import { CloudWatchLogsEvent, CloudWatchLogsDecodedData, CloudWatchLogsHandler } from 'aws-lambda'
import { gunzip } from 'zlib'
import { request } from 'https'
import config from 'config'

export const handler: CloudWatchLogsHandler = async ({ awslogs }: CloudWatchLogsEvent) => {
  const errorAlarmsConfigs = config.get<Config>('errorAlarms')

  if (!errorAlarmsConfigs.slackWebhookUrl) {
    console.log('No slack webhook URL configured; bailing...')
    return
  }
  if (!errorAlarmsConfigs.functionName) {
    console.log('No erroring lambda function name configured; bailing...')
    return
  }
  if (!errorAlarmsConfigs.region) {
    console.log('AWS_REGION or AWS_DEFAULT_REGION must be configured')
    return
  }

  const payload = Buffer.from(awslogs.data, 'base64')

  const logData = await new Promise<CloudWatchLogsDecodedData>((resolve, reject) =>
    gunzip(payload, function (e, result) {
      if (e) {
        reject(e)
      } else {
        resolve(JSON.parse(result.toString()) as CloudWatchLogsDecodedData)
      }
    })
  )

  await sendToSlack(errorAlarmsConfigs, logData)
}

const sendToSlack = async (errorAlarmsConfigs: Config, logData: CloudWatchLogsDecodedData) => {
  const region = errorAlarmsConfigs.region
  const erroringLambdaFunctionName = errorAlarmsConfigs.functionName
  const displayLogURL = `https://${region}.console.aws.amazon.com/cloudwatch/home?region=${region}#logsV2:log-groups/log-group/$252Faws$252Flambda$252F${erroringLambdaFunctionName}/log-events/${encodeURIComponent(
    logData.logStream || ''
  )}`

  const errorMessageSections = [
    ...logData.logEvents
      .filter((logEvent) => {
        const matchedFilter = errorAlarmsConfigs.errorFilters.find((filter) => !logEvent.message.match(filter))
        if (matchedFilter) {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          console.log(`${matchedFilter} matched log entry. Not sending alert for ${logEvent.message}`)
        }
        return !!matchedFilter
      })
      .map((logEvent, index) => ({
        type: 'section',
        block_id: `section-metadata-${index}`,
        text: {
          type: 'mrkdwn',
          text:
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            `*Time*: ${new Date(logEvent.timestamp)}\n` +
            `*Log Link*: ${displayLogURL}\n` +
            `*Message*:\n \`\`\`${logEvent.message}\`\`\`\n`,
        },
      })),
  ]

  if (errorMessageSections.length === 0) {
    console.log('No error message found. Not sending alert.')
    return
  }

  const payload = JSON.stringify({
    text: `AWS Alert: Lambda function *${erroringLambdaFunctionName}* is failing`,
    icon_emoji: ':sns:',
    username: 'AWS Alert',
    blocks: [
      {
        type: 'section',
        block_id: 'section-title',
        text: {
          type: 'plain_text',
          text: `Lambda function ${erroringLambdaFunctionName} is failing`,
        },
      },
      ...errorMessageSections,
    ],
  })

  await new Promise((resolve, reject) => {
    const url = new URL(errorAlarmsConfigs.slackWebhookUrl)
    const req = request(
      {
        protocol: url.protocol,
        host: url.host,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Content-Length': payload.length,
        },
      },
      (res) => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(true)
          return
        }
        if (res.statusCode) {
          reject(`${res.statusCode}: ${res.statusMessage ?? ''}`)
        }
      }
    )

    req.on('error', (e) => reject(e))
    req.write(payload)
    req.end()
  })
}

type Config = {
  functionName: string
  slackWebhookUrl: string
  region: string
  errorFilters: RegExp[]
}

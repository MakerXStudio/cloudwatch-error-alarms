import { Function, Code, Runtime } from 'aws-cdk-lib/aws-lambda'
import { Construct } from 'constructs'
import { Duration } from 'aws-cdk-lib'
import path from 'path'

export class CloudWatchErrorAlarmLambda extends Function {
  constructor(scope: Construct, id: string, props: CloudWatchErrorAlarmLambdaProps) {
    const environment: Record<string, string> = {
      SLACK_WEBHOOK_URL: props.slackWebhookUrl,
      FUNCTION_NAME: props.erroringFunctionName,
    }
    props.errorFilterRegexes?.forEach((filter, index) => {
      environment[`ERROR_FILTER_REGEX_${index + 1}`] = filter
    })

    const pathToLambda = path.join(__dirname, 'lambda')
    super(scope, id, {
      code: Code.fromAsset(pathToLambda),
      functionName: props.functionName,
      handler: 'index.handler',
      memorySize: 128,
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.seconds(60),
      retryAttempts: 2,
      environment: environment,
    })
  }
}

export type CloudWatchErrorAlarmLambdaProps = {
  slackWebhookUrl: string
  functionName: string
  erroringFunctionName: string
  errorFilterRegexes?: string[]
}

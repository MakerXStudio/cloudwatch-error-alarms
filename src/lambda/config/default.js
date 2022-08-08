const defer = require('config/defer').deferConfig

module.exports = {
  errorAlarms: {
    functionName: undefined,
    slackWebhookUrl: undefined,
    awsRegion: undefined,
    awsDefaultRegion: undefined,
    errorFilterRegex: undefined,
    region: defer(function (cfg) {
      const region = cfg.errorAlarms.awsRegion ? cfg.errorAlarms.awsRegion : cfg.errorAlarms.awsDefaultRegion
      if (!region) {
        throw new Error('AWS_REGION or AWS_DEFAULT_REGION must be configured')
      }
      return region
    }),
    errorFilter: defer(function (cfg) {
      return cfg.errorAlarms.errorFilterRegex ? new RegExp(cfg.errorAlarms.errorFilterRegex) : undefined
    }),
  },
}

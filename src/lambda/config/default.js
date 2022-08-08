const defer = require('config/defer').deferConfig

module.exports = {
  errorAlarms: {
    functionName: undefined,
    slackWebhookUrl: undefined,
    awsRegion: undefined,
    awsDefaultRegion: undefined,
    region: defer(function (cfg) {
      const region = cfg.errorAlarms.awsRegion ? cfg.errorAlarms.awsRegion : cfg.errorAlarms.awsDefaultRegion
      if (!region) {
        throw new Error('AWS_REGION or AWS_DEFAULT_REGION must be configured')
      }
      return region
    }),
    errorFilters: defer(function () {
      return Object.keys(process.env)
        .filter((key) => key.match(/^ERROR_FILTER_REGEX_/) && process.env[key])
        .map((key) => process.env[key])
    }),
  },
}

# Cloudwatch Error Alarms (cloudwatch-error-alarms)

CDK and lambda wrapper to send error alarms to Slack. This project inclues:

- A lambda that is involked by cloud watch message to send alert to Slack
- AWS CDK to deploy and configure the lambda

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

## Install

```bash
npm install @makerx/cloudwatch-error-alarms --save
```

## Usage

In your CDK stack, create the lambda with `CloudWatchErrorAlarmLambda` and subscribe it to the log group for error level messages.

```
import { CloudWatchErrorAlarmLambda } from '@makerxstudio/cloud-watch-error-alarm'

const lambda = new lambda.Function(...)

const errorsLambda = new CloudWatchErrorAlarmLambda(this, `${id}-cloud-watch-error-alarms`, {
  erroringFunctionName: `${erroringFunctionName}`, // The function name that caused the error, this will be included in the Slack message
  functionName: `${id}-cloud-watch-error-alarms`, // The cloud watch error alarm lambda function name
  slackWebhookUrl: `${slackWebhookUrl}`, // Slack webhook https://slack.com/intl/en-au/help/articles/115005265063-Incoming-webhooks-for-Slack
  errorFilterRegexes: [
    // Regex to ignore error messages
  ],
})

// Allow cloud watch to trigger the alarm lambda on error
lambda.logGroup.addSubscriptionFilter(`${id}-cloud-watch-error-alarms-subscription`, {
  destination: new destinations.LambdaDestination(errorsLambda),
  filterPattern: FilterPattern.stringValue('$.level', '=', 'error'),
})
```

## For developers

### Structure

**`index.ts`**  
is the entry point of the packaage

**`infrastructure.ts`**  
contains AWS CDK to configure the error alarm lambda

**`lambda` folder**  
Standalone package that has everything needed for the AWS lambda:

- it's own `package.json`
- build script to produce a package that can be deploy to AWS lambda and run

### How the build works

At the root level, `npm run build` does:

- Run build for the lambda then copy the output to `./build`
- Run `tsc` for `index.ts` and `infrastructure.ts` into `./build`
  The `build` folder in the content of the NPM package.

[build-img]: https://github.com/MakerXStudio/cloudwatch-error-alarms/actions/workflows/release.yml/badge.svg
[build-url]: https://github.com/MakerXStudio/cloudwatch-error-alarms/actions/workflows/release.yml
[downloads-img]: https://img.shields.io/npm/dt/@MakerXStudio/cloudwatch-error-alarms
[downloads-url]: https://www.npmtrends.com/@makerx/cloudwatch-error-alarms
[npm-img]: https://img.shields.io/npm/v/@makerx/cloudwatch-error-alarms
[npm-url]: https://www.npmjs.com/package/@makerx/cloudwatch-error-alarms
[issues-img]: https://img.shields.io/github/issues/MakerXStudio/cloudwatch-error-alarms
[issues-url]: https://github.com/MakerXStudio/cloudwatch-error-alarms/issues
[semantic-release-img]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release

---

**Attribution**

This template was based on the great work of [Ryan Sonshine](https://github.com/ryansonshine/typescript-npm-package-template)

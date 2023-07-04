# Rec0-bot --- A bot for revolution of comm.

![Action](https://github.com/clvs7-gh/rec0bot/workflows/Basic%20test/badge.svg)

## What's this?

A bot for Slack workspace. Works on Node.js.

## Requirement

Node.js >= v16. Not tested on other versions.

## How to use

Run `npm start` to start bot. 

You can change configuration by setting environment variables below. 

## Environment variables

- `REC0_ENV_SLACK_WEBAPI_TOKEN` : Token for Slack Web API.  
- `REC0_ENV_SLACK_SOCK_TOKEN` : Token for Slack SocketMode (App-level token).  
- `REC0_ENV_SLACK_USE_MOCK` : Flag whether use mock connector or not.    
- `REC0_ENV_PLUGIN_DIR_PATH` : Path for plugins directory.   
- `REC0_ENV_PLUGIN_DISABLED_NAMES` : Plugin names that are excluded from running. You can specify multiple names with comma-separated.

## Plugins

Rec0-bot has simple plugin system, so you can extend functionality by plugins.

For examples, see rec0bot-plugin-* repositories.

## License

Apache License 2.0.

# Rec0-bot --- A bot for revolution of comm.

[![Build Status](https://travis-ci.org/clvs7-gh/rec0bot.svg?branch=master)](https://travis-ci.org/clvs7-gh/rec0bot)

## What's this?

A bot for Slack workspace. Works on Node.js.

## Requirement

Node.js >= v10. Not tested on other versions.

**Note : Currently Rec0-bot doesn't support Slack's new Events API. It requires HTTP access from internet (why do I need http server for just a bot?), so I'm not willing to support it for now.**

## How to use

Run `npm start` to start bot. 

You can change configuration by setting environment variables below. 

## Environment variables

- `REC0_ENV_SLACK_TOKEN` : Token for Slack RTM API.  
- `REC0_ENV_SLACK_USE_MOCK` : Flag whether use mock connector or not.    
- `REC0_ENV_PLUGIN_DIR_PATH` : Path for plugins directory.   
- `REC0_ENV_PLUGIN_DISABLED_NAMES` : Plugin names that are excluded from running. You can specify multiple names with comma-separated.

## Plugins

Rec0-bot has simple plugin system, so you can extend functionality by plugins.

For examples, see rec0bot-plugin-* repositories.

## License

Apache License 2.0.

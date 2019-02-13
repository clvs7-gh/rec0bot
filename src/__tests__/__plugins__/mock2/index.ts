import { Logger } from 'log4js';
import * as path from 'path';
import { BotProxy } from '../../../interface/bot-proxy.interface';

let mBot: BotProxy;
let logger: Logger;
let metadata: {[key: string]: string};

export const init = async (bot: BotProxy, options: { [key: string]: any }): Promise<void> => {
    mBot = bot;
    logger = options.logger || console;
    metadata = await import(path.resolve(__dirname, 'package.json'));

    logger.info(`${metadata.name} plugin v${metadata.version} has been initialized.`);
};

export const onStart = () => {
    logger.debug('onStart()');
};

export const onStop = () => {
    logger.debug('onStop()');
};

export const onMessage = (message: string, channelId: string, userId: string, data: { [key: string]: any }) => {
    mBot.sendTalk(channelId, `モック2:${message.split(' ').slice(1).join()}`);
};

export const onPluginEvent = (eventName: string, value?: any, fromId?: string) => {
    // Nop
};

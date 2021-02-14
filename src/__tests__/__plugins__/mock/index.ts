import * as path from 'path';
import { Logger } from 'log4js';
import { BotProxy } from '../../../interface/bot-proxy.interface';
import { MessageContext } from '../../../interface/message-context.interface';

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

export const onMessage = async (message: string, context: MessageContext, data: { [key: string]: any }) => {
    await mBot.sendTalk(context.channelId, `モック:${message.split(' ').slice(1).join()}`);
};

export const onPluginEvent = (eventName: string, value?: any, fromId?: string) => {
    // Nop
};

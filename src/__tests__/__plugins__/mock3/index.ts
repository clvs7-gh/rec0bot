import type { BotProxy } from '../../../interface/bot-proxy.interface.ts';
import type { MessageContext } from '../../../interface/message-context.interface.ts';

export const init = async (bot: BotProxy, options: { [key: string]: any }): Promise<void> => {
    // プラグインのタイムアウトをテストするため
    await new Promise((resolve) => setTimeout(resolve, 10000));
};

export const onStart = () => {};

export const onStop = () => {};

export const onMessage = async (message: string, context: MessageContext, data: { [key: string]: any }) => {};

export const onPluginEvent = (eventName: string, value?: any, fromId?: string) => {};

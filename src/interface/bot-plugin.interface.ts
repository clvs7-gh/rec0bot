import type { BotProxy } from './bot-proxy.interface.ts';
import type { MessageContext } from './message-context.interface.ts';

export interface BotPlugin {
    init(botProxy: BotProxy, options?: { [key: string]: any }): void|Promise<void>;
    onStart(): void|Promise<void>;
    onStop(): void|Promise<void>;
    onMessage(message: string, context: MessageContext, data: {[key: string]: any}): void|Promise<void>;
    onPluginEvent(eventName: string, value?: any, fromId?: string): void|Promise<void>;
}

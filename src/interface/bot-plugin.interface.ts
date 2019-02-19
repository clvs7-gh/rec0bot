import { BotProxy } from './bot-proxy.interface';
import { MessageContext } from './message-context.interface';

export interface BotPlugin {
  init(botProxy: BotProxy, options?: { [key: string]: any }): void|Promise<void>;
  onStart(): void|Promise<void>;
  onStop(): void|Promise<void>;
  onMessage(message: string, context: MessageContext, data: {[key: string]: any}): void|Promise<void>;
  onPluginEvent(eventName: string, value?: any, fromId?: string): void|Promise<void>;
}

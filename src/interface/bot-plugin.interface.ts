import { BotProxy } from './bot-proxy.interface';

export interface BotPlugin {
  init(botProxy: BotProxy, options?: { [key: string]: any }): void|Promise<void>;
  onStart(): void|Promise<void>;
  onStop(): void|Promise<void>;
  onMessage(message: string, channelId: string, userId: string, data: {[key: string]: any}): void|Promise<void>;
  onPluginEvent(eventName: string, value?: any, fromId?: string): void|Promise<void>;
}

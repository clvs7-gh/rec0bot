import type { BotProxy } from '../interface/bot-proxy.interface.ts';
import type { BotService } from './bot.service.ts';

export class BotProxyService implements BotProxy {
    private bot: BotService;

    constructor(bot: BotService) {
        this.bot = bot;
    }

    getBotUserId(): Promise<string> {
        return this.bot.getBotUserId();
    }

    getChannelList(): Promise<any[]> {
        return this.bot.getChannelList();
    }

    getChannelId(channelName: string): Promise<string> {
        return this.bot.getChannelId(channelName);
    }

    getUserList(): Promise<any[]> {
        return this.bot.getUserList();
    }

    sendTalk(channelId: string, text: string, options?: { [k: string]: any }): Promise<any> {
        return this.bot.sendTalk(channelId, text, options);
    }

    editTalk(channelId: string, textId: string, text: string, options?: { [k: string]: any }): Promise<any> {
        return this.bot.editTalk(channelId, textId, text);
    }

    sendFile(channelId: string, fileName: string, buffer: Buffer, options?: { [k: string]: any }): Promise<any> {
        return this.bot.sendFile(channelId, fileName, buffer);
    }

    firePluginEvent(targetId: string, fromId: string, eventName: string, value: any): Promise<any> {
        return this.bot.firePluginEvent(targetId, fromId, eventName, value);
    }
}

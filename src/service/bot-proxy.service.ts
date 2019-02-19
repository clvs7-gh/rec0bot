import { BotProxy } from '../interface/bot-proxy.interface';
import { BotService } from './bot.service';

export class BotProxyService implements BotProxy {
    constructor(private bot: BotService) {
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

    sendTalk(channelId: string, text: string, attachmentProperty?: { [key: string]: any }[]): Promise<any> {
        return this.bot.sendTalk(channelId, text, attachmentProperty);
    }

    editTalk(channelId: string, textId: string, text: string): Promise<any> {
        return this.bot.editTalk(channelId, textId, text);
    }

    sendFile(channelId: string, fileName: string, buffer: Buffer): Promise<any> {
        return this.bot.sendFile(channelId, fileName, buffer);
    }

    firePluginEvent(targetId: string, fromId: string, eventName: string, value: any): Promise<any> {
        return this.bot.firePluginEvent(targetId, fromId, eventName, value);
    }
}

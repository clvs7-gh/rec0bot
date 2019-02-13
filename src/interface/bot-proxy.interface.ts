export interface BotProxy {
    getChannelId(channelName: string): Promise<string>;
    sendTalk(channelId: string, text: string, attachmentProperty?: {[key: string]: any}[]): Promise<any>;
    editTalk(channelId: string, textId: string, text: string): Promise<any>;
    sendFile(channelId: string, fileName: string, buffer: Buffer): Promise<any>;
    firePluginEvent(targetId: string, eventName: string, value?: any, fromId?: string): Promise<any>;
}

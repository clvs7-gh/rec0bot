import { EventEmitter } from 'events';

export interface Connector extends EventEmitter {
    getConnectorName(): string;
    init(): Promise<void>;
    finish(): Promise<void>;
    waitForOnline(): Promise<void>;
    getBotUserId(): Promise<string>;
    getChannelList(): Promise<any[]>;
    getChannelId(channelName: string): Promise<string>;
    getUserList(): Promise<any[]>;
    sendText(channelId: string, text: string, attachmentProperty?: {[key: string]: any}[]): Promise<any>;
    editText(channelId: string, textId: string, text: string): Promise<any>;
    sendFile(channelId: string, fileName: string, buffer: Buffer): Promise<any>;
}

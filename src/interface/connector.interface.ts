import type { EventEmitter } from 'events';

export interface Connector extends EventEmitter {
    getConnectorName(): string;
    init(): Promise<void>;
    finish(): Promise<void>;
    waitForOnline(): Promise<void>;
    getBotUserId(): Promise<string>;
    getChannelList(): Promise<any[]>;
    getChannelId(channelName: string): Promise<string>;
    getUserList(): Promise<any[]>;
    sendText(channelId: string, text: string, options?: { [k: string]: any }): Promise<any>;
    editText(channelId: string, textId: string, text: string, options?: { [k: string]: any }): Promise<any>;
    sendFile(channelId: string, fileName: string, buffer: Buffer, options?: { [k: string]: any }): Promise<any>;
}

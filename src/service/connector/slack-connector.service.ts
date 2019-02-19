import { RTMClient, WebClient } from '@slack/client';
import { EventEmitter } from 'events';
import { Connector } from '../../interface/connector.interface';

export class SlackConnectorService extends EventEmitter implements Connector {
    private client: RTMClient;
    private webClient: WebClient;
    private _ready: Promise<any> | undefined;

    private readonly SUBSCRIBE_EVENTS = ['message'];

    constructor(token: string) {
        super();
        this.client = new RTMClient(token);
        this.webClient = new WebClient(token);
    }

    private subscribeEvents() {
        this.SUBSCRIBE_EVENTS.forEach((ev) => this.client.on(ev, (value) => {
            if (ev === 'message') {
                // Add some properties
                value.mentions = value.text.match(/<([@!]\w+)(?:\|.*)?>/gi);
                value.isMentioned = ['!everyone', '!here', '!channel', `@${this.client.activeUserId}`]
                    .some((v) => value.mentions.includes(v));
            }
            this.emit(ev, value);
        }));
    }

    getConnectorName(): string {
        return 'SlackConnector';
    }

    async init() {
        this._ready = new Promise(async (resolve, reject) => {
            const result = await this.client.start();
            if (result.ok) {
                this.subscribeEvents();
                resolve(result);
            } else {
                reject(result);
            }
        });
        await this._ready;
    }

    async finish() {
        if (this._ready) {
            await this.client.disconnect();
        }
    }

    async waitForOnline(): Promise<void> {
        if (this._ready) {
            await this._ready;
            return;
        } else {
            return Promise.reject('Not initialized yet');
        }
    }

    async getBotUserId(): Promise<string> {
        await this.waitForOnline();
        if (!this.client.activeUserId) {
            throw new Error('No active user!');
        }
        return this.client.activeUserId;
    }

    async getChannelList(): Promise<any[]> {
        await this.waitForOnline();
        // @ts-ignore
        return (await this.webClient.channels.list()).channels || [];
    }

    async getChannelId(channelName: string): Promise<string> {
        await this.waitForOnline();
        // @ts-ignore
        const channel = (await this.getChannelsList()).find((c) => c.name === channelName.trim());
        if (!channel) {
            throw new Error('No such channel.');
        }
        return channel.id;
    }

    async getUserList(): Promise<any[]> {
        await this.waitForOnline();
        // @ts-ignore
        return (await this.webClient.users.list()).users || [];
    }

    async editText(channelId: string, textId: string, text: string): Promise<any> {
        await this.waitForOnline();
        return await this.webClient.chat.update({
            channel: channelId,
            ts: textId,
            text: text,
            as_user: true
        });
    }

    async sendFile(channelId: string, fileName: string, buffer: Buffer): Promise<any> {
        await this.waitForOnline();
        return await this.webClient.files.upload({
            channels: channelId,
            filename: fileName,
            file: buffer,
            as_user: true
        });
    }

    async sendText(channelId: string, text: string, attachmentProperty?: { [p: string]: any }[]): Promise<any> {
        await this.waitForOnline();
        return await this.webClient.chat.postMessage({
            channel: channelId,
            text: text,
            attachments: attachmentProperty,
            as_user: true
        });
    }
}

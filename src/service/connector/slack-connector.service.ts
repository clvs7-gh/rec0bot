import { EventEmitter } from 'events';
import { SocketModeClient } from '@slack/socket-mode';
import { WebClient } from '@slack/web-api';
import type { Connector } from '../../interface/connector.interface.ts';

export class SlackConnectorService extends EventEmitter implements Connector {
    private sockClient: SocketModeClient;
    private webClient: WebClient;
    private _ready: Promise<void> | undefined;

    private botUserId = '';

    private readonly SUBSCRIBE_EVENTS = ['message'];

    constructor(sockToken: string, webToken: string) {
        super();
        this.sockClient = new SocketModeClient({ appToken: sockToken });
        this.webClient = new WebClient(webToken);
    }

    getConnectorName(): string {
        return 'SlackConnector';
    }

    async init() {
        this._ready = (async () => {
            await this.sockClient.start();
            this.subscribeEvents();
            this.botUserId = await this.getBotUserId(false);
        })();
        await this._ready;
        this.botUserId = await this.getBotUserId();
    }

    async finish() {
        if (this._ready) {
            await this.sockClient.disconnect();
        }
    }

    async waitForOnline(): Promise<void> {
        if (this._ready) {
            await this._ready;
            return;
        } else {
            return Promise.reject(new Error('Not initialized yet'));
        }
    }

    async getBotUserId(isWaitForOnline = true): Promise<string> {
        if (isWaitForOnline) {
            await this.waitForOnline();
        }
        const res: any = await this.webClient.auth.test();
        if (!res.ok) {
            throw new Error('No active user!');
        }
        return res.user_id;
    }

    async getChannelList(): Promise<any[]> {
        await this.waitForOnline();
        return (await this.webClient.conversations.list()).channels || [];
    }

    async getChannelId(channelName: string): Promise<string> {
        await this.waitForOnline();
        const channel = (await this.getChannelList()).find((c) => c.name === channelName.trim());
        if (!channel) {
            throw new Error('No such channel.');
        }
        return channel.id;
    }

    async getUserList(): Promise<any[]> {
        await this.waitForOnline();
        return (await this.webClient.users.list({})).members || [];
    }

    async editText(channelId: string, textId: string, text: string, options: { [k: string]: any } = {}): Promise<any> {
        await this.waitForOnline();
        return await this.webClient.chat.update({
            channel: channelId,
            ts: textId,
            text: text,
            ...options
        });
    }

    async sendFile(channelId: string, fileName: string, buffer: Buffer, options: { [k: string]: any } = {}): Promise<any> {
        await this.waitForOnline();
        return await this.webClient.files.upload({
            channels: channelId,
            filename: fileName,
            file: buffer,
            ...options
        });
    }

    async sendText(channelId: string, text: string, options: { [k: string]: any } = {}): Promise<any> {
        await this.waitForOnline();
        return await this.webClient.chat.postMessage({
            channel: channelId,
            text: text,
            ...options
        });
    }

    private subscribeEvents() {
        this.SUBSCRIBE_EVENTS.forEach((ev) => this.sockClient.on(ev, async ({ event, body, ack }) => {
            if (ack) {
                await ack();
            }
            if (!event) {
                return;
            }
            const value = event;
            if (ev === 'message') {
                // Add some properties
                value.mentions = (/<([@!]\w+)(?:\|.*)?>/gi.exec(value.text) || []).slice(1);
                value.isMentioned = ['!everyone', '!here', '!channel', `@${this.botUserId}`]
                    .some((v) => value.mentions.includes(v));
            }
            this.emit(ev, value);
        }));
    }
}

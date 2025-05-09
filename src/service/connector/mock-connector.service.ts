import { EventEmitter } from 'events';
import type { Connector } from '../../interface/connector.interface.ts';

export class MockConnectorService extends EventEmitter implements Connector {
    private isInit = false;

    private count = 0;
    private dummyTexts = [
        'Dummy text. Timestamp : ' + (new Date()).getTime(),
        '<@UDUMMYBOT000> sindoi しんどいテスト \n<@UDUMMYBOT000|bot>\n<@UDUMMYBOT000|bot>\n sample.',
        'clean info',
        'check-alive',
        'info'
    ];
    private timeout: ReturnType<typeof setTimeout> | undefined;

    emitMessage(message: string, isMentioned = false) {
        this.emit('message', {
            text: message,
            channel: 'CDUMMYCNL000',
            user: 'UDUMMYUSR000',
            mentions: isMentioned ? ['@UDUMMYBOT000'] : [],
            isMentioned: isMentioned
        });
    }

    getConnectorName(): string {
        return 'MockConnector';
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async init() {
        if (this.isInit) {
            return;
        }
        this.isInit = true;
        const loopFn = () => {
            const i = this.count++ % this.dummyTexts.length;
            const dummyData = {
                text: this.dummyTexts[i],
                channel: 'CDUMMYCNL000',
                user: 'UDUMMYUSR000',
                mentions: i === 1 ? ['@UDUMMYBOT000'] : [],
                isMentioned: i === 1
            };
            this.emit('message', dummyData);
            this.timeout = setTimeout(() => loopFn(), 5000);
        };
        loopFn();
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async finish() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }

    waitForOnline(): Promise<void> {
        return new Promise((r) => setTimeout(r, 1000));
    }

    getBotUserId(): Promise<string> {
        return new Promise((r) => setTimeout(() => r('UDUMMYBOT000'), 1000));
    }

    getChannelList(): Promise<any[]> {
        return new Promise((r) => setTimeout(() => r([]), 1000));
    }

    getChannelId(channelName: string): Promise<string> {
        return new Promise((r) => setTimeout(() => r('CDUMMYCNL000'), 1000));
    }

    getUserList(): Promise<any[]> {
        return new Promise((r) => setTimeout(() => r([]), 1000));
    }

    editText(channelId: string, textId: string, text: string, options: { [k: string]: any } = {}): Promise<any> {
        return new Promise((r) => setTimeout(r, 1000));
    }

    sendFile(channelId: string, fileName: string, buffer: Buffer, options: { [k: string]: any } = {}): Promise<any> {
        return new Promise((r) => setTimeout(r, 1000));
    }

    sendText(channelId: string, text: string, options: { [k: string]: any } = {}): Promise<any> {
        return new Promise((r) => setTimeout(r, 1000));
    }
}

import { EventEmitter } from 'events';
import { Connector } from '../../interface/connector.interface';

export class MockConnectorService extends EventEmitter implements Connector {
    private isInit = false;

    private count = 0;
    private dummyTexts = [
        'Dummy text. Timestamp : ' + (new Date()).getTime(),
        'sindoi しんどいテスト',
        'clean info',
    ];

    emitMessage(message: string) {
        this.emit('message', {
            text: message,
            channel: 'CDUMMYCNL000',
            user: 'UDUMMYUSR000',
        });
    }

    getConnectorName(): string {
        return 'MockConnector';
    }

    init(): void {
        if (this.isInit) {
            return;
        }
        this.isInit = true;
        const loopFn = () => {
            const dummyData = {
                text: this.dummyTexts[this.count++ % 3],
                channel: 'CDUMMYCNL000',
                user: 'UDUMMYUSR000',
            };
            this.emit('message', dummyData);
            setTimeout(() => loopFn(), 5000);
        };
        loopFn();
    }

    waitForOnline(): Promise<void> {
        return new Promise((r) => setTimeout(r, 1000));
    }

    getChannelId(channelName: string): Promise<string> {
        return new Promise((r) => setTimeout(() => r('CDUMMYCNL000'), 1000));
    }

    editText(channelId: string, textId: string, text: string): Promise<any> {
        return new Promise((r) => setTimeout(r, 1000));
    }

    sendFile(channelId: string, fileName: string, buffer: Buffer): Promise<any> {
        return new Promise((r) => setTimeout(r, 1000));
    }

    sendText(channelId: string, text: string, attachmentProperty?: { [key: string]: any }[]): Promise<any> {
        return new Promise((r) => setTimeout(r, 1000));
    }
}

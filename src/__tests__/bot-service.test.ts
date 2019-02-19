import { MessageContext } from '../interface/message-context.interface';
import { BotService } from '../service/bot.service';
import { MockConnectorService } from '../service/connector/mock-connector.service';

describe('Testing BotService', async () => {
    const mockConnector = new MockConnectorService();
    const bot = new BotService(mockConnector);
    it('Init', async () => {
        await bot.run();
    });
    it('Test plugin', async () => {
        const plugins = await bot.getActivePlugins();
        expect(plugins.length).toEqual(1);
        expect(plugins[0].metadata.name).toEqual('mock');
    });
    it('Test BotUserId', async () => {
        expect(await bot.getBotUserId()).toEqual('UDUMMYBOT000');
    });
    it('Test getChannel', async () => {
        expect(await bot.getChannelId('mock')).toEqual('CDUMMYCNL000');
    });
    it('Test onMessage', async () => {
        const messageOk = 'mock test';
        let isCalled = false;
        const plugin = await bot.getActivePlugins()[0].instance;
        const oldFn = plugin.onMessage;
        plugin.onMessage = (message: string, context: MessageContext, data: { [key: string]: any }) => {
            expect(message).toEqual(messageOk);
            isCalled = true;
        };
        mockConnector.emitMessage(messageOk);
        await new Promise((r) => setTimeout(r, 100));
        expect(isCalled).toEqual(true);
        plugin.onMessage = oldFn;
    });
    it('Test onMessage (filtered)', async () => {
        const messageNg = 'mock2 test';
        let isCalled = false;
        const plugin = await bot.getActivePlugins()[0].instance;
        const oldFn = plugin.onMessage;
        plugin.onMessage = (message: string, context: MessageContext, data: { [key: string]: any }) => {
            isCalled = true;
        };
        mockConnector.emitMessage(messageNg);
        await new Promise((r) => setTimeout(r, 100));
        expect(isCalled).toEqual(false);
        plugin.onMessage = oldFn;
    });
    it('Test onMessage (2nd)', async () => {
        const messageOk = 'mock 2nd test';
        let isCalled = false;
        const plugin = await bot.getActivePlugins()[0].instance;
        const oldFn = plugin.onMessage;
        plugin.onMessage = (message: string, context: MessageContext, data: { [key: string]: any }) => {
            expect(message).toEqual(messageOk);
            isCalled = true;
        };
        mockConnector.emitMessage(messageOk);
        await new Promise((r) => setTimeout(r, 100));
        expect(isCalled).toEqual(true);
        plugin.onMessage = oldFn;
    });
});

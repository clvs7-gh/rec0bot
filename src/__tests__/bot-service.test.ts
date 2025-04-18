// noinspection TypeScriptUnresolvedReference

import { environment } from '../environment/environment.ts';
import type { MessageContext } from '../interface/message-context.interface.ts';
import { BotService } from '../service/bot.service.ts';
import { MockConnectorService } from '../service/connector/mock-connector.service.ts';
import { expect, describe, afterAll, it, vi } from 'vitest';

describe('Testing BotService', () => {
    const mockConnector = new MockConnectorService();
    const bot = new BotService(mockConnector);

    afterAll(() => bot.finish());

    it.runIf(process.env.LATEST_VERSION_TAG)('Test version', async () => {
        const packageJson = await import(import.meta.dirname + '/../../package.json');
        expect(packageJson.version).toEqual(environment.version);
        const tags = (process.env.LATEST_VERSION_TAG || '').trim().match(/^v(.+)$/) || [];
        const tagVersion = tags.length > 1 ? tags[1] : tags[0];
        expect(packageJson.version).toEqual(tagVersion);
    });
    it('Init', async () => {
        await bot.run();
    });
    it('Test plugin', () => {
        const plugins = bot.getActivePlugins();
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
        const plugin = bot.getActivePlugins()[0].instance;
        vi.spyOn(plugin, 'onMessage').mockImplementation((message: string, context: MessageContext, data: { [key: string]: any }) => {
            expect(message).toEqual(messageOk);
            isCalled = true;
        });
        mockConnector.emitMessage(messageOk);
        await new Promise((r) => setTimeout(r, 100));
        expect(isCalled).toEqual(true);
    });
    it('Test onMessage (filtered)', async () => {
        const messageNg = 'mock2 test';
        let isCalled = false;
        const plugin = bot.getActivePlugins()[0].instance;
        vi.spyOn(plugin, 'onMessage').mockImplementation((message: string, context: MessageContext, data: { [key: string]: any }) => {
            isCalled = true;
        });
        mockConnector.emitMessage(messageNg);
        await new Promise((r) => setTimeout(r, 100));
        expect(isCalled).toEqual(false);
    });
    it('Test onMessage (multi-line mentions)', async () => {
        const messageRaw = '<@UDUMMYBOT000> mock mention test \n<@UDUMMYBOT000|bot>\n<@UDUMMYBOT000|bot>\n sample.\n';
        const messageExpected = 'mock mention test \n<@UDUMMYBOT000|bot>\n<@UDUMMYBOT000|bot>\n sample.';
        let isCalled = false;
        const plugin = bot.getActivePlugins()[0].instance;
        vi.spyOn(plugin, 'onMessage').mockImplementation((message: string, context: MessageContext, data: { [key: string]: any }) => {
            expect(message).toEqual(messageExpected);
            isCalled = true;
        })
        mockConnector.emitMessage(messageRaw, true);
        await new Promise((r) => setTimeout(r, 100));
        expect(isCalled).toEqual(true);
    });
});

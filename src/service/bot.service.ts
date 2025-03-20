import { CronJob } from 'cron';
import type { Logger } from 'log4js';
import type { Connector } from '../interface/connector.interface.ts';
import type { MessageContext } from '../interface/message-context.interface.ts';
import type { RegisteredPluginInfo } from '../interface/registered-plugin-info.interface.ts';
import { BotProxyService } from './bot-proxy.service.ts';
import { LoggerService } from './logger.service.ts';
import { PluginLoaderService } from './plugin-loader.service.ts';
import { cloneDeep } from "es-toolkit";
import { environment } from "../environment/environment.js";

export class BotService {
    private connectorService: Connector;
    private botName: string;

    private logger: Logger;
    private plugins: { [pluginName: string]: RegisteredPluginInfo } = {};
    private isFinished = false;

    constructor(connectorService: Connector, botName: string = 'REC0') {
        this.connectorService = connectorService;
        this.botName = botName;
        this.logger = LoggerService.getLogger(this.botName);
        this.logger.info('BotService has been initialized.');
    }

    async run(): Promise<void> {
        this.logger.info(`Initializing connector (${this.connectorService.getConnectorName()})...`);

        await this.connectorService.init();
        this.logger.info('Waiting for online...');
        await this.connectorService.waitForOnline();
        this.logger.info('Connected.');

        process.on('SIGINT', () => this.finish());
        process.on('exit', () => this.finish());

        this.logger.info('Loading plugins...');
        // Loading plugins
        const pluginPromises = [];
        for (const [instance, metadata] of (await PluginLoaderService.load())) {
            pluginPromises.push(this.wrapWithTimeout(
                (async () => {
                    try {
                        // Initialize plugin
                        await instance.init(new BotProxyService(this), { logger: LoggerService.getLogger(metadata.name) });
                        await instance.onStart();
                        const scheduledEvents = metadata.scheduled_events || [];
                        const jobs = scheduledEvents.map((entry) => {
                            this.logger.info(`Registering scheduled job: time: ${entry.time}, event: ${entry.event}`);
                            return new CronJob(entry.time, async () => await this._firePluginEvent(metadata.name, `scheduled:${entry.event}`),
                                void 0, true, 'Asia/Tokyo');
                        });
                        this.plugins[metadata.name] = {
                            metadata: metadata,
                            instance: instance,
                            scheduledJobs: jobs || []
                        };
                    } catch (e) {
                        this.logger.warn(`Failed to load plugin : ${metadata.name}, error : `, e);
                    }
                })()
            ));
        }
        await Promise.all(pluginPromises);

        this.connectorService.on('message', (v) => this.onMessage(v.text, {
            channelId: v.channel,
            userId: v.user,
            mentions: v.mentions,
            isMentioned: v.isMentioned
        }, v));

        this.logger.info(`Now ${this.botName} is watching you; it's ready!`);
    }

    async finish() {
        if (this.isFinished) {
            return;
        }
        this.isFinished = true;
        this.logger.info('Finishing...');
        for (const entry of Object.values(this.plugins)) {
            entry.scheduledJobs.forEach((job) => job.stop());
            await entry.instance.onStop();
        }
        await this.connectorService.finish();
    }

    getActivePlugins(): RegisteredPluginInfo[] {
        return Object.values(this.plugins);
    }

    async getBotUserId(): Promise<string> {
        return await this.connectorService.getBotUserId();
    }

    async getChannelList(): Promise<any[]> {
        return await this.connectorService.getChannelList();
    }

    async getChannelId(channelName: string): Promise<string> {
        return await this.connectorService.getChannelId(channelName);
    }

    async getUserList(): Promise<any[]> {
        return await this.connectorService.getUserList();
    }

    async editTalk(channelId: string, textId: string, text: string, options?: { [k: string]: any }): Promise<any> {
        this.logger.debug(`editTalk() called : channelId: ${channelId}, textId: ${textId}, text: ${text}, options: ${JSON.stringify(options || {})}`);
        return await this.connectorService.editText(channelId, textId, text, options);
    }

    async sendFile(channelId: string, fileName: string, buffer: Buffer, options?: { [k: string]: any }): Promise<any> {
        this.logger.debug(`sendFile() called : channelId: ${channelId}, fileName: ${fileName}, options: ${JSON.stringify(options || {})}`);
        return await this.connectorService.sendFile(channelId, fileName, buffer, options);
    }

    async sendTalk(channelId: string, text: string, options?: { [k: string]: any }): Promise<any> {
        // tslint:disable-next-line:max-line-length
        this.logger.debug(`sendTalk() called : channelId: ${channelId},text: ${text}, options: ${JSON.stringify(options || {})}`);
        return await this.connectorService.sendText(channelId, text, options);
    }

    async firePluginEvent(targetId: string, eventName: string, value?: any, fromId?: string): Promise<void> {
        this.logger.debug(`firePluginEvent() called : targetId: ${targetId}, eventName: ${eventName}, fromId: ${fromId}`);
        if (!this.plugins[targetId]) {
            throw new Error('No such target.');
        }
        if (eventName.toLowerCase().startsWith('scheduled:')) {
            throw new Error('You cannot specify such a event name.');
        }
        await this._firePluginEvent(targetId, eventName, value, fromId);
    }

    private async onMessage(message: string, context: MessageContext, data: any) {
        this.logger.debug(`onMessage() : message: ${message}, channelId: ${context.channelId}, userId: ${context.userId}`);
        message = (message || '').trim();
        if (context.isMentioned) {
            message = message.replace(/^(<[@!].+?>)/i, '').trim();
        }
        for (const entry of Object.values(this.plugins)) {
            if (entry.metadata.filter_prefixes && entry.metadata.filter_prefixes.indexOf(message.split(' ')[0]) < 0) {
                // Not satisfied with filter condition
                continue;
            }
            await entry.instance.onMessage(message, context, cloneDeep(data));
        }
    }

    private _firePluginEvent(targetId: string, eventName: string, value?: any, fromId?: string) {
        return this.plugins[targetId].instance.onPluginEvent(eventName, cloneDeep(value), fromId);
    }

    private wrapWithTimeout(promise: Promise<any>, timeoutMs = environment.plugin.timeoutMs, rejectOnTimedOut = environment.plugin.failOnTimeout): Promise<any> {
        let timeout: ReturnType<typeof setTimeout> | undefined;
        const timedOutPromise = new Promise<void>((resolve, reject) => {
            timeout = setTimeout(() => {
                this.logger.warn('Timed out!');
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                rejectOnTimedOut ? reject() : resolve();
                timeout = void 0;
            }, timeoutMs);
        });
        return Promise.race([
            promise.finally(() => timeout && clearTimeout(timeout)),
            timedOutPromise
        ]);
    }
}

import { CronJob } from 'cron';
import * as _ from 'lodash';
import { Logger } from 'log4js';
import { Connector } from '../interface/connector.interface';
import { MessageContext } from '../interface/message-context.interface';
import { RegisteredPluginInfo } from '../interface/registered-plugin-info.interface';
import { BotProxyService } from './bot-proxy.service';
import { LoggerService } from './logger.service';
import { PluginLoaderService } from './plugin-loader.service';

export class BotService {
    private logger: Logger;
    private plugins: { [pluginName: string]: RegisteredPluginInfo } = {};
    private isFinished = false;

    constructor(private connectorService: Connector, private botName: string = 'REC0') {
        this.logger = LoggerService.getLogger(this.botName);
        this.logger.info('BotService has been initialized.');
    }

    async run(): Promise<void> {
        this.logger.info('Loading plugins...');
        // Loading plugins
        const pluginPromises = [];
        for ( const [instance, metadata] of (await PluginLoaderService.load()) ) {
            pluginPromises.push(await this.wrapWithTimeout(new Promise<void>(async (resolve) => {
                try {
                    // Initialize plugin
                    await instance.init(new BotProxyService(this), {logger: LoggerService.getLogger(metadata.name)});
                    await instance.onStart();
                    const scheduledEvents = metadata.scheduled_events || [];
                    const jobs = scheduledEvents.map((entry) => {
                        this.logger.info(`Registering scheduled job: time: ${entry.time}, event: ${entry.event}`);
                        return new CronJob(entry.time, async () => await this._firePluginEvent(metadata.name, `scheduled:${entry.event}`),
                            void 0, true, 'Asia/Tokyo');
                    });
                    this.plugins[metadata.name] = {metadata: metadata, instance: instance, scheduledJobs: jobs || []};
                } catch (e) {
                    this.logger.warn(`Failed to load plugin : ${metadata.name}, error : `, e);
                }
                // Always resolve even if has any errors (for Promise.all())
                resolve();
            })));
        }
        await Promise.all(pluginPromises);
        this.logger.info('Done.');

        // Initialize connector
        await this.connectorService.init();
        this.logger.info('Waiting for online...');
        await this.connectorService.waitForOnline();
        this.logger.info('Connected.');
        this.logger.info(`Now ${this.botName} is watching you; it's ready!`);
        process.on('SIGINT', () => this.finish());
        process.on('exit', () => this.finish());
        this.connectorService.on('message', (v) => this.onMessage(v.text, {
            channelId: v.channel,
            userId: v.user,
            mentions: v.mentions,
            isMentioned: v.isMentioned
        }, v));
    }

    async finish() {
        if (this.isFinished) {
            return;
        }
        this.isFinished = true;
        this.logger.info('Finishing...');
        for ( const entry of Object.values(this.plugins) ) {
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

    async editTalk(channelId: string, textId: string, text: string): Promise<any> {
        this.logger.debug(`editTalk() called : channelId: ${channelId}, textId: ${textId}, text: ${text}`);
        return await this.connectorService.editText(channelId, textId, text);
    }

    async sendFile(channelId: string, fileName: string, buffer: Buffer): Promise<any> {
        this.logger.debug(`sendFile() called : channelId: ${channelId}, fileName: ${fileName}`);
        return await this.connectorService.sendFile(channelId, fileName, buffer);
    }

    async sendTalk(channelId: string, text: string, attachmentProperty?: { [key: string]: any }[]): Promise<any> {
        // tslint:disable-next-line:max-line-length
        this.logger.debug(`sendTalk() called : channelId: ${channelId},text: ${text}, attachmentProperty: ${JSON.stringify(attachmentProperty || {})}`);
        return await this.connectorService.sendText(channelId, text, attachmentProperty);
    }

    async firePluginEvent(targetId: string, eventName: string, value?: any, fromId?: string): Promise<void> {
        this.logger.debug(`firePluginEvent() called : targetId: ${targetId}, eventName: ${eventName}, fromId: ${fromId}`);
        if (!this.plugins[targetId]) {
            throw new Error('No such target.');
        }
        if (eventName.toLowerCase().startsWith('scheduled:')) {
            throw new Error('You cannot specify such a event name.');
        }
        this._firePluginEvent(targetId, eventName, value, fromId);
    }

    private async onMessage(message: string, context: MessageContext, data: any) {
        this.logger.debug(`onMessage() : message: ${message}, channelId: ${context.channelId}, userId: ${context.userId}`);
        message = (message || '').trim();
        if (context.isMentioned) {
            message = message.replace(/^(<[@!].+?>)/i, '').trim();
        }
        Object.values(this.plugins).forEach(entry => {
            if (entry.metadata.filter_prefixes && entry.metadata.filter_prefixes.indexOf(message.split(' ')[0]) < 0) {
                // Not satisfied with filter condition
                return;
            }
            entry.instance.onMessage(message, context, _.cloneDeep(data));
        });
    }

    private _firePluginEvent(targetId: string, eventName: string, value?: any, fromId?: string) {
        this.plugins[targetId].instance.onPluginEvent(eventName, _.cloneDeep(value), fromId);
    }

    private wrapWithTimeout(promise: Promise<any>, timeoutMs = 5000, rejectOnTimedOut = false): Promise<any> {
        let timeout: NodeJS.Timeout | undefined;
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

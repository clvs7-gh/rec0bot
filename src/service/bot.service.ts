import { CronJob } from 'cron';
import * as _ from 'lodash';
import { Logger } from 'log4js';
import { Connector } from '../interface/connector.interface';
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

    private async onMessage(message: string, channelId: string, userId: string, data: any) {
        this.logger.debug(`onMessage() : message: ${message}, channelId: ${channelId}, userId: ${userId}`);
        message = message || '';
        Object.values(this.plugins).forEach(entry => {
            if (entry.metadata.filter_prefixes && entry.metadata.filter_prefixes.indexOf(message.split(' ')[0]) < 0) {
                // Not satisfied with filter condition
                return;
            }
            entry.instance.onMessage(message, channelId, userId, _.cloneDeep(data));
        });
    }

    private _firePluginEvent(targetId: string, eventName: string, value?: any, fromId?: string) {
        this.plugins[targetId].instance.onPluginEvent(eventName, _.cloneDeep(value), fromId);
    }

    async run(): Promise<void> {
        this.logger.info('Loading plugins...');
        // Loading plugins
        const pluginPromises = [];
        for ( const [instance, metadata] of (await PluginLoaderService.load()) ) {
            pluginPromises.push(new Promise(async (resolve) => {
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
            }));
        }
        await Promise.all(pluginPromises);
        this.logger.info('Done.');

        // Initialize connector
        this.connectorService.init();
        this.logger.info('Waiting for online...');
        await this.connectorService.waitForOnline();
        this.logger.info('Connected.');
        this.logger.info(`Now ${this.botName} is watching you; it's ready!`);
        this.connectorService.on('message', (v) => this.onMessage(v.text, v.channel, v.user, v));
        process.on('SIGINT', () => this.finish());
        process.on('exit', () => this.finish());
    }

    async finish() {
        if (this.isFinished) {
            return;
        }
        this.isFinished = true;
        this.logger.info('Finishing...');
        Object.values(this.plugins).forEach(entry => {
            entry.scheduledJobs.forEach((job) => job.stop());
            entry.instance.onStop();
        });
        process.exit(0);
    }

    getActivePlugins(): RegisteredPluginInfo[] {
        return Object.values(this.plugins);
    }

    async getChannelId(channelName: string): Promise<string> {
        return await this.connectorService.getChannelId(channelName);
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
            throw new Error('No such target,');
        }
        if (eventName.toLowerCase().startsWith('scheduled:')) {
            throw new Error('You cannot specify such a event name.');
        }
        this._firePluginEvent(targetId, eventName, value, fromId);
    }
}

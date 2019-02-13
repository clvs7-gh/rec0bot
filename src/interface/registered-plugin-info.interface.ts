import { CronJob } from 'cron';
import { BotPlugin } from './bot-plugin.interface';
import { PluginMetadata } from './plugin-metadata.interface';

export interface RegisteredPluginInfo {
    metadata: PluginMetadata;
    instance: BotPlugin;
    scheduledJobs: CronJob[];
}

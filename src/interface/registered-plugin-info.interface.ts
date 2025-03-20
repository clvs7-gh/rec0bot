import type { CronJob } from 'cron';
import type { BotPlugin } from './bot-plugin.interface.ts';
import type { PluginMetadata } from './plugin-metadata.interface.ts';

export interface RegisteredPluginInfo {
    metadata: PluginMetadata;
    instance: BotPlugin;
    scheduledJobs: CronJob[];
}

import { readdir as readDir } from "fs/promises";
import * as path from 'path';
import { environment } from '../environment/environment.ts';
import type { BotPlugin } from '../interface/bot-plugin.interface.ts';
import type { PluginMetadata } from '../interface/plugin-metadata.interface.ts';
import { LoggerService } from './logger.service.ts';

const logger = LoggerService.getLogger('PluginLoaderService');

export class PluginLoaderService {
    static async load(): Promise<Array<[BotPlugin, PluginMetadata]>> {
        // Get plugin directories list
        const directories = (await readDir(environment.plugin.rootDir, {
            withFileTypes: true,
        })).filter((v) => v.isDirectory());
        // Scan each plugin and filter by isEnabled
        const validPlugins = (await Promise.all(
            directories.map(async (d) => {
                try {
                    const { default: metadata } = await import(path.join(environment.plugin.rootDir, d.name, 'package.json'), { with: { type: 'json' } });
                    return [d.name, metadata];
                } catch (e) {
                    logger.warn('Failed to load package.json : ', e);
                    return [];
                }
            }),
        )).filter((v) => v.length > 0);
        return (await Promise.all(
            validPlugins
                .filter(([_, metadata]) => (environment.plugin.disabledPluginNames.findIndex((name) => name === metadata.name) < 0))
                .map(async ([dirName, metadata]) => {
                    try {
                        return [await import(path.join(environment.plugin.rootDir, dirName, 'index.ts')), metadata];
                    } catch (e) {
                        logger.warn(`Failed to load plugin ${metadata.name} : `, e);
                        return void 0;
                    }
                }),
        )).filter((v) => v !== void 0) as Array<[BotPlugin, PluginMetadata]>;
    }
}

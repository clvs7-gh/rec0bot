import { readdir as _readDir, readFile as _readFile } from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { environment } from '../environment/environment';
import { BotPlugin } from '../interface/bot-plugin.interface';
import { PluginMetadata } from '../interface/plugin-metadata.interface';
import { LoggerService } from './logger.service';

const readDir = promisify(_readDir);
const readFile = promisify(_readFile);

const logger = LoggerService.getLogger('PluginLoaderService');

export class PluginLoaderService {
    static async load(): Promise<Array<[BotPlugin, PluginMetadata]>> {
        // Get plugin directories list
        const directories = (await readDir(environment.plugin.rootDir, {
            withFileTypes: true,
        })).filter((v) => v.isDirectory());
        // Scan each plugin and filter by isEnabled
        const validPlugins = (await Promise.all(
            directories.map(async (v) => {
                try {
                    return [v.name, await readFile(path.join(environment.plugin.rootDir, v.name, 'package.json'), {encoding: 'utf-8'})];
                } catch (e) {
                    logger.warn('Failed to load package.json : ', e);
                    return [];
                }
            }),
        )).filter((v) => v.length > 0);
        return <Array<[BotPlugin, PluginMetadata]>> (await Promise.all(
            validPlugins.map(([dirName, rawJson]) => [dirName, JSON.parse(rawJson)])
                .filter(([dirName, metadata]) => (environment.plugin.disabledPluginNames.findIndex((name) => name === metadata.name) < 0))
                .map(async ([dirName, metadata]) => {
                    try {
                        return [await import(path.join(environment.plugin.rootDir, dirName, 'index.js'))
                            .catch((e) => {
                                logger.warn(`Failed to load js of ${metadata.name} : `, e);
                                return environment.isProduction ?
                                    Promise.reject(e) : import(path.join(environment.plugin.rootDir, dirName, 'index.ts'));
                            }), metadata];
                    } catch (e) {
                        logger.warn(`Failed to load plugin ${metadata.name} : `, e);
                        return void 0;
                    }
                }),
        )).filter((v) => v !== void 0);
    }
}

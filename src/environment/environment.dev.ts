import * as path from 'path';
import type { Environment } from '../interface/environment.interface.ts';

export const environmentDev: Omit<Environment, 'version'> = {
    isProduction: false,
    slack: {
        token: {
            web: (process.env.REC0_ENV_SLACK_WEBAPI_TOKEN || '').trim(),
            sock: (process.env.REC0_ENV_SLACK_SOCK_TOKEN || '').trim(),
        },
        useMock: (process.env.REC0_ENV_SLACK_USE_MOCK || 'true').trim().toLowerCase() === 'true'
    },
    plugin: {
        rootDir: path.resolve(process.env.REC0_ENV_PLUGIN_DIR_PATH || path.resolve(import.meta.dirname, '../../plugins')),
        disabledPluginNames: (process.env.REC0_ENV_PLUGIN_DISABLED_NAMES || '').split(',').map((n) => n.trim()) || [],
        timeoutMs: Number((process.env.REC0_ENV_PLUGIN_TIMEOUT_MS || '1000').trim()),
        failOnTimeout: (process.env.REC0_ENV_PLUGIN_FAIL_ON_TIMEOUT || 'true').trim().toLowerCase() === 'true'
    }
};

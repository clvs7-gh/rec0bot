import * as path from 'path';
import { Environment } from '../interface/environment.interface';

export const environmentDev: Environment = {
    version: '1.3.0',
    isProduction: false,
    slack: {
        token: (process.env.REC0_ENV_SLACK_TOKEN || '').trim(),
        useMock: (process.env.REC0_ENV_SLACK_USE_MOCK || 'true').trim().toLowerCase() === 'true'
    },
    plugin: {
        rootDir: path.resolve(process.env.REC0_ENV_PLUGIN_DIR_PATH || path.resolve(__dirname, '../../plugins')),
        disabledPluginNames: (process.env.REC0_ENV_PLUGIN_DISABLED_NAMES || '').split(',').map((n) => n.trim()) || []
    }
};

import * as log4js from 'log4js';
import { Logger } from 'log4js';
import { environment } from '../environment/environment';

log4js.configure({
    appenders: {
        console: {
            type: 'console',
            layout: {
                type: 'colored',
                pattern: '[%d{ISO8601_WITH_TZ_OFFSET}][%p] %c: %m',
            }
        }
    },
    categories: {
        default: {appenders: ['console'], level: environment.isProduction ? 'warn' : 'debug'}
    }
});

export class LoggerService {
    static getLogger(name: string): Logger {
        return log4js.getLogger(name);
    }
}

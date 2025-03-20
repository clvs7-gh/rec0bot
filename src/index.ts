import { environment } from './environment/environment.ts';
import { BotService } from './service/bot.service.ts';
import { MockConnectorService } from './service/connector/mock-connector.service.ts';
import { SlackConnectorService } from './service/connector/slack-connector.service.ts';
import { LoggerService } from './service/logger.service.ts';

const logger = LoggerService.getLogger('Launcher');
logger.info(`REC0 Bot v${environment.version} has been started!`);
const bot = new BotService(environment.slack.useMock ?
    new MockConnectorService() :
    new SlackConnectorService(environment.slack.token.sock, environment.slack.token.web)
);
try {
    await bot.run();
} catch (e) {
    logger.error(e);
}

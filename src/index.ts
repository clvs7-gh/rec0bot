import { environment } from './environment/environment';
import { BotService } from './service/bot.service';
import { MockConnectorService } from './service/connector/mock-connector.service';
import { SlackConnectorService } from './service/connector/slack-connector.service';
import { LoggerService } from './service/logger.service';

async function main() {
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
}

main();

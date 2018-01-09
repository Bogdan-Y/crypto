import { CoinIndexService } from './coin-index';
import { TelegramBotService } from './telegram-bot';

const telegramBotService = new TelegramBotService();
telegramBotService.init();

const coinIndexService = new CoinIndexService();
coinIndexService.pollingTicker();

export { telegramBotService };

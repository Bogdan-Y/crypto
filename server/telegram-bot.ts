import TelegramBot = require('node-telegram-bot-api');
const BOT_TOKEN = '543114484:AAHDP9YDt1zJMdTZaRwlzDbQHI65BV0hTl4';

export class TelegramBotService {
  bot = null;
  chatId = null;

  constructor() { }

  init() {
    this.bot = new TelegramBot(BOT_TOKEN, { polling: true });

    this.bot.on('message', msg => {
      const {chat: {id}} = msg;
      this.chatId = id;
      this.bot.sendMessage(id, 'Hello!');
    });
  }

  sendMessage(message: string): void {
    if (!this.chatId) { return; }
    this.bot.sendMessage(this.chatId, message);
  }
}

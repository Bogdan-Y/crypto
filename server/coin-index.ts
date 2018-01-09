import axios from "axios";
import { telegramBotService } from "./app";

const EXMO_API_KEY = 'https://api.exmo.com/v1/ticker/';
const COIN_PAIRS = ['BTC_USD', 'XRP_USD', 'LTC_USD', 'DASH_USD', 'BCH_USD'];

interface Ticker {
  name: string;
  avg: string;
  vol: string;
  low: string;
  high: string;
  updated: number;
  vol_curr: string;
  buy_price: string;
  sell_price: string;
  last_trade: string;
  dayPercentages: number;
}

export class CoinIndexService {
  tickers = null;

  constructor() { }

  pollingTicker(): void {
    setInterval(() => {
      axios.get(EXMO_API_KEY)
        .then(res => this.successTickerRequest(res.data))
        .catch(error => console.log(error));
    }, 1000 * 60 * 5);
  }

  private successTickerRequest(tickers): void {
    console.log('successTickerRequest');
    const filtredTicker = COIN_PAIRS.map(pair => {
      const ticker = tickers[pair];
      ticker.name = pair;

      return ticker;
    });

    this.setTickers(filtredTicker);
  }

  private setTickers(tickers: Ticker[]): void {
    const newTickers = this.setDayPercentagesChanges(tickers);

    if (!this.tickers) {
      this.tickers = newTickers;
      return;
    }

    newTickers.forEach(ticker => {
      this.checkChanges(ticker);
    });
  }

  private checkChanges(ticker: Ticker) {
    this.tickers.forEach(previousTicker => {
      if (previousTicker.name === ticker.name) {
        if (
          ticker.dayPercentages > previousTicker.dayPercentages + 2 ||
          ticker.dayPercentages < previousTicker.dayPercentages + -2
        ) {
          console.log('sendTelegramNotification');
          this.sendTelegramNotification(ticker);
          this.replaceTicker(ticker);
        }
      }
    });
  }

  private replaceTicker (ticker: Ticker) {
    this.tickers = this.tickers.map(prevTicker => {
      if (prevTicker.name === ticker.name) {
        return ticker;
      } else {
        return prevTicker;
      }
    });
  }

  private sendTelegramNotification(ticker: Ticker) {
    const data = `${ticker.name}: ${ticker.last_trade}/${ticker.dayPercentages}%`;
    telegramBotService.sendMessage(data);
  }

  private setDayPercentagesChanges(tickers: Ticker[]): Ticker[] {
    return tickers.map(ticker => {
      const avg = +ticker.avg;
      const last_trade = +ticker.last_trade;
      const difference = last_trade - avg;
      ticker.dayPercentages = (difference / avg) * 100;

      return ticker;
    });
  }
}

import axios from "axios";

export const getTickerData = async (ticker: string) => {
  const API_KEY = process.env.BYBIT_API_KEY;
  const API_SECRET = process.env.BYBIT_API_SECRET;

  if (!API_KEY || !API_SECRET) {
    throw new Error("API key or secret is missing");
  }

  const endpoint = `https://api.bybit.com/v5/market/tickers?category=spot&symbol=${ticker}`;
  const headers = {
    "X-BYBIT-API-KEY": API_KEY,
    "Content-Type": "application/json",
  };

  try {
    const res = await axios.get(endpoint, { headers });

    if (res.data.result.length === 0) {
      throw new Error("Ticker not found");
    }

    return res.data.result.list;
  } catch (err) {
    console.error(err);
    throw new Error("Internal Server Error");
  }
}

export type TKLineDto = {
  timestamp: number,
  open: number,
  high: number,
  low: number,
  close: number,
  volume: number
}

export type TKLineInervileTime = "1min" | "5min" | "15min" | "30min" | "1h" | "4h" | "1d";

const intervalMap: Record<TKLineInervileTime, number | string> = {
  "1min": 1,
  "5min": 5,
  "15min": 15,
  "30min": 30,
  "1h": 60,
  "4h": 240,
  "1d": "D",
};
const dailyLimit = 7;
const limitsMap: Record<TKLineInervileTime, number> = {
  "1min": dailyLimit * 1440,
  "5min": dailyLimit * 288,
  "15min": dailyLimit * 96,
  "30min": dailyLimit * 48,
  "1h": dailyLimit * 24,
  "4h": dailyLimit * 6,
  "1d": dailyLimit,
};

export const getKLines = async (
  ticker: string,
  intervalTime: TKLineInervileTime,
  category: string = 'linear'
): Promise<TKLineDto[]> => {
  const endpoint = `https://api.bybit.com/v5/market/kline`;

  const params = {
    category,       //  "spot" or 'linear' for futures
    symbol: ticker, // e.g., "BTCUSDC"
    interval: intervalMap[intervalTime],          // "D" for daily candles
    limit: limitsMap[intervalTime],               // Fetch the latest 1 daily candle
  };
  console.log('[getKLines] params', ticker, intervalTime, params);

  const response = await axios.get(endpoint, { params });
  console.log('[getKLines]', ticker, intervalTime, response.data);

  if (response.data.retCode !== 0) {
    throw new Error(`Error fetching KLines: ${JSON.stringify(response.data)}`);
  }

  if (!response.data.result?.list?.length) {
    throw new Error("No KLines found");
  }

  return response.data.result.list.map((item: any) => {
    const kline: TKLineDto = {
      timestamp: item[0],
      open: item[1],
      high: item[2],
      low: item[3],
      close: item[4],
      volume: item[5],
    };
    return kline;
  });
};
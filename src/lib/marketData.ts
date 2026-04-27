import { fetchBinanceUsdtPrice, fetchAlphaGlobalQuote } from "./marketQuote";
import { fetchCoinGeckoDaily, validateCryptoSymbol } from "./cryptoMarket";
import { fetchAlphaVantageDaily, generateSimulatedCryptoSeries, generateSimulatedSeries } from "./series";
import type { DataSource, Market, OHLCV } from "../types";

export type MarketDataResult = {
  series: OHLCV[];
  source: DataSource;
  liveQuote: { price: number; fetchedAt: number; source: string } | null;
};

const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY?.trim();

export async function fetchMarketData(market: Market, ticker: string): Promise<MarketDataResult> {
  const sym = ticker.trim().toUpperCase();
  let series: OHLCV[] | null = null;
  let source: DataSource = "simulated";
  let liveQuote: MarketDataResult["liveQuote"] = null;

  if (market === "stocks") {
    if (apiKey) {
      series = await fetchAlphaVantageDaily(sym, apiKey);
      if (series) source = "live";
    }
    if (!series) {
      series = generateSimulatedSeries(sym);
    }
    if (apiKey) {
      const q = await fetchAlphaGlobalQuote(sym, apiKey);
      if (q) liveQuote = { price: q.price, fetchedAt: q.fetchedAt, source: q.source };
    }
  } else {
    const valid = validateCryptoSymbol(sym);
    const t = valid ?? sym;
    series = await fetchCoinGeckoDaily(t);
    if (series) source = "live";
    if (!series) {
      series = generateSimulatedCryptoSeries(t);
    }
    const b = await fetchBinanceUsdtPrice(t);
    if (b) liveQuote = { price: b.price, fetchedAt: b.fetchedAt, source: b.source };
  }

  if (!liveQuote && series.length) {
    const last = series.at(-1)!.close;
    liveQuote = { price: last, fetchedAt: Date.now(), source: "series" };
  }

  return { series, source, liveQuote };
}

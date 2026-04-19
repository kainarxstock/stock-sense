import { useCallback, useEffect, useState } from "react";
import { analyzeSeries } from "../lib/analyze";
import { fetchCoinGeckoDaily, validateCryptoSymbol } from "../lib/cryptoMarket";
import { fetchAlphaVantageDaily, generateSimulatedCryptoSeries, generateSimulatedSeries } from "../lib/series";
import type { AnalysisResult, DataSource, Market, OHLCV } from "../types";

type LoadState =
  | { status: "idle" }
  | { status: "loading"; ticker: string }
  | { status: "error"; message: string }
  | {
      status: "ready";
      ticker: string;
      series: OHLCV[];
      analysis: AnalysisResult;
      source: DataSource;
    };

const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY?.trim();

export function useStockSeries(market: Market) {
  const [state, setState] = useState<LoadState>({ status: "loading", ticker: "AAPL" });

  const load = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim().toUpperCase();
      if (!trimmed) {
        setState({ status: "error", message: "Symbol required." });
        return;
      }

      if (market === "stocks") {
        if (!/^[A-Z]{1,6}$/.test(trimmed)) {
          setState({
            status: "error",
            message: "Equities: letters only, 1–6 characters (e.g. AAPL).",
          });
          return;
        }
      } else {
        const ok = validateCryptoSymbol(trimmed);
        if (!ok) {
          setState({
            status: "error",
            message: "Crypto: 2–12 chars, A–Z and 0–9, must start with a letter (e.g. BTC, PEPE).",
          });
          return;
        }
      }

      const ticker = market === "stocks" ? trimmed : validateCryptoSymbol(trimmed)!;

      setState({ status: "loading", ticker });

      try {
        let series: OHLCV[] | null = null;
        let source: DataSource = "simulated";

        if (market === "stocks") {
          if (apiKey) {
            series = await fetchAlphaVantageDaily(ticker, apiKey);
            if (series) source = "live";
          }
          if (!series) {
            series = generateSimulatedSeries(ticker);
          }
        } else {
          series = await fetchCoinGeckoDaily(ticker);
          if (series) source = "live";
          if (!series) {
            series = generateSimulatedCryptoSeries(ticker);
          }
        }

        const analysis = analyzeSeries(series, { market, ticker });
        setState({ status: "ready", ticker, series, analysis, source });
      } catch {
        setState({
          status: "error",
          message: "Load failed. Check your connection and try again.",
        });
      }
    },
    [market],
  );

  useEffect(() => {
    const defaultTicker = market === "stocks" ? "AAPL" : "BTC";
    void load(defaultTicker);
  }, [market, load]);

  return { state, load };
}

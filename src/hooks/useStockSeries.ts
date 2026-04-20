import { useCallback, useEffect, useState } from "react";
import { fetchCoinGeckoDaily, validateCryptoSymbol } from "../lib/cryptoMarket";
import { fetchAlphaVantageDaily, generateSimulatedCryptoSeries, generateSimulatedSeries } from "../lib/series";
import type { DataSource, Market, OHLCV } from "../types";

type LoadState =
  | { status: "idle" }
  | { status: "loading"; ticker: string }
  | { status: "error"; messageKey: "symbolRequired" | "equityFormat" | "cryptoFormat" | "loadFailed" }
  | {
      status: "ready";
      ticker: string;
      series: OHLCV[];
      source: DataSource;
    };

const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY?.trim();

export function useStockSeries(market: Market) {
  const [state, setState] = useState<LoadState>({ status: "loading", ticker: "AAPL" });

  const load = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim().toUpperCase();
      if (!trimmed) {
        setState({ status: "error", messageKey: "symbolRequired" });
        return;
      }

      if (market === "stocks") {
        if (!/^[A-Z]{1,6}$/.test(trimmed)) {
          setState({
            status: "error",
            messageKey: "equityFormat",
          });
          return;
        }
      } else {
        const ok = validateCryptoSymbol(trimmed);
        if (!ok) {
          setState({
            status: "error",
            messageKey: "cryptoFormat",
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

        setState({ status: "ready", ticker, series, source });
      } catch {
        setState({
          status: "error",
          messageKey: "loadFailed",
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

import { useCallback, useEffect, useRef, useState } from "react";
import { validateCryptoSymbol } from "../lib/cryptoMarket";
import { fetchMarketData } from "../lib/marketData";
import type { DataSource, Market, OHLCV } from "../types";

export type LiveQuoteState = {
  price: number;
  fetchedAt: number;
  source: string;
};

type LoadState =
  | { status: "idle" }
  | { status: "loading"; ticker: string }
  | { status: "error"; messageKey: "symbolRequired" | "equityFormat" | "cryptoFormat" | "loadFailed" }
  | {
      status: "ready";
      ticker: string;
      series: OHLCV[];
      source: DataSource;
      /** Last successful full or partial data sync (ms). */
      lastUpdatedAt: number;
      liveQuote: LiveQuoteState | null;
    };

const REFRESH_MS = 25_000;

export function useStockSeries(market: Market) {
  const [state, setState] = useState<LoadState>({ status: "loading", ticker: "AAPL" });
  const readyRef = useRef<{ ticker: string } | null>(null);

  useEffect(() => {
    if (state.status === "ready") readyRef.current = { ticker: state.ticker };
    else readyRef.current = null;
  }, [state]);

  const load = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim().toUpperCase();
      if (!trimmed) {
        setState({ status: "error", messageKey: "symbolRequired" });
        return;
      }

      if (market === "stocks") {
        if (!/^[A-Z]{1,6}$/.test(trimmed)) {
          setState({ status: "error", messageKey: "equityFormat" });
          return;
        }
      } else {
        const ok = validateCryptoSymbol(trimmed);
        if (!ok) {
          setState({ status: "error", messageKey: "cryptoFormat" });
          return;
        }
      }

      const ticker = market === "stocks" ? trimmed : validateCryptoSymbol(trimmed)!;
      setState({ status: "loading", ticker });

      try {
        const data = await fetchMarketData(market, ticker);
        setState({
          status: "ready",
          ticker,
          series: data.series,
          source: data.source,
          liveQuote: data.liveQuote,
          lastUpdatedAt: Date.now(),
        });
      } catch {
        setState({ status: "error", messageKey: "loadFailed" });
      }
    },
    [market],
  );

  useEffect(() => {
    const defaultTicker = market === "stocks" ? "AAPL" : "BTC";
    void load(defaultTicker);
  }, [market, load]);

  useEffect(() => {
    const id = window.setInterval(async () => {
      const r = readyRef.current;
      if (!r) return;
      try {
        const data = await fetchMarketData(market, r.ticker);
        setState((prev) => {
          if (prev.status !== "ready" || prev.ticker !== r.ticker) return prev;
          return {
            ...prev,
            series: data.series,
            source: data.source,
            liveQuote: data.liveQuote,
            lastUpdatedAt: Date.now(),
          };
        });
      } catch {
        /* keep last good snapshot */
      }
    }, REFRESH_MS);
    return () => window.clearInterval(id);
  }, [market]);

  return { state, load };
}

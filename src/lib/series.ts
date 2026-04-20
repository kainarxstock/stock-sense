import type { OHLCV } from "../types";
import { mulberry32, seedFromString } from "./seed";

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Synthetic but stable daily series for any ticker (educational demo). */
export function generateSimulatedSeries(ticker: string, days = 90): OHLCV[] {
  const seed = seedFromString(ticker.toUpperCase());
  const rand = mulberry32(seed);
  const out: OHLCV[] = [];
  let price = 80 + rand() * 220;
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setUTCDate(d.getUTCDate() - i);
    if (d.getUTCDay() === 0 || d.getUTCDay() === 6) continue;

    const drift = (rand() - 0.48) * 0.018;
    const shock = (rand() - 0.5) * 0.035;
    const open = price;
    const close = Math.max(0.5, open * (1 + drift + shock));
    const hi = Math.max(open, close) * (1 + rand() * 0.012);
    const lo = Math.min(open, close) * (1 - rand() * 0.012);
    const volume = Math.round(800_000 + rand() * 4_500_000);

    out.push({
      date: formatDate(d),
      open: +open.toFixed(4),
      high: +hi.toFixed(4),
      low: +lo.toFixed(4),
      close: +close.toFixed(4),
      volume,
    });
    price = close;
  }

  return out;
}

/**
 * Synthetic crypto spot path: 7-day week, higher variance than equities demo.
 */
export function generateSimulatedCryptoSeries(ticker: string, days = 90): OHLCV[] {
  const sym = ticker.toUpperCase();
  const seed = seedFromString(`C|${sym}`);
  const rand = mulberry32(seed);
  const out: OHLCV[] = [];
  const base =
    sym === "BTC"
      ? 38_000 + rand() * 25_000
      : sym === "ETH"
        ? 1800 + rand() * 2200
        : 0.02 + rand() * Math.min(800, 120 + sym.length * 40);
  let price = base;
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setUTCDate(d.getUTCDate() - i);

    const drift = (rand() - 0.49) * 0.045;
    const shock = (rand() - 0.5) * 0.085;
    const open = price;
    const close = Math.max(1e-8, open * (1 + drift + shock));
    const hi = Math.max(open, close) * (1 + rand() * 0.022);
    const lo = Math.min(open, close) * (1 - rand() * 0.022);
    const volume = Math.round(2e6 + rand() * 8e7);

    const dec = close >= 1 ? 4 : 8;
    out.push({
      date: formatDate(d),
      open: +open.toFixed(dec),
      high: +hi.toFixed(dec),
      low: +lo.toFixed(dec),
      close: +close.toFixed(dec),
      volume,
    });
    price = close;
  }

  return out;
}

type AvDailyBar = { "1. open": string; "2. high": string; "3. low": string; "4. close": string; "5. volume": string };

/** Alpha Vantage TIME_SERIES_DAILY when API key is configured. */
export async function fetchAlphaVantageDaily(
  ticker: string,
  apiKey: string,
): Promise<OHLCV[] | null> {
  try {
    const symbol = encodeURIComponent(ticker.trim().toUpperCase());
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${encodeURIComponent(apiKey)}`;

    const res = await fetch(url);
    if (!res.ok) return null;
    const json: unknown = await res.json();

    if (!json || typeof json !== "object") return null;
    const root = json as {
      "Time Series (Daily)"?: Record<string, AvDailyBar>;
      Note?: string;
      "Error Message"?: string;
    };
    if (root["Error Message"] || root.Note) return null;
    const series = root["Time Series (Daily)"];
    if (!series) return null;

    const rows: OHLCV[] = Object.entries(series)
      .map(([date, bar]) => ({
        date,
        open: Number(bar["1. open"]),
        high: Number(bar["2. high"]),
        low: Number(bar["3. low"]),
        close: Number(bar["4. close"]),
        volume: Number(bar["5. volume"]),
      }))
      .filter((r) => Number.isFinite(r.close))
      .sort((a, b) => a.date.localeCompare(b.date));

    return rows.length ? rows : null;
  } catch {
    return null;
  }
}

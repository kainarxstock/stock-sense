/** Latest tradable price for display (educational app — not an execution feed). */

export type LiveQuote = {
  price: number;
  fetchedAt: number;
  source: "binance" | "alphavantage" | "series";
};

const BINANCE = "https://api.binance.com/api/v3/ticker/price";

export async function fetchBinanceUsdtPrice(symbol: string): Promise<LiveQuote | null> {
  const s = symbol.trim().toUpperCase();
  const pair = `${s}USDT`;
  try {
    const url = `${BINANCE}?symbol=${encodeURIComponent(pair)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json: unknown = await res.json();
    if (!json || typeof json !== "object") return null;
    const price = Number((json as { price?: string }).price);
    if (!Number.isFinite(price)) return null;
    return { price, fetchedAt: Date.now(), source: "binance" };
  } catch {
    return null;
  }
}

export async function fetchAlphaGlobalQuote(symbol: string, apiKey: string): Promise<LiveQuote | null> {
  const sym = symbol.trim().toUpperCase();
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(sym)}&apikey=${encodeURIComponent(apiKey)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json: unknown = await res.json();
    if (!json || typeof json !== "object") return null;
    const q = (json as { "Global Quote -"?: Record<string, string> })["Global Quote -"];
    if (!q) return null;
    const raw = q["05. price"];
    const price = Number(raw);
    if (!Number.isFinite(price)) return null;
    return { price, fetchedAt: Date.now(), source: "alphavantage" };
  } catch {
    return null;
  }
}

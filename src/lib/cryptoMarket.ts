/** Large-cap / liquid spot tickers (uppercase). Not shown meme/speculative warning. */
export const MAJOR_CRYPTO_TICKERS = new Set([
  "BTC",
  "ETH",
  "SOL",
  "BNB",
  "XRP",
  "ADA",
  "DOT",
  "MATIC",
  "POL",
  "LINK",
  "AVAX",
  "LTC",
  "ATOM",
  "UNI",
  "NEAR",
  "APT",
  "ARB",
  "OP",
  "TON",
  "FIL",
  "ETC",
  "XLM",
  "HBAR",
  "VET",
  "ALGO",
  "ICP",
  "SUI",
  "SEI",
  "TIA",
]);

/** Meme or narrative-heavy symbols — explicit warning copy. */
export const MEME_CRYPTO_TICKERS = new Set([
  "DOGE",
  "SHIB",
  "PEPE",
  "FLOKI",
  "BONK",
  "WIF",
  "MEME",
  "BOME",
  "MOG",
]);

/** Meme list or any symbol outside the curated major set (treated as higher narrative / liquidity risk). */
export function needsMemeOrSpeculativePanel(symbol: string): boolean {
  const s = symbol.toUpperCase();
  if (MEME_CRYPTO_TICKERS.has(s)) return true;
  if (!MAJOR_CRYPTO_TICKERS.has(s)) return true;
  return false;
}

export function isMemeCryptoSymbol(symbol: string): boolean {
  return MEME_CRYPTO_TICKERS.has(symbol.toUpperCase());
}

export function validateCryptoSymbol(raw: string): string | null {
  const s = raw.trim().toUpperCase();
  if (!s) return null;
  if (!/^[A-Z][A-Z0-9]{1,11}$/.test(s)) return null;
  return s;
}

/** CoinGecko API id for daily chart (optional live path). */
const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  XRP: "ripple",
  ADA: "cardano",
  DOGE: "dogecoin",
  DOT: "polkadot",
  LINK: "chainlink",
  AVAX: "avalanche-2",
  LTC: "litecoin",
  ATOM: "cosmos",
  UNI: "uniswap",
  NEAR: "near",
  APT: "aptos",
  ARB: "arbitrum",
  OP: "optimism",
  TON: "the-open-network",
  FIL: "filecoin",
  SHIB: "shiba-inu",
  PEPE: "pepe",
};

export async function fetchCoinGeckoDaily(symbol: string): Promise<import("../types").OHLCV[] | null> {
  const id = COINGECKO_IDS[symbol.toUpperCase()];
  if (!id) return null;

  const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=90`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json: unknown = await res.json();
    if (!json || typeof json !== "object") return null;
    const prices = (json as { prices?: [number, number][] }).prices;
    if (!Array.isArray(prices) || prices.length < 5) return null;

    const out: import("../types").OHLCV[] = [];
    for (let i = 0; i < prices.length; i++) {
      const [, p] = prices[i];
      if (!Number.isFinite(p)) continue;
      const d = new Date(prices[i][0]);
      const date = d.toISOString().slice(0, 10);
      const spread = Math.max(p * 0.004, 0.0001);
      const open = i > 0 ? prices[i - 1][1] : p;
      const close = p;
      const high = Math.max(open, close) + spread * 0.3;
      const low = Math.min(open, close) - spread * 0.3;
      const volume = Math.round(5e6 + ((i * 1103515245) >>> 0) % 25_000_000);
      out.push({
        date,
        open: +open.toFixed(6),
        high: +high.toFixed(6),
        low: +Math.max(low, 1e-12).toFixed(6),
        close: +close.toFixed(6),
        volume,
      });
    }
    return out.length ? out.sort((a, b) => a.date.localeCompare(b.date)) : null;
  } catch {
    return null;
  }
}

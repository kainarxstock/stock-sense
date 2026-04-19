import type {
  AnalysisResult,
  Bias,
  ExplanationReason,
  Market,
  MarketInterpretation,
  MomentumRead,
  OHLCV,
  SignalAgreement,
  SnapshotBiasLabel,
  StructureRead,
  TrendRead,
} from "../types";
import { buildBeginnerBrief, buildCryptoRiskNotes, buildLayer2Narrative } from "./beginnerBrief";
import { needsMemeOrSpeculativePanel } from "./cryptoMarket";
import {
  buildBiasContextLine,
  buildMarketState,
  buildStructuredInsight,
  classifyScenario,
} from "./narrative";

function mean(xs: number[]): number {
  if (!xs.length) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function stdev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  const v = mean(xs.map((x) => (x - m) ** 2));
  return Math.sqrt(v);
}

function linearSlopePct(closes: number[]): number {
  const n = closes.length;
  if (n < 2) return 0;
  const xs = Array.from({ length: n }, (_, i) => i);
  const mx = mean(xs);
  const my = mean(closes);
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (closes[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const base = closes[0] || 1;
  return (slope / base) * 100;
}

function lastSma(closes: number[], period: number): number | null {
  if (closes.length < period) return null;
  return mean(closes.slice(-period));
}

function rsiApprox(closes: number[], period = 14): number {
  if (closes.length < period + 1) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const ch = closes[i] - closes[i - 1];
    if (ch >= 0) gains += ch;
    else losses -= ch;
  }
  const avgG = gains / period;
  const avgL = losses / period;
  if (avgL === 0) return 100;
  const rs = avgG / avgL;
  return 100 - 100 / (1 + rs);
}

function classifyTrend(
  last: number,
  sma20: number | null,
  sma50: number | null,
  slope: number,
): TrendRead {
  if (sma20 !== null && sma50 !== null) {
    const stackedUp = sma20 >= sma50 && last >= sma20;
    const stackedDn = sma20 <= sma50 && last <= sma20;
    if (stackedUp && slope > -0.02) return "bullish";
    if (stackedDn && slope < 0.02) return "bearish";
  }
  if (slope > 0.04) return "bullish";
  if (slope < -0.04) return "bearish";
  return "neutral";
}

function classifyMomentum(
  recentReturnPct: number,
  slope: number,
  rsi: number,
  bias: Bias,
): MomentumRead {
  const mag = Math.abs(recentReturnPct);
  const slopeMag = Math.abs(slope);
  if (mag < 2.2 && slopeMag < 0.028) return "weak";
  if (
    (bias === "up" && rsi >= 62 && mag < 6) ||
    (bias === "up" && slope > 0 && slope < 0.055 && mag < 5) ||
    (recentReturnPct > 0 && slope > 0 && rsi >= 60 && mag < 7)
  ) {
    return "slowing";
  }
  if (mag >= 6 || slopeMag >= 0.07) return "strong";
  if (mag >= 3.5 || slopeMag >= 0.045) return "strong";
  return "slowing";
}

function classifyStructure(volatilityPct: number, market: Market): StructureRead {
  const stableBelow = market === "crypto" ? 32 : 27;
  return volatilityPct < stableBelow ? "stable" : "volatile";
}

function volLabelFromPct(volatilityPct: number, market: Market): string {
  if (market === "crypto") {
    if (volatilityPct < 30) return "low";
    if (volatilityPct < 52) return "moderate";
    return "high";
  }
  if (volatilityPct < 22) return "low";
  if (volatilityPct < 35) return "moderate";
  return "high";
}

/**
 * Internal signal agreement → displayed confidence (not forecast probability).
 * Strong alignment → ~60–80%; mixed → ~40–60%; conflict → below 40%.
 */
function computeDynamicConfidence(params: {
  trend: TrendRead;
  momentum: MomentumRead;
  structure: StructureRead;
  bias: Bias;
  recentReturnPct: number;
  trendSlopePct: number;
  market: Market;
}): { confidence: number; agreement: SignalAgreement } {
  let score = 50;

  const trendDir = params.trend === "bullish" ? 1 : params.trend === "bearish" ? -1 : 0;

  let momDir = 0;
  if (params.momentum === "strong") {
    if (params.recentReturnPct > 1.2) momDir = 1;
    else if (params.recentReturnPct < -1.2) momDir = -1;
    else if (params.trendSlopePct > 0.03) momDir = 1;
    else if (params.trendSlopePct < -0.03) momDir = -1;
  } else if (params.momentum === "slowing") {
    if (params.trendSlopePct > 0.028) momDir = 1;
    else if (params.trendSlopePct < -0.028) momDir = -1;
  }

  const biasSign = params.bias === "up" ? 1 : params.bias === "down" ? -1 : 0;

  if (trendDir !== 0 && momDir !== 0) {
    if (trendDir === momDir) score += 22;
    else score -= 28;
  } else if (trendDir !== 0 || momDir !== 0) {
    score -= 7;
  }

  if (biasSign !== 0 && trendDir !== 0) {
    if (biasSign === trendDir) score += 10;
    else score -= 16;
  }

  if (biasSign !== 0 && momDir !== 0) {
    if (biasSign === momDir) score += 8;
    else score -= 12;
  }

  const triple =
    trendDir !== 0 && trendDir === momDir && trendDir === biasSign;
  if (params.structure === "volatile" && !triple) score -= params.market === "crypto" ? 8 : 6;
  if (params.structure === "stable" && triple) score += 5;

  if (trendDir === 0 && momDir === 0 && biasSign === 0) {
    score = 48 + (params.structure === "stable" ? 4 : -6);
  }

  const raw = Math.min(88, Math.max(16, Math.round(score)));
  let pct: number;
  let agreement: SignalAgreement;
  if (raw >= 64) {
    agreement = "strong";
    pct = 60 + Math.round(((raw - 64) / (86 - 64)) * 20);
    pct = Math.min(80, Math.max(60, pct));
  } else if (raw >= 40) {
    agreement = "mixed";
    pct = 40 + Math.round(((raw - 40) / (64 - 40)) * 19);
    pct = Math.min(59, Math.max(40, pct));
  } else {
    agreement = "conflict";
    pct = 22 + Math.round(((raw - 16) / (40 - 16)) * 16);
    pct = Math.min(39, Math.max(22, pct));
  }

  return { confidence: pct / 100, agreement };
}

function snapshotBiasLabel(bias: Bias): SnapshotBiasLabel {
  if (bias === "up") return "slightly_bullish";
  if (bias === "down") return "bearish";
  return "sideways";
}

function formatTrend(t: TrendRead): string {
  if (t === "bullish") return "Bullish";
  if (t === "bearish") return "Bearish";
  return "Neutral";
}

function formatMomentum(m: MomentumRead): string {
  if (m === "strong") return "Strong";
  if (m === "slowing") return "Slowing";
  return "Weak";
}

function formatStructure(s: StructureRead): string {
  return s === "stable" ? "Stable" : "Volatile";
}

function formatSnapshotBias(b: SnapshotBiasLabel): string {
  if (b === "slightly_bullish") return "Slightly bullish";
  if (b === "bearish") return "Bearish";
  return "Sideways";
}

function buildInterpretation(params: {
  last: number;
  sma20: number | null;
  sma50: number | null;
  trendSlopePct: number;
  recentReturnPct: number;
  rsi: number;
  volatilityPct: number;
  bias: Bias;
  market: Market;
}): MarketInterpretation {
  const { last, sma20, sma50, trendSlopePct, recentReturnPct, rsi, volatilityPct, bias, market } = params;

  const trend = classifyTrend(last, sma20, sma50, trendSlopePct);
  const momentum = classifyMomentum(recentReturnPct, trendSlopePct, rsi, bias);
  const structure = classifyStructure(volatilityPct, market);
  const snapBias = snapshotBiasLabel(bias);

  const trendMeanings: Record<TrendRead, string> = {
    bullish: "Averages and slope point to buyers controlling the short window.",
    bearish: "Price sits under pressure versus its slow trend lines in this sample.",
    neutral: "No durable edge to trend: mixed or flat structure versus moving averages.",
  };

  const momMeanings: Record<MomentumRead, string> = {
    strong: "Recent returns and slope agree; the move has had conviction on this horizon.",
    slowing: "Direction may still be positive, but pace is cooling—often a late-cycle tell in a swing.",
    weak: "Little net progress; impulse is missing even if noise prints both ways.",
  };

  const structMeanings: Record<StructureRead, string> = {
    stable: "Day-to-day swings are contained versus a high-vol regime.",
    volatile: "Realized variance is elevated; levels matter less than ranges.",
  };

  const biasMeanings: Record<SnapshotBiasLabel, string> = {
    slightly_bullish: "The composite read leans positive without claiming a forecast.",
    bearish: "The composite read leans negative for this horizon only.",
    sideways: "Signals disagree or cancel; treat direction as unresolved.",
  };

  return {
    trend: { value: formatTrend(trend), meaning: trendMeanings[trend] },
    momentum: { value: formatMomentum(momentum), meaning: momMeanings[momentum] },
    structure: { value: formatStructure(structure), meaning: structMeanings[structure] },
    bias: { value: formatSnapshotBias(snapBias), meaning: biasMeanings[snapBias] },
  };
}

function buildReasons(params: {
  last: number;
  sma20: number | null;
  sma50: number | null;
  trendSlopePct: number;
  recentReturnPct: number;
  rsi: number;
  volatilityPct: number;
  volLabel: string;
  market: Market;
}): ExplanationReason[] {
  const { last, sma20, sma50, trendSlopePct, recentReturnPct, rsi, volatilityPct, volLabel, market } =
    params;
  const volElevated = market === "crypto" ? volatilityPct >= 32 : volatilityPct >= 27;

  let trendBody: string;
  if (sma20 !== null && sma50 !== null) {
    const aboveBoth = last >= sma20 && last >= sma50;
    const belowBoth = last <= sma20 && last <= sma50;
    const golden = sma20 >= sma50;
    if (aboveBoth && golden) {
      trendBody = `Price holds above SMA20/50 with the faster line on top—right now that reads as bid control. Risk is pay-up: extensions revert faster when the stack gets vertical.`;
    } else if (belowBoth && !golden) {
      trendBody = `Price and SMA20 both sit under SMA50—supply in charge for this window. Until a reclaim, rallies are mostly borrowed time against the heavier mean.`;
    } else if (last > sma20 && last < sma50) {
      trendBody = `Stuck under the 50-day but over the 20-day: a repair bid, not a clean trend. The next leg is decided by whether overhead gives way on volume.`;
    } else if (last < sma20 && last > sma50) {
      trendBody = `Lost the 20-day, still above the 50-day—classic pullback vs early roll. Meaning hinges on whether the slow line holds on the next sell wave.`;
    } else {
      trendBody = `Averages ${golden ? "support" : "pressure"} price in a tight bundle—no winner yet. Breaks from coiled setups tend to run once one side steps away.`;
    }
  } else {
    trendBody = `Too few closes to trust SMA20/50 here—trend read is provisional until the window fills.`;
  }

  const momWords =
    trendSlopePct > 0.04 ? "firm positive" : trendSlopePct < -0.04 ? "firm negative" : "flat";

  const momentumBody = `~${recentReturnPct.toFixed(1)}% over ~20 sessions with a ${momWords} short slope. Right now that says whether the tape is paying for trend, not how far it “should” go.`;

  let rsiBody: string;
  if (rsi >= 70) {
    rsiBody = `RSI ~${rsi.toFixed(0)}: buying has been persistent—upside is crowded on this definition. It raises fade risk; it does not print a calendar for a top.`;
  } else if (rsi <= 30) {
    rsiBody = `RSI ~${rsi.toFixed(0)}: selling has been persistent—short-term exhaustion risk rises. Still needs price confirmation; washed can stay washed in a grind.`;
  } else {
    rsiBody = `RSI ~${rsi.toFixed(0)} sits mid-band—no extreme pressure on this lookback. The edge, if any, is coming from slope and averages, not the oscillator alone.`;
  }

  const volBody = volElevated
    ? `Realized vol ~${volatilityPct.toFixed(1)}% ann. (${volLabel})—ranges and gaps matter more than single prints.`
    : `Realized vol ~${volatilityPct.toFixed(1)}% ann. (${volLabel})—quieter tape; levels tend to hold until a catalyst steps in.`;

  return [
    { id: "trend", title: "Trend", body: trendBody },
    { id: "momentum", title: "Momentum", body: momentumBody },
    { id: "rsi", title: "RSI", body: rsiBody },
    { id: "volatility", title: "Volatility", body: volBody },
  ];
}

export function analyzeSeries(series: OHLCV[], ctx: { market: Market; ticker: string }): AnalysisResult {
  const { market, ticker } = ctx;
  const closes = series.map((r) => r.close);
  const last = closes.at(-1) ?? 0;
  const prev20 = closes.slice(-21, -1);
  const window = closes.slice(-22);
  const volWindow = closes.slice(-31, -1);

  const returns: number[] = [];
  for (let i = 1; i < volWindow.length; i++) {
    const a = volWindow[i - 1];
    const b = volWindow[i];
    if (a) returns.push((b - a) / a);
  }
  const volatilityPct = stdev(returns) * Math.sqrt(252) * 100;

  const trendSlopePct = linearSlopePct(window);
  const rsi = rsiApprox(closes);
  const recentReturnPct =
    prev20.length && prev20[0]
      ? ((last - prev20[0]) / prev20[0]) * 100
      : 0;

  const sma20 = lastSma(closes, 20);
  const sma50 = lastSma(closes, 50);

  let bias: Bias = "sideways";

  const strongUp = trendSlopePct > 0.06 && rsi < 68;
  const strongDown = trendSlopePct < -0.06 && rsi > 32;
  const choppyThreshold = market === "crypto" ? 46 : 38;
  const choppy = volatilityPct > choppyThreshold;

  if (choppy && Math.abs(trendSlopePct) < 0.1) {
    bias = "sideways";
  } else if (strongUp && recentReturnPct > -2) {
    bias = "up";
  } else if (strongDown && recentReturnPct < 2) {
    bias = "down";
  } else if (trendSlopePct > 0.02 && rsi < 72) {
    bias = "up";
  } else if (trendSlopePct < -0.02 && rsi > 28) {
    bias = "down";
  } else {
    bias = "sideways";
  }

  const volLabel = volLabelFromPct(volatilityPct, market);

  const trend = classifyTrend(last, sma20, sma50, trendSlopePct);
  const momentum = classifyMomentum(recentReturnPct, trendSlopePct, rsi, bias);
  const structure = classifyStructure(volatilityPct, market);

  const { confidence, agreement } = computeDynamicConfidence({
    trend,
    momentum,
    structure,
    bias,
    recentReturnPct,
    trendSlopePct,
    market,
  });

  const summary =
    bias === "up"
      ? "Composite skew constructive on this horizon—context for sizing and risk, not a price target."
      : bias === "down"
        ? "Composite skew defensive on this horizon—one lens; flow and headlines still sit outside this read."
        : "Composite skew flat—no clean lean from the inputs bundled here.";

  const interpretation = buildInterpretation({
    last,
    sma20,
    sma50,
    trendSlopePct,
    recentReturnPct,
    rsi,
    volatilityPct,
    bias,
    market,
  });

  const scenarioParams = {
    bias,
    trend,
    momentum,
    structure,
    rsi,
    recentReturnPct,
    trendSlopePct,
    volatilityPct,
  };
  const scenarioKey = classifyScenario(scenarioParams);
  const marketState = buildMarketState(scenarioParams);
  const coreInsight = buildStructuredInsight(scenarioKey, scenarioParams);
  const biasContext = buildBiasContextLine(scenarioKey, scenarioParams);

  const reasons = buildReasons({
    last,
    sma20,
    sma50,
    trendSlopePct,
    recentReturnPct,
    rsi,
    volatilityPct,
    volLabel,
    market,
  });

  const beginnerBrief = buildBeginnerBrief({
    p: scenarioParams,
    market,
  });

  const layer2 = buildLayer2Narrative(scenarioParams, volLabel);

  const memeOrSpeculative = market === "crypto" && needsMemeOrSpeculativePanel(ticker);
  const cryptoRiskNotes =
    market === "crypto"
      ? buildCryptoRiskNotes(volatilityPct, structure, ticker, memeOrSpeculative)
      : [];

  return {
    bias,
    confidence,
    agreement,
    summary,
    interpretation,
    marketState,
    coreInsight,
    biasContext,
    reasons,
    beginnerBrief,
    layer2,
    cryptoRiskNotes,
    metrics: {
      trendSlopePct,
      volatilityPct,
      rsiApprox: rsi,
      recentReturnPct,
      sma20,
      sma50,
    },
  };
}

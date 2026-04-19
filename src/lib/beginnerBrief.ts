import type {
  BeginnerBrief,
  Bias,
  Layer2Narrative,
  Market,
  MomentumRead,
  RiskLevel,
  StructureRead,
  TrendRead,
} from "../types";

type P = {
  trend: TrendRead;
  momentum: MomentumRead;
  structure: StructureRead;
  bias: Bias;
  rsi: number;
  volatilityPct: number;
  recentReturnPct: number;
};

function riskFromVol(vol: number, structure: StructureRead, market: Market): { level: RiskLevel; explain: string } {
  const highCut = market === "crypto" ? 55 : 42;
  const medCut = market === "crypto" ? 38 : 28;
  if (vol >= highCut || structure === "volatile") {
    return {
      level: "high",
      explain:
        market === "crypto"
          ? "Price is swinging hard—smaller size and wider stops matter more than usual."
          : "Price swings are large right now—surprises can arrive faster than on a quiet tape.",
    };
  }
  if (vol >= medCut) {
    return {
      level: "medium",
      explain: "Moves are normal-to-elevated—plan for two-sided days until things calm.",
    };
  }
  return {
    level: "low",
    explain: "Day-to-day moves look relatively contained for this window.",
  };
}

function marketStateLine(p: P): string {
  const { trend, momentum, bias, structure } = p;
  const upish = trend === "bullish" || bias === "up";
  const downish = trend === "bearish" || bias === "down";

  if (bias === "sideways" && (trend === "neutral" || momentum === "weak")) {
    return "Range / No clear edge";
  }
  if (bias === "sideways") {
    return "Range / No clear edge";
  }
  if (upish && momentum === "slowing") {
    return "Uptrend (weakening)";
  }
  if (upish && structure === "volatile") {
    return "Uptrend (unstable)";
  }
  if (upish) {
    return momentum === "strong" ? "Uptrend (firm)" : "Uptrend";
  }
  if (downish && structure === "volatile") {
    return "Downtrend (unstable)";
  }
  if (downish && momentum === "slowing") {
    return "Downtrend (easing)";
  }
  if (downish) {
    return momentum === "strong" ? "Downtrend (firm)" : "Downtrend";
  }
  return "Mixed / in-between";
}

function whatToDoLine(p: P): string {
  const { momentum, bias, structure, trend } = p;
  if (bias === "sideways") {
    return "Wait for confirmation";
  }
  if (momentum === "slowing" && (bias === "up" || trend === "bullish")) {
    return "Avoid chasing — momentum is slowing";
  }
  if (momentum === "slowing" && (bias === "down" || trend === "bearish")) {
    return "Don't rush a reversal — selling pressure is easing, not proven over";
  }
  if (structure === "volatile") {
    return "Trend idea may be intact — size down until ranges shrink";
  }
  if (momentum === "weak") {
    return "Stand aside or keep risk small until the next clear move";
  }
  if (bias === "up" || trend === "bullish") {
    return "Trend intact but watch for a pullback if pace stays hot";
  }
  if (bias === "down" || trend === "bearish") {
    return "Pressure still dominant — treat bounces as fragile until proven";
  }
  return "Wait for confirmation";
}

function whyLine(p: P): string {
  const { recentReturnPct, rsi, momentum, trend, bias } = p;
  const ret = recentReturnPct.toFixed(1);
  if (bias === "sideways") {
    return `Recent net change is about ${ret}% and the pieces don't agree on direction yet.`;
  }
  if (momentum === "slowing") {
    return `Price moved roughly ${ret}% over the window, but the speed of the move is cooling.`;
  }
  if (momentum === "strong") {
    return `Price moved roughly ${ret}% with follow-through still showing in this sample.`;
  }
  if (trend === "neutral") {
    return `Moving averages and slope don't line up into one clean story (${ret}% net).`;
  }
  return `RSI sits near ${rsi.toFixed(0)} in this window—use it as context, not a timer.`;
}

function simpleMarketState(p: P): string {
  const main = marketStateLine(p);
  if (main.includes("Range")) return "Sideways — no clear winner yet.";
  if (main.startsWith("Uptrend")) return "Mostly up lately.";
  if (main.startsWith("Downtrend")) return "Mostly down lately.";
  return "Mixed — the picture isn't clean.";
}

function simpleWhatToDo(p: P): string {
  if (p.bias === "sideways") return "Don't guess — wait for a clearer break.";
  if (p.momentum === "slowing" && (p.bias === "up" || p.trend === "bullish")) return "Don't buy the spike; let it prove itself first.";
  if (p.structure === "volatile") return "Use smaller size until things calm down.";
  return "Only add risk if your plan already says how you'll be wrong.";
}

function simpleWhy(p: P): string {
  return whyLine(p).split(".")[0] + ".";
}

function simpleRisk(r: { level: RiskLevel; explain: string }): string {
  if (r.level === "high") return "Risk is high — big swings are likely.";
  if (r.level === "medium") return "Risk is medium — normal chop is expected.";
  return "Risk looks lower here — still not risk-free.";
}

export function buildLayer2Narrative(p: P, volLabel: string): Layer2Narrative {
  const trendDetail =
    p.trend === "bullish"
      ? "Price is generally above its recent average path in this sample—buyers had the edge."
      : p.trend === "bearish"
        ? "Price is generally under its recent average path—sellers had the edge."
        : "Up and down forces are balanced in this window—no clean one-way path.";

  const momDetail =
    p.momentum === "strong"
      ? "Moves are still moving with energy—follow-through shows up in the numbers."
      : p.momentum === "slowing"
        ? "The move is losing steam—good trends can continue, but pay-up risk rises."
        : "Little net push either way—easy to get chopped if you force a direction.";

  const structDetail =
    p.structure === "stable"
      ? "Day-to-day swings are milder—levels tend to matter more than wild gaps."
      : "Swings are wider—one headline can reprice faster than on a quiet tape.";

  const volDetail =
    p.volatilityPct < 22
      ? `Annualized swing rate looks quiet (${volLabel})—still not “safe,” just calmer.`
      : p.volatilityPct < 35
        ? `Annualized swing rate looks moderate (${volLabel})—plan for normal two-way action.`
        : `Annualized swing rate looks elevated (${volLabel})—expect bigger surprises day to day.`;

  let rsiDetail: string;
  if (p.rsi >= 70) rsiDetail = "Buying has been persistent—snapbacks can arrive without warning.";
  else if (p.rsi <= 30) rsiDetail = "Selling has been persistent—relief bounces can appear, but need proof.";
  else rsiDetail = "Oscillator sits in the middle—edge, if any, is coming from trend and pace, not RSI alone.";

  return {
    trend: { title: "Trend", detail: trendDetail },
    momentum: { title: "Momentum", detail: momDetail },
    structure: { title: "Structure", detail: structDetail },
    volatility: { title: "Volatility", detail: volDetail },
    rsi: { title: "RSI (context)", detail: rsiDetail },
  };
}

export function buildCryptoRiskNotes(
  volatilityPct: number,
  structure: StructureRead,
  _ticker: string,
  memeOrSpeculative: boolean,
): string[] {
  const notes: string[] = [
    "Crypto behaves faster and more unpredictably than equities.",
    "High volatility — avoid large position sizes",
    "Possible sharp reversals",
  ];
  if (structure === "volatile" || volatilityPct >= 50) {
    notes.push("Wide ranges — entries and exits need extra slack.");
  }
  if (memeOrSpeculative && volatilityPct >= 45) {
    notes.push("Meme / thin-name risk: prices can gap on sentiment with little warning.");
  }
  return notes;
}

export function buildBeginnerBrief(params: { p: P; market: Market }): BeginnerBrief {
  const { p, market } = params;
  const risk = riskFromVol(p.volatilityPct, p.structure, market);

  const brief: BeginnerBrief = {
    marketState: marketStateLine(p),
    whatToDo: whatToDoLine(p),
    why: whyLine(p),
    riskLevel: risk.level,
    riskExplain: risk.explain,
    simple: {
      marketState: simpleMarketState(p),
      whatToDo: simpleWhatToDo(p),
      why: simpleWhy(p),
      riskExplain: simpleRisk(risk),
    },
  };

  if (market === "crypto") {
    brief.why += " Crypto prints wider swings than large-cap stocks for the same read.";
    brief.simple.why += " Crypto moves faster than typical stocks.";
  }

  return brief;
}

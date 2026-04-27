import type { AnalysisResult, Bias, Market, MomentumRead, TrendRead } from "../types";

export type DecisionMarketStatus = "trending" | "neutral" | "volatile" | "risky";
export type DecisionAction = "WAIT" | "ENTER_SMALL" | "HOLD" | "EXIT";
export type DecisionTone = "green" | "yellow" | "red";
export type VolDisplayTier = "low" | "medium" | "high";

export type DecisionContext = {
  assetLabel: string;
  marketStatus: DecisionMarketStatus;
  action: DecisionAction;
  tone: DecisionTone;
  confidencePct: number;
  trendSimple: "up" | "down" | "sideways";
  momentumSimple: "weak" | "strong";
  volTier: VolDisplayTier;
  combinationKey: string;
  explainKeys: readonly string[];
};

function volTierFromPct(volatilityPct: number, market: Market): VolDisplayTier {
  if (market === "crypto") {
    if (volatilityPct < 30) return "low";
    if (volatilityPct < 52) return "medium";
    return "high";
  }
  if (volatilityPct < 22) return "low";
  if (volatilityPct < 35) return "medium";
  return "high";
}

function isVolatileStructure(volatilityPct: number, market: Market): boolean {
  const stableBelow = market === "crypto" ? 32 : 27;
  return volatilityPct >= stableBelow;
}

function trendSimpleFromReads(trend: TrendRead, bias: Bias): "up" | "down" | "sideways" {
  if (bias === "up" || trend === "bullish") return "up";
  if (bias === "down" || trend === "bearish") return "down";
  return "sideways";
}

function momentumSimple(m: MomentumRead): "weak" | "strong" {
  return m === "strong" ? "strong" : "weak";
}

function deriveMarketStatus(
  a: AnalysisResult,
  market: Market,
  volTier: VolDisplayTier,
  volatileStructure: boolean,
): DecisionMarketStatus {
  const { beginnerBrief, bias, metrics } = a;
  const { riskLevel } = beginnerBrief;
  const vol = metrics.volatilityPct;
  const veryHighVol = market === "crypto" ? vol >= 58 : vol >= 45;

  if (riskLevel === "high" || veryHighVol) return "risky";
  if (volatileStructure || volTier === "high") return "volatile";
  if (bias === "sideways") return "neutral";
  if (bias === "up" || bias === "down") return "trending";
  return "neutral";
}

function deriveAction(
  a: AnalysisResult,
  marketStatus: DecisionMarketStatus,
  volTier: VolDisplayTier,
  volatileStructure: boolean,
): DecisionAction {
  const { bias, agreement, beginnerBrief } = a;
  const { riskLevel } = beginnerBrief;
  const conflict = agreement === "conflict";
  const downish = bias === "down";
  const upish = bias === "up";
  const sideways = bias === "sideways";

  if (riskLevel === "high" && downish) return "EXIT";
  if (downish && (marketStatus === "risky" || riskLevel !== "low")) return "EXIT";
  if (downish && volTier === "high") return "EXIT";

  if (sideways || conflict) return "WAIT";
  if (riskLevel === "high" && !downish) return "WAIT";
  if (marketStatus === "volatile" && sideways) return "WAIT";
  if (marketStatus === "neutral" && volTier === "medium" && sideways) return "WAIT";

  if (upish) {
    if (riskLevel === "high" || volatileStructure || volTier === "high") return "ENTER_SMALL";
    if (riskLevel === "low" && volTier === "low" && !volatileStructure) return "HOLD";
    if (riskLevel === "medium") {
      if (volTier !== "low" || volatileStructure) return "ENTER_SMALL";
      return "HOLD";
    }
    return "ENTER_SMALL";
  }

  if (marketStatus === "risky") return "WAIT";

  void a;
  void marketStatus;
  return "WAIT";
}

function refineActionWithMomentum(
  action: DecisionAction,
  a: AnalysisResult,
  volTier: VolDisplayTier,
  volatileStructure: boolean,
): DecisionAction {
  const m = a.reads.momentum;
  if (action === "HOLD" && m === "strong" && volTier !== "low") return "ENTER_SMALL";
  if (action === "HOLD" && volatileStructure) return "ENTER_SMALL";
  return action;
}

function deriveTone(marketStatus: DecisionMarketStatus, action: DecisionAction): DecisionTone {
  if (action === "EXIT" || marketStatus === "risky") return "red";
  if (action === "WAIT" || marketStatus === "volatile" || marketStatus === "neutral") return "yellow";
  return "green";
}

function combinationKeyFor(
  marketStatus: DecisionMarketStatus,
  action: DecisionAction,
  trendSimple: "up" | "down" | "sideways",
  volTier: VolDisplayTier,
): string {
  if (marketStatus === "risky") return "decision.combination.risky";
  if (action === "EXIT") return "decision.combination.exitDefensive";
  if (marketStatus === "volatile" && trendSimple === "sideways") return "decision.combination.volatileSideways";
  if (marketStatus === "volatile") return "decision.combination.volatileTrend";
  if (action === "WAIT" && marketStatus === "neutral") return "decision.combination.neutralWait";
  if (action === "WAIT") return "decision.combination.wait";
  if (action === "ENTER_SMALL") return "decision.combination.enterSmall";
  if (action === "HOLD") return "decision.combination.hold";
  if (marketStatus === "trending" && volTier === "low") return "decision.combination.trendingCalm";
  return "decision.combination.default";
}

function explainKeysFor(
  action: DecisionAction,
  marketStatus: DecisionMarketStatus,
  trendSimple: "up" | "down" | "sideways",
): readonly string[] {
  if (action === "EXIT") return ["decision.explain.exit.1", "decision.explain.exit.2"] as const;
  if (action === "WAIT" && marketStatus === "volatile")
    return ["decision.explain.waitVolatile.1", "decision.explain.waitVolatile.2"] as const;
  if (action === "WAIT")
    return ["decision.explain.wait.1", "decision.explain.wait.2", "decision.explain.wait.3"] as const;
  if (action === "ENTER_SMALL")
    return ["decision.explain.enterSmall.1", "decision.explain.enterSmall.2"] as const;
  if (action === "HOLD") return ["decision.explain.hold.1", "decision.explain.hold.2"] as const;
  if (trendSimple === "up") return ["decision.explain.up.1", "decision.explain.up.2"] as const;
  if (trendSimple === "down") return ["decision.explain.down.1", "decision.explain.down.2"] as const;
  return ["decision.explain.neutral.1", "decision.explain.neutral.2"] as const;
}

/** Map internal analysis to beginner-facing decision support (educational, not advice). */
export function buildDecisionContext(analysis: AnalysisResult, market: Market, ticker: string): DecisionContext {
  const vol = analysis.metrics.volatilityPct;
  const volTier = volTierFromPct(vol, market);
  const volatileStructure = isVolatileStructure(vol, market);
  const { trend, momentum } = analysis.reads;

  const trendSimple = trendSimpleFromReads(trend, analysis.bias);
  const marketStatus = deriveMarketStatus(analysis, market, volTier, volatileStructure);
  let action = deriveAction(analysis, marketStatus, volTier, volatileStructure);
  action = refineActionWithMomentum(action, analysis, volTier, volatileStructure);

  const tone = deriveTone(marketStatus, action);
  const combinationKey = combinationKeyFor(marketStatus, action, trendSimple, volTier);
  const explainKeys = explainKeysFor(action, marketStatus, trendSimple);

  const pair = market === "crypto" ? `${ticker.toUpperCase()} / USDT` : `${ticker.toUpperCase()} / USD`;

  return {
    assetLabel: pair,
    marketStatus,
    action,
    tone,
    confidencePct: Math.round(analysis.confidence * 100),
    trendSimple,
    momentumSimple: momentumSimple(momentum),
    volTier,
    combinationKey,
    explainKeys,
  };
}


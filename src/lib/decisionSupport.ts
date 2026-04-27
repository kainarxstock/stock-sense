import type { AnalysisResult, Bias, Market, MomentumRead, RiskLevel, TrendRead } from "../types";

export type DecisionMarketStatus = "trending" | "downtrend" | "neutral" | "volatile" | "risky";
export type DecisionAction = "WAIT" | "ENTER_SMALL" | "HOLD" | "EXIT";
export type DecisionTone = "green" | "yellow" | "red";
export type VolDisplayTier = "low" | "medium" | "high";
export type ConfidenceBand = "low" | "medium" | "high";
export type RiskDisplay = "low" | "moderate" | "high";

export type DecisionContext = {
  assetLabel: string;
  marketStatus: DecisionMarketStatus;
  action: DecisionAction;
  tone: DecisionTone;
  confidencePct: number;
  confidenceBand: ConfidenceBand;
  trendSimple: "up" | "down" | "sideways";
  momentumSimple: "weak" | "strong";
  volTier: VolDisplayTier;
  riskDisplay: RiskDisplay;
  combinationKey: string;
  explainKeys: readonly string[];
  behaviorKey: string;
  positionSizeKey: string;
  invalidationKey: string;
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

function confidenceBandFromPct(pct: number): ConfidenceBand {
  if (pct < 50) return "low";
  if (pct <= 70) return "medium";
  return "high";
}

function riskDisplayFromLevel(level: RiskLevel): RiskDisplay {
  if (level === "high") return "high";
  if (level === "medium") return "moderate";
  return "low";
}

/** Align headline regime with trend/vol so the story stays internally consistent. */
function deriveMarketStatus(
  a: AnalysisResult,
  market: Market,
  volTier: VolDisplayTier,
  volatileStructure: boolean,
  trend: TrendRead,
  bias: Bias,
): DecisionMarketStatus {
  const { beginnerBrief, metrics } = a;
  const { riskLevel } = beginnerBrief;
  const vol = metrics.volatilityPct;
  const veryHighVol = market === "crypto" ? vol >= 58 : vol >= 45;

  if (riskLevel === "high" || veryHighVol) return "risky";
  if (volatileStructure || volTier === "high") return "volatile";

  const downish = bias === "down" || trend === "bearish";
  const upish = bias === "up" || trend === "bullish";

  if (downish) return "downtrend";
  if (upish) return "trending";
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
  if (marketStatus === "downtrend") return "yellow";
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
  if (marketStatus === "downtrend") return "decision.combination.downtrend";
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

function positionSizeKey(action: DecisionAction, risk: RiskDisplay): string {
  if (action === "EXIT" || action === "WAIT") return "decision.positionSize.waitExit";
  if (action === "HOLD") return "decision.positionSize.hold";
  if (risk === "high") return "decision.positionSize.enterSmallHigh";
  if (risk === "moderate") return "decision.positionSize.enterSmallMod";
  return "decision.positionSize.enterSmallLow";
}

function invalidationKey(action: DecisionAction): string {
  return `decision.invalidation.${action}`;
}

export function buildDecisionContext(analysis: AnalysisResult, market: Market, ticker: string): DecisionContext {
  const vol = analysis.metrics.volatilityPct;
  const volTier = volTierFromPct(vol, market);
  const volatileStructure = isVolatileStructure(vol, market);
  const { trend, momentum } = analysis.reads;

  const trendSimple = trendSimpleFromReads(trend, analysis.bias);
  const marketStatus = deriveMarketStatus(analysis, market, volTier, volatileStructure, trend, analysis.bias);
  let action = deriveAction(analysis, marketStatus, volTier, volatileStructure);
  action = refineActionWithMomentum(action, analysis, volTier, volatileStructure);

  const confidencePct = Math.round(analysis.confidence * 100);
  const confidenceBand = confidenceBandFromPct(confidencePct);
  const riskDisplay = riskDisplayFromLevel(analysis.beginnerBrief.riskLevel);
  const tone = deriveTone(marketStatus, action);
  const combinationKey = combinationKeyFor(marketStatus, action, trendSimple, volTier);
  const explainKeys = explainKeysFor(action, marketStatus, trendSimple);
  const behaviorKey = `decision.behavior.${action}`;
  const positionSizeKeyResolved = positionSizeKey(action, riskDisplay);
  const invalidationKeyResolved = invalidationKey(action);

  const pair = market === "crypto" ? `${ticker.toUpperCase()} / USDT` : `${ticker.toUpperCase()} / USD`;

  return {
    assetLabel: pair,
    marketStatus,
    action,
    tone,
    confidencePct,
    confidenceBand,
    trendSimple,
    momentumSimple: momentumSimple(momentum),
    volTier,
    riskDisplay,
    combinationKey,
    explainKeys,
    behaviorKey,
    positionSizeKey: positionSizeKeyResolved,
    invalidationKey: invalidationKeyResolved,
  };
}

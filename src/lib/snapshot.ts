import type { AnalysisResult } from "../types";

export type SnapshotTrend = "upward" | "downward" | "sideways";
export type SnapshotMomentum = "strong" | "weak" | "neutral";
export type SnapshotVolatility = "high" | "moderate" | "low";

export type SnapshotSummary = {
  trend: SnapshotTrend;
  momentum: SnapshotMomentum;
  volatility: SnapshotVolatility;
  riskLevel: AnalysisResult["beginnerBrief"]["riskLevel"];
  confidencePct: number;
};

export function buildSnapshotSummary(analysis: AnalysisResult): SnapshotSummary {
  const slope = analysis.metrics.trendSlopePct;
  const absSlope = Math.abs(slope);
  const recentAbs = Math.abs(analysis.metrics.recentReturnPct);
  const vol = analysis.metrics.volatilityPct;

  const trend: SnapshotTrend =
    slope > 0.025 ? "upward" : slope < -0.025 ? "downward" : "sideways";

  const momentum: SnapshotMomentum =
    absSlope >= 0.055 || recentAbs >= 5.5
      ? "strong"
      : absSlope <= 0.02 && recentAbs <= 2
        ? "weak"
        : "neutral";

  const volatility: SnapshotVolatility =
    vol >= 42 ? "high" : vol >= 28 ? "moderate" : "low";

  return {
    trend,
    momentum,
    volatility,
    riskLevel: analysis.beginnerBrief.riskLevel,
    confidencePct: Math.round(analysis.confidence * 100),
  };
}

export function buildPlainEnglishInterpretation(
  snapshot: SnapshotSummary,
  explainSimply: boolean,
): string {
  if (explainSimply) {
    if (snapshot.trend === "upward") {
      return snapshot.volatility === "high"
        ? "Price is mostly moving up, but it can swing hard in both directions."
        : "Price is mostly moving up right now.";
    }
    if (snapshot.trend === "downward") {
      return snapshot.volatility === "high"
        ? "Price is mostly moving down, and moves can be sharp."
        : "Price is mostly moving down right now.";
    }
    return "Price is moving sideways, so direction is not clear yet.";
  }

  if (snapshot.trend === "upward") {
    return snapshot.momentum === "strong"
      ? "This asset is in an upward trend with strong momentum, showing active buyer control."
      : "This asset is trending upward, but momentum is no longer accelerating.";
  }
  if (snapshot.trend === "downward") {
    return snapshot.momentum === "strong"
      ? "This asset is in a downward trend with persistent selling pressure."
      : "This asset is trending downward, though downside momentum is less forceful than before.";
  }
  return "This asset is in a sideways regime, with no durable directional edge in the current window.";
}

export function buildWhyThisMatters(snapshot: SnapshotSummary, explainSimply: boolean): string {
  if (explainSimply) {
    if (snapshot.volatility === "high") {
      return "Use smaller size and wait for cleaner moves before taking big risk.";
    }
    if (snapshot.trend === "sideways") {
      return "Waiting for a clearer break can help avoid random chop.";
    }
    return "The trend may continue, but avoid chasing fast candles.";
  }

  if (snapshot.volatility === "high") {
    return "Continuation is possible, but timing quality matters more when volatility expands.";
  }
  if (snapshot.trend === "sideways") {
    return "With weak directional structure, confirmation is usually more valuable than anticipation.";
  }
  return "The current bias supports continuation scenarios, but entries should still respect pullback and risk placement.";
}

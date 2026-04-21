import type { AnalysisResult } from "../types";
import { type Locale, translate } from "../i18n";

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
  locale: Locale,
): string {
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
  if (explainSimply) {
    if (snapshot.trend === "upward") {
      return snapshot.volatility === "high"
        ? t("snapshot.interpretation.simple.upHighVol")
        : t("snapshot.interpretation.simple.up");
    }
    if (snapshot.trend === "downward") {
      return snapshot.volatility === "high"
        ? t("snapshot.interpretation.simple.downHighVol")
        : t("snapshot.interpretation.simple.down");
    }
    return t("snapshot.interpretation.simple.sideways");
  }

  if (snapshot.trend === "upward") {
    return snapshot.momentum === "strong"
      ? t("snapshot.interpretation.advanced.upStrong")
      : t("snapshot.interpretation.advanced.up");
  }
  if (snapshot.trend === "downward") {
    return snapshot.momentum === "strong"
      ? t("snapshot.interpretation.advanced.downStrong")
      : t("snapshot.interpretation.advanced.down");
  }
  return t("snapshot.interpretation.advanced.sideways");
}

export function buildWhyThisMatters(snapshot: SnapshotSummary, explainSimply: boolean, locale: Locale): string {
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
  if (explainSimply) {
    if (snapshot.volatility === "high") {
      return t("snapshot.why.simple.highVol");
    }
    if (snapshot.trend === "sideways") {
      return t("snapshot.why.simple.sideways");
    }
    return t("snapshot.why.simple.default");
  }

  if (snapshot.volatility === "high") {
    return t("snapshot.why.advanced.highVol");
  }
  if (snapshot.trend === "sideways") {
    return t("snapshot.why.advanced.sideways");
  }
  return t("snapshot.why.advanced.default");
}

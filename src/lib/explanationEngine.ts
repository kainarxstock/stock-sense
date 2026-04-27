import type { AnalysisResult } from "../types";
import type { DecisionContext } from "./decisionSupport";

export type ConfidenceItem = {
  label: string;
  value: number;
};

export type DeterministicInsight = {
  explanation: string[];
  scenarios: string[];
  confidence: {
    items: ConfidenceItem[];
    finalScore: number;
  };
};

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export function buildDeterministicInsight(
  analysis: AnalysisResult,
  ctx: DecisionContext,
  t: (key: string) => string,
): DeterministicInsight {
  const trend = ctx.trendSimple;
  const momentum = ctx.momentumSimple;
  const vol = ctx.volTier;

  const explanation: string[] = [];
  if (trend === "up" && momentum === "strong" && vol === "low") {
    explanation.push(
      t("insights.explain.upStrongLow.1"),
      t("insights.explain.upStrongLow.2"),
    );
  } else if (trend === "down" && momentum === "weak") {
    explanation.push(
      t("insights.explain.downWeak.1"),
      t("insights.explain.downWeak.2"),
    );
  } else if (trend === "sideways") {
    explanation.push(
      t("insights.explain.sideways.1"),
      t("insights.explain.sideways.2"),
    );
  } else {
    explanation.push(
      t("insights.explain.mixed.1"),
      t("insights.explain.mixed.2"),
    );
  }
  if (vol === "high") {
    explanation.push(t("insights.explain.highVol"));
  }

  const scenarios: string[] = [];
  if (trend === "up") {
    scenarios.push(t("insights.scenarios.up.breakout"));
    scenarios.push(t("insights.scenarios.up.pullback"));
  } else if (trend === "down") {
    scenarios.push(t("insights.scenarios.down.breakdown"));
    scenarios.push(t("insights.scenarios.down.relief"));
  } else {
    scenarios.push(t("insights.scenarios.sideways.range"));
    scenarios.push(t("insights.scenarios.sideways.breakout"));
  }
  scenarios.push(t("insights.scenarios.default.wait"));

  const trendClarity = Math.abs(analysis.metrics.trendSlopePct);
  const trendScore = trendClarity > 0.08 ? 20 : trendClarity > 0.045 ? 14 : trendClarity > 0.02 ? 8 : 3;
  const momentumScore = momentum === "strong" ? 10 : momentum === "weak" ? -10 : 4;
  const volatilityScore = vol === "low" ? -4 : vol === "medium" ? -10 : -15;
  const conflictScore = analysis.agreement === "strong" ? 8 : analysis.agreement === "mixed" ? -6 : -16;

  const items: ConfidenceItem[] = [
    { label: t("insights.confidence.trendClarity"), value: trendScore },
    { label: t("insights.confidence.momentumStrength"), value: momentumScore },
    { label: t("insights.confidence.volatilityNoise"), value: volatilityScore },
    { label: t("insights.confidence.signalConflict"), value: conflictScore },
  ];
  const finalScore = clamp(50 + items.reduce((s, i) => s + i.value, 0), 0, 100);

  return { explanation, scenarios: scenarios.slice(0, 3), confidence: { items, finalScore } };
}

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
): DeterministicInsight {
  const trend = ctx.trendSimple;
  const momentum = ctx.momentumSimple;
  const vol = ctx.volTier;

  const explanation: string[] = [];
  if (trend === "up" && momentum === "strong" && vol === "low") {
    explanation.push(
      "The market is moving up with clear momentum, and volatility remains controlled.",
      "This combination supports continuation conditions with relatively lower noise.",
    );
  } else if (trend === "down" && momentum === "weak") {
    explanation.push(
      "Price structure is declining and momentum is not showing recovery strength.",
      "Directional conviction is limited, so downside pressure can persist unless signals improve.",
    );
  } else if (trend === "sideways") {
    explanation.push(
      "The market is range-bound with no clear directional edge right now.",
      "When trend is flat, entries usually need stronger confirmation to avoid random noise.",
    );
  } else {
    explanation.push(
      "Signals are partially aligned but not fully clean across trend, momentum, and volatility.",
      "The read supports caution and disciplined risk sizing while waiting for better alignment.",
    );
  }
  if (vol === "high") {
    explanation.push("High volatility increases uncertainty and risk, so decision quality matters more than speed.");
  }

  const scenarios: string[] = [];
  if (trend === "up") {
    scenarios.push("Breakout scenario: If price holds above recent resistance, continuation pressure can stay intact.");
    scenarios.push("Pullback scenario: If support fails, a short corrective move can develop before trend resumes.");
  } else if (trend === "down") {
    scenarios.push("Breakdown scenario: If support breaks again, downside continuation can remain active.");
    scenarios.push("Relief bounce scenario: If momentum stabilizes, price may retrace before deciding direction.");
  } else {
    scenarios.push("Range scenario: If momentum stays muted, price may continue consolidating between key levels.");
    scenarios.push("Breakout scenario: If momentum expands above resistance, a directional move can form.");
  }
  scenarios.push("Sideways scenario: If no signal improves, waiting for clearer structure remains the lower-risk path.");

  const trendClarity = Math.abs(analysis.metrics.trendSlopePct);
  const trendScore = trendClarity > 0.08 ? 20 : trendClarity > 0.045 ? 14 : trendClarity > 0.02 ? 8 : 3;
  const momentumScore = momentum === "strong" ? 10 : momentum === "weak" ? -10 : 4;
  const volatilityScore = vol === "low" ? -4 : vol === "medium" ? -10 : -15;
  const conflictScore = analysis.agreement === "strong" ? 8 : analysis.agreement === "mixed" ? -6 : -16;

  const items: ConfidenceItem[] = [
    { label: "Trend clarity", value: trendScore },
    { label: "Momentum strength", value: momentumScore },
    { label: "Volatility noise", value: volatilityScore },
    { label: "Signal conflict", value: conflictScore },
  ];
  const finalScore = clamp(50 + items.reduce((s, i) => s + i.value, 0), 0, 100);

  return { explanation, scenarios: scenarios.slice(0, 3), confidence: { items, finalScore } };
}

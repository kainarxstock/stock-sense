import type {
  Bias,
  MarketStateBlock,
  MomentumRead,
  StructureRead,
  StructuredCoreInsight,
  TrendRead,
} from "../types";
import { type Locale, translate } from "../i18n";

export type ScenarioKey =
  | "bearish_trend_up_bias"
  | "bullish_trend_sideways_bias"
  | "up_slow_bear_trend"
  | "up_slow"
  | "up_strong_vol"
  | "up_strong"
  | "up_weak"
  | "down_strong_vol"
  | "down_strong"
  | "down_weak"
  | "sideways_volatile"
  | "sideways_stable_midrsi"
  | "sideways_stable"
  | "sideways_rsi_hi"
  | "sideways_rsi_lo"
  | "default";

type ScenarioParams = {
  bias: Bias;
  trend: TrendRead;
  momentum: MomentumRead;
  structure: StructureRead;
  rsi: number;
  recentReturnPct: number;
  trendSlopePct: number;
  volatilityPct: number;
};

export function classifyScenario(p: ScenarioParams): ScenarioKey {
  const { bias, trend, momentum, structure, rsi } = p;
  if (trend === "bearish" && bias === "up") return "bearish_trend_up_bias";
  if (trend === "bullish" && bias === "sideways") return "bullish_trend_sideways_bias";
  if (bias === "up" && momentum === "slowing" && trend === "bearish") return "up_slow_bear_trend";
  if (bias === "up" && momentum === "slowing") return "up_slow";
  if (bias === "up" && momentum === "strong" && structure === "volatile") return "up_strong_vol";
  if (bias === "up" && momentum === "strong") return "up_strong";
  if (bias === "up" && momentum === "weak") return "up_weak";
  if (bias === "down" && momentum === "strong" && structure === "volatile") return "down_strong_vol";
  if (bias === "down" && momentum === "strong") return "down_strong";
  if (bias === "down" && momentum === "weak") return "down_weak";
  if (bias === "sideways" && structure === "volatile") return "sideways_volatile";
  if (bias === "sideways" && structure === "stable" && rsi >= 44 && rsi <= 56)
    return "sideways_stable_midrsi";
  if (bias === "sideways" && structure === "stable") return "sideways_stable";
  if (bias === "sideways" && rsi >= 62) return "sideways_rsi_hi";
  if (bias === "sideways" && rsi <= 38) return "sideways_rsi_lo";
  return "default";
}

export function buildMarketState(p: ScenarioParams, locale: Locale): MarketStateBlock {
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
  const { trend, momentum, structure, bias, volatilityPct } = p;
  const key =
    structure === "volatile" && volatilityPct >= 34
      ? "highVol"
      : bias === "sideways" && structure === "stable"
        ? "rangeStable"
        : bias === "sideways" && structure === "volatile"
          ? "twoWay"
          : (trend === "bullish" && bias === "up" && momentum === "strong") ||
              (trend === "bearish" && bias === "down" && momentum === "strong")
            ? "trendContinuation"
            : momentum === "slowing" || trend === "neutral"
              ? "transition"
              : "mixed";
  return {
    label: t(`analysis.narrative.marketState.${key}.label`),
    detail: t(`analysis.narrative.marketState.${key}.detail`),
  };
}

export function buildStructuredInsight(_key: ScenarioKey, p: ScenarioParams, locale: Locale): StructuredCoreInsight {
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
  const trendLabel =
    p.trend === "bullish"
      ? t("analysis.common.trend.bullish")
      : p.trend === "bearish"
        ? t("analysis.common.trend.bearish")
        : t("analysis.common.trend.neutral");
  const momentumLabel =
    p.momentum === "strong"
      ? t("analysis.common.momentum.strong")
      : p.momentum === "slowing"
        ? t("analysis.common.momentum.slowing")
        : t("analysis.common.momentum.weak");
  const structureLabel =
    p.structure === "volatile"
      ? t("analysis.common.structure.volatile")
      : t("analysis.common.structure.stable");

  return {
    trend: t("analysis.narrative.structuredGeneric.trend", { trend: trendLabel }),
    momentum: t("analysis.narrative.structuredGeneric.momentum", {
      momentum: momentumLabel,
      ret: p.recentReturnPct.toFixed(1),
    }),
    condition: t("analysis.narrative.structuredGeneric.condition", { structure: structureLabel }),
    implication: t("analysis.narrative.structuredGeneric.implication", {
      volatility: p.volatilityPct.toFixed(0),
    }),
    watchNext: t("analysis.narrative.structuredGeneric.watchNext"),
  };
}

export function buildBiasContextLine(_key: ScenarioKey, p: ScenarioParams, locale: Locale): string {
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
  if (p.bias === "sideways") return t("analysis.narrative.biasContextGeneric.sideways");
  if (p.bias === "up" && p.momentum === "strong") return t("analysis.narrative.biasContextGeneric.upStrong");
  if (p.bias === "down" && p.momentum === "strong") return t("analysis.narrative.biasContextGeneric.downStrong");
  if (p.momentum === "slowing") return t("analysis.narrative.biasContextGeneric.slowing");
  return t("analysis.narrative.biasContextGeneric.default");
}

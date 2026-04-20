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
import { type Locale, translate } from "../i18n";

type P = {
  trend: TrendRead;
  momentum: MomentumRead;
  structure: StructureRead;
  bias: Bias;
  rsi: number;
  volatilityPct: number;
  recentReturnPct: number;
};

function riskFromVol(
  vol: number,
  structure: StructureRead,
  market: Market,
  locale: Locale,
): { level: RiskLevel; explain: string } {
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
  const highCut = market === "crypto" ? 55 : 42;
  const medCut = market === "crypto" ? 38 : 28;
  if (vol >= highCut || structure === "volatile") {
    return {
      level: "high",
      explain: market === "crypto" ? t("analysis.beginner.riskExplain.highCrypto") : t("analysis.beginner.riskExplain.highStock"),
    };
  }
  if (vol >= medCut) {
    return {
      level: "medium",
      explain: t("analysis.beginner.riskExplain.medium"),
    };
  }
  return {
    level: "low",
    explain: t("analysis.beginner.riskExplain.low"),
  };
}

function marketStateLine(p: P, locale: Locale): string {
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
  const { trend, momentum, bias, structure } = p;
  const upish = trend === "bullish" || bias === "up";
  const downish = trend === "bearish" || bias === "down";

  if (bias === "sideways" && (trend === "neutral" || momentum === "weak")) {
    return t("analysis.beginner.marketState.range");
  }
  if (bias === "sideways") {
    return t("analysis.beginner.marketState.range");
  }
  if (upish && momentum === "slowing") {
    return t("analysis.beginner.marketState.upWeakening");
  }
  if (upish && structure === "volatile") {
    return t("analysis.beginner.marketState.upUnstable");
  }
  if (upish) {
    return momentum === "strong" ? t("analysis.beginner.marketState.upFirm") : t("analysis.beginner.marketState.up");
  }
  if (downish && structure === "volatile") {
    return t("analysis.beginner.marketState.downUnstable");
  }
  if (downish && momentum === "slowing") {
    return t("analysis.beginner.marketState.downEasing");
  }
  if (downish) {
    return momentum === "strong" ? t("analysis.beginner.marketState.downFirm") : t("analysis.beginner.marketState.down");
  }
  return t("analysis.beginner.marketState.mixed");
}

function whatToDoLine(p: P, locale: Locale): string {
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
  const { momentum, bias, structure, trend } = p;
  if (bias === "sideways") {
    return t("analysis.beginner.whatToDo.waitConfirm");
  }
  if (momentum === "slowing" && (bias === "up" || trend === "bullish")) {
    return t("analysis.beginner.whatToDo.avoidChasing");
  }
  if (momentum === "slowing" && (bias === "down" || trend === "bearish")) {
    return t("analysis.beginner.whatToDo.dontRushReversal");
  }
  if (structure === "volatile") {
    return t("analysis.beginner.whatToDo.sizeDown");
  }
  if (momentum === "weak") {
    return t("analysis.beginner.whatToDo.standAside");
  }
  if (bias === "up" || trend === "bullish") {
    return t("analysis.beginner.whatToDo.upWatchPullback");
  }
  if (bias === "down" || trend === "bearish") {
    return t("analysis.beginner.whatToDo.downPressure");
  }
  return t("analysis.beginner.whatToDo.waitConfirm");
}

function whyLine(p: P, locale: Locale): string {
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
  const { recentReturnPct, rsi, momentum, trend, bias } = p;
  const ret = recentReturnPct.toFixed(1);
  if (bias === "sideways") {
    return t("analysis.beginner.why.sideways", { ret });
  }
  if (momentum === "slowing") {
    return t("analysis.beginner.why.slowing", { ret });
  }
  if (momentum === "strong") {
    return t("analysis.beginner.why.strong", { ret });
  }
  if (trend === "neutral") {
    return t("analysis.beginner.why.neutralTrend", { ret });
  }
  return t("analysis.beginner.why.default", { rsi: rsi.toFixed(0) });
}

function simpleMarketState(p: P, locale: Locale): string {
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
  if (p.bias === "sideways") return t("analysis.beginner.simple.marketState.sideways");
  if (p.bias === "up" || p.trend === "bullish") return t("analysis.beginner.simple.marketState.up");
  if (p.bias === "down" || p.trend === "bearish") return t("analysis.beginner.simple.marketState.down");
  return t("analysis.beginner.simple.marketState.mixed");
}

function simpleWhatToDo(p: P, locale: Locale): string {
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
  if (p.bias === "sideways") return t("analysis.beginner.simple.whatToDo.waitBreak");
  if (p.momentum === "slowing" && (p.bias === "up" || p.trend === "bullish")) return t("analysis.beginner.simple.whatToDo.dontBuySpike");
  if (p.structure === "volatile") return t("analysis.beginner.simple.whatToDo.sizeDown");
  return t("analysis.beginner.simple.whatToDo.default");
}

function simpleWhy(p: P, locale: Locale): string {
  return whyLine(p, locale).split(".")[0] + ".";
}

function simpleRisk(r: { level: RiskLevel; explain: string }, locale: Locale): string {
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
  if (r.level === "high") return t("analysis.beginner.simple.risk.high");
  if (r.level === "medium") return t("analysis.beginner.simple.risk.medium");
  return t("analysis.beginner.simple.risk.low");
}

export function buildLayer2Narrative(p: P, volLabel: string, locale: Locale): Layer2Narrative {
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
  const trendDetail =
    p.trend === "bullish"
      ? t("analysis.layer2.trend.bullish")
      : p.trend === "bearish"
        ? t("analysis.layer2.trend.bearish")
        : t("analysis.layer2.trend.neutral");

  const momDetail =
    p.momentum === "strong"
      ? t("analysis.layer2.momentum.strong")
      : p.momentum === "slowing"
        ? t("analysis.layer2.momentum.slowing")
        : t("analysis.layer2.momentum.weak");

  const structDetail =
    p.structure === "stable"
      ? t("analysis.layer2.structure.stable")
      : t("analysis.layer2.structure.volatile");

  const volDetail =
    p.volatilityPct < 22
      ? t("analysis.layer2.volatility.low", { label: volLabel })
      : p.volatilityPct < 35
        ? t("analysis.layer2.volatility.medium", { label: volLabel })
        : t("analysis.layer2.volatility.high", { label: volLabel });

  let rsiDetail: string;
  if (p.rsi >= 70) rsiDetail = t("analysis.layer2.rsi.high");
  else if (p.rsi <= 30) rsiDetail = t("analysis.layer2.rsi.low");
  else rsiDetail = t("analysis.layer2.rsi.mid");

  return {
    trend: { title: t("deeper.trend"), detail: trendDetail },
    momentum: { title: t("deeper.momentum"), detail: momDetail },
    structure: { title: t("deeper.structure"), detail: structDetail },
    volatility: { title: t("deeper.volatility"), detail: volDetail },
    rsi: { title: t("deeper.rsiContext"), detail: rsiDetail },
  };
}

export function buildCryptoRiskNotes(
  volatilityPct: number,
  structure: StructureRead,
  _ticker: string,
  memeOrSpeculative: boolean,
  locale: Locale,
): string[] {
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
  const notes: string[] = [
    t("analysis.cryptoNotes.faster"),
    t("analysis.cryptoNotes.highVol"),
    t("analysis.cryptoNotes.reversal"),
  ];
  if (structure === "volatile" || volatilityPct >= 50) {
    notes.push(t("analysis.cryptoNotes.wideRange"));
  }
  if (memeOrSpeculative && volatilityPct >= 45) {
    notes.push(t("analysis.cryptoNotes.memeRisk"));
  }
  return notes;
}

export function buildBeginnerBrief(params: { p: P; market: Market; locale: Locale }): BeginnerBrief {
  const { p, market, locale } = params;
  const risk = riskFromVol(p.volatilityPct, p.structure, market, locale);
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);

  const brief: BeginnerBrief = {
    marketState: marketStateLine(p, locale),
    whatToDo: whatToDoLine(p, locale),
    why: whyLine(p, locale),
    riskLevel: risk.level,
    riskExplain: risk.explain,
    simple: {
      marketState: simpleMarketState(p, locale),
      whatToDo: simpleWhatToDo(p, locale),
      why: simpleWhy(p, locale),
      riskExplain: simpleRisk(risk, locale),
    },
  };

  if (market === "crypto") {
    brief.why += ` ${t("analysis.beginner.cryptoWhyAddon")}`;
    brief.simple.why += ` ${t("analysis.beginner.cryptoSimpleWhyAddon")}`;
  }

  return brief;
}

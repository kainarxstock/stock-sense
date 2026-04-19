import type {
  Bias,
  MarketStateBlock,
  MomentumRead,
  StructureRead,
  StructuredCoreInsight,
  TrendRead,
} from "../types";

function formatTrendLabel(t: TrendRead): string {
  if (t === "bullish") return "Bullish";
  if (t === "bearish") return "Bearish";
  return "Neutral";
}

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

export function buildMarketState(p: ScenarioParams): MarketStateBlock {
  const { trend, momentum, structure, bias, volatilityPct } = p;

  if (structure === "volatile" && volatilityPct >= 34) {
    return {
      label: "High-volatility expansion",
      detail:
        "Realized variance is elevated; day ranges dominate over level trades. Edges decay unless size matches the tape.",
    };
  }
  if (bias === "sideways" && structure === "stable") {
    return {
      label: "Range / consolidation",
      detail:
        "Price is compressing with contained disorder—supply and demand matched inside a box until a catalyst forces a vote.",
    };
  }
  if (bias === "sideways" && structure === "volatile" && volatilityPct < 34) {
    return {
      label: "Two-way / indecisive",
      detail:
        "Chop without a vol blow-off: wide day ranges, no held break. Two-sided risk dominates until a side commits on a close.",
    };
  }
  if (
    (trend === "bullish" && bias === "up" && momentum === "strong") ||
    (trend === "bearish" && bias === "down" && momentum === "strong")
  ) {
    return {
      label: "Trend continuation",
      detail:
        "Slow structure and short-window impulse point the same way. The open question is extension versus exhaustion, not direction.",
    };
  }
  if (
    (trend === "bearish" && bias === "up") ||
    (trend === "bullish" && bias === "sideways") ||
    momentum === "slowing" ||
    (trend === "neutral" && bias !== "sideways")
  ) {
    return {
      label: "Transition phase",
      detail:
        "Time frames disagree or pace is shifting—directional clarity is decaying. Capital should assume two-sided risk until one axis wins.",
    };
  }
  return {
    label: "Mixed regime",
    detail:
      "Signals do not line up into a single clean story. Treat the tape as unresolved until slope, range, or volatility picks a side.",
  };
}

const WATCH_DEFAULT =
  "What to watch next: slope inflection, realized-vol step-up, or a decisive close through the last swing high / low.";

export function buildStructuredInsight(key: ScenarioKey, p: ScenarioParams): StructuredCoreInsight {
  const { trend, momentum, structure, rsi, recentReturnPct, trendSlopePct, volatilityPct } = p;

  const trendWord =
    trend === "bullish"
      ? "Constructive on averages."
      : trend === "bearish"
        ? "Heavy vs slow lines."
        : "Mixed—no durable directional control.";
  const momWord =
    momentum === "strong"
      ? "Impulse still pays for directional risk."
      : momentum === "slowing"
        ? "Follow-through is cooling after the last leg."
        : "Impulse is thin—moves lack sponsorship.";

  switch (key) {
    case "bearish_trend_up_bias":
      return {
        trend: "Trend: averages still lean lower; structure has not flipped.",
        momentum: "Momentum: short-window lift—relief, cover, or flow—not a new backbone yet.",
        condition: "Market condition: bear-market rally / counter-trend noise until reclaim proves.",
        implication: "Practical implication: treat strength as tactical; invalidation is a failed hold above declining means.",
        watchNext:
          "What to watch next: whether the lift can close and hold above SMA20 / prior breakdown pivot.",
      };
    case "bullish_trend_sideways_bias":
      return {
        trend: "Trend: slow lines still constructive; fast inputs went flat.",
        momentum: "Momentum: digestion—pace rolled off without breaking the larger skew.",
        condition: "Market condition: pause or flag inside a broader drift higher.",
        implication:
          "Practical implication: directional conviction is medium; time decay hurts stale longs without a fresh catalyst.",
        watchNext:
          "What to watch next: a resumed push with participation, or a break of the last higher low.",
      };
    case "up_slow_bear_trend":
      return {
        trend: "Trend: negative backbone; bounces lose increment.",
        momentum: "Momentum: fading lift into overhead—slope flattening, not accelerating.",
        condition: "Market condition: rally selling into supply until a higher low on volume.",
        implication:
          "Practical implication: longs need a reclaim thesis; shorts still own time until structure improves.",
        watchNext: "What to watch next: failed reclaim at SMA20 / last lower high; vol expansion on down days.",
      };
    case "up_slow":
      return {
        trend: "Trend: still constructive in the composite, but edge is thinning.",
        momentum: "Momentum: slowing—ROC and slope no longer pay the same per day.",
        condition: "Market condition: mean-reversion / drift risk rises before trend proves broken.",
        implication:
          "Practical implication: size for chop; directional conviction is moderate-to-low on fresh adds.",
        watchNext:
          "What to watch next: whether the next dip holds the last swing low with narrowing vol.",
      };
    case "up_strong_vol":
      return {
        trend: "Trend: bid is real—price has advanced with positive short slope.",
        momentum: `Momentum: strong (~${recentReturnPct.toFixed(1)}% over ~20 sessions) but noisy.`,
        condition: `Market condition: high realized vol (~${volatilityPct.toFixed(0)}% ann.)—ranges dominate levels.`,
        implication:
          "Practical implication: risk budget is vol-first; direction without gap control is incomplete.",
        watchNext: "What to watch next: vol crush vs expansion; whether closes cluster at highs or revert mid-range.",
      };
    case "up_strong":
      return {
        trend: "Trend: aligned up—slow structure and impulse agree in this window.",
        momentum: `Momentum: strong—~${recentReturnPct.toFixed(1)}% net with slope still positive.`,
        condition: "Market condition: trend continuation profile until extension invites mean reversion.",
        implication:
          "Practical implication: wrong is defined by time/level—tighten risk if price stretches vs SMA20.",
        watchNext: "What to watch next: first close below rising SMA20 or a vol spike without new highs.",
      };
    case "up_weak":
      return {
        trend: "Trend: composite reads up, tape does not fully cooperate.",
        momentum: "Momentum: weak—follow-through absent despite a positive bias flag.",
        condition: "Market condition: one-off flows or passive bid, not broad re-risk.",
        implication:
          "Practical implication: fade chasing pops until slope re-hooks with broader participation.",
        watchNext: "What to watch next: volume on up days vs down days; slope re-acceleration or failure.",
      };
    case "down_strong_vol":
      return {
        trend: "Trend: distribution has pace and width.",
        momentum: `Momentum: strong downside—slope ~${trendSlopePct.toFixed(2)}% / day with elevated vol.`,
        condition: `Market condition: expansion (${volatilityPct.toFixed(0)}% ann.)—counter-trend is rent, not own.`,
        implication:
          "Practical implication: wait for offer to clear or time to compress range before sizing reversal.",
        watchNext: "What to watch next: lower band of range / capitulation volume vs orderly drift lower.",
      };
    case "down_strong":
      return {
        trend: "Trend: sellers control closes; slope negative with sponsorship.",
        momentum: "Momentum: strong—downside closes cluster; bounces are tactical.",
        condition: "Market condition: trend continuation lower until time or price stabilizes.",
        implication:
          "Practical implication: oversold can stay oversold; timing a turn needs flow evidence this stack lacks.",
        watchNext: "What to watch next: volume dry-up on declines, or failed new lows on high print.",
      };
    case "down_weak":
      return {
        trend: "Trend: drift lower without urgency.",
        momentum: "Momentum: weak—grind, not stampede; impulse missing on both sides.",
        condition: "Market condition: apathy risk—tape extends on lack of bid as much as on fear.",
        implication:
          "Practical implication: fading needs a catalyst; oscillator alone is insufficient.",
        watchNext: "What to watch next: macro / idiosyncratic headline, or a vol lift that breaks the grind.",
      };
    case "sideways_volatile":
      return {
        trend: `Trend: ${trendWord}`,
        momentum: momWord,
        condition: "Market condition: range-like but wide—two-way inventory, no held break.",
        implication:
          "Practical implication: directional conviction is low; pay for false breaks, not narratives.",
        watchNext:
          "What to watch next: a close outside the last 10–20 day box with follow-through next session.",
      };
    case "sideways_stable_midrsi":
      return {
        trend: "Trend: neutral—no skew from slow lines in this sample.",
        momentum: `Momentum: balanced—RSI mid (${rsi.toFixed(0)}), returns non-trending.`,
        condition: "Market condition: equilibrium—matched supply/demand inside tight vol.",
        implication:
          "Practical implication: premium for direction is expensive; break trades need clean follow-through.",
        watchNext: WATCH_DEFAULT,
      };
    case "sideways_stable":
      return {
        trend: "Trend: flat composite; no initiative owner.",
        momentum: momWord,
        condition: "Market condition: low disorder, indecisive—range or drift inside a band.",
        implication:
          "Practical implication: flat or edge-only risk until a catalyst forces a side.",
        watchNext: "What to watch next: vol lift, gap, or flow shift that breaks the local equilibrium.",
      };
    case "sideways_rsi_hi":
      return {
        trend: "Trend: sideways composite despite stretched oscillator.",
        momentum: `Momentum: RSI elevated (${rsi.toFixed(0)})—upside already paid for in the window.`,
        condition: "Market condition: chop near upper band—gap risk on sentiment slip.",
        implication:
          "Practical implication: long gamma is crowded; tight risk if engaged at all.",
        watchNext: "What to watch next: failed highs with rising vol; or absorption at highs on dry supply.",
      };
    case "sideways_rsi_lo":
      return {
        trend: "Trend: sideways; oscillator washed but structure not flipped.",
        momentum: `Momentum: RSI low (${rsi.toFixed(0)})—selling may be exhausted short-term.`,
        condition: "Market condition: bounce-prone into overhead until trend proves.",
        implication:
          "Practical implication: bounces are trades into supply, not structural flips, without reclaim.",
        watchNext: "What to watch next: reclaim of SMA20 / prior breakdown; volume on first up days.",
      };
    default:
      return {
        trend: `Trend: ${trend === "neutral" ? "Mixed—no durable control." : `${formatTrendLabel(trend)} tilt, not unanimous across windows.`}`,
        momentum: momWord,
        condition: `Market condition: ${structure === "volatile" ? "Volatile" : "Contained"} tape with conflicting fast/slow reads.`,
        implication:
          "Practical implication: keep conviction low; let one axis (slope, range, vol) break cleanly first.",
        watchNext: WATCH_DEFAULT,
      };
  }
}

export function buildBiasContextLine(key: ScenarioKey, _p: ScenarioParams): string {
  switch (key) {
    case "bearish_trend_up_bias":
      return "Relief lift into a still-negative average stack—strength is tactical until reclaim proves.";
    case "bullish_trend_sideways_bias":
      return "Slow trend intact while fast inputs stall—digestion, not a confirmed handoff lower.";
    case "up_slow_bear_trend":
      return "Bounces fade against a weak backbone—sellers still own time without a higher low.";
    case "up_slow":
      return "Composite leans up, but pace is cooling—mean-reversion risk rises before trend breaks.";
    case "up_strong_vol":
      return "Upside impulse competes with wide daily ranges—edge is as much vol as direction.";
    case "up_strong":
      return "Trend and impulse agree constructive—risk is extension, not absence of bid.";
    case "up_weak":
      return "Positive bias without follow-through—flows look episodic, not sustained.";
    case "down_strong_vol":
      return "Selling has velocity and width—counter-trend needs time or cleared offer.";
    case "down_strong":
      return "Downside has sponsorship in closes—bounces remain trades until structure flips.";
    case "down_weak":
      return "Soft drift lower—low urgency, but no mandate to fade without a catalyst.";
    case "sideways_volatile":
      return "Two-way tape: momentum and trend do not give a clean skew inside wide ranges.";
    case "sideways_stable_midrsi":
      return "Equilibrium: oscillators mid-band, vol contained—market not forcing a side.";
    case "sideways_stable":
      return "Flat bias with quiet ranges—wait for a break rather than force a narrative.";
    case "sideways_rsi_hi":
      return "Flat bias with RSI stretched—upside crowded; slips can gap through thin air.";
    case "sideways_rsi_lo":
      return "Flat bias with washed RSI—short-cover possible; supply still defines overhead.";
    default:
      return "Time frames disagree enough that the next leg belongs to whichever axis breaks first.";
  }
}

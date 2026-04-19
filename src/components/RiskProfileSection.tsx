import type { AnalysisResult, Market } from "../types";
import { GlassCard } from "./GlassCard";
import { TermTooltip } from "./TermTooltip";

type Props = {
  market: Market;
  analysis: AnalysisResult;
};

export function RiskProfileSection({ market, analysis }: Props) {
  const { riskLevel, riskExplain } = analysis.beginnerBrief;

  return (
    <section className="px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">Risk profile</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          {market === "crypto"
            ? "How this asset tends to behave — qualitative, not a model of worst case."
            : "How this name tends to behave under stress — qualitative, not a VaR number."}
        </p>

        <GlassCard hover className="mt-8 max-w-2xl space-y-5 p-6 sm:p-7">
          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-2">
              <TermTooltip termKey="risk" label="Risk level (from recent swings)" />
            </p>
            <p className="mt-2 text-base font-semibold capitalize text-foreground">{riskLevel}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{riskExplain}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-2">
              Context
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {market === "stocks"
                ? "Company news, earnings, and macro can gap price overnight. This page only sees history on the chart."
                : "Liquidity and sentiment can gap price without a “fundamental” trigger. Size for venue and tail risk first."}
            </p>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}

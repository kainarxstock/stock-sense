import type { AnalysisResult, Market } from "../types";
import { GlassCard } from "./GlassCard";
import { TermTooltip } from "./TermTooltip";

type Props = {
  analysis: AnalysisResult;
  market: Market;
  explainSimply: boolean;
};

const riskStyles: Record<
  AnalysisResult["beginnerBrief"]["riskLevel"],
  { pill: string; label: string }
> = {
  low: { pill: "bg-emerald-500/15 text-emerald-200/95 border-emerald-500/25", label: "Low" },
  medium: { pill: "bg-amber-500/12 text-amber-100/95 border-amber-500/22", label: "Medium" },
  high: { pill: "bg-rose-500/12 text-rose-100/95 border-rose-500/25", label: "High" },
};

export function PrimaryInsightCard({ analysis, market, explainSimply }: Props) {
  const b = explainSimply ? analysis.beginnerBrief.simple : analysis.beginnerBrief;
  const rs = riskStyles[analysis.beginnerBrief.riskLevel];

  return (
    <section className="px-4 sm:px-6" aria-labelledby="primary-insight-heading">
      <div className="mx-auto max-w-3xl">
        <h2 id="primary-insight-heading" className="sr-only">
          At a glance
        </h2>
        <GlassCard className="relative overflow-hidden border-white/[0.12] bg-white/[0.07] p-6 shadow-[0_0_60px_-24px_rgba(120,170,200,0.12)] sm:p-8">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/35 to-transparent"
            aria-hidden
          />
          <div className="space-y-8">
            <div>
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-2">
                <TermTooltip termKey="marketState" label="Market state" />
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-[1.65rem]">
                {b.marketState}
              </p>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" aria-hidden />

            <div>
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-2">
                What to do
              </p>
              <p className="mt-2 text-lg font-medium leading-snug text-foreground/95">{b.whatToDo}</p>
            </div>

            <div>
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-2">
                Why
              </p>
              <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">{b.why}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-2">
                  <TermTooltip termKey="risk" label="Risk level" />
                </p>
                <p className="mt-2">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold tracking-tight ${rs.pill}`}
                  >
                    {rs.label}
                  </span>
                </p>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{b.riskExplain}</p>
              </div>
            </div>

            {market === "crypto" && analysis.cryptoRiskNotes.length > 0 ? (
              <div className="rounded-xl border border-amber-500/18 bg-amber-500/[0.06] px-4 py-3 sm:px-5">
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-amber-100/85">
                  Risk notes · crypto
                </p>
                <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-amber-50/95">
                  {analysis.cryptoRiskNotes.map((line, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-300/70" aria-hidden />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </GlassCard>
      </div>
    </section>
  );
}

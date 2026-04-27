import { useMemo } from "react";
import type { AnalysisResult, Market } from "../../types";
import { buildDecisionContext } from "../../lib/decisionSupport";
import { buildDeterministicInsight } from "../../lib/explanationEngine";
import { GlassCard } from "../GlassCard";
import { useI18n } from "../../i18n";

type Props = {
  analysis: AnalysisResult;
  market: Market;
  ticker: string;
};

export function InsightsPanel({ analysis, market, ticker }: Props) {
  const { t } = useI18n();
  const ctx = useMemo(() => buildDecisionContext(analysis, market, ticker), [analysis, market, ticker]);
  const insight = useMemo(() => buildDeterministicInsight(analysis, ctx, t), [analysis, ctx, t]);

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <GlassCard className="p-6 sm:p-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-2">{t("insights.kicker")}</p>
        <h3 className="mt-2 text-xl font-semibold text-foreground">{t("insights.title")}</h3>
        <div className="mt-4 space-y-3">
          {insight.explanation.map((line, idx) => (
            <p key={`${idx}-${line}`} className="text-sm leading-relaxed text-muted">
              {line}
            </p>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6 sm:p-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-2">{t("insights.scenarios.kicker")}</p>
        <h3 className="mt-2 text-xl font-semibold text-foreground">{t("insights.scenarios.title")}</h3>
        <ol className="mt-4 space-y-3">
          {insight.scenarios.map((s, idx) => (
            <li key={s} className="rounded-xl border border-white/[0.08] bg-surface-0/60 px-4 py-3 text-sm leading-relaxed text-muted">
              <span className="mr-2 font-mono text-[11px] text-muted-2">{idx + 1}.</span>
              {s}
            </li>
          ))}
        </ol>
      </GlassCard>

      <GlassCard className="p-6 sm:p-7 lg:col-span-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-2">{t("insights.confidence.kicker")}</p>
        <h3 className="mt-2 text-xl font-semibold text-foreground">{t("insights.confidence.title")}</h3>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {insight.confidence.items.map((item) => {
            const positive = item.value >= 0;
            return (
              <div
                key={item.label}
                className={`rounded-xl border px-4 py-3 ${
                  positive ? "border-emerald-400/25 bg-emerald-950/15" : "border-rose-400/20 bg-rose-950/15"
                }`}
              >
                <p className="text-xs text-muted">{item.label}</p>
                <p className={`mt-1 font-mono text-xl font-semibold ${positive ? "text-emerald-200" : "text-rose-200"}`}>
                  {positive ? "+" : ""}
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>
        <div className="mt-5 rounded-xl border border-white/[0.08] bg-surface-0/60 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-2">{t("insights.confidence.final")}</p>
          <p className="mt-1 font-mono text-3xl font-semibold text-foreground">{insight.confidence.finalScore}%</p>
        </div>
      </GlassCard>
    </section>
  );
}

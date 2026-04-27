import { useMemo } from "react";
import type { AnalysisResult, Market } from "../../types";
import { useI18n } from "../../i18n";
import { buildDecisionContext } from "../../lib/decisionSupport";

const toneCard: Record<string, string> = {
  green:
    "border-emerald-500/25 bg-gradient-to-b from-emerald-950/35 to-surface-1/80 shadow-[0_0_60px_-20px_rgba(52,211,153,0.15)]",
  yellow:
    "border-amber-500/25 bg-gradient-to-b from-amber-950/30 to-surface-1/80 shadow-[0_0_50px_-22px_rgba(251,191,36,0.12)]",
  red: "border-rose-500/30 bg-gradient-to-b from-rose-950/40 to-surface-1/80 shadow-[0_0_60px_-18px_rgba(244,63,94,0.18)]",
};

const actionBadge: Record<string, string> = {
  green: "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/30",
  yellow: "bg-amber-500/15 text-amber-50 ring-1 ring-amber-400/25",
  red: "bg-rose-500/20 text-rose-50 ring-1 ring-rose-400/35",
};

type Props = {
  analysis: AnalysisResult;
  market: Market;
  ticker: string;
};

export function DecisionHero({ analysis, market, ticker }: Props) {
  const { t } = useI18n();
  const ctx = useMemo(() => buildDecisionContext(analysis, market, ticker), [analysis, market, ticker]);

  const statusLabel = t(`decision.marketStatus.${ctx.marketStatus}`);
  const actionLabel = t(`decision.action.${ctx.action}`);
  const cardTone = toneCard[ctx.tone] ?? toneCard.yellow;
  const badgeTone = actionBadge[ctx.tone] ?? actionBadge.yellow;

  return (
    <section
      className={`relative overflow-hidden rounded-3xl border px-5 py-8 sm:px-10 sm:py-10 ${cardTone}`}
      aria-labelledby="decision-hero-heading"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <p className="text-center font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-muted-2">
        {t("decision.heroKicker")}
      </p>

      <h1
        id="decision-hero-heading"
        className="mt-4 text-center text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-[2.35rem] md:leading-tight"
      >
        {ctx.assetLabel}
      </h1>

      <div className="mx-auto mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.08] bg-surface-0/50 px-5 py-4 text-center backdrop-blur-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-2">
            {t("decision.marketStatusLabel")}
          </p>
          <p className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">{statusLabel}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-surface-0/50 px-5 py-4 text-center backdrop-blur-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-2">
            {t("decision.confidenceLabel")}
          </p>
          <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-foreground sm:text-4xl">
            {ctx.confidencePct}
            <span className="text-lg font-medium text-muted">%</span>
          </p>
        </div>
      </div>

      <div className="mx-auto mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-2">{t("decision.suggestedAction")}</p>
        <span
          className={`inline-flex min-w-[10rem] items-center justify-center rounded-full px-6 py-3 text-center text-xs font-bold uppercase tracking-[0.14em] sm:text-sm ${badgeTone}`}
        >
          {actionLabel}
        </span>
      </div>

      <div className="mx-auto mt-10 max-w-2xl space-y-3 text-center">
        {ctx.explainKeys.map((key) => (
          <p key={key} className="text-base leading-relaxed text-muted sm:text-lg">
            {t(key, {
              asset: ctx.assetLabel,
              confidence: ctx.confidencePct,
            })}
          </p>
        ))}
      </div>

      <p className="mx-auto mt-8 max-w-xl text-center text-xs leading-relaxed text-muted-2">{t("decision.notAdvice")}</p>
    </section>
  );
}

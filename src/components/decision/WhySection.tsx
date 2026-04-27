import { useMemo } from "react";
import type { AnalysisResult, Market } from "../../types";
import { useI18n } from "../../i18n";
import { buildDecisionContext } from "../../lib/decisionSupport";

type Props = {
  analysis: AnalysisResult;
  market: Market;
  ticker: string;
};

function Row({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-white/[0.08] bg-surface-0/55 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-2">{label}</span>
      <div className="text-left sm:text-right">
        <span className="text-lg font-semibold text-foreground">{value}</span>
        {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
      </div>
    </div>
  );
}

export function WhySection({ analysis, market, ticker }: Props) {
  const { t } = useI18n();
  const ctx = useMemo(() => buildDecisionContext(analysis, market, ticker), [analysis, market, ticker]);

  const trendLabel = t(`decision.trend.${ctx.trendSimple}`);
  const momentumLabel = t(`decision.momentum.${ctx.momentumSimple}`);
  const volLabel = t(`decision.vol.${ctx.volTier}`);
  const combination = t(ctx.combinationKey);

  return (
    <section className="rounded-3xl border border-white/[0.09] bg-white/[0.04] px-5 py-8 sm:px-8 sm:py-10" aria-labelledby="why-heading">
      <h2 id="why-heading" className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
        {t("decision.why.title")}
      </h2>
      <p className="mt-1 text-sm text-muted">{t("decision.why.subtitle")}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Row label={t("decision.why.trend")} value={trendLabel} />
        <Row label={t("decision.why.momentum")} value={momentumLabel} />
        <Row label={t("decision.why.volatility")} value={volLabel} />
      </div>

      <div className="mt-8 rounded-2xl border border-accent/20 bg-accent/[0.06] px-5 py-4 sm:px-6">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-2">
          {t("decision.why.combinationLead")}
        </p>
        <p className="mt-2 text-base leading-relaxed text-foreground/95 sm:text-[17px]">{combination}</p>
      </div>
    </section>
  );
}

import { useMemo } from "react";
import type { AnalysisResult, Market } from "../../types";
import { useI18n } from "../../i18n";
import { buildDecisionContext } from "../../lib/decisionSupport";
import { GlassCard } from "../GlassCard";

type Props = {
  analysis: AnalysisResult;
  market: Market;
  ticker: string;
};

export function DecisionLayer({ analysis, market, ticker }: Props) {
  const { t } = useI18n();
  const ctx = useMemo(() => buildDecisionContext(analysis, market, ticker), [analysis, market, ticker]);

  return (
    <GlassCard className="border-white/[0.1] bg-surface-0/55 p-6 sm:p-8">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-2">{t("decision.layerKicker")}</p>
      <h2 className="mt-2 text-lg font-semibold tracking-tight text-foreground">{t("decision.layerTitle")}</h2>

      <div className="mt-6 space-y-5">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-4 sm:px-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-2">{t("decision.suggestedAction")}</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{t(`decision.action.${ctx.action}`)}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">{t(ctx.behaviorKey)}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-2">{t("decision.riskLevelLabel")}</p>
            <p className="mt-1 text-lg font-semibold capitalize text-foreground">{t(`decision.risk.${ctx.riskDisplay}`)}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-2">{t("decision.positionSizeLabel")}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{t(ctx.positionSizeKey)}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/15 bg-amber-950/10 px-4 py-4 sm:px-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100/80">{t("decision.invalidationLabel")}</p>
          <p className="mt-2 text-sm leading-relaxed text-amber-50/95">{t(ctx.invalidationKey)}</p>
        </div>
      </div>
    </GlassCard>
  );
}

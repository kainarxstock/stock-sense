import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../i18n";
import {
  buildPlainEnglishInterpretation,
  buildSnapshotSummary,
  buildWhyThisMatters,
} from "../lib/snapshot";
import type { AnalysisResult } from "../types";
import { GlassCard } from "./GlassCard";

type Props = {
  analysis: AnalysisResult;
  explainSimply: boolean;
};

export function InterpretationSnapshotCard({ analysis, explainSimply }: Props) {
  const { t } = useI18n();
  const snapshot = useMemo(() => buildSnapshotSummary(analysis), [analysis]);
  const plainEnglish = useMemo(
    () => buildPlainEnglishInterpretation(snapshot, explainSimply),
    [snapshot, explainSimply],
  );
  const whyMatters = useMemo(
    () => buildWhyThisMatters(snapshot, explainSimply),
    [snapshot, explainSimply],
  );

  const typedPlainEnglish = useTypewriter(plainEnglish, 16);
  const typedWhyMatters = useTypewriter(whyMatters, 14);

  return (
    <section className="px-4 sm:px-6" aria-labelledby="snapshot-heading">
      <div className="mx-auto max-w-6xl">
        <GlassCard className="overflow-hidden border-white/[0.12] bg-white/[0.07] p-6 shadow-[0_0_70px_-32px_rgba(120,170,200,0.18)] sm:p-8">
          <div className="space-y-8">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-2">
                {t("snapshot.kicker")}
              </p>
              <h2 id="snapshot-heading" className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                {t("snapshot.title")}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t("snapshot.subtitle")}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <Metric label={t("snapshot.metrics.trend")} value={t(`snapshot.values.trend.${snapshot.trend}`)} />
              <Metric
                label={t("snapshot.metrics.momentum")}
                value={t(`snapshot.values.momentum.${snapshot.momentum}`)}
              />
              <Metric
                label={t("snapshot.metrics.volatility")}
                value={t(`snapshot.values.volatility.${snapshot.volatility}`)}
              />
              <Metric
                label={t("snapshot.metrics.risk")}
                value={t(`riskLevel.${snapshot.riskLevel}`)}
              />
              <Metric label={t("snapshot.metrics.confidence")} value={`${snapshot.confidencePct}%`} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <InsightBlock
                label={t("snapshot.plainEnglish")}
                body={typedPlainEnglish}
                animateHint={typedPlainEnglish.length < plainEnglish.length}
              />
              <InsightBlock
                label={t("snapshot.whyMatters")}
                body={typedWhyMatters}
                animateHint={typedWhyMatters.length < whyMatters.length}
              />
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.1] bg-surface-0/65 px-4 py-3">
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-2">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground sm:text-base">{value}</p>
    </div>
  );
}

function InsightBlock({
  label,
  body,
  animateHint,
}: {
  label: string;
  body: string;
  animateHint: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/[0.1] bg-surface-0/60 px-4 py-4 sm:px-5">
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-2">{label}</p>
      <p className="mt-2 text-sm leading-relaxed text-foreground/95 sm:text-[15px]">
        {body}
        {animateHint ? <span className="ml-0.5 inline-block h-4 w-[1px] animate-pulse bg-foreground/70" /> : null}
      </p>
    </div>
  );
}

function useTypewriter(text: string, speedMs: number) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    setTyped("");
    if (!text) return;
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTyped(text.slice(0, index));
      if (index >= text.length) {
        window.clearInterval(timer);
      }
    }, speedMs);

    return () => window.clearInterval(timer);
  }, [text, speedMs]);

  return typed;
}

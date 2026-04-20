import { useI18n } from "../i18n";
import { GlassCard } from "./GlassCard";

type Props = {
  explainSimply: boolean;
};

export function LiveExampleSection({ explainSimply }: Props) {
  const { t } = useI18n();

  return (
    <section className="px-4 sm:px-6" aria-labelledby="live-example-heading">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-2">
            {t("liveExample.kicker")}
          </p>
          <h2 id="live-example-heading" className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t("liveExample.title")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{t("liveExample.subtitle")}</p>
        </div>

        <GlassCard className="mt-8 overflow-hidden border-white/[0.13] bg-white/[0.075] p-6 sm:p-8">
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label={t("deeper.trend")} value={t("liveExample.values.trend")} />
            <Metric label={t("deeper.momentum")} value={t("liveExample.values.momentum")} />
            <Metric label={t("deeper.structure")} value={t("liveExample.values.structure")} />
          </div>

          <div className="mt-6 rounded-xl border border-accent/22 bg-accent/[0.08] px-4 py-4 sm:px-5">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-2">
              {t("liveExample.explanationLabel")}
            </p>
            <p className="mt-2 text-sm font-medium leading-relaxed text-foreground/95 sm:text-base">
              {explainSimply ? t("liveExample.explanationSimple") : t("liveExample.explanation")}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-muted-2">{t("liveExample.notPrediction")}</p>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.1] bg-surface-0/60 px-4 py-3">
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-2">{label}</p>
      <p className="mt-2 text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}

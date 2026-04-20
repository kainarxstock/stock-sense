import { useI18n } from "../i18n";
import { GlassCard } from "./GlassCard";

export function TrustLayerSection() {
  const { t } = useI18n();

  return (
    <section className="px-4 sm:px-6" aria-labelledby="trust-layer-heading">
      <div className="mx-auto max-w-6xl">
        <GlassCard className="max-w-4xl border-white/[0.12] bg-white/[0.06] p-6 sm:p-8">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-2">{t("trustLayer.kicker")}</p>
          <h2 id="trust-layer-heading" className="mt-3 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {t("trustLayer.title")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{t("trustLayer.body")}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{t("trustLayer.disclaimer")}</p>
        </GlassCard>
      </div>
    </section>
  );
}

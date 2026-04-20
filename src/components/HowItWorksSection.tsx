import { useI18n } from "../i18n";
import { GlassCard } from "./GlassCard";

const STEPS = [1, 2, 3] as const;

export function HowItWorksSection() {
  const { t } = useI18n();

  return (
    <section className="px-4 sm:px-6" aria-labelledby="how-it-works-heading">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-2">
            {t("howItWorks.kicker")}
          </p>
          <h2 id="how-it-works-heading" className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t("howItWorks.title")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{t("howItWorks.subtitle")}</p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((step) => (
            <GlassCard key={step} hover className="p-5 sm:p-6">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-2">
                {t("howItWorks.step", { n: step })}
              </p>
              <p className="mt-3 text-base font-semibold text-foreground">{t(`howItWorks.items.${step}.title`)}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t(`howItWorks.items.${step}.detail`)}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

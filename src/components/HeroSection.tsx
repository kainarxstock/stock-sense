import { useI18n } from "../i18n";

type Props = {
  onAnalyzeClick: () => void;
};

export function HeroSection({ onAnalyzeClick }: Props) {
  const { t } = useI18n();

  return (
    <section className="relative px-4 pb-20 pt-12 sm:px-6 sm:pb-24 sm:pt-16 md:pb-28 md:pt-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-2">
          {t("hero.badge")}
        </p>
        <h1 className="mt-5 text-balance text-3xl font-semibold leading-[1.12] tracking-tight text-foreground sm:text-4xl md:text-[2.8rem] md:leading-[1.06]">
          {t("hero.headline")}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
          {t("hero.subtitle")}
        </p>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-2 sm:text-base">
          {t("hero.clarity")}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <button
            type="button"
            onClick={onAnalyzeClick}
            className="inline-flex h-11 min-w-[220px] items-center justify-center rounded-full bg-foreground px-8 text-sm font-medium text-surface-0 transition hover:bg-foreground/90"
          >
            {t("hero.cta")}
          </button>
          <a
            href="#results"
            className="text-sm font-medium text-muted transition hover:text-foreground"
          >
            {t("hero.viewOutput")}
          </a>
        </div>
      </div>
    </section>
  );
}

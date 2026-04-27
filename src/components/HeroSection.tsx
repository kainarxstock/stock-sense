import { useI18n } from "../i18n";

type Props = {
  onAnalyzeClick: () => void;
  /** Shorter landing when the main story is the decision block below. */
  compact?: boolean;
};

export function HeroSection({ onAnalyzeClick, compact }: Props) {
  const { t } = useI18n();

  return (
    <section
      className={`relative px-4 sm:px-6 ${compact ? "pb-10 pt-8 sm:pb-12 sm:pt-10" : "pb-20 pt-12 sm:pb-24 sm:pt-16 md:pb-28 md:pt-20"}`}
    >
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-2">
          {t("hero.badge")}
        </p>
        <h1
          className={`mt-5 text-balance font-semibold leading-[1.12] tracking-tight text-foreground ${compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl md:text-[2.8rem] md:leading-[1.06]"}`}
        >
          {t("hero.headline")}
        </h1>
        {!compact ? (
          <>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
              {t("hero.subtitle")}
            </p>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-2 sm:text-base">
              {t("hero.clarity")}
            </p>
          </>
        ) : (
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">{t("hero.clarity")}</p>
        )}
        <div
          className={`flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 ${compact ? "mt-6" : "mt-10"}`}
        >
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

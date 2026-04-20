import { useI18n, type Locale } from "../i18n";

const LOCALES: Locale[] = ["en", "zh-CN", "zh-HK", "kz"];

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      className="inline-flex rounded-full border border-white/[0.12] bg-surface-2/80 p-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
      role="tablist"
      aria-label={t("nav.language")}
    >
      {LOCALES.map((item) => (
        <button
          key={item}
          type="button"
          role="tab"
          aria-selected={locale === item}
          onClick={() => setLocale(item)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
            locale === item ? "bg-white/[0.12] text-foreground shadow-sm" : "text-muted hover:text-foreground"
          }`}
        >
          {t(`language.${item}`)}
        </button>
      ))}
    </div>
  );
}

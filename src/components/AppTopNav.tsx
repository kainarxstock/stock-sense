import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "../i18n";
import type { Market } from "../types";

export type AppRoute = "market" | "calculator" | "insights";

type Props = {
  route: AppRoute;
  market: Market;
  beginnerMode: boolean;
  onRouteChange: (route: AppRoute) => void;
  onMarketChange: (market: Market) => void;
  onBeginnerMode: (v: boolean) => void;
  onInputClick: () => void;
};

export function AppTopNav({
  route,
  market,
  beginnerMode,
  onRouteChange,
  onMarketChange,
  onBeginnerMode,
  onInputClick,
}: Props) {
  const { t } = useI18n();

  const tabClass = (active: boolean) =>
    `rounded-lg px-2.5 py-1.5 text-xs font-medium transition sm:px-3 ${
      active ? "bg-white/[0.12] text-foreground shadow-sm" : "text-muted hover:text-foreground"
    }`;

  return (
    <nav className="flex flex-col gap-4 border-b border-white/[0.08] px-4 pb-5 pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6">
      <div className="min-w-0">
        <span className="text-sm font-semibold tracking-tight text-foreground">{t("brand.name")}</span>
        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-2">{t("brand.tagline")}</p>
      </div>

      <div
        className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/[0.1] bg-surface-2/80 p-1 sm:gap-1"
        role="tablist"
        aria-label={t("nav.market")}
      >
        <button
          type="button"
          role="tab"
          aria-selected={route === "market" && market === "stocks"}
          className={tabClass(route === "market" && market === "stocks")}
          onClick={() => {
            onRouteChange("market");
            onMarketChange("stocks");
          }}
        >
          {t("nav.tabs.stocks")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={route === "market" && market === "crypto"}
          className={tabClass(route === "market" && market === "crypto")}
          onClick={() => {
            onRouteChange("market");
            onMarketChange("crypto");
          }}
        >
          {t("nav.tabs.crypto")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={route === "calculator"}
          className={tabClass(route === "calculator")}
          onClick={() => onRouteChange("calculator")}
        >
          {t("nav.tabs.calculator")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={route === "insights"}
          className={tabClass(route === "insights")}
          onClick={() => onRouteChange("insights")}
        >
          {t("nav.tabs.insights")}
        </button>
        <button type="button" className={tabClass(false)} onClick={onInputClick}>
          {t("nav.tabs.input")}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <div
          className="inline-flex rounded-full border border-white/[0.12] bg-surface-2/80 p-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          role="group"
          aria-label={t("nav.beginnerMode")}
        >
          <button
            type="button"
            onClick={() => onBeginnerMode(true)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition sm:px-4 ${
              beginnerMode ? "bg-white/[0.12] text-foreground shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            {t("nav.modeBeginner")}
          </button>
          <button
            type="button"
            onClick={() => onBeginnerMode(false)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition sm:px-4 ${
              !beginnerMode ? "bg-white/[0.12] text-foreground shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            {t("nav.modeAdvanced")}
          </button>
        </div>
        <LanguageSwitcher />
      </div>
    </nav>
  );
}

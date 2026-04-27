import { useCallback, useEffect, useMemo, useState } from "react";
import { AnalyzeSection } from "./components/AnalyzeSection";
import { AdvancedAnalyticsPanel } from "./components/decision/AdvancedAnalyticsPanel";
import { DecisionHero } from "./components/decision/DecisionHero";
import { WhySection } from "./components/decision/WhySection";
import { HeroSection } from "./components/HeroSection";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { MarketSwitch } from "./components/MarketSwitch";
import { TrustDisclaimer } from "./components/TrustDisclaimer";
import { TrustLayerSection } from "./components/TrustLayerSection";
import { useStockSeries } from "./hooks/useStockSeries";
import { useI18n } from "./i18n";
import { analyzeSeries } from "./lib/analyze";
import { needsMemeOrSpeculativePanel } from "./lib/cryptoMarket";
import type { Market } from "./types";

export default function App() {
  const { t, locale } = useI18n();
  const [market, setMarket] = useState<Market>("stocks");
  /** Beginner: decision + why only. Advanced: full analytics (progressive disclosure). */
  const [beginnerMode, setBeginnerMode] = useState(true);
  const [deeperOpen, setDeeperOpen] = useState(false);
  const { state, load } = useStockSeries(market);

  const ready = state.status === "ready";
  const loading = state.status === "loading";
  const ticker = state.status === "loading" || state.status === "ready" ? state.ticker : "AAPL";
  const analysis = useMemo(
    () => (state.status === "ready" ? analyzeSeries(state.series, { market, ticker: state.ticker, locale }) : null),
    [state, market, locale],
  );

  const scrollToAnalyze = useCallback(() => {
    document.getElementById("analyze")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const showSpeculativePanel = market === "crypto" && ready && needsMemeOrSpeculativePanel(state.ticker);
  const showMarketing = !ready;

  useEffect(() => {
    document.title = t("meta.title");
  }, [t, locale]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(900px 480px at 50% -6%, rgba(125,180,200,0.09), transparent 55%), radial-gradient(640px 400px at 92% 12%, rgba(100,115,180,0.08), transparent 50%), radial-gradient(520px 360px at 8% 40%, rgba(255,255,255,0.04), transparent 45%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at 50% 0%, black 0%, transparent 75%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-4 pb-5 pt-6 sm:px-6">
          <div>
            <span className="text-sm font-semibold tracking-tight text-foreground">{t("brand.name")}</span>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-2">
              {t("brand.tagline")}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
            <div
              className="inline-flex rounded-full border border-white/[0.12] bg-surface-2/80 p-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              role="group"
              aria-label={t("nav.beginnerMode")}
            >
              <button
                type="button"
                onClick={() => setBeginnerMode(true)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition sm:px-4 ${
                  beginnerMode ? "bg-white/[0.12] text-foreground shadow-sm" : "text-muted hover:text-foreground"
                }`}
              >
                {t("nav.modeBeginner")}
              </button>
              <button
                type="button"
                onClick={() => setBeginnerMode(false)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition sm:px-4 ${
                  !beginnerMode ? "bg-white/[0.12] text-foreground shadow-sm" : "text-muted hover:text-foreground"
                }`}
              >
                {t("nav.modeAdvanced")}
              </button>
            </div>
            <LanguageSwitcher />
            <MarketSwitch value={market} onChange={setMarket} />
            <button
              type="button"
              onClick={scrollToAnalyze}
              className="text-sm font-medium text-muted transition hover:text-foreground"
            >
              {t("nav.input")}
            </button>
          </div>
        </nav>

        {showMarketing ? (
          <>
            <HeroSection onAnalyzeClick={scrollToAnalyze} />
            <div className="space-y-12 px-0 pb-2 sm:space-y-14">
              <HowItWorksSection />
              <TrustLayerSection />
            </div>
          </>
        ) : (
          <HeroSection onAnalyzeClick={scrollToAnalyze} compact />
        )}

        <div className="space-y-16 pb-24 sm:space-y-20 sm:pb-28">
          <AnalyzeSection market={market} initial={ticker} loading={loading} onSubmit={load} />

          {state.status === "error" ? (
            <div className="px-4 sm:px-6">
              <div
                role="alert"
                className="mx-auto max-w-2xl rounded-2xl border border-white/[0.1] bg-rose-950/25 px-5 py-4 text-sm text-rose-100/95 backdrop-blur-md"
              >
                {t(`errors.${state.messageKey}`)}
              </div>
            </div>
          ) : null}

          <div id="results" className="scroll-mt-24 space-y-10 px-4 sm:px-6 sm:space-y-12">
            {ready && analysis ? (
              <>
                <DecisionHero analysis={analysis} market={market} ticker={state.ticker} />
                <WhySection analysis={analysis} market={market} ticker={state.ticker} />
                <TrustDisclaimer />
                {!beginnerMode ? (
                  <AdvancedAnalyticsPanel
                    market={market}
                    ticker={state.ticker}
                    series={state.series}
                    source={state.source}
                    analysis={analysis}
                    explainSimply={beginnerMode}
                    deeperOpen={deeperOpen}
                    onDeeperToggle={() => setDeeperOpen((v) => !v)}
                    showSpeculativePanel={showSpeculativePanel}
                  />
                ) : null}
              </>
            ) : loading ? (
              <div className="space-y-6">
                <div className="rounded-2xl border border-white/[0.09] bg-white/[0.05] p-6 sm:p-8">
                  <p className="text-sm font-medium text-foreground">{t("loading.analyzing")}</p>
                  <p className="mt-2 text-xs text-muted-2">{t("loading.subtitle")}</p>
                  <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/[0.08]">
                    <div className="h-full w-1/3 animate-[pulse_1.2s_ease-in-out_infinite] rounded-full bg-accent/60" />
                  </div>
                </div>
                <div className="h-[200px] animate-pulse rounded-2xl border border-white/[0.09] bg-white/[0.05]" />
              </div>
            ) : null}
          </div>
        </div>

        <footer className="border-t border-white/[0.08] px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm leading-relaxed text-muted">{t("footer.disclaimer")}</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

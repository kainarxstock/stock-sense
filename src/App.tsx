import { useCallback, useState } from "react";
import { AnalyzeSection } from "./components/AnalyzeSection";
import { DeeperAnalysisSection } from "./components/DeeperAnalysisSection";
import { HeroSection } from "./components/HeroSection";
import { MarketSwitch } from "./components/MarketSwitch";
import { PrimaryInsightCard } from "./components/PrimaryInsightCard";
import { RiskProfileSection } from "./components/RiskProfileSection";
import { ShortTermBiasCard } from "./components/ShortTermBiasCard";
import { SpeculativeAssetWarning } from "./components/SpeculativeAssetWarning";
import { StockChart } from "./components/StockChart";
import { TradeCalculator } from "./components/TradeCalculator";
import { TrustDisclaimer } from "./components/TrustDisclaimer";
import { useStockSeries } from "./hooks/useStockSeries";
import { needsMemeOrSpeculativePanel } from "./lib/cryptoMarket";
import type { Market } from "./types";

export default function App() {
  const [market, setMarket] = useState<Market>("stocks");
  const [explainSimply, setExplainSimply] = useState(false);
  const [deeperOpen, setDeeperOpen] = useState(false);
  const { state, load } = useStockSeries(market);

  const ready = state.status === "ready";
  const loading = state.status === "loading";
  const ticker = state.status === "loading" || state.status === "ready" ? state.ticker : "AAPL";

  const scrollToAnalyze = useCallback(() => {
    document.getElementById("analyze")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const showSpeculativePanel = market === "crypto" && ready && needsMemeOrSpeculativePanel(state.ticker);

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
            <span className="text-sm font-semibold tracking-tight text-foreground">Stock Sense</span>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-2">
              Interpretation-first market read
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
            <label className="flex cursor-pointer items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-muted transition hover:border-white/[0.14] hover:text-foreground">
              <input
                type="checkbox"
                className="accent-accent h-3.5 w-3.5 rounded border-white/20"
                checked={explainSimply}
                onChange={(e) => setExplainSimply(e.target.checked)}
              />
              Explain simply
            </label>
            <MarketSwitch value={market} onChange={setMarket} />
            <button
              type="button"
              onClick={scrollToAnalyze}
              className="text-sm font-medium text-muted transition hover:text-foreground"
            >
              Input
            </button>
          </div>
        </nav>

        <HeroSection onAnalyzeClick={scrollToAnalyze} />

        <div className="space-y-20 pb-24 sm:space-y-24 sm:pb-28">
          <AnalyzeSection market={market} initial={ticker} loading={loading} onSubmit={load} />

          {state.status === "error" ? (
            <div className="px-4 sm:px-6">
              <div
                role="alert"
                className="mx-auto max-w-2xl rounded-2xl border border-white/[0.1] bg-rose-950/25 px-5 py-4 text-sm text-rose-100/95 backdrop-blur-md"
              >
                {state.message}
              </div>
            </div>
          ) : null}

          <div id="results" className="scroll-mt-24 space-y-12 px-4 sm:px-6 sm:space-y-14">
            {ready ? (
              <>
                <TrustDisclaimer />
                <StockChart market={market} ticker={state.ticker} series={state.series} />
                <PrimaryInsightCard analysis={state.analysis} market={market} explainSimply={explainSimply} />
                <ShortTermBiasCard
                  market={market}
                  ticker={state.ticker}
                  analysis={state.analysis}
                  source={state.source}
                  explainSimply={explainSimply}
                />
                <DeeperAnalysisSection
                  open={deeperOpen}
                  onToggle={() => setDeeperOpen((v) => !v)}
                  analysis={state.analysis}
                  interpretation={state.analysis.interpretation}
                />
              </>
            ) : loading ? (
              <div className="space-y-6">
                <div className="h-[300px] animate-pulse rounded-2xl border border-white/[0.09] bg-white/[0.05]" />
                <div className="h-[220px] animate-pulse rounded-2xl border border-white/[0.09] bg-white/[0.05]" />
                <div className="h-[180px] animate-pulse rounded-2xl border border-white/[0.09] bg-white/[0.05]" />
              </div>
            ) : null}
          </div>

          {ready ? (
            <>
              <RiskProfileSection market={market} analysis={state.analysis} />
              {showSpeculativePanel ? <SpeculativeAssetWarning symbol={state.ticker} /> : null}
              <TradeCalculator />
            </>
          ) : null}
        </div>

        <footer className="border-t border-white/[0.08] px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm leading-relaxed text-muted">Educational tool. Not financial advice.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

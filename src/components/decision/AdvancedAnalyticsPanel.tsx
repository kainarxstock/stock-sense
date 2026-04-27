import { useId, useState } from "react";
import { DeeperAnalysisSection } from "../DeeperAnalysisSection";
import { InterpretationSnapshotCard } from "../InterpretationSnapshotCard";
import { PrimaryInsightCard } from "../PrimaryInsightCard";
import { RiskProfileSection } from "../RiskProfileSection";
import { ShortTermBiasCard } from "../ShortTermBiasCard";
import { SpeculativeAssetWarning } from "../SpeculativeAssetWarning";
import { StockChart } from "../StockChart";
import { TradeCalculator } from "../TradeCalculator";
import { TrustDisclaimer } from "../TrustDisclaimer";
import type { AnalysisResult, DataSource, Market, OHLCV } from "../../types";
import { useI18n } from "../../i18n";

type Props = {
  market: Market;
  ticker: string;
  series: OHLCV[];
  source: DataSource;
  analysis: AnalysisResult;
  explainSimply: boolean;
  deeperOpen: boolean;
  onDeeperToggle: () => void;
  showSpeculativePanel: boolean;
};

export function AdvancedAnalyticsPanel({
  market,
  ticker,
  series,
  source,
  analysis,
  explainSimply,
  deeperOpen,
  onDeeperToggle,
  showSpeculativePanel,
}: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <section className="rounded-3xl border border-white/[0.08] bg-surface-1/40" aria-labelledby={panelId}>
      <button
        type="button"
        id={panelId}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 rounded-3xl px-5 py-4 text-left transition hover:bg-white/[0.04] sm:px-6 sm:py-5"
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-2">{t("decision.advanced.kicker")}</p>
          <p className="mt-1 text-base font-semibold text-foreground sm:text-lg">{t("decision.advanced.title")}</p>
          <p className="mt-1 text-sm text-muted">{t("decision.advanced.subtitle")}</p>
        </div>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-surface-0/60 text-muted-2 transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {open ? (
        <div className="space-y-12 border-t border-white/[0.06] px-4 py-8 sm:space-y-14 sm:px-6 sm:py-10">
          <InterpretationSnapshotCard analysis={analysis} explainSimply={explainSimply} />
          <TrustDisclaimer />
          <StockChart market={market} ticker={ticker} series={series} />
          <PrimaryInsightCard analysis={analysis} market={market} explainSimply={explainSimply} />
          <ShortTermBiasCard market={market} ticker={ticker} analysis={analysis} source={source} explainSimply={explainSimply} />
          <DeeperAnalysisSection
            open={deeperOpen}
            onToggle={onDeeperToggle}
            analysis={analysis}
            interpretation={analysis.interpretation}
          />
          <RiskProfileSection market={market} analysis={analysis} />
          {showSpeculativePanel ? <SpeculativeAssetWarning symbol={ticker} /> : null}
          <TradeCalculator />
        </div>
      ) : null}
    </section>
  );
}

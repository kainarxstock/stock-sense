import type { AnalysisResult, DataSource, Market } from "../types";
import { useI18n } from "../i18n";
import { TermTooltip } from "./TermTooltip";

const biasMeta: Record<
  AnalysisResult["bias"],
  {
    accent: string;
    bar: string;
    border: string;
    glow: string;
  }
> = {
  up: {
    accent: "text-up",
    bar: "from-up/30 to-transparent",
    border: "border-l-[3px] border-up/50",
    glow: "shadow-[0_0_40px_-12px_rgba(138,185,164,0.25)]",
  },
  down: {
    accent: "text-down",
    bar: "from-down/30 to-transparent",
    border: "border-l-[3px] border-down/45",
    glow: "shadow-[0_0_40px_-12px_rgba(201,160,158,0.2)]",
  },
  sideways: {
    accent: "text-side",
    bar: "from-side/25 to-transparent",
    border: "border-l-[3px] border-side/40",
    glow: "shadow-[0_0_36px_-14px_rgba(174,180,194,0.12)]",
  },
};

type Props = {
  market: Market;
  ticker: string;
  analysis: AnalysisResult;
  source: DataSource;
  explainSimply: boolean;
};

export function ShortTermBiasCard({ market, ticker, analysis, source, explainSimply }: Props) {
  const { t } = useI18n();
  const meta = biasMeta[analysis.bias];
  const pct = Math.round(analysis.confidence * 100);
  const biasLabel =
    analysis.bias === "up"
      ? t("shortBias.leansUpward")
      : analysis.bias === "down"
        ? t("shortBias.leansDownward")
        : t("shortBias.noClearLean");

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border border-white/[0.11] bg-white/[0.065] pl-1 shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset] backdrop-blur-xl transition-[border-color,box-shadow] duration-300 ease-out hover:border-white/[0.14] sm:pl-1 ${meta.glow}`}
    >
      <div className={`rounded-2xl ${meta.border} bg-surface-1/20 py-6 pl-5 pr-6 sm:py-8 sm:pl-7 sm:pr-8`}>
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r ${meta.bar}`}
          aria-hidden
        />
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-2">
              <TermTooltip termKey="compositeLean" label={t("shortBias.compositeLean")} />
            </h2>
            <p className={`mt-3 text-3xl font-semibold tracking-tight sm:text-[2.15rem] ${meta.accent}`}>
              {biasLabel}
            </p>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-2">
              {explainSimply
                ? t("shortBias.simpleHorizon")
                : t("shortBias.advancedHorizon")}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-2">
                {ticker}
              </span>
              <span className="rounded-full border border-white/[0.1] bg-surface-0/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">
                {source === "live" ? t("shortBias.live") : t("shortBias.demo")}
              </span>
            </div>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">{analysis.biasContext}</p>
            <p className="mt-5 max-w-xl text-xs leading-relaxed text-muted-2">
              {t("shortBias.notForecast")}
            </p>
            {market === "crypto" ? (
              <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted-2">
                {t("shortBias.cryptoFragile")}
              </p>
            ) : null}
          </div>
          <div className="shrink-0 border-t border-white/[0.06] pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-2">
              <TermTooltip termKey="confidence" label={t("shortBias.confidence")} />
            </p>
            <p className="mt-2 font-mono text-4xl font-semibold tabular-nums tracking-tight text-foreground sm:text-5xl">
              {pct}
              <span className="text-xl font-medium text-muted">%</span>
            </p>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-2 lg:text-right">
              {analysis.agreement === "strong"
                ? t("shortBias.strongAgreement")
                : analysis.agreement === "mixed"
                  ? t("shortBias.mixedSignals")
                  : t("shortBias.conflictingSignals")}
            </p>
            <p className="mt-3 max-w-[240px] text-xs leading-relaxed text-muted lg:text-right">
              {t("shortBias.confidenceExplain")}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

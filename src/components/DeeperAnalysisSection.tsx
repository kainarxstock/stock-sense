import type { AnalysisResult, MarketInterpretation } from "../types";
import { useI18n } from "../i18n";
import { GlassCard } from "./GlassCard";
import { TermTooltip } from "./TermTooltip";

type Props = {
  open: boolean;
  onToggle: () => void;
  analysis: AnalysisResult;
  interpretation: MarketInterpretation;
};

function Block({
  termKey,
  title,
  value,
  detail,
}: {
  termKey: "trend" | "momentum" | "structure" | "volatility" | "rsi";
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <GlassCard hover className="p-5 sm:p-6">
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-2">
        <TermTooltip termKey={termKey} label={title} />
      </p>
      <p className="mt-2 text-base font-semibold text-foreground">{value}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted">{detail}</p>
    </GlassCard>
  );
}

export function DeeperAnalysisSection({ open, onToggle, analysis, interpretation }: Props) {
  const { t } = useI18n();
  const l2 = analysis.layer2;
  const vp = analysis.metrics.volatilityPct;
  const volValue =
    vp >= 48 ? t("deeper.volHighSwing") : vp >= 30 ? t("deeper.volMediumSwing") : t("deeper.volLowSwing");

  return (
    <section className="px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={onToggle}
          className="group flex w-full max-w-md items-center justify-between gap-3 rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-3 text-left text-sm font-medium text-foreground transition hover:border-accent/25 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          aria-expanded={open}
        >
          <span>{open ? t("deeper.hide") : t("deeper.show")}</span>
          <span
            className={`text-muted-2 transition group-hover:text-foreground ${open ? "rotate-180" : ""}`}
            aria-hidden
          >
            ▾
          </span>
        </button>

        {open ? (
          <div className="mt-8 space-y-10">
            <div className="grid gap-4 sm:grid-cols-2">
              <Block
                termKey="trend"
                title={t("deeper.trend")}
                value={interpretation.trend.value}
                detail={l2.trend.detail}
              />
              <Block
                termKey="momentum"
                title={t("deeper.momentum")}
                value={interpretation.momentum.value}
                detail={l2.momentum.detail}
              />
              <Block
                termKey="structure"
                title={t("deeper.structure")}
                value={interpretation.structure.value}
                detail={l2.structure.detail}
              />
              <Block termKey="volatility" title={t("deeper.volatility")} value={volValue} detail={l2.volatility.detail} />
              <Block termKey="rsi" title={t("deeper.rsiContext")} value={`~${analysis.metrics.rsiApprox.toFixed(0)}`} detail={l2.rsi.detail} />
            </div>

            <div>
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-2">
                <TermTooltip termKey="bias" label={t("deeper.compositeBiasDetail")} />
              </p>
              <GlassCard className="mt-3 max-w-2xl p-5">
                <p className="text-base font-semibold text-foreground">{interpretation.bias.value}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{interpretation.bias.meaning}</p>
              </GlassCard>
            </div>

            <div>
              <h3 className="text-sm font-semibold tracking-tight text-foreground">{t("deeper.whatThisMeansExtended")}</h3>
              <GlassCard className="mt-4 max-w-3xl border-white/[0.1] bg-white/[0.05] p-6 sm:p-8">
                <ul className="space-y-3 text-sm leading-relaxed text-foreground/95 sm:text-[15px]">
                  {[analysis.coreInsight.trend, analysis.coreInsight.momentum, analysis.coreInsight.condition, analysis.coreInsight.implication].map(
                    (line, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent/70" aria-hidden />
                        <span>{line}</span>
                      </li>
                    ),
                  )}
                </ul>
                <div className="mt-6 rounded-xl border border-accent/22 bg-accent/[0.07] px-4 py-3 sm:px-5">
                  <p className="text-sm font-medium leading-relaxed text-foreground/95">{analysis.coreInsight.watchNext}</p>
                </div>
              </GlassCard>
            </div>

            <div>
              <h3 className="text-sm font-semibold tracking-tight text-foreground">{t("deeper.behindRead")}</h3>
              <p className="mt-1 max-w-2xl text-xs text-muted-2">{t("deeper.behindReadSubtitle")}</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {analysis.reasons.map((r, i) => (
                  <GlassCard key={r.id} hover className="p-5 sm:p-6">
                    <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-2">
                      {String(i + 1).padStart(2, "0")} · {r.title}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{r.body}</p>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

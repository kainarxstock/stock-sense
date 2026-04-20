import type { AnalysisResult, Market } from "../types";
import { useI18n } from "../i18n";
import { GlassCard } from "./GlassCard";
import { TermTooltip } from "./TermTooltip";

type Props = {
  market: Market;
  analysis: AnalysisResult;
};

export function RiskProfileSection({ market, analysis }: Props) {
  const { t } = useI18n();
  const { riskLevel, riskExplain } = analysis.beginnerBrief;

  return (
    <section className="px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{t("riskProfile.title")}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          {market === "crypto"
            ? t("riskProfile.subtitleCrypto")
            : t("riskProfile.subtitleStocks")}
        </p>

        <GlassCard hover className="mt-8 max-w-2xl space-y-5 p-6 sm:p-7">
          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-2">
              <TermTooltip termKey="risk" label={t("riskProfile.riskFromRecent")} />
            </p>
            <p className="mt-2 text-base font-semibold capitalize text-foreground">{t(`riskLevel.${riskLevel}`)}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{riskExplain}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-2">
              {t("riskProfile.context")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {market === "stocks"
                ? t("riskProfile.contextStocks")
                : t("riskProfile.contextCrypto")}
            </p>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}

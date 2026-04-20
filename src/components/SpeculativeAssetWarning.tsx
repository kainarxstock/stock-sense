import { isMemeCryptoSymbol } from "../lib/cryptoMarket";
import { useI18n } from "../i18n";
import { GlassCard } from "./GlassCard";

type Props = {
  symbol: string;
};

export function SpeculativeAssetWarning({ symbol }: Props) {
  const { t } = useI18n();
  const meme = isMemeCryptoSymbol(symbol);

  return (
    <section className="px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <GlassCard className="max-w-2xl border-amber-500/18 bg-amber-950/[0.12] p-6 sm:p-7">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">{t("speculative.title")}</h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
            {meme ? (
              <>
                <p>{t("speculative.memeP1")}</p>
                <p>{t("speculative.memeP2")}</p>
              </>
            ) : (
              <>
                <p>{t("speculative.otherP1")}</p>
                <p>{t("speculative.otherP2")}</p>
              </>
            )}
          </div>
        </GlassCard>
      </div>
    </section>
  );
}

import { isMemeCryptoSymbol } from "../lib/cryptoMarket";
import { GlassCard } from "./GlassCard";

type Props = {
  symbol: string;
};

export function SpeculativeAssetWarning({ symbol }: Props) {
  const meme = isMemeCryptoSymbol(symbol);

  return (
    <section className="px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <GlassCard className="max-w-2xl border-amber-500/18 bg-amber-950/[0.12] p-6 sm:p-7">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">Speculative asset warning</h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
            {meme ? (
              <>
                <p>
                  This segment trades on attention and flow, not on cash-flow fundamentals. Narrative
                  shifts can reprice the tape faster than on-chain or technical inputs update.
                </p>
                <p>
                  Outcomes are highly uncertain; drawdowns can arrive quickly when liquidity thins or
                  social bid evaporates.
                </p>
              </>
            ) : (
              <>
                <p>
                  This symbol sits outside our large-cap basket. Price is more sensitive to depth,
                  wallet flow, and headline risk than to slow fundamental ratios.
                </p>
                <p>
                  Assume wide slippage and gap risk until you independently verify liquidity, venue,
                  and custody.
                </p>
              </>
            )}
          </div>
        </GlassCard>
      </div>
    </section>
  );
}

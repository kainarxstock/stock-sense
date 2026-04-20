import { type FormEvent, useEffect, useId, useState } from "react";
import { useI18n } from "../i18n";
import type { Market } from "../types";
import { GlassCard } from "./GlassCard";

type Props = {
  market: Market;
  initial: string;
  loading: boolean;
  onSubmit: (ticker: string) => void;
};

export function AnalyzeSection({ market, initial, loading, onSubmit }: Props) {
  const { t } = useI18n();
  const [value, setValue] = useState(initial);
  const inputId = useId();

  useEffect(() => {
    setValue(initial);
  }, [initial]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(value);
  }

  const maxLen = market === "stocks" ? 6 : 12;
  const placeholder = market === "stocks" ? "AAPL" : "BTC";
  const title = market === "stocks" ? t("analyze.titleTicker") : t("analyze.titleSymbol");

  return (
    <section id="analyze" className="scroll-mt-24 px-4 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <GlassCard className="p-6 sm:p-8">
          <div className="text-center">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {market === "stocks"
                ? t("analyze.subtitleStocks")
                : t("analyze.subtitleCrypto")}
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-end sm:gap-3"
          >
            <div className="flex-1 text-left">
              <label
                htmlFor={inputId}
                className="block text-[11px] font-medium uppercase tracking-[0.14em] text-muted-2"
              >
                {market === "stocks" ? t("analyze.labelTicker") : t("analyze.labelSymbol")}
              </label>
              <input
                id={inputId}
                name="ticker"
                autoComplete="off"
                spellCheck={false}
                maxLength={maxLen}
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value.toUpperCase())}
                className="mt-2 w-full rounded-xl border border-white/[0.1] bg-surface-0/80 px-4 py-3 font-mono text-sm tracking-[0.08em] text-foreground placeholder:text-muted-2/80 transition focus:border-accent/35 focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-[46px] shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.06] px-8 text-sm font-medium text-foreground transition hover:border-white/[0.14] hover:bg-white/[0.09] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {loading ? t("analyze.running") : t("analyze.run")}
            </button>
          </form>
        </GlassCard>
      </div>
    </section>
  );
}

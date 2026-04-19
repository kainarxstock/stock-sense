import type { Market } from "../types";

type Props = {
  value: Market;
  onChange: (market: Market) => void;
};

export function MarketSwitch({ value, onChange }: Props) {
  return (
    <div
      className="inline-flex rounded-full border border-white/[0.12] bg-surface-2/80 p-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
      role="tablist"
      aria-label="Market"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === "stocks"}
        onClick={() => onChange("stocks")}
        className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
          value === "stocks"
            ? "bg-white/[0.12] text-foreground shadow-sm"
            : "text-muted hover:text-foreground"
        }`}
      >
        Stocks
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === "crypto"}
        onClick={() => onChange("crypto")}
        className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
          value === "crypto"
            ? "bg-white/[0.12] text-foreground shadow-sm"
            : "text-muted hover:text-foreground"
        }`}
      >
        Crypto
      </button>
    </div>
  );
}

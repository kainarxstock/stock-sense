import { useId, useState } from "react";
import { TERM_TIPS } from "../lib/tipTexts";

type TipKey = keyof typeof TERM_TIPS;

type Props = {
  termKey: TipKey;
  label?: string;
  className?: string;
};

export function TermTooltip({ termKey, label, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const text = TERM_TIPS[termKey];
  const display =
    label ??
    termKey
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase())
      .trim();

  return (
    <span className={`relative inline-flex items-center gap-1 ${className}`.trim()}>
      <span>{display}</span>
      <button
        type="button"
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.06] text-[10px] font-semibold leading-none text-muted-2 transition hover:border-accent/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35"
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        aria-label={`What “${display}” means here`}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        ?
      </button>
      {open ? (
        <span
          id={id}
          role="tooltip"
          className="absolute left-0 top-full z-50 mt-2 w-[min(18rem,calc(100vw-2rem))] rounded-xl border border-white/[0.12] bg-surface-2/95 px-3 py-2.5 text-left text-xs leading-snug text-muted shadow-[0_12px_40px_-12px_rgba(0,0,0,0.65)] backdrop-blur-md"
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}

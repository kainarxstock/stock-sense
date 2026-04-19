type Props = {
  className?: string;
};

export function TrustDisclaimer({ className = "" }: Props) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-center text-xs leading-relaxed text-muted sm:px-5 ${className}`.trim()}
    >
      <p>
        This is an interpretation of recent price behavior, not a forecast. Past patterns do not
        guarantee future results.
      </p>
      <p className="mt-2 text-[11px] text-muted-2">
        Validation: methodology review in progress — treat outputs as educational context only.
      </p>
    </div>
  );
}

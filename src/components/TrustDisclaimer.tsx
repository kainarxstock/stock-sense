import { useI18n } from "../i18n";

type Props = {
  className?: string;
};

export function TrustDisclaimer({ className = "" }: Props) {
  const { t } = useI18n();

  return (
    <div
      className={`rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-center text-xs leading-relaxed text-muted sm:px-5 ${className}`.trim()}
    >
      <p>
        {t("trust.primary")}
      </p>
      <p className="mt-2 text-[11px] text-muted-2">
        {t("trust.secondary")}
      </p>
    </div>
  );
}

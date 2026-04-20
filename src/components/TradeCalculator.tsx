import { useMemo, useState } from "react";
import { useI18n } from "../i18n";
import { GlassCard } from "./GlassCard";

function parseNum(raw: string): number | null {
  const n = Number(raw.replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function TradeCalculator() {
  const { t } = useI18n();
  const [entry, setEntry] = useState("182.50");
  const [stop, setStop] = useState("178.00");
  const [takeProfit, setTakeProfit] = useState("190.00");
  const [positionSize, setPositionSize] = useState("100");

  const result = useMemo(() => {
    const e = parseNum(entry);
    const s = parseNum(stop);
    const target = parseNum(takeProfit);
    const shares = parseNum(positionSize);
    if (e === null || s === null || target === null || shares === null) return { kind: "invalid" as const };
    if (shares <= 0) return { kind: "invalid" as const };

    const longOk = target > e && s < e;
    const shortOk = target < e && s > e;
    if (!longOk && !shortOk) {
      return {
        kind: "shape" as const,
        message:
          t("trade.shapeLongShort"),
      };
    }

    const side = longOk ? "long" : "short";
    const riskPerShare = longOk ? e - s : s - e;
    const rewardPerShare = longOk ? target - e : e - target;
    if (riskPerShare <= 0 || rewardPerShare <= 0) {
      return {
        kind: "shape" as const,
        message: t("trade.shapeBracket"),
      };
    }

    const risk = shares * riskPerShare;
    const reward = shares * rewardPerShare;
    const ratio = risk > 0 ? reward / risk : null;

    return {
      kind: "ok" as const,
      side,
      risk,
      reward,
      ratio,
      riskPerShare,
      rewardPerShare,
      shares,
    };
  }, [entry, stop, takeProfit, positionSize, t]);

  return (
    <section className="px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{t("trade.title")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {t("trade.subtitle")}
          </p>
        </div>

        <GlassCard className="mx-auto mt-8 max-w-6xl p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
              <Field label={t("trade.entry")} value={entry} onChange={setEntry} prefix="$" />
              <Field label={t("trade.stop")} value={stop} onChange={setStop} prefix="$" />
              <Field label={t("trade.target")} value={takeProfit} onChange={setTakeProfit} prefix="$" />
              <Field label={t("trade.size")} hint={t("trade.shares")} value={positionSize} onChange={setPositionSize} />
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-xl border border-white/[0.08] bg-surface-0/60 p-5 sm:p-6">
                {result.kind === "ok" ? (
                  <dl className="space-y-5">
                    <div className="flex items-baseline justify-between gap-4 border-b border-white/[0.06] pb-4">
                      <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-2">
                        {t("trade.side")}
                      </dt>
                      <dd className="font-mono text-xs uppercase tracking-wider text-muted">
                        {result.side === "long" ? t("trade.long") : t("trade.short")} · {result.shares} {t("trade.sharesUnit")}
                      </dd>
                    </div>
                    <Stat label={t("trade.riskDollars")} value={`$${result.risk.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
                    <Stat label={t("trade.rewardDollars")} value={`$${result.reward.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
                    <Stat
                      label={t("trade.rr")}
                      value={result.ratio === null ? "—" : `${result.ratio.toFixed(2)} : 1`}
                    />
                    <p className="pt-1 text-xs leading-relaxed text-muted-2">
                      {t("trade.perShare", {
                        risk: result.riskPerShare.toFixed(2),
                        reward: result.rewardPerShare.toFixed(2),
                      })}
                    </p>
                  </dl>
                ) : result.kind === "shape" ? (
                  <p className="text-sm leading-relaxed text-muted">{result.message}</p>
                ) : (
                  <p className="text-sm text-muted">{t("trade.enterNumeric")}</p>
                )}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  prefix,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-2">{label}</span>
        {hint ? <span className="text-[10px] text-muted">{hint}</span> : null}
      </span>
      <div className="relative mt-2">
        {prefix ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted-2">
            {prefix}
          </span>
        ) : null}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-xl border border-white/[0.1] bg-surface-0/80 py-3 font-mono text-sm text-foreground transition focus:border-accent/35 focus:outline-none focus:ring-2 focus:ring-accent/20 ${prefix ? "pl-7 pr-3" : "px-3"}`}
        />
      </div>
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-2">{label}</dt>
      <dd className="font-mono text-base font-medium tabular-nums text-foreground">{value}</dd>
    </div>
  );
}

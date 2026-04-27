import { useMemo, useState } from "react";
import { useI18n } from "../i18n";
import { GlassCard } from "./GlassCard";

function parseNum(raw: string): number | null {
  const n = Number(raw.replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function PositionCalculator() {
  const { t } = useI18n();
  const [capital, setCapital] = useState("25000");
  const [riskPct, setRiskPct] = useState("1");
  const [entry, setEntry] = useState("182.5");
  const [stop, setStop] = useState("178");
  const [target, setTarget] = useState("190");

  const result = useMemo(() => {
    const cap = parseNum(capital);
    const rp = parseNum(riskPct);
    const e = parseNum(entry);
    const s = parseNum(stop);
    const tp = parseNum(target);
    if (cap === null || rp === null || e === null || s === null || tp === null) return { kind: "invalid" as const };
    if (cap <= 0 || rp <= 0 || rp > 100 || e <= 0) return { kind: "invalid" as const };

    const longOk = tp > e && s < e;
    const shortOk = tp < e && s > e;
    if (!longOk && !shortOk) return { kind: "invalid" as const };

    const riskDollars = cap * (rp / 100);
    const perUnitRisk = longOk ? Math.abs(e - s) : Math.abs(s - e);
    if (perUnitRisk <= 0) return { kind: "invalid" as const };

    const units = riskDollars / perUnitRisk;
    const maxLoss = units * perUnitRisk;
    const perUnitReward = longOk ? Math.abs(tp - e) : Math.abs(e - tp);
    const potentialProfit = units * perUnitReward;
    const rr = maxLoss > 0 ? potentialProfit / maxLoss : null;

    return {
      kind: "ok" as const,
      units,
      maxLoss,
      potentialProfit,
      rr,
      side: longOk ? ("long" as const) : ("short" as const),
    };
  }, [capital, riskPct, entry, stop, target]);

  return (
    <section className="px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Simulator</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">{t("positionCalc.subtitle")}</p>
        </div>

        <GlassCard className="mx-auto mt-8 max-w-6xl p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
              <Field
                label={t("positionCalc.capital")}
                hint="Total account value used as your planning base."
                value={capital}
                onChange={setCapital}
                prefix="$"
              />
              <Field
                label={t("positionCalc.riskPct")}
                hint="Percent of capital you are willing to lose if stop is hit."
                value={riskPct}
                onChange={setRiskPct}
                suffix="%"
              />
              <Field
                label={t("positionCalc.entry")}
                hint="Your planned entry level."
                value={entry}
                onChange={setEntry}
                prefix="$"
              />
              <Field
                label={t("positionCalc.stop")}
                hint="Your invalidation level where risk is cut."
                value={stop}
                onChange={setStop}
                prefix="$"
              />
              <Field
                label={t("positionCalc.target")}
                hint="Your expected take-profit level for scenario planning."
                value={target}
                onChange={setTarget}
                prefix="$"
                className="sm:col-span-2"
              />
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-xl border border-white/[0.08] bg-surface-0/60 p-5 sm:p-6">
                {result.kind === "ok" ? (
                  <dl className="space-y-4">
                    <Stat label={t("positionCalc.positionUnits")} value={result.units.toFixed(4)} />
                    <Stat label={t("positionCalc.maxLoss")} value={`$${result.maxLoss.toFixed(2)}`} />
                    <Stat label={t("positionCalc.potentialProfit")} value={`$${result.potentialProfit.toFixed(2)}`} />
                    <Stat
                      label={t("positionCalc.rr")}
                      value={result.rr === null ? "—" : `${result.rr.toFixed(2)} : 1`}
                    />
                    <p className="border-t border-white/[0.06] pt-4 text-xs leading-relaxed text-muted-2">
                      {t("positionCalc.explainUnits")}
                    </p>
                    <p className="text-xs leading-relaxed text-muted-2">{t("positionCalc.explainLoss")}</p>
                    <p className="text-xs leading-relaxed text-muted-2">{t("positionCalc.explainProfit")}</p>
                  </dl>
                ) : (
                  <p className="text-sm text-muted">{t("positionCalc.invalid")}</p>
                )}
              </div>
              <p className="mt-4 text-center text-xs leading-relaxed text-muted-2">{t("positionCalc.disclaimer")}</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  hint,
  prefix,
  suffix,
  className = "",
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`.trim()}>
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-2">{label}</span>
      {hint ? <p className="mt-1 text-xs leading-relaxed text-muted">{hint}</p> : null}
      <div className="relative mt-2">
        {prefix ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted-2">
            {prefix}
          </span>
        ) : null}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-xl border border-white/[0.1] bg-surface-0/80 py-3 font-mono text-sm text-foreground transition focus:border-accent/35 focus:outline-none focus:ring-2 focus:ring-accent/20 ${prefix ? "pl-7 pr-3" : "px-3"} ${suffix ? "pr-8" : ""}`}
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-2">{suffix}</span>
        ) : null}
      </div>
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-white/[0.06] pb-3 last:border-0">
      <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-2">{label}</dt>
      <dd className="font-mono text-lg font-semibold tabular-nums text-foreground">{value}</dd>
    </div>
  );
}

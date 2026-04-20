import { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Market, OHLCV } from "../types";
import { useI18n } from "../i18n";
import { GlassCard } from "./GlassCard";

type Props = {
  market: Market;
  ticker: string;
  series: OHLCV[];
};

function formatAxisDate(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const stroke = "#7dd3c0";
const fillStart = "rgba(125, 211, 192, 0.28)";
const fillEnd = "rgba(125, 211, 192, 0)";

export function StockChart({ market, ticker, series }: Props) {
  const { t } = useI18n();
  const gid = useId().replace(/:/g, "");
  const gradId = `priceFill-${gid}`;

  const data = series.map((r) => ({
    ...r,
    label: formatAxisDate(r.date),
  }));

  const lastClose = series.at(-1)?.close ?? 0;

  return (
    <GlassCard className="flex min-h-[320px] flex-col p-6 sm:p-8">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{t("chart.title")}</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {market === "stocks"
              ? t("chart.subtitleStocks")
              : t("chart.subtitleCrypto")}
          </p>
          {market === "crypto" ? (
            <p className="mt-2 text-xs font-medium leading-relaxed text-amber-200/75">
              {t("chart.cryptoNote")}
            </p>
          ) : null}
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-2">{ticker}</p>
          <p className="mt-1 font-mono text-lg font-medium tabular-nums text-foreground">
            {lastClose.toLocaleString(undefined, {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: lastClose < 1 ? 6 : 2,
            })}
          </p>
        </div>
      </div>

      <div className="relative h-64 sm:h-72 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={fillStart} />
                <stop offset="100%" stopColor={fillEnd} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="4 8" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#949aa8", fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
            />
            <YAxis
              domain={["auto", "auto"]}
              width={56}
              tick={{ fill: "#949aa8", fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) =>
                v.toLocaleString(undefined, { maximumFractionDigits: v < 1 ? 4 : 0 })
              }
            />
            <Tooltip
              cursor={{ stroke: "rgba(125,211,192,0.25)" }}
              contentStyle={{
                background: "rgba(14, 17, 24, 0.94)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                fontSize: 12,
                fontFamily: "JetBrains Mono, monospace",
                color: "#f0f2f7",
                backdropFilter: "blur(8px)",
              }}
              labelStyle={{ color: "#949aa8", marginBottom: 4 }}
              formatter={(value: number) => [
                value.toLocaleString(undefined, {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: value < 1 ? 6 : 2,
                }),
                t("chart.close"),
              ]}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke={stroke}
              strokeWidth={1.75}
              fill={`url(#${gradId})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

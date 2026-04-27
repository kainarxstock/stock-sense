import { useId, useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
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
  beginnerMode: boolean;
  displayPrice: number;
};

function formatAxisDate(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function rollingSma(closes: number[], period: number): (number | null)[] {
  const out: (number | null)[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      out.push(null);
      continue;
    }
    let s = 0;
    for (let j = i - period + 1; j <= i; j++) s += closes[j];
    out.push(s / period);
  }
  return out;
}

const stroke = "#7dd3c0";
const fillStart = "rgba(125, 211, 192, 0.28)";
const fillEnd = "rgba(125, 211, 192, 0)";

export function StockChart({ market, ticker, series, beginnerMode, displayPrice }: Props) {
  const { t } = useI18n();
  const gid = useId().replace(/:/g, "");
  const gradId = `priceFill-${gid}`;

  const closes = useMemo(() => series.map((r) => r.close), [series]);
  const sma20 = useMemo(() => rollingSma(closes, 20), [closes]);
  const sma50 = useMemo(() => rollingSma(closes, 50), [closes]);

  const data = useMemo(
    () =>
      series.map((r, i) => ({
        ...r,
        label: formatAxisDate(r.date),
        sma20: sma20[i],
        sma50: sma50[i],
      })),
    [series, sma20, sma50],
  );

  return (
    <GlassCard className="flex min-h-[320px] flex-col p-6 sm:p-8">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-xl">
          <h2 className="text-sm font-semibold text-foreground">{t("chart.title")}</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {beginnerMode ? t("chart.captionBeginner") : t("chart.captionAdvanced")}
          </p>
          {!beginnerMode ? (
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {market === "stocks" ? t("chart.subtitleStocks") : t("chart.subtitleCrypto")}
            </p>
          ) : null}
          {market === "crypto" ? (
            <p className="mt-2 text-xs font-medium leading-relaxed text-amber-200/75">
              {t("chart.cryptoNote")}
            </p>
          ) : null}
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-2">{ticker}</p>
          <p className="mt-1 font-mono text-lg font-medium tabular-nums text-foreground">
            {displayPrice.toLocaleString(undefined, {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: displayPrice < 1 ? 6 : 2,
            })}
          </p>
        </div>
      </div>

      <div className="relative h-64 sm:h-72 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
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
              formatter={(value: number, name: string) => [
                value.toLocaleString(undefined, {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: value < 1 ? 6 : 2,
                }),
                name === "close" ? t("chart.legendPrice") : name === "sma20" ? t("chart.legendSma20") : t("chart.legendSma50"),
              ]}
            />
            <Area
              type="monotone"
              dataKey="close"
              name="close"
              stroke={stroke}
              strokeWidth={1.75}
              fill={`url(#${gradId})`}
              isAnimationActive={false}
            />
            {!beginnerMode ? (
              <>
                <Line
                  type="monotone"
                  dataKey="sma20"
                  name="sma20"
                  stroke="#9aa6d4"
                  strokeWidth={1.2}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="sma50"
                  name="sma50"
                  stroke="#c4a574"
                  strokeWidth={1.2}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls
                />
              </>
            ) : null}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

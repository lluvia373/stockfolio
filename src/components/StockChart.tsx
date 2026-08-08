"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getChart } from "@/lib/stock-api";
import { formatCurrency } from "@/lib/format";
import type { ChartPoint } from "@/lib/types";
import { Loader2 } from "lucide-react";

const RANGES = [
  { label: "1주", value: "5d" },
  { label: "1개월", value: "1mo" },
  { label: "3개월", value: "3mo" },
  { label: "6개월", value: "6mo" },
  { label: "1년", value: "1y" },
  { label: "5년", value: "5y" },
];

interface StockChartProps {
  symbol: string;
  currency: string;
}

export function StockChart({ symbol, currency }: StockChartProps) {
  const [range, setRange] = useState("6mo");
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getChart(symbol, range)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [symbol, range]);

  const isUp =
    data.length >= 2 && data[data.length - 1].close >= data[0].close;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-white">가격 차트</h3>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                range === r.value
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400 hover:bg-slate-800"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-slate-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          차트 로딩 중...
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-slate-500">
          차트 데이터가 없습니다
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isUp ? "#34d399" : "#f87171"}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={isUp ? "#34d399" : "#f87171"}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fill: "#64748b", fontSize: 11 }}
              tickFormatter={(v) => v.slice(5)}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 11 }}
              domain={["auto", "auto"]}
              axisLine={false}
              tickLine={false}
              width={70}
            />
            <Tooltip
              contentStyle={{
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#f1f5f9",
              }}
              formatter={(value) => [formatCurrency(Number(value), currency), "종가"]}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke={isUp ? "#34d399" : "#f87171"}
              fill="url(#colorPrice)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

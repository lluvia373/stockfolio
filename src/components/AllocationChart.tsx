"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/format";
import type { HoldingWithQuote } from "@/lib/types";

const COLORS = [
  "#34d399", "#60a5fa", "#a78bfa", "#f472b6",
  "#fbbf24", "#fb923c", "#38bdf8", "#4ade80",
];

interface AllocationChartProps {
  holdings: HoldingWithQuote[];
}

export function AllocationChart({ holdings }: AllocationChartProps) {
  const data = holdings
    .filter((h) => h.marketValueKRW > 0)
    .map((h) => ({
      name: h.symbol,
      value: h.marketValueKRW,
    }));

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        데이터가 없습니다
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "8px",
            color: "#f1f5f9",
          }}
          formatter={(value) => [formatCurrency(Number(value), "KRW"), "평가액"]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

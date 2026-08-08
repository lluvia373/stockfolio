"use client";

import { formatCurrency, formatPercent } from "@/lib/format";
import { PriceChange } from "@/components/PriceChange";
import type { PortfolioSummary } from "@/lib/types";
import { DollarSign, PieChart, TrendingUp, Wallet } from "lucide-react";

interface PortfolioSummaryCardsProps {
  summary: PortfolioSummary | null;
  loading?: boolean;
}

export function PortfolioSummaryCards({ summary, loading }: PortfolioSummaryCardsProps) {
  const baseCurrency = summary?.baseCurrency ?? "KRW";
  const currencyLabel = baseCurrency === "KRW" ? "원화" : "달러";
  const cards = [
    {
      label: `총 평가액 (${currencyLabel})`,
      value: summary ? formatCurrency(summary.totalValue, baseCurrency) : "—",
      icon: Wallet,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: `총 매입금액 (${currencyLabel})`,
      value: summary ? formatCurrency(summary.totalCost, baseCurrency) : "—",
      icon: DollarSign,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      label: `총 손익 (${currencyLabel})`,
      value: null,
      icon: TrendingUp,
      color: summary && summary.totalGainLoss >= 0 ? "text-emerald-400" : "text-red-400",
      bg: summary && summary.totalGainLoss >= 0 ? "bg-emerald-500/10" : "bg-red-500/10",
      extra: summary ? (
        <PriceChange
          value={summary.totalGainLoss}
          percent={summary.totalGainLossPercent}
          currency={baseCurrency}
          size="lg"
          showPercent
        />
      ) : (
        <span className="text-white">—</span>
      ),
    },
    {
      label: `${currencyLabel} 기준 수익률`,
      value: summary ? formatPercent(summary.totalGainLossPercent) : "—",
      icon: PieChart,
      color: summary && summary.totalGainLossPercent >= 0 ? "text-emerald-400" : "text-red-400",
      bg: "bg-slate-700/30",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">{card.label}</span>
            <div className={`rounded-lg p-2 ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </div>
          <p
            className={`mt-3 text-2xl font-bold ${loading ? "animate-pulse text-slate-600" : "text-white"}`}
          >
            {loading ? "로딩 중..." : (card.extra ?? card.value)}
          </p>
        </div>
      ))}
    </div>
  );
}

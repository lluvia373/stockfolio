"use client";

import { PriceChange } from "@/components/PriceChange";
import { usePortfolio } from "@/hooks/usePortfolio";
import { formatCurrency } from "@/lib/format";
import type { PortfolioSummary } from "@/lib/types";

interface PortfolioSummaryCardsProps {
  summary: PortfolioSummary | null;
  loading?: boolean;
}

export function PortfolioSummaryCards({ summary, loading }: PortfolioSummaryCardsProps) {
  const { displayCurrency } = usePortfolio();
  const baseCurrency = summary?.baseCurrency ?? displayCurrency;
  const placeholder = loading ? "불러오는 중..." : "—";

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/60">
      <div className="p-6 sm:p-8">
        <p className="text-sm font-medium text-slate-400">총 자산</p>
        <p className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl ${loading ? "animate-pulse text-slate-600" : "text-white"}`}>
          {summary ? formatCurrency(summary.totalAssets, baseCurrency) : placeholder}
        </p>

        <div className="mt-7 grid gap-5 border-t border-slate-800 pt-6 sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-500">투자자산</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {summary ? formatCurrency(summary.investmentAssets, baseCurrency) : placeholder}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">투자성과</p>
            <div className="mt-1">
              {summary ? (
                <PriceChange
                  value={summary.investmentGainLoss}
                  percent={summary.investmentGainLossPercent}
                  currency={baseCurrency}
                  size="lg"
                  showPercent
                />
              ) : (
                <span className="text-lg font-semibold text-white">{placeholder}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-px border-t border-slate-800 bg-slate-800 sm:grid-cols-2">
        <div className="bg-slate-950/60 px-6 py-4 sm:px-8">
          <p className="text-xs text-slate-500">주가 영향 · 원화 기준</p>
          <div className="mt-1">
            {summary ? (
              <PriceChange value={summary.stockPriceImpactKRW} currency="KRW" size="sm" />
            ) : (
              <span className="text-sm text-slate-400">{placeholder}</span>
            )}
          </div>
        </div>
        <div className="bg-slate-950/60 px-6 py-4 sm:px-8">
          <p className="text-xs text-slate-500">환율 영향 · 원화 기준</p>
          <div className="mt-1">
            {summary ? (
              <PriceChange value={summary.fxImpactKRW} currency="KRW" size="sm" />
            ) : (
              <span className="text-sm text-slate-400">{placeholder}</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

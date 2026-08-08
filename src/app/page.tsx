"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { PortfolioSummaryCards } from "@/components/PortfolioSummaryCards";
import { HoldingsTable } from "@/components/HoldingsTable";
import { AllocationChart } from "@/components/AllocationChart";
import { usePortfolio } from "@/hooks/usePortfolio";

export default function DashboardPage() {
  const { summary, loading, refreshQuotes, displayCurrency } = usePortfolio();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">대시보드</h1>
          <p className="mt-1 text-slate-400">포트폴리오 현황을 한눈에 확인하세요.</p>
        </div>
        <button
          onClick={refreshQuotes}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          새로고침
        </button>
      </div>

      <PortfolioSummaryCards summary={summary} loading={loading} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">보유 종목</h2>
            <Link
              href="/search"
              className="text-sm text-emerald-400 hover:underline"
            >
              + 거래 추가
            </Link>
          </div>
          <HoldingsTable
            holdings={summary?.holdings ?? []}
            displayCurrency={displayCurrency}
            loading={loading}
          />
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">자산 배분</h2>
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <AllocationChart
              holdings={summary?.holdings ?? []}
              displayCurrency={displayCurrency}
            />
            {summary && summary.holdings.length > 0 && (
              <div className="mt-4 space-y-2">
                {summary.holdings.map((h) => {
                  const pct =
                    summary.totalValue > 0
                      ? (h.displayMarketValue / summary.totalValue) * 100
                      : 0;
                  return (
                    <div key={h.id} className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{h.symbol}</span>
                      <span className="text-slate-500">{pct.toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

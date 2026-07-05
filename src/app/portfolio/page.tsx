"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { PortfolioSummaryCards } from "@/components/PortfolioSummaryCards";
import { HoldingsTable } from "@/components/HoldingsTable";
import { TransactionList } from "@/components/TransactionList";
import { usePortfolio } from "@/hooks/usePortfolio";

export default function PortfolioPage() {
  const { summary, transactions, loading, removeTransaction, refreshQuotes } =
    usePortfolio();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">포트폴리오</h1>
          <p className="mt-1 text-slate-400">보유 종목과 거래 내역을 관리하세요.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800"
          >
            + 거래 추가
          </Link>
          <button
            onClick={refreshQuotes}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            새로고침
          </button>
        </div>
      </div>

      <PortfolioSummaryCards summary={summary} loading={loading} />

      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">보유 종목</h2>
        <HoldingsTable holdings={summary?.holdings ?? []} loading={loading} />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">거래 내역</h2>
        <TransactionList transactions={transactions} onRemove={removeTransaction} />
      </div>
    </div>
  );
}

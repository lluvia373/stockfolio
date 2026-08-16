"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, RotateCcw, X } from "lucide-react";
import { PortfolioSummaryCards } from "@/components/PortfolioSummaryCards";
import { HoldingsTable } from "@/components/HoldingsTable";
import { TransactionList } from "@/components/TransactionList";
import { MarketDataStatus } from "@/components/MarketDataStatus";
import { TransactionBackupPanel } from "@/components/TransactionBackupPanel";
import { usePortfolio } from "@/hooks/usePortfolio";
import type { Transaction } from "@/lib/types";

export default function PortfolioPage() {
  const {
    summary,
    transactions,
    loading,
    updateTransaction,
    removeTransaction,
    restoreTransaction,
    displayCurrency,
    lastMarketUpdateAt,
    marketDataError,
  } = usePortfolio();
  const [lastDeleted, setLastDeleted] = useState<Transaction | null>(null);
  const [undoing, setUndoing] = useState(false);
  const [undoError, setUndoError] = useState<string | null>(null);

  useEffect(() => {
    if (!lastDeleted) return;
    const timeout = window.setTimeout(() => {
      setLastDeleted(null);
      setUndoError(null);
    }, 8000);
    return () => window.clearTimeout(timeout);
  }, [lastDeleted]);

  const handleDeleted = (transaction: Transaction) => {
    setUndoError(null);
    setLastDeleted(transaction);
  };

  const handleUndo = async () => {
    if (!lastDeleted) return;
    setUndoing(true);
    setUndoError(null);
    const error = await restoreTransaction(lastDeleted);
    setUndoing(false);

    if (error) {
      setUndoError(error);
      return;
    }

    setLastDeleted(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">Portfolio</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">포트폴리오</h1>
          <p className="mt-1 text-slate-400">보유 종목과 거래 내역을 관리하세요.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Link
            href="/search"
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800"
          >
            + 거래 추가
          </Link>
          <MarketDataStatus
            lastUpdatedAt={lastMarketUpdateAt}
            error={marketDataError}
            loading={loading}
          />
        </div>
      </div>

      <PortfolioSummaryCards summary={summary} loading={loading} />

      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">보유 종목</h2>
        <HoldingsTable
          holdings={summary?.holdings ?? []}
          displayCurrency={displayCurrency}
          loading={loading}
        />
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">거래 내역</h2>
        </div>
        <div className="mb-4">
          <TransactionBackupPanel />
        </div>
        <TransactionList
          transactions={transactions}
          onUpdate={updateTransaction}
          onRemove={removeTransaction}
          onDeleted={handleDeleted}
        />
      </div>

      {lastDeleted && (
        <div className="fixed bottom-6 left-1/2 z-40 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">
                {lastDeleted.symbol} 거래를 삭제했습니다.
              </p>
              {undoError ? (
                <p className="mt-1 text-xs text-red-300">{undoError}</p>
              ) : (
                <p className="mt-1 text-xs text-slate-500">
                  8초 안에 되돌릴 수 있습니다.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleUndo}
              disabled={undoing}
              className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
            >
              {undoing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              되돌리기
            </button>
            <button
              type="button"
              onClick={() => {
                setLastDeleted(null);
                setUndoError(null);
              }}
              disabled={undoing}
              className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-white disabled:opacity-50"
              aria-label="알림 닫기"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

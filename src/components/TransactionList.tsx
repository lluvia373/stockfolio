"use client";

import { Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Transaction } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TransactionListProps {
  transactions: Transaction[];
  onRemove?: (id: string) => void;
}

export function TransactionList({ transactions, onRemove }: TransactionListProps) {
  const sorted = [...transactions].sort(
    (a, b) =>
      b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)
  );

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
        <p className="text-slate-400">거래 내역이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="px-4 py-3 font-medium">날짜</th>
              <th className="px-4 py-3 font-medium">종목</th>
              <th className="px-4 py-3 font-medium">구분</th>
              <th className="px-4 py-3 font-medium text-right">수량</th>
              <th className="px-4 py-3 font-medium text-right">단가</th>
              <th className="px-4 py-3 font-medium text-right">금액</th>
              {onRemove && <th className="px-4 py-3 font-medium text-right">관리</th>}
            </tr>
          </thead>
          <tbody>
            {sorted.map((tx) => {
              const amount = tx.quantity * tx.price + (tx.type === "buy" ? tx.fee : 0);
              return (
                <tr
                  key={tx.id}
                  className="border-b border-slate-800/50 transition-colors hover:bg-slate-800/30"
                >
                  <td className="px-4 py-3 text-slate-300">{formatDate(tx.date)}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-white">{tx.symbol}</span>
                    <span className="ml-2 text-xs text-slate-500">{tx.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        tx.type === "buy"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      )}
                    >
                      {tx.type === "buy" ? "매수" : "매도"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">{tx.quantity}</td>
                  <td className="px-4 py-3 text-right text-slate-300">
                    {formatCurrency(tx.price)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-white">
                    {formatCurrency(amount)}
                  </td>
                  {onRemove && (
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onRemove(tx.id)}
                        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        aria-label="거래 삭제"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

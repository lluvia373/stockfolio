"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { normalizeCurrency } from "@/lib/currency";
import { PriceChange } from "@/components/PriceChange";
import type { DisplayCurrency, HoldingWithQuote } from "@/lib/types";

interface HoldingsTableProps {
  holdings: HoldingWithQuote[];
  displayCurrency: DisplayCurrency;
  onRemove?: (id: string) => void;
  loading?: boolean;
}

export function HoldingsTable({
  holdings,
  displayCurrency,
  onRemove,
  loading,
}: HoldingsTableProps) {
  const displayLabel = displayCurrency === "KRW" ? "원화" : "달러";

  if (holdings.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
        <p className="text-slate-400">보유 종목이 없습니다.</p>
        <Link
          href="/search"
          className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          종목 검색하기
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="px-4 py-3 font-medium">종목</th>
              <th className="px-4 py-3 font-medium text-right">수량</th>
              <th className="px-4 py-3 font-medium text-right">현재가</th>
              <th className="px-4 py-3 font-medium text-right">평가액 ({displayLabel})</th>
              <th className="px-4 py-3 font-medium text-right">손익 ({displayLabel})</th>
              {onRemove && <th className="px-4 py-3 font-medium text-right">관리</th>}
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) => {
              const currency = h.quote?.currency ?? h.currency ?? "USD";
              const nativeCurrency = normalizeCurrency(currency);
              const showNativeSecondary = nativeCurrency !== displayCurrency;
              const displayPrice =
                h.quantity > 0 ? h.displayMarketValue / h.quantity : 0;

              return (
                <tr
                  key={h.id}
                  className="border-b border-slate-800/50 transition-colors hover:bg-slate-800/30"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/stock/${h.symbol}`}
                      className="group flex flex-col"
                    >
                      <span className="font-semibold text-white group-hover:text-emerald-400">
                        {h.symbol}
                      </span>
                      <span className="text-xs text-slate-500">{h.name}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">{h.quantity}</td>
                  <td className="px-4 py-3 text-right">
                    {loading || !h.quote ? (
                      <span className="text-slate-600">—</span>
                    ) : (
                      <div className="flex flex-col items-end">
                        <span className="text-white">
                          {formatCurrency(h.quote.price, currency)}
                        </span>
                        {showNativeSecondary && (
                          <span className="text-xs text-slate-500">
                            {formatCurrency(displayPrice, displayCurrency)} /주
                          </span>
                        )}
                        <PriceChange
                          value={h.quote.change}
                          percent={h.quote.changePercent}
                          currency={currency}
                          size="sm"
                        />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-white">
                    {loading ? (
                      "—"
                    ) : (
                      <div className="flex flex-col items-end">
                        <span>{formatCurrency(h.displayMarketValue, displayCurrency)}</span>
                        {showNativeSecondary && (
                          <span className="text-xs font-normal text-slate-500">
                            현지 {formatCurrency(h.marketValue, currency)}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {loading ? (
                      <span className="text-slate-600">—</span>
                    ) : (
                      <PriceChange
                        value={h.displayGainLoss}
                        percent={h.displayGainLossPercent}
                        currency={displayCurrency}
                        size="sm"
                      />
                    )}
                  </td>
                  {onRemove && (
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onRemove(h.id)}
                        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        aria-label={`${h.symbol} 삭제`}
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

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { getQuote } from "@/lib/stock-api";
import { formatCompactNumber, formatCurrency } from "@/lib/format";
import { PriceChange } from "@/components/PriceChange";
import { StockChart } from "@/components/StockChart";
import type { StockQuote } from "@/lib/types";

interface StockDetailProps {
  symbol: string;
}

export function StockDetail({ symbol }: StockDetailProps) {
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getQuote(symbol)
      .then(setQuote)
      .catch(() => setQuote(null))
      .finally(() => setLoading(false));
  }, [symbol]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        데이터 로딩 중...
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="py-24 text-center text-slate-400">
        종목 정보를 불러올 수 없습니다.
      </div>
    );
  }

  const stats = [
    { label: "시가총액", value: quote.marketCap ? formatCompactNumber(quote.marketCap) : "—" },
    { label: "거래량", value: quote.volume ? formatCompactNumber(quote.volume) : "—" },
    { label: "당일 고가", value: quote.dayHigh ? formatCurrency(quote.dayHigh, quote.currency) : "—" },
    { label: "당일 저가", value: quote.dayLow ? formatCurrency(quote.dayLow, quote.currency) : "—" },
    { label: "52주 고가", value: quote.fiftyTwoWeekHigh ? formatCurrency(quote.fiftyTwoWeekHigh, quote.currency) : "—" },
    { label: "52주 저가", value: quote.fiftyTwoWeekLow ? formatCurrency(quote.fiftyTwoWeekLow, quote.currency) : "—" },
    { label: "전일 종가", value: quote.previousClose ? formatCurrency(quote.previousClose, quote.currency) : "—" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{quote.symbol}</h1>
          <p className="text-slate-400">{quote.name}</p>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-4xl font-bold text-white">
              {formatCurrency(quote.price, quote.currency)}
            </span>
            <PriceChange
              value={quote.change}
              percent={quote.changePercent}
              size="lg"
            />
          </div>
        </div>
        <Link
          href="/search"
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 font-medium text-white hover:bg-emerald-500"
        >
          <Plus className="h-4 w-4" />
          거래 기록하기
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3"
          >
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="mt-1 font-semibold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <StockChart symbol={symbol} />
    </div>
  );
}

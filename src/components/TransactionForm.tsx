"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, Search } from "lucide-react";
import { searchStocks, getHistoricalDay } from "@/lib/stock-api";
import { formatCurrency, todayISO } from "@/lib/format";
import type { DayOHLC, StockSearchResult, TransactionType } from "@/lib/types";
import { usePortfolio } from "@/hooks/usePortfolio";
import { getAvailableQuantity } from "@/lib/portfolio";
import { PriceRangePicker } from "@/components/PriceRangePicker";
import { cn } from "@/lib/utils";

export function TransactionForm() {
  const { transactions, addTransaction } = usePortfolio();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selected, setSelected] = useState<StockSearchResult | null>(null);

  const [txType, setTxType] = useState<TransactionType>("buy");
  const [date, setDate] = useState(todayISO());
  const [ohlc, setOhlc] = useState<DayOHLC | null>(null);
  const [ohlcLoading, setOhlcLoading] = useState(false);
  const [ohlcError, setOhlcError] = useState<string | null>(null);
  const [price, setPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState("");
  const [fee, setFee] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const availableQty = selected
    ? getAvailableQuantity(transactions, selected.symbol)
    : 0;

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 1) {
      setResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const data = await searchStocks(q);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  useEffect(() => {
    if (!selected || !date) {
      setOhlc(null);
      return;
    }

    let cancelled = false;
    setOhlcLoading(true);
    setOhlcError(null);

    getHistoricalDay(selected.symbol, date)
      .then((data) => {
        if (cancelled) return;
        setOhlc(data);
        setPrice(Math.round(data.close * 100) / 100);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setOhlc(null);
        setOhlcError(err.message);
      })
      .finally(() => {
        if (!cancelled) setOhlcLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selected, date]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !ohlc || !quantity || price <= 0) return;

    const qty = parseFloat(quantity);
    if (Number.isNaN(qty) || qty <= 0) {
      setError("유효한 수량을 입력하세요.");
      return;
    }

    const err = addTransaction({
      symbol: selected.symbol,
      name: selected.name,
      type: txType,
      date,
      quantity: qty,
      price,
      fee: fee ? parseFloat(fee) : 0,
    });

    if (err) {
      setError(err);
      return;
    }

    setError(null);
    setSuccess(true);
    setQuantity("");
    setFee("");
    setTimeout(() => setSuccess(false), 2000);
  };

  const totalAmount = ohlc && quantity ? parseFloat(quantity) * price : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">종목 검색</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="티커 또는 회사명 입력 (예: AAPL, 삼성)"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 py-3 pl-10 pr-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="mt-4 max-h-80 overflow-y-auto">
          {searchLoading && (
            <div className="flex items-center justify-center py-8 text-slate-400">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              검색 중...
            </div>
          )}
          {!searchLoading && results.length === 0 && query && (
            <p className="py-8 text-center text-slate-500">검색 결과가 없습니다.</p>
          )}
          {results.map((r) => (
            <button
              key={r.symbol}
              type="button"
              onClick={() => {
                setSelected(r);
                setError(null);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-3 text-left transition-colors",
                selected?.symbol === r.symbol
                  ? "bg-emerald-500/10 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              )}
            >
              <div>
                <span className="font-semibold">{r.symbol}</span>
                <span className="ml-2 text-sm text-slate-500">{r.name}</span>
              </div>
              <span className="text-xs text-slate-500">{r.exchange}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">거래 기록</h2>

        {selected ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-lg bg-slate-800 p-4">
              <p className="font-semibold text-white">{selected.symbol}</p>
              <p className="text-sm text-slate-400">{selected.name}</p>
              {txType === "sell" && (
                <p className="mt-1 text-sm text-amber-400">
                  보유 수량: {availableQty}
                </p>
              )}
              <Link
                href={`/stock/${selected.symbol}`}
                className="mt-2 inline-block text-sm text-emerald-400 hover:underline"
              >
                상세 정보 보기 →
              </Link>
            </div>

            <div className="flex gap-2">
              {(["buy", "sell"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setTxType(type);
                    setError(null);
                  }}
                  className={cn(
                    "flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors",
                    txType === type
                      ? type === "buy"
                        ? "bg-emerald-600 text-white"
                        : "bg-red-600 text-white"
                      : "border border-slate-700 text-slate-400 hover:bg-slate-800"
                  )}
                >
                  {type === "buy" ? "매수" : "매도"}
                </button>
              ))}
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-400">거래일</label>
              <input
                type="date"
                value={date}
                max={todayISO()}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {ohlcLoading && (
              <div className="flex items-center justify-center py-8 text-slate-400">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                해당 날짜 시세 조회 중...
              </div>
            )}

            {ohlcError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {ohlcError}
              </div>
            )}

            {ohlc && !ohlcLoading && (
              <PriceRangePicker ohlc={ohlc} price={price} onChange={setPrice} />
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-slate-400">수량</label>
                <input
                  type="number"
                  min="0.0001"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  placeholder="10"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-400">
                  수수료 (선택)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>

            {totalAmount > 0 && ohlc && (
              <p className="text-sm text-slate-400">
                거래 금액:{" "}
                <span className="font-medium text-white">
                  {formatCurrency(totalAmount, ohlc.currency)}
                </span>
              </p>
            )}

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!ohlc || ohlcLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {success ? "기록 완료!" : txType === "buy" ? "매수 기록" : "매도 기록"}
            </button>
          </form>
        ) : (
          <p className="py-12 text-center text-slate-500">왼쪽에서 종목을 선택하세요.</p>
        )}
      </div>
    </div>
  );
}

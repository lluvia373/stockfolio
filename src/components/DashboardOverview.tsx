"use client";

import { useState } from "react";
import { ArrowUpRight, CalendarDays, CircleDollarSign } from "lucide-react";
import { PriceChange } from "@/components/PriceChange";
import { formatCurrency } from "@/lib/format";
import type { DisplayCurrency, PortfolioSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

const ranges = [
  { key: "1d", label: "1일" },
  { key: "1w", label: "1주" },
  { key: "1m", label: "1개월" },
  { key: "3m", label: "3개월" },
  { key: "6m", label: "6개월" },
  { key: "ytd", label: "올해" },
  { key: "1y", label: "1년" },
  { key: "all", label: "전체" },
] as const;

interface DashboardOverviewProps {
  summary: PortfolioSummary | null;
  displayCurrency: DisplayCurrency;
  loading?: boolean;
}

export function DashboardOverview({
  summary,
  displayCurrency,
  loading,
}: DashboardOverviewProps) {
  const [range, setRange] = useState<(typeof ranges)[number]["key"]>("all");
  const historicalRange = range !== "all";
  const totalAssets = summary?.totalAssets ?? 0;

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0d1324]/90 shadow-2xl shadow-black/20">
      <div className="grid lg:grid-cols-[1.55fr_0.75fr]">
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-400">내 총 자산</p>
              <p className={cn("mt-2 text-3xl font-bold tracking-[-0.04em] text-white sm:text-4xl", loading ? "animate-pulse text-slate-600" : "") }>
                {summary ? formatCurrency(totalAssets, displayCurrency) : "—"}
              </p>
              <div className="mt-2 min-h-6">
                {summary && !historicalRange ? (
                  <PriceChange
                    value={summary.investmentGainLoss}
                    percent={summary.investmentGainLossPercent}
                    currency={displayCurrency}
                    size="sm"
                  />
                ) : (
                  <span className="text-xs text-slate-500">
                    {historicalRange ? "기간별 계좌 기록을 연결하면 성과를 표시합니다." : "자산을 등록하면 성과를 표시합니다."}
                  </span>
                )}
              </div>
            </div>

            <div className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-white/5 p-1">
              {ranges.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setRange(item.key)}
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3",
                    range === item.key
                      ? "bg-white text-slate-950"
                      : "text-slate-500 hover:text-white"
                  )}
                  aria-pressed={range === item.key}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative mt-6 h-24 overflow-hidden rounded-2xl bg-gradient-to-b from-indigo-500/10 to-transparent sm:h-28">
            <div className="absolute inset-x-4 top-1/3 border-t border-dashed border-indigo-300/15" />
            <div className="absolute inset-x-4 top-2/3 border-t border-dashed border-indigo-300/10" />
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
              <p className="max-w-md text-xs leading-5 text-slate-500">
                자산 스냅샷 저장을 시작하면 선택한 기간의 자산·순입금·수익률 추이를 여기에 비교합니다.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 bg-white/[0.025] p-5 sm:p-7 lg:border-l lg:border-t-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <ArrowUpRight className="h-4 w-4 text-indigo-300" />
            자산 변화 해석
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-1">
            <div className="rounded-2xl bg-white/[0.035] p-4">
              <p className="text-xs text-slate-500">주가 영향</p>
              <div className="mt-1.5">
                {summary ? <PriceChange value={summary.stockPriceImpactKRW} currency="KRW" size="sm" /> : <span>—</span>}
              </div>
            </div>
            <div className="rounded-2xl bg-white/[0.035] p-4">
              <p className="text-xs text-slate-500">환율 영향</p>
              <div className="mt-1.5">
                {summary ? <PriceChange value={summary.fxImpactKRW} currency="KRW" size="sm" /> : <span>—</span>}
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-xs text-slate-500">
            <p className="flex items-center gap-2"><CircleDollarSign className="h-3.5 w-3.5" /> 현금·배당 기여도 연결 예정</p>
            <p className="flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5" /> 매일 계좌 스냅샷 저장 예정</p>
          </div>
        </div>
      </div>
    </section>
  );
}

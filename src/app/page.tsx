"use client";

import Link from "next/link";
import { BellRing, ChevronRight, MessageCircleMore, Scale, Sparkles } from "lucide-react";
import { AllocationChart } from "@/components/AllocationChart";
import { DashboardOverview } from "@/components/DashboardOverview";
import { HoldingsTable } from "@/components/HoldingsTable";
import { InteractionStyleSampler } from "@/components/InteractionStyleSampler";
import { MarketDataStatus } from "@/components/MarketDataStatus";
import { usePortfolio } from "@/hooks/usePortfolio";

const roadmapCards = [
  {
    href: "/insights",
    icon: Scale,
    label: "벤치마크",
    title: "시장보다 잘하고 있을까?",
    description: "KOSPI·S&P 500과 내 기간별 수익률을 같은 기준으로 비교합니다.",
  },
  {
    href: "/watchlist",
    icon: BellRing,
    label: "관심종목",
    title: "뉴스와 목표가를 한곳에",
    description: "관심종목 뉴스, 목표 매수가와 가격 알림을 모아봅니다.",
  },
  {
    href: "/community",
    icon: MessageCircleMore,
    label: "커뮤니티",
    title: "종목을 아는 사람들과 대화",
    description: "종목 분석과 근거를 공유하고 관심종목 토론을 이어갑니다.",
  },
];

export default function DashboardPage() {
  const {
    summary,
    loading,
    displayCurrency,
    lastMarketUpdateAt,
    marketDataError,
  } = usePortfolio();

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">Overview</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">내 투자 현황</h1>
        </div>
        <MarketDataStatus lastUpdatedAt={lastMarketUpdateAt} error={marketDataError} loading={loading} />
      </div>

      <DashboardOverview summary={summary} displayCurrency={displayCurrency} loading={loading} />

      <div className="grid gap-6 lg:grid-cols-[1.65fr_0.75fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">보유 자산</h2>
              <p className="mt-0.5 text-xs text-slate-500">현재 비중과 손익 기여도를 확인하세요.</p>
            </div>
            <Link href="/portfolio" className="flex items-center gap-1 text-xs font-medium text-indigo-300 hover:text-indigo-200">
              전체 보기 <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <HoldingsTable holdings={summary?.holdings ?? []} displayCurrency={displayCurrency} loading={loading} />
        </section>

        <section>
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-white">자산 배분</h2>
            <p className="mt-0.5 text-xs text-slate-500">종목별 포트폴리오 비중</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-4">
            <AllocationChart holdings={summary?.holdings ?? []} displayCurrency={displayCurrency} />
          </div>
        </section>
      </div>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-300" />
          <h2 className="text-lg font-semibold text-white">다음으로 연결될 기능</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {roadmapCards.map(({ href, icon: Icon, label, title, description }) => (
            <Link key={href} href={href} className="group rounded-3xl border border-white/10 bg-white/[0.025] p-5 transition-colors hover:border-indigo-400/30 hover:bg-indigo-500/[0.06]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-semibold text-indigo-300"><Icon className="h-4 w-4" />{label}</span>
                <ChevronRight className="h-4 w-4 text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
              </div>
              <h3 className="mt-5 font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
            </Link>
          ))}
        </div>
      </section>

      <InteractionStyleSampler />
    </div>
  );
}

import { Bell, Newspaper, Plus, Target } from "lucide-react";

const features = [
  { icon: Target, title: "목표 매수가", description: "관심 가격과 현재가의 차이를 추적합니다." },
  { icon: Bell, title: "맞춤 알림", description: "가격·뉴스·실적 발표 알림을 종목별로 설정합니다." },
  { icon: Newspaper, title: "관심 뉴스", description: "등록한 종목의 뉴스와 공시만 모아서 봅니다." },
];

export default function WatchlistPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">Watchlist</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">관심종목</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">사고 싶은 가격, 놓치면 안 되는 뉴스와 사람들의 대화를 종목별로 연결합니다.</p>
        </div>
        <button type="button" disabled className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-slate-400">
          <Plus className="h-4 w-4" /> 관심종목 추가 준비 중
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
            <Icon className="h-5 w-5 text-indigo-300" />
            <h2 className="mt-4 font-semibold text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
          </div>
        ))}
      </div>

      <section className="rounded-[1.75rem] border border-dashed border-white/15 bg-[#0d1324]/70 px-6 py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10"><Bell className="h-5 w-5 text-indigo-300" /></div>
        <h2 className="mt-5 font-semibold text-white">관심종목 피드가 여기에 생깁니다</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">관심종목 저장 기능을 연결한 뒤 뉴스, 목표가 도달 여부, 실적 일정과 커뮤니티 새 글을 시간순으로 보여줍니다.</p>
      </section>
    </div>
  );
}

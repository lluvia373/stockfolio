import { BarChart3, CalendarRange, Scale, Sparkles } from "lucide-react";

const ranges = ["1일", "1주", "1개월", "3개월", "6개월", "올해", "1년", "전체"];

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">Insights</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">성과 분석</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">얼마나 벌었는지만이 아니라 어떤 선택과 시장 요인이 성과를 만들었는지 비교합니다.</p>
      </div>

      <section className="rounded-[1.75rem] border border-white/10 bg-[#0d1324]/90 p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white"><CalendarRange className="h-4 w-4 text-indigo-300" /> 분석 기간</div>
          <div className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-white/5 p-1">
            {ranges.map((range) => <span key={range} className="shrink-0 rounded-full px-3 py-1.5 text-xs text-slate-500 first:bg-white first:text-slate-950">{range}</span>)}
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            ["내 수익률", "계좌 이력 필요"],
            ["S&P 500", "벤치마크 연결 예정"],
            ["초과 수익", "동일 기간 비교 예정"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-white/[0.035] p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-sm font-semibold text-slate-300">{value}</p></div>
          ))}
        </div>
        <div className="mt-4 flex h-40 items-center justify-center rounded-2xl border border-dashed border-white/10 text-center text-xs leading-5 text-slate-600">일별 자산 스냅샷을 저장한 뒤<br />내 계좌와 지수의 누적 수익률을 그립니다.</div>
      </section>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          { icon: BarChart3, title: "수익 기여도", text: "종목·주가·환율·배당이 만든 성과를 분해합니다." },
          { icon: Scale, title: "시장 비교", text: "KOSPI, S&P 500, NASDAQ과 같은 기간으로 비교합니다." },
          { icon: Sparkles, title: "성과 해석", text: "가장 잘한 선택과 개선할 투자 습관을 요약합니다." },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.025] p-5"><Icon className="h-5 w-5 text-indigo-300" /><h2 className="mt-4 font-semibold text-white">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></div>
        ))}
      </div>
    </div>
  );
}

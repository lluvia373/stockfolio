import { BarChart3, Scale, Sparkles } from "lucide-react";
import { PerformanceAnalytics } from "@/components/PerformanceAnalytics";

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">Insights</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">성과 분석</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">얼마나 벌었는지만이 아니라 어떤 선택과 시장 요인이 성과를 만들었는지 비교합니다.</p>
      </div>

      <PerformanceAnalytics />

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

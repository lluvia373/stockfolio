import { MessageCircleMore, ShieldCheck, Sparkles, Users } from "lucide-react";

const tabs = ["관심종목", "보유종목", "인기", "팔로잉"];

export default function CommunityPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">Community</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">투자 커뮤니티</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">종목별로 분석 근거를 공유하고, 뉴스와 실적을 서로 다른 관점에서 해석합니다.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_0.7fr]">
        <section className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0d1324]/90">
          <div className="flex gap-1 overflow-x-auto border-b border-white/10 p-3">
            {tabs.map((tab, index) => <span key={tab} className={`shrink-0 rounded-full px-3 py-2 text-xs font-medium ${index === 0 ? "bg-white text-slate-950" : "text-slate-500"}`}>{tab}</span>)}
          </div>
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10"><MessageCircleMore className="h-5 w-5 text-indigo-300" /></div>
            <h2 className="mt-5 font-semibold text-white">종목별 대화가 시작될 공간</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">관심종목과 보유종목을 기준으로 분석 글, 질문, 투표와 댓글을 개인화해 보여줍니다.</p>
          </div>
        </section>

        <aside className="space-y-3">
          {[
            { icon: Sparkles, title: "분석 근거 중심", text: "상승·하락 의견보다 숫자와 출처가 있는 분석을 우선합니다." },
            { icon: Users, title: "종목별 공간", text: "각 종목 페이지에서 분석·뉴스·커뮤니티를 함께 봅니다." },
            { icon: ShieldCheck, title: "신뢰와 안전", text: "신고, 차단, 운영 규칙과 투자 조언 고지를 처음부터 설계합니다." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.025] p-5"><Icon className="h-5 w-5 text-indigo-300" /><h2 className="mt-4 font-semibold text-white">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></div>
          ))}
        </aside>
      </div>
    </div>
  );
}

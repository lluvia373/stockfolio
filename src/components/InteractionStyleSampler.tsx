"use client";

import { useState } from "react";
import { Bell, Check, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const particles = [
  { left: "12%", top: "24%", delay: "0ms" },
  { left: "28%", top: "12%", delay: "90ms" },
  { left: "52%", top: "18%", delay: "160ms" },
  { left: "74%", top: "10%", delay: "40ms" },
  { left: "88%", top: "28%", delay: "130ms" },
  { left: "68%", top: "42%", delay: "220ms" },
];

export function InteractionStyleSampler() {
  const [maximalSaved, setMaximalSaved] = useState(false);
  const [quietSaved, setQuietSaved] = useState(false);

  return (
    <section className="border-t border-dashed border-white/15 pt-8" aria-labelledby="interaction-sample-title">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-200">
              임시 비교 샘플
            </span>
            <span className="text-xs text-slate-600">확인 후 삭제</span>
          </div>
          <h2 id="interaction-sample-title" className="mt-3 text-lg font-semibold text-white">
            같은 행동, 다른 고급스러움
          </h2>
          <p className="mt-1 text-sm text-slate-500">두 카드의 관심종목 버튼을 직접 눌러 반응 차이를 비교해보세요.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="premium-maximal-card group relative isolate min-h-[330px] overflow-hidden rounded-[2rem] border border-violet-300/20 p-6 shadow-2xl shadow-violet-950/40 sm:p-8">
          <div className="premium-aurora absolute -inset-28 -z-20 opacity-70" aria-hidden="true" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.16),transparent_34%),linear-gradient(145deg,rgba(17,12,48,0.72),rgba(4,9,24,0.94))]" aria-hidden="true" />
          <div className="premium-shine absolute inset-0 -z-10" aria-hidden="true" />

          {maximalSaved ? (
            <div aria-hidden="true">
              {particles.map((particle, index) => (
                <span
                  key={index}
                  className="premium-particle absolute h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_14px_3px_rgba(165,243,252,0.8)]"
                  style={{ left: particle.left, top: particle.top, animationDelay: particle.delay }}
                />
              ))}
            </div>
          ) : null}

          <div className="relative flex h-full flex-col">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200">
                <Sparkles className="h-3.5 w-3.5" /> Maximal Luxe
              </span>
              <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] text-white/70 backdrop-blur-xl">강한 연출</span>
            </div>

            <div className="mt-10">
              <p className="text-sm text-violet-200/70">샘플 종목</p>
              <div className="mt-1 flex items-end justify-between gap-4">
                <div>
                  <h3 className="text-4xl font-black tracking-[-0.05em] text-white">AAPL</h3>
                  <p className="mt-1 text-sm text-white/55">Apple Inc.</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/45">목표 매수가</p>
                  <p className="mt-1 text-lg font-bold text-cyan-200">US$290</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMaximalSaved((saved) => !saved)}
              aria-pressed={maximalSaved}
              className={cn(
                "premium-action mt-auto flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-500 active:scale-[0.97]",
                maximalSaved
                  ? "bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400 shadow-cyan-400/25"
                  : "bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500 shadow-indigo-500/35 hover:-translate-y-0.5 hover:shadow-indigo-400/50"
              )}
            >
              {maximalSaved ? <Check className="h-4 w-4" /> : <Star className="h-4 w-4" />}
              {maximalSaved ? "관심종목에 담았어요" : "관심종목 등록"}
            </button>
            <p className="mt-3 text-center text-[11px] text-white/35">빛, 이동, 입자, 큰 상태 변화로 행동을 강조</p>
          </div>
        </article>

        <article className="min-h-[330px] rounded-[2rem] border border-slate-200 bg-[#f7f7f4] p-6 text-slate-950 shadow-[0_18px_60px_rgba(0,0,0,0.18)] sm:p-8">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Quiet Premium</span>
              <span className="rounded-full bg-slate-950/[0.04] px-2.5 py-1 text-[10px] text-slate-500">절제된 반응</span>
            </div>

            <div className="mt-10 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">샘플 종목</p>
                <h3 className="mt-1 text-3xl font-bold tracking-[-0.04em]">AAPL</h3>
                <p className="mt-1 text-sm text-slate-500">Apple Inc.</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">목표 매수가</p>
                <p className="mt-1 text-base font-semibold">US$290</p>
              </div>
            </div>

            <div className="mt-auto">
              <button
                type="button"
                onClick={() => setQuietSaved((saved) => !saved)}
                aria-pressed={quietSaved}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.985]",
                  quietSaved
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50"
                )}
              >
                {quietSaved ? <Check className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                {quietSaved ? "관심종목 등록됨" : "관심종목 등록"}
              </button>
              <div className={cn("mt-3 flex h-5 items-center justify-center gap-1.5 text-xs transition-opacity duration-200", quietSaved ? "opacity-100 text-slate-500" : "opacity-0")} aria-live="polite">
                <Bell className="h-3.5 w-3.5" /> {quietSaved ? "가격과 뉴스 알림을 설정할 수 있어요." : ""}
              </div>
              <p className="mt-1 text-center text-[11px] text-slate-400">빠른 색상·문구 변화와 짧은 확인 메시지만 사용</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { Loader2, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, configured, signInWithGoogle } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google/Supabase 환경변수가 준비되기 전에는 기존 공개 앱을 유지합니다.
  if (!configured) return children;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          로그인 확인 중...
        </div>
      </div>
    );
  }

  if (user) return children;

  const handleGoogleLogin = async () => {
    setSigningIn(true);
    setError(null);
    const message = await signInWithGoogle();
    if (message) {
      setError(message);
      setSigningIn(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/70 p-7 shadow-2xl shadow-black/20">
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
            <TrendingUp className="h-6 w-6 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Stockfolio</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            내 포트폴리오를 확인하려면 Google 계정으로 로그인하세요.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={signingIn}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {signingIn ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-xs font-bold text-blue-600">
              G
            </span>
          )}
          {signingIn ? "Google로 이동 중..." : "Google로 계속하기"}
        </button>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <p className="mt-5 text-center text-xs leading-5 text-slate-500">
          별도 Stockfolio 비밀번호를 만들지 않습니다.
        </p>
      </div>
    </div>
  );
}

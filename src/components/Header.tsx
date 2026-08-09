"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Search,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { usePortfolio } from "@/hooks/usePortfolio";
import type { DisplayCurrency } from "@/lib/types";

const navItems = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/portfolio", label: "포트폴리오", icon: BarChart3 },
  { href: "/search", label: "거래 기록", icon: Search },
];

const currencyOptions: { value: DisplayCurrency; label: string }[] = [
  { value: "KRW", label: "₩" },
  { value: "USD", label: "$" },
];

export function Header() {
  const pathname = usePathname();
  const { user, configured, signOut } = useAuth();
  const { displayCurrency, setDisplayCurrency } = usePortfolio();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
          <span className="hidden text-lg font-bold text-white sm:inline">Stockfolio</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="hidden text-xs text-slate-500 lg:block">표시 통화</div>
          <div
            className="flex rounded-lg border border-slate-700 bg-slate-900 p-0.5"
            aria-label="자산 표시 통화"
            title="포트폴리오 자산을 어떤 통화 기준으로 볼지 선택합니다. 환차손익 분석과는 별개입니다."
          >
            {currencyOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDisplayCurrency(option.value)}
                className={cn(
                  "min-w-9 rounded-md px-2 py-1.5 text-sm font-semibold transition-colors",
                  displayCurrency === option.value
                    ? "bg-emerald-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
                title={
                  option.value === "KRW"
                    ? "자산을 원화 기준으로 보기"
                    : "자산을 달러 기준으로 보기"
                }
                aria-pressed={displayCurrency === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>

          <nav className="flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{label}</span>
                </Link>
              );
            })}
          </nav>

          {configured && user && (
            <div className="ml-1 flex items-center gap-1 border-l border-slate-800 pl-2">
              <span
                className="hidden max-w-40 truncate text-xs text-slate-400 xl:inline"
                title={user.email ?? "Google 계정"}
              >
                {user.email ?? "Google 계정"}
              </span>
              <button
                type="button"
                onClick={() => void signOut()}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                aria-label="로그아웃"
                title="로그아웃"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

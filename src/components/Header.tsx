"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BellRing,
  House,
  LogOut,
  MessageCircleMore,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { usePortfolio } from "@/hooks/usePortfolio";
import type { DisplayCurrency } from "@/lib/types";

const navItems = [
  { href: "/", label: "홈", icon: House },
  { href: "/portfolio", label: "포트폴리오", icon: BarChart3 },
  { href: "/insights", label: "분석", icon: Sparkles },
  { href: "/watchlist", label: "관심종목", icon: BellRing },
  { href: "/community", label: "커뮤니티", icon: MessageCircleMore },
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
    <>
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#070b16]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Stockfolio 홈">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/20">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="hidden text-base font-bold tracking-tight text-white sm:inline">
              Stockfolio
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="주요 메뉴">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-white text-slate-950"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div
              className="flex rounded-full border border-white/10 bg-white/5 p-0.5"
              aria-label="자산 표시 통화"
            >
              {currencyOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDisplayCurrency(option.value)}
                  className={cn(
                    "min-w-8 rounded-full px-2 py-1.5 text-xs font-bold transition-colors",
                    displayCurrency === option.value
                      ? "bg-indigo-500 text-white"
                      : "text-slate-500 hover:text-white"
                  )}
                  aria-pressed={displayCurrency === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <Link
              href="/search"
              className="flex h-9 items-center gap-1.5 rounded-full bg-white px-3 text-xs font-semibold text-slate-950 transition-colors hover:bg-slate-200"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">거래</span>
            </Link>

            {configured && user ? (
              <button
                type="button"
                onClick={() => void signOut()}
                className="hidden rounded-full p-2 text-slate-500 hover:bg-white/5 hover:text-white sm:block"
                aria-label="로그아웃"
                title={user.email ?? "로그아웃"}
              >
                <LogOut className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#070b16]/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden" aria-label="모바일 메뉴">
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-w-0 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium",
                  active ? "text-indigo-300" : "text-slate-500"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

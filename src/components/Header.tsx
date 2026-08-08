"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, LayoutDashboard, Search, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
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
          <div
            className="flex rounded-lg border border-slate-700 bg-slate-900 p-0.5"
            aria-label="포트폴리오 표시 통화"
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
                title={option.value === "KRW" ? "원화로 보기" : "달러로 보기"}
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
        </div>
      </div>
    </header>
  );
}

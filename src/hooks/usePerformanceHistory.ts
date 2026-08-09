"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePortfolio } from "@/hooks/usePortfolio";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { getChartSeries } from "@/lib/stock-api";
import {
  addCalendarDays,
  buildDailyPerformance,
  kstDate,
} from "@/lib/performance";
import type {
  ChartPoint,
  PortfolioPerformancePoint,
} from "@/lib/types";

const PERFORMANCE_CACHE_KEY = "stockfolio-performance-snapshots";

interface SnapshotRow {
  snapshot_date: string;
  cutoff_at: string;
  total_assets_krw: number;
  twr_index: number;
  net_flow_krw: number;
  cumulative_net_flow_krw: number;
  cumulative_profit_krw: number;
  is_active: boolean;
  is_final: boolean;
}

export function usePerformanceHistory() {
  const { user } = useAuth();
  const { transactions } = usePortfolio();

  const [points, setPoints] = useState<PortfolioPerformancePoint[]>([]);
  const [trackingStartedAt, setTrackingStartedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id ?? null;

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      if (transactions.length === 0) {
        setPoints([]);
        setTrackingStartedAt(null);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      const fallbackStartedAt = [...transactions]
        .map((transaction) => transaction.createdAt)
        .filter(Boolean)
        .sort()[0] ?? new Date().toISOString();
      let startedAt = fallbackStartedAt;
      let hadStoredPoints = false;
      const supabase = getSupabaseBrowserClient();

      if (supabase && userId) {
        const [preferenceResult, snapshotResult] = await Promise.all([
          supabase
            .from("portfolio_preferences")
            .select("portfolio_started_at")
            .eq("user_id", userId)
            .maybeSingle(),
          supabase
            .from("portfolio_snapshots")
            .select(
              "snapshot_date, cutoff_at, total_assets_krw, twr_index, net_flow_krw, cumulative_net_flow_krw, cumulative_profit_krw, is_active, is_final"
            )
            .eq("user_id", userId)
            .order("snapshot_date"),
        ]);

        const persistedStartedAt = preferenceResult.data?.portfolio_started_at;
        if (persistedStartedAt) {
          startedAt = persistedStartedAt;
        } else if (!preferenceResult.error) {
          await supabase.from("portfolio_preferences").upsert(
            {
              user_id: userId,
              portfolio_started_at: fallbackStartedAt,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );
        }

        if (!snapshotResult.error && snapshotResult.data?.length) {
          const stored = (snapshotResult.data as SnapshotRow[]).map(rowToPoint);
          hadStoredPoints = true;
          if (!cancelled) setPoints(stored);
        }
      } else {
        const cached = loadCachedPoints(userId);
        if (cached.length) {
          hadStoredPoints = true;
          if (!cancelled) setPoints(cached);
        }
      }

      if (cancelled) return;
      setTrackingStartedAt(startedAt);

      const startDate = kstDate(new Date(startedAt));
      const endDate = kstDate();
      const fetchStart = addCalendarDays(startDate, -7);
      const symbols = Array.from(
        new Set(transactions.map((transaction) => transaction.symbol))
      );
      const currencies = Array.from(
        new Set(
          transactions
            .map((transaction) => transaction.currency ?? "USD")
            .filter((currency) => currency !== "KRW")
        )
      );

      try {
        const [priceResults, fxResults] = await Promise.all([
          Promise.all(
            symbols.map(async (symbol) => [
              symbol,
              await getChartSeries(symbol, fetchStart, endDate),
            ] as const)
          ),
          Promise.all(
            currencies.map(async (currency) => [
              currency,
              await getChartSeries(`${currency}KRW=X`, fetchStart, endDate),
            ] as const)
          ),
        ]);

        const pricesBySymbol = Object.fromEntries(
          priceResults.map(([symbol, series]) => [symbol, series.points])
        ) as Record<string, ChartPoint[]>;
        const fxByCurrency = Object.fromEntries(
          fxResults.map(([currency, series]) => [currency, series.points])
        ) as Record<string, ChartPoint[]>;
        const reconstructed = buildDailyPerformance({
          transactions,
          trackingStartDate: startDate,
          endDate,
          pricesBySymbol,
          fxByCurrency,
        });

        if (cancelled) return;
        setPoints(reconstructed);
        saveCachedPoints(reconstructed, userId);

        if (supabase && userId && reconstructed.length) {
          const rows = reconstructed.map((point) => ({
            user_id: userId,
            snapshot_date: point.date,
            cutoff_at: point.cutoffAt,
            captured_at: new Date().toISOString(),
            portfolio_started_at: startedAt,
            total_assets_krw: point.assetValueKRW,
            investment_assets_krw: point.assetValueKRW,
            cash_assets_krw: 0,
            twr_index: point.twrIndex,
            net_flow_krw: point.netFlowKRW,
            cumulative_net_flow_krw: point.cumulativeNetFlowKRW,
            cumulative_profit_krw: point.cumulativeProfitKRW,
            is_active: point.active,
            is_final: point.final,
            valuation_method: "reconstructed_daily_close",
          }));
          const { error: saveError } = await supabase
            .from("portfolio_snapshots")
            .upsert(rows, { onConflict: "user_id,snapshot_date" });
          if (saveError) console.error("일별 스냅샷 서버 저장 실패", saveError);
        }
      } catch (caught) {
        console.error("성과 이력 재구성 실패", caught);
        if (!cancelled) {
          setError(
            hadStoredPoints
              ? "일부 최신 시세를 불러오지 못해 저장된 기록을 표시합니다."
              : "일별 성과 기록을 불러오지 못했습니다."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [transactions, userId]);

  return { points, trackingStartedAt, loading, error };
}

function rowToPoint(row: SnapshotRow): PortfolioPerformancePoint {
  return {
    date: row.snapshot_date,
    cutoffAt: row.cutoff_at,
    assetValueKRW: Number(row.total_assets_krw),
    twrIndex: Number(row.twr_index),
    netFlowKRW: Number(row.net_flow_krw),
    cumulativeNetFlowKRW: Number(row.cumulative_net_flow_krw),
    cumulativeProfitKRW: Number(row.cumulative_profit_krw),
    active: row.is_active,
    final: row.is_final,
  };
}

function cacheKey(userId: string | null): string {
  return userId
    ? `${PERFORMANCE_CACHE_KEY}:${userId}`
    : PERFORMANCE_CACHE_KEY;
}

function loadCachedPoints(userId: string | null): PortfolioPerformancePoint[] {
  try {
    return JSON.parse(localStorage.getItem(cacheKey(userId)) ?? "[]");
  } catch {
    return [];
  }
}

function saveCachedPoints(
  points: PortfolioPerformancePoint[],
  userId: string | null
) {
  localStorage.setItem(cacheKey(userId), JSON.stringify(points));
}

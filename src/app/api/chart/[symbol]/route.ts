import YahooFinance from "yahoo-finance2";
import { NextRequest, NextResponse } from "next/server";
import type {
  ChartPoint,
  ChartSeries,
  DividendDataStatus,
  DividendEvent,
} from "@/lib/types";

const yahooFinance = new YahooFinance();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const range = request.nextUrl.searchParams.get("range") ?? "6mo";
  const start = request.nextUrl.searchParams.get("start");
  const end = request.nextUrl.searchParams.get("end");
  const detailed = request.nextUrl.searchParams.get("detailed") === "true";

  try {
    const period1 = start ?? getPeriodStart(range);
    const period2 = end ? addDays(end, 1) : undefined;
    const result = await yahooFinance.chart(symbol, {
      period1,
      ...(period2 ? { period2 } : {}),
      interval: start || range === "5d" || range === "1mo" ? "1d" : "1wk",
      events: "div",
    });

    const points: ChartPoint[] = (result.quotes ?? [])
      .filter((q) => q.close != null)
      .map((q) => ({
        date: q.date.toISOString().split("T")[0],
        close: q.close!,
        adjustedClose:
          q.adjclose == null || !Number.isFinite(q.adjclose)
            ? undefined
            : q.adjclose,
      }));

    if (!detailed) return NextResponse.json(points);

    const dividendRows = result.events?.dividends;
    const dividends: DividendEvent[] = (dividendRows ?? []).map((row) => ({
      date: row.date.toISOString().split("T")[0],
      amount: row.amount,
    }));
    const dividendStatus: DividendDataStatus =
      dividends.length > 0 ? "confirmed_amount" : "confirmed_zero";

    const series: ChartSeries = {
      symbol,
      points,
      dividendStatus,
      dividends,
    };

    return NextResponse.json(series);
  } catch (error) {
    console.error("차트 데이터 조회 실패", { symbol, start, end, error });
    return NextResponse.json({ error: "차트 데이터 조회에 실패했습니다." }, { status: 500 });
  }
}

function addDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().split("T")[0];
}

function getPeriodStart(range: string): string {
  const now = new Date();
  const map: Record<string, number> = {
    "5d": 5,
    "1mo": 30,
    "3mo": 90,
    "6mo": 180,
    "1y": 365,
    "5y": 365 * 5,
  };
  const days = map[range] ?? 180;
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return start.toISOString().split("T")[0];
}

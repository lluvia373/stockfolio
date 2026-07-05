import YahooFinance from "yahoo-finance2";
import { NextRequest, NextResponse } from "next/server";
import type { ChartPoint } from "@/lib/types";

const yahooFinance = new YahooFinance();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const range = request.nextUrl.searchParams.get("range") ?? "6mo";

  try {
    const result = await yahooFinance.chart(symbol, {
      period1: getPeriodStart(range),
      interval: range === "5d" || range === "1mo" ? "1d" : "1wk",
    });

    const points: ChartPoint[] = (result.quotes ?? [])
      .filter((q) => q.close != null)
      .map((q) => ({
        date: q.date.toISOString().split("T")[0],
        close: q.close!,
      }));

    return NextResponse.json(points);
  } catch {
    return NextResponse.json({ error: "차트 데이터 조회에 실패했습니다." }, { status: 500 });
  }
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

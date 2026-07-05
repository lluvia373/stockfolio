import YahooFinance from "yahoo-finance2";
import { NextRequest, NextResponse } from "next/server";
import type { DayOHLC } from "@/lib/types";

const yahooFinance = new YahooFinance();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const date = request.nextUrl.searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "유효한 날짜가 필요합니다." }, { status: 400 });
  }

  const today = new Date().toISOString().split("T")[0];
  if (date > today) {
    return NextResponse.json({ error: "미래 날짜는 선택할 수 없습니다." }, { status: 400 });
  }

  try {
    const period2 = addDays(date, 1);

    const result = await yahooFinance.chart(symbol, {
      period1: date,
      period2,
      interval: "1d",
    });

    const quote = (result.quotes ?? []).find(
      (q) => q.date.toISOString().split("T")[0] === date
    ) ?? result.quotes?.[0];

    if (!quote || quote.high == null || quote.low == null) {
      return NextResponse.json(
        { error: "해당 날짜의 거래 데이터가 없습니다. (휴장일일 수 있습니다)" },
        { status: 404 }
      );
    }

    const currency =
      result.meta?.currency ??
      (await yahooFinance.quote(symbol)).currency ??
      "USD";

    const data: DayOHLC = {
      date,
      open: quote.open ?? quote.close!,
      high: quote.high,
      low: quote.low,
      close: quote.close!,
      currency,
    };

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "과거 시세 조회에 실패했습니다." }, { status: 500 });
  }
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

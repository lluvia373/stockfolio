import YahooFinance from "yahoo-finance2";
import { NextRequest, NextResponse } from "next/server";
import type { StockQuote } from "@/lib/types";

const yahooFinance = new YahooFinance();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;

  try {
    const quote = await yahooFinance.quote(symbol);

    if (!quote || !quote.regularMarketPrice) {
      return NextResponse.json({ error: "종목을 찾을 수 없습니다." }, { status: 404 });
    }

    const data: StockQuote = {
      symbol: quote.symbol ?? symbol,
      name: quote.shortName ?? quote.longName ?? symbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange ?? 0,
      changePercent: quote.regularMarketChangePercent ?? 0,
      currency: quote.currency ?? "USD",
      marketCap: quote.marketCap,
      volume: quote.regularMarketVolume,
      dayHigh: quote.regularMarketDayHigh,
      dayLow: quote.regularMarketDayLow,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
      previousClose: quote.regularMarketPreviousClose,
    };

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "시세 조회에 실패했습니다." }, { status: 500 });
  }
}

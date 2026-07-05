import YahooFinance from "yahoo-finance2";
import { NextRequest, NextResponse } from "next/server";
import type { StockSearchResult } from "@/lib/types";

const yahooFinance = new YahooFinance();

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query || query.trim().length < 1) {
    return NextResponse.json([]);
  }

  try {
    const results = await yahooFinance.search(query, { quotesCount: 10 });

    const stocks: StockSearchResult[] = (results.quotes ?? [])
      .filter(
        (q): q is typeof q & { symbol: string; shortname?: string; longname?: string } =>
          "symbol" in q && typeof q.symbol === "string"
      )
      .map((q) => ({
        symbol: q.symbol,
        name: q.shortname ?? q.longname ?? q.symbol,
        exchange: String(q.exchange ?? ""),
        type: String(q.quoteType ?? "EQUITY"),
      }));

    return NextResponse.json(stocks);
  } catch {
    return NextResponse.json({ error: "검색에 실패했습니다." }, { status: 500 });
  }
}

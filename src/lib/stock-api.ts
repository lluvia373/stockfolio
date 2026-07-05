import type { ChartPoint, DayOHLC, StockQuote, StockSearchResult } from "./types";

export async function searchStocks(query: string): Promise<StockSearchResult[]> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("검색에 실패했습니다.");
  return res.json();
}

export async function getQuote(symbol: string): Promise<StockQuote> {
  const res = await fetch(`/api/quote/${encodeURIComponent(symbol)}`);
  if (!res.ok) throw new Error("시세 조회에 실패했습니다.");
  return res.json();
}

export async function getChart(symbol: string, range = "6mo"): Promise<ChartPoint[]> {
  const res = await fetch(
    `/api/chart/${encodeURIComponent(symbol)}?range=${encodeURIComponent(range)}`
  );
  if (!res.ok) throw new Error("차트 데이터 조회에 실패했습니다.");
  return res.json();
}

export async function getHistoricalDay(symbol: string, date: string): Promise<DayOHLC> {
  const res = await fetch(
    `/api/historical/${encodeURIComponent(symbol)}?date=${encodeURIComponent(date)}`
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "과거 시세 조회에 실패했습니다.");
  }
  return res.json();
}

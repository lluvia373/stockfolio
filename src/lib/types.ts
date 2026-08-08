export type TransactionType = "buy" | "sell";

export interface Transaction {
  id: string;
  symbol: string;
  name: string;
  type: TransactionType;
  date: string;
  quantity: number;
  price: number;
  fee: number;
  currency?: string;
  fxRateToKRW?: number;
  createdAt: string;
}

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgCost: number;
  currency?: string;
  costBasisKRW?: number;
  addedAt: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  marketCap?: number;
  volume?: number;
  dayHigh?: number;
  dayLow?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  previousClose?: number;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

export interface ChartPoint {
  date: string;
  close: number;
}

export interface DayOHLC {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  currency: string;
}

export interface HoldingWithQuote extends Holding {
  quote?: StockQuote;
  marketValue: number;
  costBasis: number;
  gainLoss: number;
  gainLossPercent: number;
  marketValueKRW: number;
  resolvedCostBasisKRW: number;
  gainLossKRW: number;
  gainLossPercentKRW: number;
}

export interface PortfolioSummary {
  baseCurrency: "KRW";
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  holdings: HoldingWithQuote[];
}

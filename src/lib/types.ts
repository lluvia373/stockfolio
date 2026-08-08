export type TransactionType = "buy" | "sell";
export type DisplayCurrency = "KRW" | "USD";

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
  usdKrwRateAtTransaction?: number;
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
  costBasisUSD?: number;
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
  marketValueUSD: number;
  resolvedCostBasisUSD: number;
  gainLossUSD: number;
  gainLossPercentUSD: number;
  displayMarketValue: number;
  displayCostBasis: number;
  displayGainLoss: number;
  displayGainLossPercent: number;
}

export interface PortfolioSummary {
  baseCurrency: DisplayCurrency;
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  holdings: HoldingWithQuote[];
}

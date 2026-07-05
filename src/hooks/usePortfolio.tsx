"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  Holding,
  HoldingWithQuote,
  PortfolioSummary,
  StockQuote,
  Transaction,
  TransactionType,
} from "@/lib/types";
import { deriveHoldings, validateSell } from "@/lib/portfolio";
import { getQuote } from "@/lib/stock-api";

const TRANSACTIONS_KEY = "stock-transactions";
const LEGACY_HOLDINGS_KEY = "stock-portfolio";

interface AddTransactionInput {
  symbol: string;
  name: string;
  type: TransactionType;
  date: string;
  quantity: number;
  price: number;
  fee?: number;
}

interface PortfolioContextValue {
  transactions: Transaction[];
  holdings: Holding[];
  summary: PortfolioSummary | null;
  loading: boolean;
  addTransaction: (input: AddTransactionInput) => string | null;
  removeTransaction: (id: string) => void;
  refreshQuotes: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

function loadTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    if (raw) return JSON.parse(raw);

    const legacy = localStorage.getItem(LEGACY_HOLDINGS_KEY);
    if (!legacy) return [];

    const holdings: Holding[] = JSON.parse(legacy);
    const migrated: Transaction[] = holdings.map((h) => ({
      id: h.id,
      symbol: h.symbol,
      name: h.name,
      type: "buy" as const,
      date: h.addedAt.split("T")[0],
      quantity: h.quantity,
      price: h.avgCost,
      fee: 0,
      createdAt: h.addedAt,
    }));

    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(migrated));
    localStorage.removeItem(LEGACY_HOLDINGS_KEY);
    return migrated;
  } catch {
    return [];
  }
}

function saveTransactions(transactions: Transaction[]) {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}

function buildSummary(
  holdings: Holding[],
  quotes: Record<string, StockQuote>
): PortfolioSummary {
  const enriched: HoldingWithQuote[] = holdings.map((h) => {
    const quote = quotes[h.symbol];
    const marketValue = quote ? quote.price * h.quantity : 0;
    const costBasis = h.avgCost * h.quantity;
    const gainLoss = marketValue - costBasis;
    const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

    return { ...h, quote, marketValue, costBasis, gainLoss, gainLossPercent };
  });

  const totalValue = enriched.reduce((s, h) => s + h.marketValue, 0);
  const totalCost = enriched.reduce((s, h) => s + h.costBasis, 0);
  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

  return {
    totalValue,
    totalCost,
    totalGainLoss,
    totalGainLossPercent,
    holdings: enriched,
  };
}

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const holdings = useMemo(() => deriveHoldings(transactions), [transactions]);

  useEffect(() => {
    setTransactions(loadTransactions());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveTransactions(transactions);
  }, [transactions, hydrated]);

  const refreshQuotes = useCallback(async () => {
    if (holdings.length === 0) {
      setQuotes({});
      return;
    }

    setLoading(true);
    try {
      const results = await Promise.allSettled(
        holdings.map((h) => getQuote(h.symbol))
      );

      const newQuotes: Record<string, StockQuote> = {};
      results.forEach((result, i) => {
        if (result.status === "fulfilled") {
          newQuotes[holdings[i].symbol] = result.value;
        }
      });
      setQuotes(newQuotes);
    } finally {
      setLoading(false);
    }
  }, [holdings]);

  useEffect(() => {
    if (hydrated && holdings.length > 0) {
      refreshQuotes();
    }
  }, [hydrated, holdings.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const addTransaction = useCallback(
    (input: AddTransactionInput): string | null => {
      const upper = input.symbol.toUpperCase();
      const fee = input.fee ?? 0;

      if (input.type === "sell") {
        const error = validateSell(transactions, upper, input.quantity);
        if (error) return error;
      }

      const tx: Transaction = {
        id: crypto.randomUUID(),
        symbol: upper,
        name: input.name,
        type: input.type,
        date: input.date,
        quantity: input.quantity,
        price: input.price,
        fee,
        createdAt: new Date().toISOString(),
      };

      setTransactions((prev) => [...prev, tx]);
      return null;
    },
    [transactions]
  );

  const removeTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const summary = useMemo(
    () => (holdings.length > 0 ? buildSummary(holdings, quotes) : null),
    [holdings, quotes]
  );

  return (
    <PortfolioContext.Provider
      value={{
        transactions,
        holdings,
        summary,
        loading,
        addTransaction,
        removeTransaction,
        refreshQuotes,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used within PortfolioProvider");
  return ctx;
}

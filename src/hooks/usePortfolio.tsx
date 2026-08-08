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
import { getFxRateToKRW, getQuote } from "@/lib/stock-api";
import { BASE_CURRENCY, normalizeCurrency, toKRW } from "@/lib/currency";

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
  currency: string;
  fxRateToKRW: number;
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
      currency: h.currency,
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

async function enrichLegacyCurrencies(transactions: Transaction[]): Promise<Transaction[]> {
  const currencyPromises = new Map<string, Promise<string>>();
  const fxPromises = new Map<string, Promise<number>>();

  const getCurrency = (symbol: string) => {
    let promise = currencyPromises.get(symbol);
    if (!promise) {
      promise = getQuote(symbol).then((quote) => quote.currency);
      currencyPromises.set(symbol, promise);
    }
    return promise;
  };

  const getHistoricalFx = (currency: string, date: string) => {
    const key = `${currency}:${date}`;
    let promise = fxPromises.get(key);
    if (!promise) {
      promise = getFxRateToKRW(currency, date);
      fxPromises.set(key, promise);
    }
    return promise;
  };

  return Promise.all(
    transactions.map(async (tx) => {
      if (tx.currency && tx.fxRateToKRW != null) return tx;

      try {
        const currency = tx.currency ?? (await getCurrency(tx.symbol));
        const fxRateToKRW = tx.fxRateToKRW ?? (await getHistoricalFx(currency, tx.date));
        return { ...tx, currency, fxRateToKRW };
      } catch {
        return tx;
      }
    })
  );
}

function buildSummary(
  holdings: Holding[],
  quotes: Record<string, StockQuote>,
  fxRatesToKRW: Record<string, number>
): PortfolioSummary {
  const enriched: HoldingWithQuote[] = holdings.map((h) => {
    const quote = quotes[h.symbol];
    const currency = quote?.currency ?? h.currency ?? "USD";
    const normalizedCurrency = normalizeCurrency(currency);
    const fxRate =
      normalizedCurrency === BASE_CURRENCY
        ? 1
        : fxRatesToKRW[normalizedCurrency] ?? 0;

    const marketValue = quote ? quote.price * h.quantity : 0;
    const costBasis = h.avgCost * h.quantity;
    const gainLoss = marketValue - costBasis;
    const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

    const marketValueKRW = fxRate > 0 ? toKRW(marketValue, currency, fxRate) : 0;
    const resolvedCostBasisKRW =
      h.costBasisKRW ?? (fxRate > 0 ? toKRW(costBasis, currency, fxRate) : 0);
    const gainLossKRW = marketValueKRW - resolvedCostBasisKRW;
    const gainLossPercentKRW =
      resolvedCostBasisKRW > 0 ? (gainLossKRW / resolvedCostBasisKRW) * 100 : 0;

    return {
      ...h,
      currency,
      quote,
      marketValue,
      costBasis,
      gainLoss,
      gainLossPercent,
      marketValueKRW,
      resolvedCostBasisKRW,
      gainLossKRW,
      gainLossPercentKRW,
    };
  });

  const totalValue = enriched.reduce((s, h) => s + h.marketValueKRW, 0);
  const totalCost = enriched.reduce((s, h) => s + h.resolvedCostBasisKRW, 0);
  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

  return {
    baseCurrency: BASE_CURRENCY,
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
  const [fxRatesToKRW, setFxRatesToKRW] = useState<Record<string, number>>({ KRW: 1 });
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const holdings = useMemo(() => deriveHoldings(transactions), [transactions]);

  useEffect(() => {
    const loaded = loadTransactions();
    setTransactions(loaded);
    setHydrated(true);

    if (loaded.some((tx) => !tx.currency || tx.fxRateToKRW == null)) {
      enrichLegacyCurrencies(loaded).then((enriched) => {
        const changed = enriched.some(
          (tx, i) =>
            tx.currency !== loaded[i]?.currency ||
            tx.fxRateToKRW !== loaded[i]?.fxRateToKRW
        );
        if (changed) setTransactions(enriched);
      });
    }
  }, []);

  useEffect(() => {
    if (hydrated) saveTransactions(transactions);
  }, [transactions, hydrated]);

  const refreshQuotes = useCallback(async () => {
    if (holdings.length === 0) {
      setQuotes({});
      setFxRatesToKRW({ KRW: 1 });
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

      const currencies = Array.from(
        new Set(
          Object.values(newQuotes)
            .map((quote) => normalizeCurrency(quote.currency))
            .filter((currency) => currency !== BASE_CURRENCY)
        )
      );

      const fxResults = await Promise.allSettled(
        currencies.map(async (currency) => [currency, await getFxRateToKRW(currency)] as const)
      );
      const nextFxRates: Record<string, number> = { KRW: 1 };
      fxResults.forEach((result) => {
        if (result.status === "fulfilled") {
          const [currency, rate] = result.value;
          nextFxRates[currency] = rate;
        }
      });
      setFxRatesToKRW(nextFxRates);
    } finally {
      setLoading(false);
    }
  }, [holdings]);

  useEffect(() => {
    if (hydrated && holdings.length > 0) {
      void refreshQuotes();
    }
  }, [hydrated, refreshQuotes, holdings.length]);

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
        currency: input.currency,
        fxRateToKRW: input.fxRateToKRW,
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
    () =>
      holdings.length > 0
        ? buildSummary(holdings, quotes, fxRatesToKRW)
        : null,
    [holdings, quotes, fxRatesToKRW]
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

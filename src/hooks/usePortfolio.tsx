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
  DisplayCurrency,
  Holding,
  HoldingWithQuote,
  PortfolioSummary,
  StockQuote,
  Transaction,
  TransactionType,
} from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { deriveHoldings, validateSell } from "@/lib/portfolio";
import { getFxRateToKRW, getQuote } from "@/lib/stock-api";
import {
  BASE_CURRENCY,
  DEFAULT_DISPLAY_CURRENCY,
  krwToDisplayCurrency,
  normalizeCurrency,
  toKRW,
} from "@/lib/currency";

const TRANSACTIONS_KEY = "stock-transactions";
const LEGACY_HOLDINGS_KEY = "stock-portfolio";
const DISPLAY_CURRENCY_KEY = "stock-display-currency";

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
  usdKrwRateAtTransaction: number;
}

interface PortfolioContextValue {
  transactions: Transaction[];
  holdings: Holding[];
  summary: PortfolioSummary | null;
  loading: boolean;
  displayCurrency: DisplayCurrency;
  setDisplayCurrency: (currency: DisplayCurrency) => void;
  addTransaction: (input: AddTransactionInput) => string | null;
  removeTransaction: (id: string) => void;
  refreshQuotes: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

function scopedKey(baseKey: string, userId?: string | null): string {
  return userId ? `${baseKey}:${userId}` : baseKey;
}

function loadTransactions(userId?: string | null): Transaction[] {
  if (typeof window === "undefined") return [];

  try {
    const transactionKey = scopedKey(TRANSACTIONS_KEY, userId);
    const raw = localStorage.getItem(transactionKey);
    if (raw) return JSON.parse(raw);

    // 로그인 도입 전 기존 데이터는 첫 로그인 계정으로 한 번만 이전합니다.
    if (userId) {
      const unscopedTransactions = localStorage.getItem(TRANSACTIONS_KEY);
      if (unscopedTransactions) {
        localStorage.setItem(transactionKey, unscopedTransactions);
        localStorage.removeItem(TRANSACTIONS_KEY);
        return JSON.parse(unscopedTransactions);
      }
    }

    const legacyKey = scopedKey(LEGACY_HOLDINGS_KEY, userId);
    let legacy = localStorage.getItem(legacyKey);

    if (!legacy && userId) {
      legacy = localStorage.getItem(LEGACY_HOLDINGS_KEY);
      if (legacy) localStorage.removeItem(LEGACY_HOLDINGS_KEY);
    }

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

    localStorage.setItem(transactionKey, JSON.stringify(migrated));
    localStorage.removeItem(legacyKey);
    return migrated;
  } catch {
    return [];
  }
}

function saveTransactions(
  transactions: Transaction[],
  userId?: string | null
) {
  localStorage.setItem(
    scopedKey(TRANSACTIONS_KEY, userId),
    JSON.stringify(transactions)
  );
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
      if (
        tx.currency &&
        tx.fxRateToKRW != null &&
        tx.usdKrwRateAtTransaction != null
      ) {
        return tx;
      }

      try {
        const currency = tx.currency ?? (await getCurrency(tx.symbol));
        const [fxRateToKRW, usdKrwRateAtTransaction] = await Promise.all([
          tx.fxRateToKRW ?? getHistoricalFx(currency, tx.date),
          tx.usdKrwRateAtTransaction ?? getHistoricalFx("USD", tx.date),
        ]);
        return { ...tx, currency, fxRateToKRW, usdKrwRateAtTransaction };
      } catch {
        return tx;
      }
    })
  );
}

function buildSummary(
  holdings: Holding[],
  quotes: Record<string, StockQuote>,
  fxRatesToKRW: Record<string, number>,
  displayCurrency: DisplayCurrency
): PortfolioSummary {
  const currentUsdKrwRate = fxRatesToKRW.USD ?? 0;

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

    const marketValueUSD = krwToDisplayCurrency(
      marketValueKRW,
      "USD",
      currentUsdKrwRate
    );
    const resolvedCostBasisUSD =
      h.costBasisUSD ??
      krwToDisplayCurrency(resolvedCostBasisKRW, "USD", currentUsdKrwRate);
    const gainLossUSD = marketValueUSD - resolvedCostBasisUSD;
    const gainLossPercentUSD =
      resolvedCostBasisUSD > 0 ? (gainLossUSD / resolvedCostBasisUSD) * 100 : 0;

    const displayMarketValue =
      displayCurrency === "KRW" ? marketValueKRW : marketValueUSD;
    const displayCostBasis =
      displayCurrency === "KRW" ? resolvedCostBasisKRW : resolvedCostBasisUSD;
    const displayGainLoss =
      displayCurrency === "KRW" ? gainLossKRW : gainLossUSD;
    const displayGainLossPercent =
      displayCurrency === "KRW" ? gainLossPercentKRW : gainLossPercentUSD;

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
      marketValueUSD,
      resolvedCostBasisUSD,
      gainLossUSD,
      gainLossPercentUSD,
      displayMarketValue,
      displayCostBasis,
      displayGainLoss,
      displayGainLossPercent,
    };
  });

  const totalValue = enriched.reduce((s, h) => s + h.displayMarketValue, 0);
  const totalCost = enriched.reduce((s, h) => s + h.displayCostBasis, 0);
  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

  return {
    baseCurrency: displayCurrency,
    totalValue,
    totalCost,
    totalGainLoss,
    totalGainLossPercent,
    holdings: enriched,
  };
}

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const { user, configured: authConfigured } = useAuth();
  const storageUserId = authConfigured ? user?.id ?? null : null;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});
  const [fxRatesToKRW, setFxRatesToKRW] = useState<Record<string, number>>({ KRW: 1 });
  const [displayCurrency, setDisplayCurrencyState] =
    useState<DisplayCurrency>(DEFAULT_DISPLAY_CURRENCY);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const holdings = useMemo(() => deriveHoldings(transactions), [transactions]);

  useEffect(() => {
    setHydrated(false);
    setTransactions([]);
    setQuotes({});
    setFxRatesToKRW({ KRW: 1 });

    const displayKey = scopedKey(DISPLAY_CURRENCY_KEY, storageUserId);
    let storedDisplayCurrency = localStorage.getItem(displayKey);

    if (!storedDisplayCurrency && storageUserId) {
      storedDisplayCurrency = localStorage.getItem(DISPLAY_CURRENCY_KEY);
      if (storedDisplayCurrency) {
        localStorage.setItem(displayKey, storedDisplayCurrency);
        localStorage.removeItem(DISPLAY_CURRENCY_KEY);
      }
    }

    if (storedDisplayCurrency === "KRW" || storedDisplayCurrency === "USD") {
      setDisplayCurrencyState(storedDisplayCurrency);
    } else {
      setDisplayCurrencyState(DEFAULT_DISPLAY_CURRENCY);
    }

    const loaded = loadTransactions(storageUserId);
    setTransactions(loaded);
    setHydrated(true);

    if (
      loaded.some(
        (tx) =>
          !tx.currency ||
          tx.fxRateToKRW == null ||
          tx.usdKrwRateAtTransaction == null
      )
    ) {
      enrichLegacyCurrencies(loaded).then((enriched) => {
        const changed = enriched.some(
          (tx, i) =>
            tx.currency !== loaded[i]?.currency ||
            tx.fxRateToKRW !== loaded[i]?.fxRateToKRW ||
            tx.usdKrwRateAtTransaction !== loaded[i]?.usdKrwRateAtTransaction
        );
        if (changed) setTransactions(enriched);
      });
    }
  }, [storageUserId]);

  useEffect(() => {
    if (hydrated) saveTransactions(transactions, storageUserId);
  }, [transactions, hydrated, storageUserId]);

  const setDisplayCurrency = useCallback(
    (currency: DisplayCurrency) => {
      setDisplayCurrencyState(currency);
      localStorage.setItem(
        scopedKey(DISPLAY_CURRENCY_KEY, storageUserId),
        currency
      );
    },
    [storageUserId]
  );

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
        new Set([
          "USD",
          ...Object.values(newQuotes)
            .map((quote) => normalizeCurrency(quote.currency))
            .filter((currency) => currency !== BASE_CURRENCY),
        ])
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
        usdKrwRateAtTransaction: input.usdKrwRateAtTransaction,
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
        ? buildSummary(holdings, quotes, fxRatesToKRW, displayCurrency)
        : null,
    [holdings, quotes, fxRatesToKRW, displayCurrency]
  );

  return (
    <PortfolioContext.Provider
      value={{
        transactions,
        holdings,
        summary,
        loading,
        displayCurrency,
        setDisplayCurrency,
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

import type { Holding, Transaction } from "./types";

export function deriveHoldings(transactions: Transaction[]): Holding[] {
  const sorted = [...transactions].sort(
    (a, b) =>
      a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt)
  );

  const positions = new Map<
    string,
    { symbol: string; name: string; quantity: number; totalCost: number; firstDate: string }
  >();

  for (const tx of sorted) {
    if (tx.type === "buy") {
      const existing = positions.get(tx.symbol);
      const cost = tx.quantity * tx.price + tx.fee;
      if (existing) {
        existing.quantity += tx.quantity;
        existing.totalCost += cost;
      } else {
        positions.set(tx.symbol, {
          symbol: tx.symbol,
          name: tx.name,
          quantity: tx.quantity,
          totalCost: cost,
          firstDate: tx.date,
        });
      }
    } else {
      const existing = positions.get(tx.symbol);
      if (!existing || existing.quantity <= 0) continue;

      const avgCost = existing.totalCost / existing.quantity;
      existing.quantity -= tx.quantity;
      existing.totalCost -= avgCost * tx.quantity;

      if (existing.quantity < 1e-8) {
        positions.delete(tx.symbol);
      }
    }
  }

  return Array.from(positions.values()).map((p) => ({
    id: p.symbol,
    symbol: p.symbol,
    name: p.name,
    quantity: p.quantity,
    avgCost: p.quantity > 0 ? p.totalCost / p.quantity : 0,
    addedAt: p.firstDate,
  }));
}

export function getAvailableQuantity(
  transactions: Transaction[],
  symbol: string
): number {
  return deriveHoldings(transactions).find((h) => h.symbol === symbol)?.quantity ?? 0;
}

export function validateSell(
  transactions: Transaction[],
  symbol: string,
  quantity: number
): string | null {
  const available = getAvailableQuantity(transactions, symbol);
  if (quantity > available) {
    return `보유 수량(${available})을 초과할 수 없습니다.`;
  }
  return null;
}

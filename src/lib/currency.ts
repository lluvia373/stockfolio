export const BASE_CURRENCY = "KRW";

export function normalizeCurrency(currency?: string): string {
  if (!currency) return "USD";
  if (currency === "GBp" || currency === "GBX") return "GBP";
  return currency.toUpperCase();
}

export function currencyUnitScale(currency?: string): number {
  return currency === "GBp" || currency === "GBX" ? 0.01 : 1;
}

export function toKRW(amount: number, currency: string, fxRateToKRW: number): number {
  return amount * currencyUnitScale(currency) * fxRateToKRW;
}

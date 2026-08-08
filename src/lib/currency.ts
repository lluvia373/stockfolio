import type { DisplayCurrency } from "./types";

export const BASE_CURRENCY = "KRW";
export const DEFAULT_DISPLAY_CURRENCY: DisplayCurrency = "KRW";

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

export function krwToDisplayCurrency(
  amountKRW: number,
  displayCurrency: DisplayCurrency,
  usdKrwRate: number
): number {
  if (displayCurrency === "KRW") return amountKRW;
  return usdKrwRate > 0 ? amountKRW / usdKrwRate : 0;
}

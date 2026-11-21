import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { APP_CONFIG, type CurrencyCode, type DistanceUnit } from "./config";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function isClerkConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return Boolean(key && key.startsWith("pk_") && key.length > 20);
}

export function formatPrice(
  usdAmount: number,
  currency: CurrencyCode = APP_CONFIG.defaultCurrency
): string {
  const rate = APP_CONFIG.currencyRates[currency] ?? 1;
  const locale = APP_CONFIG.currencyLocales[currency] ?? APP_CONFIG.defaultLocale;
  const converted = Math.round(usdAmount * rate);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(converted);
}

export function formatMileage(
  km: number,
  unit: DistanceUnit = APP_CONFIG.defaultDistanceUnit,
  locale: string = APP_CONFIG.defaultLocale
): string {
  const value = unit === "mi" ? Math.round(km * 0.621371) : km;
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit: unit === "mi" ? "mile" : "kilometer",
    unitDisplay: "short",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(
  isoDate: string,
  locale: string = APP_CONFIG.defaultLocale
): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(isoDate));
}

export function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

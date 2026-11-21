export type CurrencyCode = "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "AED" | "SGD" | "CHF";
export type DistanceUnit = "km" | "mi";

export interface AppLocaleConfig {
  defaultLocale: string;
  defaultCurrency: CurrencyCode;
  defaultDistanceUnit: DistanceUnit;
  supportedCurrencies: readonly CurrencyCode[];
  /** Reference conversion rates relative to USD for client-side display switching */
  currencyRates: Record<CurrencyCode, number>;
  currencyLocales: Record<CurrencyCode, string>;
}

export const APP_CONFIG: AppLocaleConfig = {
  defaultLocale: "en-US",
  defaultCurrency: "USD",
  defaultDistanceUnit: "km",
  supportedCurrencies: ["USD", "EUR", "GBP", "CAD", "AUD", "AED", "SGD", "CHF"] as const,
  currencyRates: {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    CAD: 1.38,
    AUD: 1.53,
    AED: 3.67,
    SGD: 1.34,
    CHF: 0.88,
  },
  currencyLocales: {
    USD: "en-US",
    EUR: "de-DE",
    GBP: "en-GB",
    CAD: "en-CA",
    AUD: "en-AU",
    AED: "en-AE",
    SGD: "en-SG",
    CHF: "de-CH",
  },
};

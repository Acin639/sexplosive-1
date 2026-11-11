import countryToCurrency from "country-to-currency";
import countryNames from "./country-names.json";

export type PaymentMethod = "mpesa" | "card" | "paypal";
export const DEFAULT_COUNTRY = "KE";
const currencies: Record<string, string> = countryToCurrency;
const names: Record<string, string> = countryNames;
export const CHECKOUT_COUNTRIES = Object.keys(currencies)
  .filter(code => code !== "AN")
  .map(code => ({ code, name: names[code] ?? code }))
  .sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
export function currencyForCountry(country: string) {
  return currencies[country] ?? "USD";
}
export function mpesaAvailable(country: string) {
  return country === "KE";
}
export function convertUsd(amount: number, currency: string, rates: Record<string, number>) {
  const rate = currency === "USD" ? 1 : rates[currency];
  return rate && Number.isFinite(rate) && rate > 0 ? amount * rate : null;
}
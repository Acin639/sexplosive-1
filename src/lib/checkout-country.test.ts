import { expect, it } from "vitest";
import { DEFAULT_COUNTRY, convertUsd, currencyForCountry, mpesaAvailable } from "./checkout-country";
it("defaults checkout to Kenya", () => { expect(DEFAULT_COUNTRY).toBe("KE"); });
it("uses Kenya shillings in Kenya", () => { expect(currencyForCountry("KE")).toBe("KES"); });
it("changes currency with country", () => {
  expect(currencyForCountry("US")).toBe("USD");
  expect(currencyForCountry("GB")).toBe("GBP");
  expect(currencyForCountry("UG")).toBe("UGX");
});
it("allows M-Pesa in Kenya", () => { expect(mpesaAvailable("KE")).toBe(true); });
it("disables M-Pesa in every other listed country", async () => {
  const { CHECKOUT_COUNTRIES } = await import("./checkout-country");
  for (const country of CHECKOUT_COUNTRIES.filter(c => c.code !== "KE")) expect(mpesaAvailable(country.code)).toBe(false);
});
it("converts rather than relabeling USD prices", () => { expect(convertUsd(10, "KES", { KES: 130 })).toBe(1300); });
it("does not invent unavailable exchange rates", () => { expect(convertUsd(10, "KES", {})).toBeNull(); });
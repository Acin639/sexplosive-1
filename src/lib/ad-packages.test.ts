import { describe, expect, it } from "vitest";
import { priceForDuration } from "./ad-packages";

describe("priceForDuration", () => {
  it("charges the package price for 30 days", () => expect(priceForDuration(129, 30)).toBe(129));
  it("doubles for 60 days", () => expect(priceForDuration(129, 60)).toBe(258));
  it("prorates shorter durations", () => expect(priceForDuration(49, 7)).toBe(11.43));
});

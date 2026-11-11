import { describe, expect, test } from "vitest";
import { categoryCatalog, visibleCategoryCount } from "./category-catalog";

describe("category rules", () => {
  test("Gallery, Premium, Legends are first in that order", () => expect(categoryCatalog().slice(0, 3).map(c => c.slug)).toEqual(["gallery", "premium", "legends"]));
  test("at least six categories show before Show more", () => {
    expect(visibleCategoryCount(false, 2, 15)).toBe(6);
    expect(visibleCategoryCount(false, 4, 15)).toBe(8);
  });
  test("expanding reveals all categories", () => expect(visibleCategoryCount(true, 2, 15)).toBe(15));
});

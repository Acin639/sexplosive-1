import { describe, expect, test } from "vitest";
import { REFERRAL_TARGET, isSuperTuesday, rewardUntil } from "./referral";

describe("share-for-premium rules", () => {
  test("five visitors are needed", () => expect(REFERRAL_TARGET).toBe(5));
  test("a normal day earns one hour", () => {
    const mon = new Date(2026, 10, 9, 12, 0);
    expect(rewardUntil(mon) - mon.getTime()).toBe(3_600_000);
  });
  test("Super Tuesday earns the rest of the day", () => {
    const tue = new Date(2026, 10, 10, 9, 0);
    expect(isSuperTuesday(tue)).toBe(true);
    const end = new Date(rewardUntil(tue));
    expect([end.getDate(), end.getHours(), end.getMinutes()]).toEqual([10, 23, 59]);
  });
});

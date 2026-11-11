import { expect, it } from "vitest";
import { watchCreator, WATCH_FOLLOWERS, WATCH_INSTAGRAM } from "./watch-creator";
it("uses sxplosive for unknown uploaders without replacing real creators", () => {
  expect(watchCreator("Unknown")).toBe("sxplosive");
  expect(watchCreator()).toBe("sxplosive");
  expect(watchCreator("Actual Creator")).toBe("Actual Creator");
});
it("uses 200 followers and the sxplosive Instagram destination", () => {
  expect(WATCH_FOLLOWERS).toBe(200);
  expect(WATCH_INSTAGRAM).toBe("https://www.instagram.com/sxplosive/");
});
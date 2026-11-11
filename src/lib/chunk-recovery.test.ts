import { beforeEach, describe, expect, it, vi } from "vitest";
import { isChunkLoadError, recoverChunkLoad } from "./chunk-recovery";

describe("Stale page file recovery", () => {
  const reload = vi.fn();
  beforeEach(() => {
    sessionStorage.clear();
    reload.mockClear();
    vi.stubGlobal("window", { sessionStorage, location: { reload } });
  });
  it("reloads a missing gallery chunk once, not in a loop", () => {
    const error = new TypeError("Failed to fetch dynamically imported module: /assets/gallery-BqspC0N1.js");
    expect(recoverChunkLoad(error)).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(recoverChunkLoad(error)).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);
  });
  it("does not reload ordinary fetch errors", () => {
    expect(isChunkLoadError(new TypeError("Failed to fetch"))).toBe(false);
    expect(recoverChunkLoad(new Error("API returned invalid JSON"))).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });
});
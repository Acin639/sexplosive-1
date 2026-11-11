import { describe, expect, it } from "vitest";
import { imageFileName } from "./download";

describe("imageFileName", () => {
  it("keeps the source extension and slugifies the title", () => {
    expect(imageFileName("Hot Night! #2", "https://x.com/a/b.webp?v=1")).toBe("hot-night-2.webp");
  });
  it("defaults to jpg", () => {
    expect(imageFileName("", "https://x.com/thumb")).toBe("image.jpg");
  });
});

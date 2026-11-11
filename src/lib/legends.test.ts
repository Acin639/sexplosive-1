import { describe, expect, it } from "vitest";
import { buildLegends, legendSlug } from "./legends";
import type { ApiVideo } from "./mock-videos";

const v = (id: string, uploader: string): ApiVideo => ({ id, title: id, uploader, thumbnail: `t${id}`, views: "", age: "", duration: "", default_quality_url: "", low_quality: "", hd_quality: "", uhd_quality: "" });

describe("legends", () => {
  it("groups videos by uploader with the most videos first", () => {
    const l = buildLegends([v("1", "Ann"), v("2", "Bo"), v("3", "ann")]);
    expect(l.map(x => [x.slug, x.videos.length])).toEqual([["ann", 2], ["bo", 1]]);
  });
  it("slugifies names", () => expect(legendSlug("@Big Star!")).toBe("big-star"));
});

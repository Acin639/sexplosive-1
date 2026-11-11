import { expect, test } from "vitest";
import { creatorVideos, findCreatorName, galleryImages } from "./gallery-media";
import type { ApiVideo } from "./mock-videos";

const videos = [
  { id: "a", uploader: "Alex River", thumbnail: "one.jpg" },
  { id: "b", uploader: "Other Person", thumbnail: "two.jpg" },
  { id: "c", uploader: "Alex River", thumbnail: "one.jpg" },
] as ApiVideo[];

test("an exact person name resolves to their profile, ignoring case and @", () => {
  expect(findCreatorName(" @alex river ", videos)).toBe("Alex River");
  expect(findCreatorName("Alex", videos)).toBeUndefined();
});

test("creator counts include only that creator's videos", () => {
  expect(creatorVideos("Alex River", videos).map(video => video.id)).toEqual(["a", "c"]);
});

test("image counts count distinct supplied images", () => {
  expect(galleryImages(creatorVideos("Alex River", videos)).length).toBe(1);
});

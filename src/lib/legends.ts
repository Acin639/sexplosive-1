import type { ApiVideo } from "./mock-videos";
import { galleryImages, normalizeCreatorName, uniqueVideos } from "./gallery-media";

export type Legend = { name: string; slug: string; avatar: string; videos: ApiVideo[] };

export function legendSlug(name: string) {
  return normalizeCreatorName(name).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Groups supplied videos by uploader; most videos first. */
export function buildLegends(videos: ApiVideo[]): Legend[] {
  const map = new Map<string, Legend>();
  for (const v of uniqueVideos(videos)) {
    if (!v.uploader) continue;
    const slug = legendSlug(v.uploader);
    if (!slug) continue;
    const l = map.get(slug) ?? { name: v.uploader, slug, avatar: v.thumbnail, videos: [] };
    l.videos.push(v);
    map.set(slug, l);
  }
  return [...map.values()].sort((a, b) => b.videos.length - a.videos.length);
}

export function legendImageCount(l: Legend) {
  return galleryImages(l.videos).length;
}

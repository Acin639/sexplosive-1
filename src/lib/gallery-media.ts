import type { ApiVideo } from "./mock-videos";

export function normalizeCreatorName(value: string) {
  return value.trim().replace(/^@/, "").replace(/\s+/g, " ").toLocaleLowerCase();
}

export function findCreatorName(query: string, videos: ApiVideo[]) {
  const key = normalizeCreatorName(query);
  if (!key) return undefined;
  return videos.find(video => normalizeCreatorName(video.uploader ?? "") === key)?.uploader;
}

export function creatorVideos(name: string, videos: ApiVideo[]) {
  const key = normalizeCreatorName(name);
  return uniqueVideos(videos).filter(video => normalizeCreatorName(video.uploader ?? "") === key);
}

export function uniqueVideos(videos: ApiVideo[]) {
  return Array.from(new Map(videos.map(video => [video.id, video])).values());
}

export function galleryImages(videos: ApiVideo[]) {
  return Array.from(new Map(videos.filter(video => video.thumbnail).map(video => [video.thumbnail, video])).values());
}
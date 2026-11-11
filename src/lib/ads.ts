import { useEffect, useState } from "react";
import { increment, onValue, push, ref, remove, set, update } from "firebase/database";
import { db } from "@/lib/firebase";

export const AD_SLOTS = [
  "home-top",
  "home-feed",
  "slider",
  "video-grid",
  "suggestions",
  "tiktok",
  "preroll",
  "gallery",
  "watch",
] as const;
export type AdSlotId = (typeof AD_SLOTS)[number];

export const AD_SLOT_LABELS: Record<AdSlotId, string> = {
  "home-top": "Home — below hero",
  "home-feed": "Home — inside video feed",
  slider: "Hero slider (as a slide)",
  "video-grid": "Video grid (as a video box)",
  suggestions: "Watch page suggestions",
  tiktok: "TikTok feed (full screen)",
  preroll: "Before playing a video",
  gallery: "Gallery page",
  watch: "Watch page",
};

/** Slots where the ad repeats every N items; the others show once. */
export const REPEATING_SLOTS: AdSlotId[] = ["slider", "video-grid", "suggestions", "tiktok", "preroll"];

export const FREQUENCY_OPTIONS = [1, 2, 3, 5, 10, 20] as const;

export type Ad = {
  id: string;
  title: string;
  imageUrl: string;
  /** "video" ads play videoUrl (muted, looping); imageUrl is the poster. */
  mediaType?: "image" | "video";
  videoUrl?: string;
  linkUrl: string;
  slot: AdSlotId;
  active: boolean;
  createdAt: number;
  /** Show after every N videos/slides (repeating slots). */
  frequency?: number;
  /** Seconds before the viewer can close/skip the ad. */
  countdown?: number;
  impressions?: number;
  clicks?: number;
};

/** Live list of ads, stored at ads in the database. */
export function useAds() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onValue(
      ref(db, "ads"),
      (snap) => {
        const val = (snap.val() ?? {}) as Record<string, Omit<Ad, "id">>;
        setAds(
          Object.entries(val)
            .map(([id, a]) => ({ id, ...a }))
            .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)),
        );
        setError(null);
      },
      (err) => setError(err.message),
    );
  }, []);

  return { ads, error };
}

/** Picks one random active ad from a placement's pool. */
export function pickRandomAd(pool: Ad[], rand: number = Math.random()) {
  if (pool.length === 0) return null;
  return pool[Math.min(pool.length - 1, Math.floor(rand * pool.length))];
}

/** A random active ad for a placement, stable while mounted; counts one impression. */
export function useSlotAd(slot: AdSlotId) {
  const { ads } = useAds();
  const [seed] = useState(() => Math.random());
  const pool = ads.filter((a) => a.slot === slot && a.active);
  const ad = pickRandomAd(pool, seed);
  const id = ad?.id;
  useEffect(() => {
    if (id) trackAd(id, "impressions");
  }, [id]);
  return ad;
}

/** Increments an ad's impressions or clicks counter. */
export function trackAd(id: string, field: "impressions" | "clicks") {
  update(ref(db, `ads/${id}`), { [field]: increment(1) }).catch(() => {});
}

/** True when an ad should follow the item at index i (0-based). */
export function adAfter(i: number, frequency: number | undefined) {
  const f = Math.max(1, frequency ?? 3);
  return (i + 1) % f === 0;
}

export async function addAd(ad: Omit<Ad, "id" | "createdAt">) {
  const node = push(ref(db, "ads"));
  await set(node, { ...ad, createdAt: Date.now() });
}

export async function setAdActive(id: string, active: boolean) {
  await update(ref(db, `ads/${id}`), { active });
}

export async function deleteAd(id: string) {
  await remove(ref(db, `ads/${id}`));
}

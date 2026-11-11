export type AdPackage = {
  id: string;
  name: string;
  frequency: string;
  audience: string;
  placement: string;
  /** Price in USD for the base 30-day period. */
  price: number;
};

export const BASE_DAYS = 30;
export const DURATION_OPTIONS = [7, 14, 30, 60, 90] as const;

export const AD_PACKAGES: AdPackage[] = [
  { id: "starter", name: "Starter", frequency: "After every 10 videos", audience: "~15K daily viewers", placement: "Video containers", price: 49 },
  { id: "growth", name: "Growth", frequency: "After every 5 videos", audience: "~45K daily viewers", placement: "Video containers + watch suggestions", price: 129 },
  { id: "spotlight", name: "Spotlight", frequency: "Every 3rd slide", audience: "~80K daily viewers", placement: "Hero slider + TikTok feed", price: 249 },
  { id: "takeover", name: "Takeover", frequency: "Before every 3rd video", audience: "120K+ daily viewers", placement: "Pre-roll + slider + TikTok feed", price: 499 },
];

/** A package lasts 30 days; other durations scale the price proportionally (rounded to cents). */
export function priceForDuration(price: number, days: number) {
  return Math.round(((price * days) / BASE_DAYS) * 100) / 100;
}

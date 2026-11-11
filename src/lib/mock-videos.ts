/**
 * Mock video service data.
 *
 * Produces records with the exact field names the external video API used
 * (title / thumbnail / views / duration / *_quality urls) so the client can
 * call it the same way, plus an id so videos are addressable at /watch/$id.
 */

export type ApiVideo = {
  id: string;
  title: string;
  uploader: string;
  hashtags?: string[];
  thumbnail: string;
  views: string;
  age: string;
  duration: string;
  default_quality_url: string;
  low_quality: string;
  hd_quality: string;
  uhd_quality: string;
};

const SAMPLE_STREAMS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
];

const TITLES = [
  "Midnight Skyline Sessions",
  "Deep Focus Studio Mix",
  "Behind The Neon Curtain",
  "Rooftop Cinematics Vol. 4",
  "Analog Dreams Live Set",
  "The Late Broadcast",
  "Chrome City Drive",
  "Unreleased Studio Takes",
  "Backstage With The Crew",
  "Vertical Motion Reel",
  "Signal Lost — Full Episode",
  "Golden Hour Diaries",
  "Sound Check: Room 12",
  "Slow Burn Documentary",
  "After Party Recap",
  "Frames Per Second",
  "Static & Velvet",
  "The Long Way Around",
  "Pressure Test Live",
  "Echoes of the Grid",
  "Nightshift Chronicles",
  "Prism Break Session",
  "Low Orbit Broadcast",
  "Concrete Poetry",
];

const UPLOADERS = [
  "VHX Originals",
  "Neon Archive",
  "Studio Kilo",
  "Late Signal",
  "Chrome Tapes",
  "Nightshift Media",
  "Prism Labs",
  "Orbit Room",
];

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function isoDuration(totalSeconds: number) {
  const pad = (v: number) => String(v).padStart(2, "0");
  return `PT${pad(Math.floor(totalSeconds / 3600))}H${pad(Math.floor((totalSeconds % 3600) / 60))}M${pad(
    totalSeconds % 60,
  )}S`;
}

export function makeVideo(seed: string, index: number, label?: string): ApiVideo {
  const h = hash(`${seed}:${index}`);
  const stream = SAMPLE_STREAMS[h % SAMPLE_STREAMS.length]!;
  const base = TITLES[(h >> 3) % TITLES.length]!;
  const uploader = UPLOADERS[(h >> 7) % UPLOADERS.length]!;
  const days = (h % 21) + 1;

  return {
    id: `${seed}__${index}`,
    title: label ? `${base} — ${label}` : base,
    uploader,
    thumbnail: `https://picsum.photos/seed/${encodeURIComponent(`${seed}-${index}`)}/640/360`,
    views: `${(12000 + (h % 940000)).toLocaleString("en-US")} Views`,
    age: `${days} day${days === 1 ? "" : "s"} ago`,
    duration: isoDuration(45 + (h % 5400)),
    default_quality_url: stream,
    low_quality: stream,
    hd_quality: stream,
    uhd_quality: stream,
  };
}

export function buildVideos(seed: string, limit: number, label?: string): ApiVideo[] {
  return Array.from({ length: limit }, (_, i) => makeVideo(seed, i, label));
}

export function videoFromId(id: string): ApiVideo {
  const [seed = "home", raw = "0"] = id.split("__");
  const index = Number.parseInt(raw, 10);
  return makeVideo(seed, Number.isFinite(index) ? index : 0);
}

export function clampLimit(raw: string | null, fallback: number, max = 200) {
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(n, max);
}

export function resolvePages(raw: string | null) {
  if (!raw) return 1;
  if (raw === "all") return 5;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return 1;
  return Math.min(n, 10);
}

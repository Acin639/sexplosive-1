export type Video = {
  id: string;
  title: string;
  uploader: string;
  views: string;
  age: string;
  duration: string;
  seed: string;
};

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

function pick<T>(arr: T[], i: number) {
  return arr[i % arr.length];
}

export function makeVideos(count: number, prefix = "v"): Video[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i + 1}`,
    title: pick(TITLES, i * 3 + prefix.length),
    uploader: pick(UPLOADERS, i * 2 + prefix.length),
    views: `${((i * 37) % 900) + 12}${i % 3 === 0 ? "K" : "M"} views`,
    age: `${(i % 11) + 1} day${i % 11 === 0 ? "" : "s"} ago`,
    duration: `${8 + (i % 40)}:${String((i * 17) % 60).padStart(2, "0")}`,
    seed: `${prefix}${i + 1}`,
  }));
}

export const HOME_VIDEOS = makeVideos(21, "home");

export type Category = { slug: string; title: string; seed: string };

export const CATEGORY_PAGES: Category[][] = [
  [
    { slug: "milf", title: "Milf", seed: "cat-tr" },
    { slug: "Stepmom", title: "stepmom", seed: "cat-lv" },
    { slug: "Lesbians", title: "Lesbians", seed: "cat-st" },
    { slug: "ebony", title: "Ebony", seed: "cat-sh" },
  ],
  [
    { slug: "blowjob", title: "Blowjob", seed: "cat-ci" },
    { slug: "bbw", title: "BBW", seed: "cat-bs" },
    { slug: "Gay", title: "Gay", seed: "cat-mu" },
    { slug: "indian", title: "Indian", seed: "cat-ar" },
  ],
  [
    { slug: "office", title: "office", seed: "cat-cr" },
    { slug: "massage", title: "Massage", seed: "cat-do" },
    { slug: "Threesome", title: "Threesome", seed: "cat-ln" },
    { slug: "teen", title: "Teen", seed: "cat-ex" },
    { slug: "oiled", title: "Oiled", seed: "cat-ex" },
  ],
];

export const LEAKS_CATEGORY: Category = {
  slug: "leaks",
  title: "Leaks",
  seed: "cat-leaks",
};

export const SLIDES = [
  {
    id: 1,
    kicker: "VHX Engine",
    title: "Build anything you want using 6IXIDE'S VHX ENGINE",
    cta: "Get",
    seed: "slide-1",
  },
  {
    id: 2,
    kicker: "Premium",
    title: "Unlock Only Fans and Full videos",
    cta: "Visit",
    seed: "slide-2",
  },
  {
    id: 3,
    kicker: "Mirth ☘️",
    title: "Enjoy access to many premium platforms like only fans and netflix using the mirth extension ",
    cta: "Get",
    seed: "slide-3",
  },
];

export const SUGGESTION_POOL = [
  "Hardcore","BBW",
  "Lesbians","Lesbians scissoring ","lesbian sex","Ebony","Blowjob","Gay","milf","Stepmom"
  
];

export type Streamer = {
  id: string;
  name: string;
  active: boolean;
  price: number;
  gender: string;
  seed: string;
  tags: string[];
};

export const STREAMERS: Streamer[] = [
  { id: "s1", name: "Aria Vale", active: true, price: 12, gender: "Girl", seed: "st1", tags: ["Personal", "Mass"] },
  { id: "s2", name: "Kai Rhodes", active: false, price: 9, gender: "Boy", seed: "st2", tags: ["Mass"] },
  { id: "s3", name: "Nova Lin", active: true, price: 18, gender: "Girl", seed: "st3", tags: ["Personal"] },
  { id: "s4", name: "Dex Moreau", active: true, price: 15, gender: "Boy", seed: "st4", tags: ["Personal", "Mass"] },
  { id: "s5", name: "Юna Park", active: false, price: 11, gender: "Girl", seed: "st5", tags: ["Personal"] },
  { id: "s6", name: "Rio Santos", active: true, price: 22, gender: "Both", seed: "st6", tags: ["Mass"] },
];

export const img = (seed: string, w = 640, h = 360) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

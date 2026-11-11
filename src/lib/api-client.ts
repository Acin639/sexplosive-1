import type { ApiVideo } from "@/lib/mock-videos";

export type { ApiVideo };

export const API = "https://vhx-api-zgh1.onrender.com";

type ListResponse = {
  success: boolean;
  count?: number;
  videos?: ApiVideo[];
  error?: string;
};

/*
 * The upstream API does not include an id field, so derive a stable one
 * from the video's stream/thumbnail URL. This keeps /watch/$id links,
 * saved-video storage and per-video suggestions working.
 */
function hashString(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h).toString(36);
}

function withIds(videos: ApiVideo[] | undefined): ApiVideo[] {
  return (videos ?? []).map((v, i) => ({
    ...v,
    id:
      v.id ||
      `v-${hashString(v.default_quality_url || v.thumbnail || v.title || String(i))}`,
  }));
}

async function getJson<T extends { success: boolean; error?: string }>(
  path: string,
): Promise<T> {
  const response = await fetch(`${API}${path}`);

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    );
  }

  let data: T;

  try {
    data = JSON.parse(text) as T;
  } catch {
    throw new Error(
      `API returned invalid JSON from ${path}`,
    );
  }

  if (!data.success) {
    throw new Error(data.error || "API error");
  }

  return data;
}

/**
 * GET /api/health
 */
export async function fetchHealth() {
  return getJson<{
    success: boolean;
    status: string;
  }>("/api/health");
}

/**
 * GET /api/home?limit=10
 */
export async function fetchHome(limit = 10) {
  const data = await getJson<ListResponse>(
    `/api/home?limit=${limit}`,
  );

  return {
    count: data.count ?? 0,
    videos: withIds(data.videos),
  };
}

/**
 * GET /api/search?q=hello&pages=3&limit=20
 *
 * or:
 *
 * GET /api/search?q=hello&pages=all&limit=100
 */
export async function fetchSearch(
  q: string,
  {
    pages = 3,
    limit = 20,
  }: {
    pages?: number | "all";
    limit?: number;
  } = {},
) {
  const data = await getJson<ListResponse>(
    `/api/search?q=${encodeURIComponent(q)}&pages=${pages}&limit=${limit}`,
  );

  return {
    count: data.count ?? 0,
    videos: withIds(data.videos),
  };
}

/**
 * There is intentionally NO fetchVideo().
 *
 * The API already gives us:
 *
 * video.default_quality_url
 *
 * from /api/home and /api/search.
 *
 * The watch page uses that URL directly.
 */

/**
 * "PT00H12M30S" -> "12:30"
 */
export function formatDuration(iso: string) {
  const match =
    /^PT(\d+)H(\d+)M(\d+)S$/.exec(iso ?? "");

  if (!match) {
    return iso || "—";
  }

  const hours = Number(match[1]);

  const mm = String(
    Number(match[2]),
  ).padStart(2, "0");

  const ss = String(
    Number(match[3]),
  ).padStart(2, "0");

  return hours
    ? `${hours}:${mm}:${ss}`
    : `${mm}:${ss}`;
}

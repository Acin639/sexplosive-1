export const SITE_ORIGIN = "https://sexplosive.com";

/** Public link for a site path, always on the sexplosive.com domain. */
export function siteUrl(path: string) {
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function copyOrShare(title: string, url: string) {
  if (navigator.share) {
    try { await navigator.share({ title, url }); return "shared"; }
    catch (e) { if (e instanceof DOMException && e.name === "AbortError") return "cancelled"; }
  }
  await navigator.clipboard.writeText(url);
  return "copied";
}

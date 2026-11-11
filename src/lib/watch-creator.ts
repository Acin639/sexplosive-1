export const WATCH_FOLLOWERS = 200;
export const WATCH_INSTAGRAM = "https://www.instagram.com/sxplosive/";
export function watchCreator(uploader?: string) {
  return !uploader?.trim() || /^unknown(?: uploader)?$/i.test(uploader.trim()) ? "sxplosive" : uploader.trim();
}
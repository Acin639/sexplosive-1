export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/** Safe file name from a title, keeping the source extension. */
export function imageFileName(title: string, src: string) {
  const ext = src.split("?")[0].match(/\.(jpe?g|png|webp|gif)$/i)?.[1] ?? "jpg";
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "image";
  return `${base}.${ext}`;
}

/** Downloads an image; falls back to opening it when the host blocks fetching. */
export async function downloadImage(src: string, title: string) {
  try {
    const res = await fetch(src, { mode: "cors" });
    if (!res.ok) throw new Error(String(res.status));
    downloadBlob(await res.blob(), imageFileName(title, src));
    return true;
  } catch {
    window.open(src, "_blank", "noopener");
    return false;
  }
}

/** Downloads a video file; falls back to opening it when the host blocks fetching. */
export async function downloadVideo(src: string, title: string) {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "video";
  try {
    const res = await fetch(src, { mode: "cors" });
    if (!res.ok) throw new Error(String(res.status));
    downloadBlob(await res.blob(), `${base}.mp4`);
    return true;
  } catch {
    window.open(src, "_blank", "noopener");
    return false;
  }
}

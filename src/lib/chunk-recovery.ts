const RETRY_KEY = "sexplosive-chunk-retry";
const RETRY_WINDOW = 30_000;

export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  return /Failed to fetch dynamically imported module|Importing a module script failed|Failed to load module script|Loading chunk .+ failed/i.test(message);
}

/** A fresh document replaces stale hashed asset references; limit automatic retries. */
export function recoverChunkLoad(error: unknown): boolean {
  if (typeof window === "undefined" || !isChunkLoadError(error)) return false;
  try {
    const last = Number(window.sessionStorage.getItem(RETRY_KEY));
    if (last && Date.now() - last < RETRY_WINDOW) return false;
    window.sessionStorage.setItem(RETRY_KEY, String(Date.now()));
  } catch {
    // Without a durable guard, leave recovery to the visible refresh button.
    return false;
  }
  window.location.reload();
  return true;
}

let installed = false;
export function installChunkRecovery() {
  if (typeof window === "undefined" || installed) return;
  installed = true;
  window.addEventListener("vite:preloadError", (event) => {
    const error = "payload" in event ? event.payload : undefined;
    if (recoverChunkLoad(error)) event.preventDefault();
  });
}
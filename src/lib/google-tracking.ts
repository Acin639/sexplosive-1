export const GOOGLE_MEASUREMENT_ID = "G-ABC123XYZ9";
declare global {
  interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; }
}
export function trackPage(path: string) {
  if (typeof window === "undefined" || path.startsWith("/chebwai")) return;
  const id = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY || GOOGLE_MEASUREMENT_ID;
  if (!window.gtag) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function (..._args: unknown[]) { window.dataLayer?.push(arguments); };
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(script);
    window.gtag("set", "developer_id.dZjgwMW", true);
    window.gtag("js", new Date());
    window.gtag("config", id, { send_page_view: false });
  }
  window.gtag("event", "page_view", { page_path: path, page_title: document.title, send_to: id });
}
export function trackNavigationClick(event: MouseEvent) {
  const link = event.target instanceof Element ? event.target.closest("a") : null;
  if (!link || !window.gtag || window.location.pathname.startsWith("/chebwai")) return;
  const url = new URL(link.href, window.location.origin);
  if (url.origin !== window.location.origin || url.pathname.startsWith("/chebwai")) return;
  window.gtag("event", "page_click", { page_path: window.location.pathname, destination_path: url.pathname });
}
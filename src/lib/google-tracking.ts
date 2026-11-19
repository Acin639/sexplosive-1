export const GOOGLE_MEASUREMENT_ID = "G-KFXDW7WFVV";

declare global {
  interface Window {
    dataLayer ? : unknown[][];
    gtag ? : (...args: unknown[]) => void;
  }
}

export function trackPage(path: string) {
  if (
    typeof window === "undefined" ||
    path.startsWith("/chebwai")
  ) {
    return;
  }
  
  const id = GOOGLE_MEASUREMENT_ID;
  
  if (!window.gtag) {
    window.dataLayer = window.dataLayer || [];
    
    window.gtag = (...args: unknown[]) => {
      window.dataLayer?.push(args);
    };
    
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    
    document.head.appendChild(script);
    
    window.gtag("js", new Date());
    window.gtag("config", id, {
      send_page_view: false,
    });
  }
  
  window.gtag("event", "page_view", {
    page_path: path,
    page_title: document.title,
    send_to: id,
  });
}

export function trackNavigationClick(event: MouseEvent) {
  const link =
    event.target instanceof Element ?
    event.target.closest("a") :
    null;
  
  if (
    !link ||
    !window.gtag ||
    window.location.pathname.startsWith("/chebwai")
  ) {
    return;
  }
  
  const url = new URL(link.href, window.location.origin);
  
  if (
    url.origin !== window.location.origin ||
    url.pathname.startsWith("/chebwai")
  ) {
    return;
  }
  
  window.gtag("event", "page_click", {
    page_path: window.location.pathname,
    destination_path: url.pathname,
  });
}
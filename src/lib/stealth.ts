import { useEffect, useState } from "react";

const KEY = "vhx-stealth";
const EVT = "vhx-stealth-change";

export function isStealthOn() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "1";
}

export function setStealth(on: boolean) {
  if (typeof window === "undefined") return;
  if (on) {
    window.localStorage.setItem(KEY, "1");
    // Incognito: drop any browsing traces kept by the app.
    try {
      window.sessionStorage.clear();
      Object.keys(window.localStorage)
        .filter((k) => k !== KEY)
        .forEach((k) => window.localStorage.removeItem(k));
    } catch {
      /* ignore */
    }
  } else {
    window.localStorage.removeItem(KEY);
  }
  document.documentElement.classList.toggle("stealth", on);
  window.dispatchEvent(new CustomEvent(EVT, { detail: on }));
}

/** Reactive stealth flag, hydration-safe. */
export function useStealth() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const sync = () => {
      const v = isStealthOn();
      setOn(v);
      document.documentElement.classList.toggle("stealth", v);
    };
    sync();
    window.addEventListener(EVT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return on;
}

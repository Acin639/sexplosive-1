import { useEffect, useState } from "react";
import { onValue, ref, update } from "firebase/database";
import { db } from "@/lib/firebase";

export const PAGE_KEYS = ["connect", "advertise", "api", "extension"] as const;
export type PageKey = (typeof PAGE_KEYS)[number];

export const PAGE_LABELS: Record<PageKey, string> = {
  connect: "Connect",
  advertise: "Advertise",
  api: "API",
  extension: "Extension",
};

export type PageStatus = Record<PageKey, boolean>;

const DEFAULTS: PageStatus = { connect: false, advertise: false, api: false, extension: false };

/** Live map of which pages are closed, stored at settings/pages in the database. */
export function usePageStatus() {
  const [closed, setClosed] = useState<PageStatus>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onValue(
      ref(db, "settings/pages"),
      (snap) => {
        const val = (snap.val() ?? {}) as Partial<Record<PageKey, boolean>>;
        setClosed({ ...DEFAULTS, ...val });
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
  }, []);

  return { closed, loading, error };
}

/** Persist a page open/closed change to the database. */
export async function setPageClosed(key: PageKey, value: boolean) {
  await update(ref(db, "settings/pages"), { [key]: value });
}

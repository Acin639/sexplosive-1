import { useEffect, useState } from "react";
import { onValue, ref, serverTimestamp, set } from "firebase/database";
import { auth, db } from "@/lib/firebase";

export type HistoryItem = {
  videoId: string;
  title: string;
  seed: string;
  uploader?: string;
  watchedAt?: number | null;
};

/** Record a watched video under users/{uid}/history in realtime. */
export async function recordWatch(item: Omit<HistoryItem, "watchedAt">) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  const key = encodeURIComponent(item.videoId).replace(/[.#$/[\]]/g, "_");
  try {
    await set(ref(db, `users/${uid}/history/${key}`), {
      ...item,
      watchedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("[history] write failed", err);
  }
}

/** Live watch history for the signed-in user. */
export function useHistory(uid?: string | null, max = 12) {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (!uid) {
      setItems([]);
      return;
    }
    return onValue(
      ref(db, `users/${uid}/history`),
      (snap) => {
        const val = (snap.val() ?? {}) as Record<string, HistoryItem>;
        setItems(
          Object.values(val)
            .sort((a, b) => (b.watchedAt ?? 0) - (a.watchedAt ?? 0))
            .slice(0, max),
        );
      },
      (err) => console.warn("[history] listener", err),
    );
  }, [uid, max]);

  return items;
}

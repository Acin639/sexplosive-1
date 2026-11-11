import { useEffect, useMemo, useState } from "react";
import { onValue, ref } from "firebase/database";
import { db } from "@/lib/firebase";
import { STREAMERS, type Streamer } from "@/lib/mock-data";

export type UiStreamer = Streamer & { avatarUrl?: string | null };

type DbStreamerDoc = {
  uid?: string;
  username?: string;
  displayName?: string;
  gender?: string;
  price?: number;
  active?: boolean;
  avatarUrl?: string | null;
};

/**
 * Live streamer directory: everyone who applied through /streamer in the
 * database, merged with the demo roster so the page is never empty.
 */
export function useStreamers() {
  const [live, setLive] = useState<UiStreamer[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onValue(
      ref(db, "streamers"),
      (snap) => {
        const val = (snap.val() ?? {}) as Record<string, DbStreamerDoc>;
        setLive(
          Object.entries(val).map(([id, s]) => ({
            id,
            name: s.displayName || s.username || "Streamer",
            active: Boolean(s.active),
            price: Number(s.price) || 0,
            gender: s.gender ?? "Both",
            seed: id,
            tags: ["Personal", "Mass"],
            avatarUrl: s.avatarUrl ?? null,
          })),
        );
        setError(null);
      },
      (err) => {
        console.warn("[streamers] listener", err);
        setError(err.message);
      },
    );
  }, []);

  const streamers = useMemo(() => [...live, ...(STREAMERS as UiStreamer[])], [live]);

  return { streamers, live, error };
}

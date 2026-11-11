import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { db } from "@/lib/firebase";

export type DbUser = {
  uid: string;
  username?: string;
  email?: string;
  premium?: boolean;
  apiAccount?: boolean;
  extension?: boolean;
  streamer?: boolean;
  online?: boolean;
  lastSeen?: number;
};

export type DbPayment = {
  id: string;
  uid?: string;
  kind?: "premium" | "api" | "extension" | "stream";
  amount?: number;
  method?: string;
  createdAt?: number;
};

export type DbStreamer = {
  id: string;
  username?: string;
  price?: number;
  status?: string;
  active?: boolean;
  avatarUrl?: string | null;
};

function useCollection<T>(name: string) {
  const [rows, setRows] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return onValue(
      ref(db, name),
      (snap) => {
        const val = (snap.val() ?? {}) as Record<string, Record<string, unknown>>;
        setRows(Object.entries(val).map(([id, data]) => ({ id, ...data }) as T));
        setError(null);
      },
      (err) => setError(err.message),
    );
  }, [name]);

  return { rows, error };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Live admin metrics read straight from the Realtime Database. */
export function useAdminStats() {
  const users = useCollection<DbUser>("users");
  const payments = useCollection<DbPayment>("payments");
  const streamers = useCollection<DbStreamer>("streamers");

  const paid = payments.rows;
  const sum = (kind: DbPayment["kind"]) =>
    paid.filter((p) => p.kind === kind).reduce((a, p) => a + (Number(p.amount) || 0), 0);

  const streamRevenue = sum("stream");
  const sources = [
    { name: "Streams", value: streamRevenue, color: "var(--primary)" },
    { name: "Premium", value: sum("premium"), color: "var(--accent)" },
    { name: "Extension", value: sum("extension"), color: "var(--gold)" },
    { name: "API", value: sum("api"), color: "var(--destructive)" },
  ];
  const total = sources.reduce((a, s) => a + s.value, 0);

  // monthly buckets for the last 6 months
  const now = new Date();
  const revenue = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const inMonth = (p: DbPayment) => {
      if (!p.createdAt) return false;
      const t = new Date(p.createdAt);
      return t.getFullYear() === d.getFullYear() && t.getMonth() === d.getMonth();
    };
    const by = (kind: DbPayment["kind"]) =>
      paid
        .filter((p) => p.kind === kind && inMonth(p))
        .reduce((a, p) => a + (Number(p.amount) || 0), 0);
    return {
      month: MONTHS[d.getMonth()],
      Streams: by("stream"),
      Premium: by("premium"),
      Extension: by("extension"),
      API: by("api"),
    };
  });

  const fiveMinAgo = Date.now() - 5 * 60_000;

  return {
    error: users.error ?? payments.error ?? streamers.error,
    users: users.rows,
    streamers: streamers.rows,
    payments: paid,
    loggedIn: users.rows.filter((u) => u.online).length,
    activeNow: users.rows.filter((u) => (u.lastSeen ?? 0) > fiveMinAgo).length,
    streamerCount: streamers.rows.length,
    commission: Math.round(streamRevenue * 0.4),
    extensionDownloads: users.rows.filter((u) => u.extension).length,
    extensionRevenue: sum("extension"),
    apiAccounts: users.rows.filter((u) => u.apiAccount).length,
    apiRevenue: sum("api"),
    premiumMembers: users.rows.filter((u) => u.premium).length,
    sources,
    total,
    revenue,
  };
}

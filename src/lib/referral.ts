import { useEffect, useState } from "react";
import { onValue, ref, set } from "firebase/database";
import { db } from "@/lib/firebase";

export const REFERRAL_TARGET = 5;
const HOUR = 3_600_000;

/** Tuesday = Super Tuesday (premium for the rest of the day); other days = 1 hour. */
export function isSuperTuesday(date: Date) {
  return date.getDay() === 2;
}

export function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** When premium earned at `date` expires. */
export function rewardUntil(date: Date) {
  if (!isSuperTuesday(date)) return date.getTime() + HOUR;
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end.getTime();
}

export function visitorId() {
  let id = localStorage.getItem("sx-visitor");
  if (!id) {
    id = Math.random().toString(36).slice(2, 12);
    localStorage.setItem("sx-visitor", id);
  }
  return id;
}

export function shareLink() {
  return `${window.location.origin}/?ref=${visitorId()}`;
}

/** Records a unique visit for the sharer when someone arrives through their link. */
export function captureReferral() {
  try {
    const refId = new URLSearchParams(window.location.search).get("ref");
    if (!refId || !/^[a-z0-9]{4,20}$/.test(refId)) return;
    const me = visitorId();
    const day = dayKey(new Date());
    const seen = `sx-ref-${refId}-${day}`;
    if (refId === me || localStorage.getItem(seen)) return;
    localStorage.setItem(seen, "1");
    void set(ref(db, `referrals/${refId}/${day}/${me}`), Date.now()).catch(() => {});
  } catch {
    /* storage unavailable */
  }
}

/** Live referral count for today and any earned premium window. */
export function useReferralPremium() {
  const [count, setCount] = useState(0);
  const [until, setUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = visitorId();
    const day = dayKey(new Date());
    setUntil(Number(localStorage.getItem("sx-premium-until") ?? 0));
    const t = setInterval(() => setNow(Date.now()), 30_000);
    const off = onValue(ref(db, `referrals/${id}/${day}`), snap => {
      const n = Object.keys(snap.val() ?? {}).length;
      setCount(n);
      const grantKey = `sx-granted-${day}`;
      if (n >= REFERRAL_TARGET && !localStorage.getItem(grantKey)) {
        const u = rewardUntil(new Date());
        localStorage.setItem(grantKey, "1");
        localStorage.setItem("sx-premium-until", String(u));
        setUntil(u);
        void set(ref(db, `referralGrants/${id}/${day}`), u).catch(() => {});
      }
    }, () => {});
    return () => { off(); clearInterval(t); };
  }, []);

  return { count, until, active: until > now };
}

import { useEffect, useState } from "react";
import { onValue, ref, set } from "firebase/database";
import { db } from "@/lib/firebase";

export const CONSENT_KEY = "vhx-age-consent";

/** Whether the age/terms popup is enabled, stored at settings/consent/enabled (default on). */
export function useConsentEnabled() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  useEffect(() => onValue(ref(db, "settings/consent/enabled"), (s) => setEnabled(s.val() !== false), () => setEnabled(true)), []);
  return enabled;
}

export function setConsentEnabled(value: boolean) {
  return set(ref(db, "settings/consent/enabled"), value);
}

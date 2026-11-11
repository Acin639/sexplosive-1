import { useEffect, useState } from "react";
import { onValue, ref, update } from "firebase/database";
import { db } from "@/lib/firebase";

export const PASSWORD_KINDS = ["admin", "developer", "creator"] as const;
export type PasswordKind = (typeof PASSWORD_KINDS)[number];

export const PASSWORD_LABELS: Record<PasswordKind, string> = {
  admin: "Admin console",
  developer: "Developer workspace",
  creator: "Creator workspace",
};

/** Defaults used until a password is changed in the database. */
export const DEFAULT_PASSWORDS: Record<PasswordKind, string> = {
  admin: "vhx-admin",
  developer: "vhx-dev",
  creator: "vhx-creator",
};

/** Live map of access passwords, stored at settings/passwords in the database. */
export function usePasswords() {
  const [passwords, setPasswords] = useState<Record<PasswordKind, string>>(DEFAULT_PASSWORDS);

  useEffect(() => {
    return onValue(ref(db, "settings/passwords"), (snap) => {
      const val = (snap.val() ?? {}) as Partial<Record<PasswordKind, string>>;
      setPasswords({ ...DEFAULT_PASSWORDS, ...val });
    });
  }, []);

  return passwords;
}

/** Persist a password change to the database. */
export async function setPassword(kind: PasswordKind, value: string) {
  await update(ref(db, "settings/passwords"), { [kind]: value });
}

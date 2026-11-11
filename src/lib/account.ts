import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { get, onValue, ref, serverTimestamp, set, update } from "firebase/database";
import { auth, db } from "@/lib/firebase";

export type Profile = {
  uid: string;
  username: string;
  email: string;
  premium?: boolean;
  apiAccount?: boolean;
  apiKey?: string;
  extension?: boolean;
  streamer?: boolean;
  avatarUrl?: string | null;
};

/**
 * Database writes hang forever when the backend is unreachable (e.g. rules deny
 * access). Never let that block an auth flow.
 */
export function bestEffort<T>(p: Promise<T>, ms = 6000) {
  return Promise.race([
    p.catch((e) => {
      console.warn("[rtdb] write failed", e);
      return null;
    }),
    new Promise((res) => setTimeout(res, ms)),
  ]);
}

export async function signUp(username: string, email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: username }).catch(() => {});
  await bestEffort(
    set(ref(db, `users/${cred.user.uid}`), {
      uid: cred.user.uid,
      username,
      email,
      premium: false,
      apiAccount: false,
      extension: false,
      streamer: false,
      online: true,
      createdAt: serverTimestamp(),
      lastSeen: serverTimestamp(),
    }),
  );
  return cred.user;
}

export async function logIn(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await bestEffort(
    update(ref(db, `users/${cred.user.uid}`), {
      uid: cred.user.uid,
      username: cred.user.displayName ?? email.split("@")[0],
      email: cred.user.email ?? email,
      online: true,
      lastSeen: serverTimestamp(),
    }),
  );
  return cred.user;
}

export async function logOut() {
  const uid = auth.currentUser?.uid;
  if (uid) {
    await bestEffort(
      update(ref(db, `users/${uid}`), { online: false, lastSeen: serverTimestamp() }),
      2000,
    );
  }
  await signOut(auth);
}

export async function getProfile(uid: string) {
  const snap = await get(ref(db, `users/${uid}`));
  return snap.exists() ? (snap.val() as Profile) : null;
}

/** Live auth + Realtime Database profile state. Falls back to the auth user if the DB is unreachable. */
export function useAccount() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    const fallback: Profile = {
      uid: user.uid,
      username: user.displayName ?? user.email?.split("@")[0] ?? "Member",
      email: user.email ?? "",
    };
    setProfile(fallback);
    return onValue(
      ref(db, `users/${user.uid}`),
      (snap) => setProfile(snap.exists() ? ({ ...fallback, ...snap.val() } as Profile) : fallback),
      (err) => console.warn("[rtdb] profile listener", err),
    );
  }, [user]);

  return { user, profile, loading, signedIn: Boolean(user) };
}

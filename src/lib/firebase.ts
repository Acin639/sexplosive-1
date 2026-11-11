import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCDILDA8iA9dqWfzyDhrPpW6NRQupebWd4",
  authDomain: "explosive-5c18f.firebaseapp.com",
  databaseURL: "https://explosive-5c18f-default-rtdb.firebaseio.com",
  projectId: "explosive-5c18f",
  storageBucket: "explosive-5c18f.firebasestorage.app",
  messagingSenderId: "847160544764",
  appId: "1:847160544764:web:3ff223dda41f77ead03679",
  measurementId: "G-PQC07TQGQ6",
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
/** Realtime Database (replaces Firestore across the app). */
export const db = getDatabase(app);
export const storage = getStorage(app);

/** Analytics only works in the browser — call from useEffect. */
export async function initAnalytics() {
  if (typeof window === "undefined") return null;
  const { getAnalytics, isSupported } = await import("firebase/analytics");
  return (await isSupported()) ? getAnalytics(app) : null;
}

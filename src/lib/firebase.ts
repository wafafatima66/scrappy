import { FirebaseApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore, initializeFirestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";

// Fill these in .env.local (see PLAY_STORE_GUIDE.md). Without them the app runs in
// "local mode": no login, everything stays on the device.
const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseReady = Boolean(cfg.apiKey && cfg.projectId && cfg.appId);

let app: FirebaseApp | null = null;
const getApp = () => {
  if (!firebaseReady) throw new Error("Firebase is not configured");
  app = app ?? (getApps()[0] ?? initializeApp(cfg));
  return app;
};

export const fbAuth = (): Auth => getAuth(getApp());
// Phones' web views often can't hold the streaming connection Firestore prefers, so a read just hangs.
// Letting it fall back to plain requests makes the cloud copy load reliably on every device.
let db: Firestore | null = null;
export const fbDb = (): Firestore => {
  if (db) return db;
  try {
    db = initializeFirestore(getApp(), { experimentalAutoDetectLongPolling: true });
  } catch {
    db = getFirestore(getApp());
  }
  return db;
};
export const fbStorage = (): FirebaseStorage => getStorage(getApp());

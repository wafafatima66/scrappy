"use client";
import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { deleteObject, getDownloadURL, listAll, ref, uploadString } from "firebase/storage";
import { useEffect, useState } from "react";
import { fbAuth, fbDb, fbStorage, firebaseReady } from "./firebase";
import { clearAllLocal, getName, setName, setScope } from "./store";

export interface Session {
  status: "loading" | "out" | "in";
  uid: string | null;
  name: string;
  email: string;
  photoURL: string;
  local: boolean; // true when Firebase isn't configured
}

let state: Session = { status: "loading", uid: null, name: "", email: "", photoURL: "", local: !firebaseReady };
const listeners = new Set<() => void>();
const publish = (s: Partial<Session>) => {
  state = { ...state, ...s };
  listeners.forEach((l) => l());
};
let started = false;

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  if (!firebaseReady) {
    setScope("local");
    const n = getName();
    publish({ status: n ? "in" : "out", name: n, uid: null, local: true });
    return;
  }
  onAuthStateChanged(fbAuth(), (u) => {
    if (u) {
      setScope(u.uid);
      publish({ status: "in", uid: u.uid, name: u.displayName || u.email?.split("@")[0] || "friend", email: u.email ?? "", photoURL: u.photoURL ?? "", local: false });
    } else {
      setScope("local");
      publish({ status: "out", uid: null, name: "", email: "", photoURL: "", local: false });
    }
  });
}

export function useSession(): Session {
  const [, tick] = useState(0);
  useEffect(() => {
    start();
    const l = () => tick((n) => n + 1);
    listeners.add(l);
    l();
    return () => {
      listeners.delete(l);
    };
  }, []);
  return state;
}

export const friendlyAuthError = (e: unknown): string => {
  const code = (e as { code?: string })?.code ?? "";
  if (code.includes("invalid-email")) return "That email doesn't look right.";
  if (code.includes("email-already-in-use")) return "An account with this email already exists. Try logging in.";
  if (code.includes("weak-password")) return "Use a password with at least 6 characters.";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) return "Email or password is wrong.";
  if (code.includes("too-many-requests")) return "Too many tries. Wait a minute and try again.";
  if (code.includes("network")) return "No internet connection.";
  if (code.includes("requires-recent-login")) return "Please log in again first, then retry.";
  return "Something went wrong. Please try again.";
};

export async function signUp(name: string, email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(fbAuth(), email.trim(), password);
  await updateProfile(cred.user, { displayName: name.trim() });
  await setDoc(doc(fbDb(), "users", cred.user.uid), { name: name.trim(), created: Date.now() }, { merge: true });
  publish({ name: name.trim() });
}

export const signIn = (email: string, password: string) => signInWithEmailAndPassword(fbAuth(), email.trim(), password);
export const resetPassword = (email: string) => sendPasswordResetEmail(fbAuth(), email.trim());
export const logout = () => (firebaseReady ? signOut(fbAuth()) : Promise.resolve());

// local mode (no Firebase): just remember the name
export function setLocalName(n: string) {
  setName(n);
  publish({ status: "in", name: n.trim() });
}

export async function changeName(n: string) {
  const name = n.trim();
  if (!name) return;
  if (!firebaseReady || !fbAuth().currentUser) return setLocalName(name);
  await updateProfile(fbAuth().currentUser!, { displayName: name });
  await setDoc(doc(fbDb(), "users", fbAuth().currentUser!.uid), { name }, { merge: true });
  publish({ name });
}

// centre-crops to a 320px square JPEG
async function squarePhoto(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  const s = Math.min(bmp.width, bmp.height);
  const c = document.createElement("canvas");
  c.width = c.height = 320;
  c.getContext("2d")!.drawImage(bmp, (bmp.width - s) / 2, (bmp.height - s) / 2, s, s, 0, 0, 320, 320);
  return c.toDataURL("image/jpeg", 0.88);
}

const AVATAR_LOCAL = "patchlet.avatar.local";

export async function changeAvatar(file: File) {
  const data = await squarePhoto(file);
  const u = firebaseReady ? fbAuth().currentUser : null;
  if (!u) {
    try {
      localStorage.setItem(AVATAR_LOCAL, data);
    } catch {}
    publish({ photoURL: data });
    return;
  }
  const r = ref(fbStorage(), `users/${u.uid}/avatar.jpg`);
  await uploadString(r, data, "data_url");
  const url = await getDownloadURL(r);
  await updateProfile(u, { photoURL: url });
  await setDoc(doc(fbDb(), "users", u.uid), { photoURL: url }, { merge: true });
  publish({ photoURL: url });
}

export function loadLocalAvatar() {
  try {
    const a = localStorage.getItem(AVATAR_LOCAL);
    if (a && !state.photoURL) publish({ photoURL: a });
  } catch {}
}

export async function deleteAccount(password: string) {
  const u = fbAuth().currentUser;
  if (!u || !u.email) throw new Error("not signed in");
  await reauthenticateWithCredential(u, EmailAuthProvider.credential(u.email, password));
  const uid = u.uid;
  try {
    const pages = await getDocs(collection(fbDb(), "users", uid, "pages"));
    await Promise.all(pages.docs.map((d) => deleteDoc(d.ref)));
    await deleteDoc(doc(fbDb(), "users", uid));
    const photos = await listAll(ref(fbStorage(), `users/${uid}/photos`));
    await Promise.all(photos.items.map((i) => deleteObject(i)));
    await deleteObject(ref(fbStorage(), `users/${uid}/avatar.jpg`)).catch(() => undefined);
  } catch {}
  await deleteUser(u);
  await clearAllLocal();
}

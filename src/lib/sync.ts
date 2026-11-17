import { collection, deleteDoc, deleteField, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { fbDb } from "./firebase";
import { clearDeleted, readDeleted } from "./store";
import { Book, Page } from "./types";

// Cloud backup, kept tiny on purpose:
//  - every page is saved to Firestore as ONE picture (WebP) plus a few small fields
//  - the photos people add are NEVER uploaded; they only live on the device that made the page, so it stays editable there
//  - users/{uid} holds the page order and a small "page id -> last changed" list, so opening the app costs one read
//    plus one read for each page that actually changed on another device
// A page that arrives from the cloud is a picture (page.flat): it can be flipped, exported and shared on any device.

const SYNCED = (uid: string) => `patchlet.synced2.${uid}`;
const ORDER = (uid: string) => `patchlet.order2.${uid}`;
const readSynced = (uid: string): Record<string, number> => {
  try {
    return JSON.parse(localStorage.getItem(SYNCED(uid)) ?? "{}");
  } catch {
    return {};
  }
};
const writeSynced = (uid: string, m: Record<string, number>) => {
  try {
    localStorage.setItem(SYNCED(uid), JSON.stringify(m));
  } catch {}
};

const clean = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

// pages saved by older versions still have their items; new ones have a picture
const toPage = (d: Record<string, unknown>): Page => {
  const r = d as unknown as Page & { preview?: string };
  if (r.preview) {
    const { preview, ...rest } = r;
    return { ...rest, items: [], flat: preview };
  }
  return { ...r, items: r.items ?? [] };
};

export async function pullAndMerge(uid: string, local: Book): Promise<Book> {
  const db = fbDb();
  const userSnap = await getDoc(doc(db, "users", uid));
  const data = userSnap.data();
  const order: string[] = (data?.order as string[] | undefined) ?? [];
  const known = data?.pages as Record<string, number> | undefined; // page id -> last changed
  const gone = new Set(readDeleted(uid).map((d) => d.id));
  const byId = new Map(local.pages.map((p) => [p.id, p]));
  const synced = readSynced(uid);

  // which pages do we need to download?
  const fetched: Page[] = [];
  if (known) {
    const want = Object.keys(known).filter((id) => !gone.has(id) && (!byId.has(id) || (known[id] ?? 0) > (byId.get(id)?.updated ?? 0)));
    const snaps = await Promise.all(want.map((id) => getDoc(doc(db, "users", uid, "pages", id))));
    snaps.forEach((s) => {
      if (s.exists()) fetched.push(toPage(s.data()));
    });
    // a page that was in the cloud before, isn't any more and wasn't changed here since: it was deleted on another device
    Array.from(byId.values()).forEach((lp) => {
      if (lp.kind === "day" && synced[lp.id] !== undefined && known[lp.id] === undefined && (lp.updated ?? 0) <= synced[lp.id]) byId.delete(lp.id);
    });
  } else {
    // an account saved before the picture format: read everything once
    const all = await getDocs(collection(db, "users", uid, "pages"));
    all.forEach((d) => {
      if (!gone.has(d.id)) {
        const rp = toPage(d.data());
        const lp = byId.get(rp.id);
        if (!lp || (rp.updated ?? 0) > (lp.updated ?? 0)) fetched.push(rp);
      }
    });
  }
  if (fetched.length === 0 && byId.size === local.pages.length) return local;

  fetched.forEach((rp) => {
    const lp = byId.get(rp.id);
    // never replace a page that is newer on this device
    if (!lp || (rp.updated ?? 0) > (lp.updated ?? 0)) {
      byId.set(rp.id, rp);
      synced[rp.id] = rp.updated ?? 0;
    }
  });
  writeSynced(uid, synced);

  const cover = byId.get("cover");
  const back = byId.get("back");
  const days = Array.from(byId.values()).filter((p) => p.kind !== "cover" && p.kind !== "back");
  const rank = (p: Page) => {
    const i = order.indexOf(p.id);
    return i >= 0 ? i : 10_000 + (p.date ? Date.parse(p.date) / 86400000 : 0);
  };
  days.sort((a, b) => rank(a) - rank(b));
  return { ...local, pages: [cover, ...days, back].filter((p): p is Page => !!p) };
}

export interface PushResult {
  error?: string; // plain-English reason when something could not be backed up
}

export function describeSyncError(e: unknown): string {
  const code = String((e as { code?: string })?.code ?? "");
  const msg = String((e as { message?: string })?.message ?? e ?? "");
  if (code.includes("permission-denied")) return "The cloud refused the backup. Check the Firestore rules in Firebase.";
  if (code.includes("invalid-argument") || /maximum allowed size|too large|too big/i.test(msg)) return "One page is too big to back up. Try removing a few heavy items from it.";
  if (code.includes("unavailable") || code.includes("network") || /offline|network|fetch/i.test(msg)) return "No internet right now. Your work is safe on this device and will back up later.";
  return "Couldn't back up everything yet. It will try again.";
}

// Saves changed pages as pictures. A page that fails never blocks the others; it is retried next time.
export async function pushBook(uid: string, book: Book): Promise<PushResult> {
  const db = fbDb();
  const userRef = doc(db, "users", uid);
  const synced = readSynced(uid);
  let error: string | undefined;
  const changed: Record<string, number> = {};
  const removedIds: Record<string, ReturnType<typeof deleteField>> = {};

  for (const d of readDeleted(uid)) {
    try {
      await deleteDoc(doc(db, "users", uid, "pages", d.id));
      removedIds[d.id] = deleteField();
      clearDeleted(uid, [d.id]);
    } catch (e) {
      error = describeSyncError(e); // try again next time
    }
  }

  const { pageToWebp } = await import("./exporter");
  for (const p of book.pages) {
    if (p.flat) continue; // came from the cloud already as a picture
    const stamp = p.updated ?? (p.kind === "day" ? 1 : 0);
    if (stamp <= (synced[p.id] ?? 0)) continue;
    try {
      const preview = await pageToWebp(p);
      const { items: _items, flat: _flat, ...meta } = p;
      void _items;
      void _flat;
      await setDoc(doc(db, "users", uid, "pages", p.id), clean({ ...meta, updated: stamp, preview }));
      synced[p.id] = stamp;
      changed[p.id] = stamp;
    } catch (e) {
      error = describeSyncError(e);
    }
  }

  const order = book.pages.map((p) => p.id);
  const orderKey = order.join(",");
  let lastOrder = "";
  try {
    lastOrder = localStorage.getItem(ORDER(uid)) ?? "";
  } catch {}
  if (Object.keys(changed).length || Object.keys(removedIds).length || orderKey !== lastOrder) {
    try {
      await setDoc(userRef, { order, updated: Date.now(), pages: { ...changed, ...removedIds } }, { merge: true });
      try {
        localStorage.setItem(ORDER(uid), orderKey);
      } catch {}
    } catch (e) {
      error = describeSyncError(e);
    }
  }
  writeSynced(uid, synced);
  return { error };
}

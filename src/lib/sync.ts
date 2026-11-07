import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadString } from "firebase/storage";
import { fbDb, fbStorage } from "./firebase";
import { clearDeleted, readDeleted } from "./store";
import { Book, Page } from "./types";

// Cloud backup: one Firestore document per page (so no single document gets too big),
// photos in Firebase Storage. The device copy is always the working copy; the cloud is
// merged in when the app opens and written to after edits.

const SYNCED = (uid: string) => `patchlet.synced.${uid}`;
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

export async function pullAndMerge(uid: string, local: Book): Promise<Book> {
  const db = fbDb();
  const [userSnap, pageSnap] = await Promise.all([getDoc(doc(db, "users", uid)), getDocs(collection(db, "users", uid, "pages"))]);
  const remote = new Map<string, Page>();
  const gone = new Set(readDeleted(uid).map((d) => d.id));
  pageSnap.forEach((d) => {
    if (!gone.has(d.id)) remote.set(d.id, d.data() as Page);
  });
  if (remote.size === 0) return local;

  const order: string[] = (userSnap.data()?.order as string[] | undefined) ?? [];
  const byId = new Map(local.pages.map((p) => [p.id, p]));
  const synced = readSynced(uid);
  // a page that was already in the cloud but isn't any more (and wasn't edited here since) was deleted on another device
  Array.from(byId.values()).forEach((lp) => {
    if (lp.kind === "day" && synced[lp.id] !== undefined && !remote.has(lp.id) && (lp.updated ?? 0) <= synced[lp.id]) byId.delete(lp.id);
  });
  remote.forEach((rp, id) => {
    const lp = byId.get(id);
    if (!lp || (rp.updated ?? 0) > (lp.updated ?? 0)) {
      byId.set(id, rp);
      synced[id] = rp.updated ?? 0;
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
  swapped: Record<string, string>; // data URI -> download URL
  error?: string; // plain-English reason when something could not be backed up
}

export function describeSyncError(e: unknown): string {
  const code = String((e as { code?: string })?.code ?? "");
  const msg = String((e as { message?: string })?.message ?? e ?? "");
  if (/storage\//.test(code) || /storage/i.test(msg)) return "Your pages are backed up, but photos can't be uploaded yet. Firebase Storage needs to be switched on (Build → Storage → Get started).";
  if (code.includes("permission-denied")) return "The cloud refused the backup. Check the Firestore rules in Firebase.";
  if (code.includes("unavailable") || code.includes("network") || /offline|network|fetch/i.test(msg)) return "No internet right now. Your work is safe on this device and will back up later.";
  return "Couldn't back up everything yet. It will try again.";
}

// Writes changed pages to the cloud. A page that fails (for example because photo storage isn't switched on)
// never blocks the other pages: it is written without the photos it couldn't upload and retried next time.
export async function pushBook(uid: string, book: Book): Promise<PushResult> {
  const db = fbDb();
  const synced = readSynced(uid);
  const swapped: Record<string, string> = {};
  let error: string | undefined;

  const removed = readDeleted(uid);
  for (const d of removed) {
    try {
      await deleteDoc(doc(db, "users", uid, "pages", d.id));
      for (const pid of d.photos) {
        for (const f of [`${pid}.jpg`, `${pid}-cut.png`, `${pid}-bg.jpg`]) await deleteObject(ref(fbStorage(), `users/${uid}/photos/${f}`)).catch(() => undefined);
      }
      clearDeleted(uid, [d.id]);
    } catch (e) {
      error = describeSyncError(e); // try again next time
    }
  }

  const up = async (data: string, name: string) => {
    if (swapped[data]) return swapped[data];
    const r = ref(fbStorage(), `users/${uid}/photos/${name}`);
    await uploadString(r, data, "data_url");
    const url = await getDownloadURL(r);
    swapped[data] = url;
    return url;
  };

  for (const p of book.pages) {
    if ((p.updated ?? 0) <= (synced[p.id] ?? 0)) continue;
    const items = [];
    let complete = true;
    for (const it of p.items) {
      if (it.kind !== "photo") {
        items.push(it);
        continue;
      }
      try {
        let n = it;
        if (n.src?.startsWith("data:")) n = { ...n, src: await up(n.src, `${it.id}.jpg`) };
        if (n.cut?.startsWith("data:")) n = { ...n, cut: await up(n.cut, `${it.id}-cut.png`) };
        if (n.pbg?.k === "photo" && n.pbg.v?.startsWith("data:")) n = { ...n, pbg: { ...n.pbg, v: await up(n.pbg.v, `${it.id}-bg.jpg`) } };
        items.push(n);
      } catch (e) {
        // leave this photo out of the cloud copy for now; the rest of the page still backs up
        complete = false;
        error = describeSyncError(e);
      }
    }
    try {
      await setDoc(doc(db, "users", uid, "pages", p.id), clean({ ...p, items }));
      if (complete) synced[p.id] = p.updated ?? Date.now();
    } catch (e) {
      error = describeSyncError(e);
    }
  }
  try {
    await setDoc(doc(db, "users", uid), { order: book.pages.map((p) => p.id), updated: Date.now() }, { merge: true });
  } catch (e) {
    error = describeSyncError(e);
  }
  writeSynced(uid, synced);
  return { swapped, error };
}

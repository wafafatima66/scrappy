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

// Uploads data-URI photos (original, cut-out and background photo) and writes changed pages.
// Returns a map of data URI -> download URL so the caller can swap them into its own copy.
export async function pushBook(uid: string, book: Book): Promise<Record<string, string>> {
  const db = fbDb();
  const synced = readSynced(uid);
  const swapped: Record<string, string> = {};

  const removed = readDeleted(uid);
  for (const d of removed) {
    try {
      await deleteDoc(doc(db, "users", uid, "pages", d.id));
      for (const pid of d.photos) {
        for (const f of [`${pid}.jpg`, `${pid}-cut.png`, `${pid}-bg.jpg`]) await deleteObject(ref(fbStorage(), `users/${uid}/photos/${f}`)).catch(() => undefined);
      }
    } catch {
      /* try again next time */
    }
  }
  if (removed.length) clearDeleted(uid, removed.map((d) => d.id));

  const up = async (data: string, name: string) => {
    if (swapped[data]) return swapped[data];
    const r = ref(fbStorage(), `users/${uid}/photos/${name}`);
    await uploadString(r, data, "data_url");
    const url = await getDownloadURL(r);
    swapped[data] = url;
    return url;
  };

  for (const p of book.pages) {
    if ((p.updated ?? 0) <= (synced[p.id] ?? -1)) continue;
    const items = [];
    for (const it of p.items) {
      if (it.kind !== "photo") {
        items.push(it);
        continue;
      }
      let n = it;
      if (n.src?.startsWith("data:")) n = { ...n, src: await up(n.src, `${it.id}.jpg`) };
      if (n.cut?.startsWith("data:")) n = { ...n, cut: await up(n.cut, `${it.id}-cut.png`) };
      if (n.pbg?.k === "photo" && n.pbg.v?.startsWith("data:")) n = { ...n, pbg: { ...n.pbg, v: await up(n.pbg.v, `${it.id}-bg.jpg`) } };
      items.push(n);
    }
    await setDoc(doc(db, "users", uid, "pages", p.id), clean({ ...p, items }));
    synced[p.id] = p.updated ?? Date.now();
  }
  await setDoc(doc(db, "users", uid), { order: book.pages.map((p) => p.id), updated: Date.now() }, { merge: true });
  writeSynced(uid, synced);
  return swapped;
}

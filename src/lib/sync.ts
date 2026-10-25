import { doc, collection, getDoc, getDocs, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { fbDb, fbStorage } from "./firebase";
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
  pageSnap.forEach((d) => remote.set(d.id, d.data() as Page));
  if (remote.size === 0) return local;

  const order: string[] = (userSnap.data()?.order as string[] | undefined) ?? [];
  const byId = new Map(local.pages.map((p) => [p.id, p]));
  const synced = readSynced(uid);
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

// Uploads data-URI photos and writes changed pages. Returns pages with photo URLs swapped in.
export async function pushBook(uid: string, book: Book): Promise<Book | null> {
  const db = fbDb();
  const synced = readSynced(uid);
  let changed = false;
  const pages = [...book.pages];

  for (let pi = 0; pi < pages.length; pi++) {
    const p = pages[pi];
    if ((p.updated ?? 0) <= (synced[p.id] ?? -1)) continue;
    const items = [];
    for (const it of p.items) {
      if (it.kind === "photo" && it.src?.startsWith("data:")) {
        const r = ref(fbStorage(), `users/${uid}/photos/${it.id}.jpg`);
        await uploadString(r, it.src, "data_url");
        items.push({ ...it, src: await getDownloadURL(r) });
        changed = true;
      } else items.push(it);
    }
    const next = { ...p, items };
    pages[pi] = next;
    await setDoc(doc(db, "users", uid, "pages", p.id), clean(next));
    synced[p.id] = p.updated ?? Date.now();
  }
  await setDoc(doc(db, "users", uid), { order: pages.map((p) => p.id), updated: Date.now() }, { merge: true });
  writeSynced(uid, synced);
  return changed ? { ...book, pages } : null;
}

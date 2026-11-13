import { Session } from "./auth";
import { normalizeBook } from "./book";
import { loadMainBook, mergeStreakDays, saveBook } from "./store";
import { pullAndMerge, pushBook } from "./sync";
import { Book } from "./types";

// Loads this user's book from the device, merges in the cloud copy when signed in,
// and guarantees it has a cover and back cover.
// why the last cloud read failed (shown to the person so a missing page is never a mystery)
export let lastPullError = "";

export async function loadBookFor(s: Session): Promise<Book> {
  let book = normalizeBook(await loadMainBook(s.name), s.name);
  if (s.uid) {
    try {
      const merged = await Promise.race([pullAndMerge(s.uid, book), new Promise<Book>((_, rej) => setTimeout(() => rej(new Error("timeout")), 20000))]);
      book = normalizeBook(merged, s.name);
      lastPullError = "";
      mergeStreakDays(book.pages.filter((p) => p.kind === "day" && p.items.length > 0 && p.date).map((p) => p.date as string));
      // keep what came from the cloud on this device too, and send up anything only this device has
      await saveBook(book);
      void pushBook(s.uid, book).catch(() => undefined);
    } catch (e) {
      // offline: carry on with the device copy
      lastPullError = String((e as { message?: string })?.message ?? e);
    }
  }
  return book;
}

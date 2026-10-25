import { Session } from "./auth";
import { normalizeBook } from "./book";
import { loadMainBook, mergeStreakDays } from "./store";
import { pullAndMerge } from "./sync";
import { Book } from "./types";

// Loads this user's book from the device, merges in the cloud copy when signed in,
// and guarantees it has a cover and back cover.
export async function loadBookFor(s: Session): Promise<Book> {
  let book = normalizeBook(await loadMainBook(s.name), s.name);
  if (s.uid) {
    try {
      const merged = await Promise.race([pullAndMerge(s.uid, book), new Promise<Book>((_, rej) => setTimeout(() => rej(new Error("timeout")), 8000))]);
      book = normalizeBook(merged, s.name);
      mergeStreakDays(book.pages.filter((p) => p.kind === "day" && p.items.length > 0 && p.date).map((p) => p.date as string));
    } catch {
      // offline: carry on with the device copy
    }
  }
  return book;
}

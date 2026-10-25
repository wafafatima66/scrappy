import { get, set } from "idb-keyval";
import { Book } from "./types";

// Data is kept per account on the device: "local" when no one is signed in (or Firebase isn't set up).
let scope = "local";
export const setScope = (s: string) => {
  scope = s || "local";
};
const booksKey = () => `patchlet.books.v2.${scope}`;
const streakKey = () => `patchlet.streak.v2.${scope}`;
const nameKey = () => `patchlet.name.v2.${scope}`;
export const MAIN_ID = "patchlet-main";

export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);

export const getName = () => {
  try {
    return localStorage.getItem(nameKey()) ?? "";
  } catch {
    return "";
  }
};
export const setName = (n: string) => {
  try {
    localStorage.setItem(nameKey(), n.trim());
  } catch {}
};

export async function loadBooks(): Promise<Book[]> {
  try {
    return (await get<Book[]>(booksKey())) ?? [];
  } catch {
    return [];
  }
}

export async function saveBooks(books: Book[]) {
  try {
    await set(booksKey(), books);
  } catch {}
}

export async function loadMainBook(name: string): Promise<Book> {
  const found = (await loadBooks()).find((b) => b.id === MAIN_ID);
  return { id: MAIN_ID, title: `${name}'s Patchlet`, pages: found?.pages ?? [], updated: found?.updated ?? Date.now() };
}

export async function saveBook(book: Book) {
  const all = await loadBooks();
  const i = all.findIndex((b) => b.id === book.id);
  if (i >= 0) all[i] = book;
  else all.unshift(book);
  await saveBooks(all);
  markToday();
}

export async function clearAllLocal() {
  await saveBooks([]);
  try {
    localStorage.removeItem(streakKey());
    localStorage.removeItem(nameKey());
  } catch {}
}

// ---- streak: consecutive days with at least one saved edit ----
export const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function readStreak(): { count: number; days: string[] } {
  try {
    const days: string[] = JSON.parse(localStorage.getItem(streakKey()) ?? "[]");
    let count = 0;
    const d = new Date();
    if (!days.includes(dayKey(d))) d.setDate(d.getDate() - 1); // today not done yet: still alive
    while (days.includes(dayKey(d))) {
      count++;
      d.setDate(d.getDate() - 1);
    }
    return { count, days };
  } catch {
    return { count: 0, days: [] };
  }
}

export function markToday() {
  try {
    const days: string[] = JSON.parse(localStorage.getItem(streakKey()) ?? "[]");
    const t = dayKey(new Date());
    if (!days.includes(t)) localStorage.setItem(streakKey(), JSON.stringify([...days, t].slice(-400)));
  } catch {}
}

export function mergeStreakDays(extra: string[]) {
  try {
    const days: string[] = JSON.parse(localStorage.getItem(streakKey()) ?? "[]");
    localStorage.setItem(streakKey(), JSON.stringify(Array.from(new Set([...days, ...extra])).sort().slice(-400)));
  } catch {}
}

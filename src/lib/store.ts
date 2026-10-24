import { get, set } from "idb-keyval";
import { Book } from "./types";

const KEY = "scrappy.books.v1";
const STREAK = "scrappy.streak.v1";

export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);

export async function loadBooks(): Promise<Book[]> {
  try {
    return (await get<Book[]>(KEY)) ?? [];
  } catch {
    return [];
  }
}

export async function saveBooks(books: Book[]) {
  try {
    await set(KEY, books);
  } catch {}
}

export function newBook(title: string): Book {
  return { id: uid(), title, pages: [{ id: uid(), bg: "cream", items: [] }], updated: Date.now() };
}

export async function saveBook(book: Book) {
  const all = await loadBooks();
  const i = all.findIndex((b) => b.id === book.id);
  if (i >= 0) all[i] = book;
  else all.unshift(book);
  await saveBooks(all);
  markToday();
}

// ---- streak: consecutive days with at least one saved edit ----
const day = (d: Date) => d.toISOString().slice(0, 10);

export function readStreak(): { count: number; days: string[] } {
  try {
    const days: string[] = JSON.parse(localStorage.getItem(STREAK) ?? "[]");
    let count = 0;
    const d = new Date();
    if (!days.includes(day(d))) d.setDate(d.getDate() - 1); // today not done yet: still alive
    while (days.includes(day(d))) {
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
    const days: string[] = JSON.parse(localStorage.getItem(STREAK) ?? "[]");
    const t = day(new Date());
    if (!days.includes(t)) localStorage.setItem(STREAK, JSON.stringify([...days, t].slice(-400)));
  } catch {}
}

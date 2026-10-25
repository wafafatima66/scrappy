import { BY_SRC } from "./catalog";
import { makeBack, makeCover } from "./cover";
import { Book, Item, Page } from "./types";

// Old saves kept the whole SVG data URI on each sticker; swap it for a catalog id.
function slim(it: Item): Item {
  if (it.kind === "img" && !it.ref && it.src && BY_SRC[it.src]) {
    const { src: _src, ...rest } = it;
    void _src;
    return { ...rest, ref: BY_SRC[it.src] };
  }
  return it;
}

// A book is always [cover, ...day pages, back cover].
export function normalizeBook(b: Book, name: string): Book {
  const days = b.pages.filter((p) => p.kind !== "cover" && p.kind !== "back").map((p) => ({ ...p, kind: "day" as const, items: p.items.map(slim) }));
  const cover = b.pages.find((p) => p.kind === "cover") ?? makeCover(name);
  const back = b.pages.find((p) => p.kind === "back") ?? makeBack(name);
  return { ...b, title: `${name}'s Patchlet`, pages: [cover, ...days, back] };
}

// New day pages always slot in just before the back cover.
export function addDayPage(b: Book, page: Page): Book {
  const pages = [...b.pages];
  pages.splice(Math.max(1, pages.length - 1), 0, { ...page, kind: "day" });
  return { ...b, pages };
}

export const dayPages = (b: Book) => b.pages.filter((p) => p.kind === "day");

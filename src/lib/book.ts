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
// true when the page still looks exactly like the old auto-made default (nothing moved, added or removed)
function isUntouched(page: Page, old: Page): boolean {
  if (page.items.length !== old.items.length || page.bg !== old.bg || page.frame) return false;
  const by = new Map(page.items.map((i) => [i.id, i]));
  return old.items.every((o) => {
    const i = by.get(o.id);
    return !!i && Math.abs(i.x - o.x) < 0.5 && Math.abs(i.y - o.y) < 0.5 && Math.abs(i.w - o.w) < 0.5 && Math.abs(i.r - o.r) < 0.5;
  });
}

export function normalizeBook(b: Book, name: string): Book {
  const days = b.pages.filter((p) => p.kind !== "cover" && p.kind !== "back").map((p) => ({ ...p, kind: "day" as const, items: p.items.map(slim) }));
  let cover = b.pages.find((p) => p.kind === "cover") ?? makeCover(name);
  let back = b.pages.find((p) => p.kind === "back") ?? makeBack(name);
  // covers nobody has touched move to the newest default design (customised ones are left alone)
  if (isUntouched(cover, makeCover(name, "kraft"))) cover = { ...makeCover(name), updated: 0 };
  if (isUntouched(back, makeBack(name, "kraft"))) back = { ...makeBack(name), updated: 0 };
  return { ...b, title: `${name}'s Patchlet`, pages: [cover, ...days, back] };
}

// New day pages always slot in just before the back cover.
export function addDayPage(b: Book, page: Page): Book {
  const pages = [...b.pages];
  pages.splice(Math.max(1, pages.length - 1), 0, { ...page, kind: "day" });
  return { ...b, pages };
}

export const dayPages = (b: Book) => b.pages.filter((p) => p.kind === "day");

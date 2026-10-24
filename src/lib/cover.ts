import { PROCEDURAL } from "./procedural";
import { Book, Item, Page } from "./types";

const find = (id: string) => PROCEDURAL.find((s) => s.id === id);

function sticker(id: string, x: number, y: number, w: number, r = 0): Item | null {
  const s = find(id);
  if (!s) return null;
  return { id: `c-${id}-${x}`, kind: "img", src: s.src, x, y, w, h: (w * s.h) / s.w, r };
}

// Auto-built cover for the flipbook: kraft board, torn paper label, tape and a stamp.
export function coverPage(book: Book): Page {
  const items: (Item | null)[] = [
    sticker("pat-gingham-rose", 60, 90, 300, -6),
    sticker("paper-cream-wide", 120, 230, 380, 2),
    sticker("tape-stripes-lilac", 220, 200, 200, -3),
    sticker("stamp-1-0", 400, 520, 120, 8),
    sticker("postmark-0", 330, 600, 220, -6),
    sticker("seal-0", 80, 560, 110, 0),
    sticker("doodle-sparkles-plum", 440, 130, 110, 10),
    sticker("tape-dots-peach", 60, 640, 190, 14),
  ];
  const title: Item = {
    id: "c-title",
    kind: "text",
    text: book.title,
    font: "type",
    color: "#3b3128",
    size: 40,
    x: 150,
    y: 330,
    w: 320,
    h: 60,
    r: 2,
  };
  const sub: Item = { id: "c-sub", kind: "text", text: `${book.pages.length} ${book.pages.length === 1 ? "page" : "pages"} of little joys`, font: "hand", color: "#6b5744", size: 30, x: 160, y: 430, w: 300, h: 40, r: 2 };
  return { id: "cover", bg: "kraft", items: [...items.filter((i): i is Item => !!i), title, sub] };
}

export function backCover(): Page {
  return {
    id: "back",
    bg: "kraft",
    items: [
      { id: "b-t", kind: "text", text: "the end ♡", font: "script", color: "#3b3128", size: 38, x: 150, y: 360, w: 300, h: 60, r: -3 },
      ...([sticker("seal-1", 255, 460, 90, 0), sticker("tape-zigzag-sage", 180, 300, 240, -2)].filter((i): i is Item => !!i)),
    ],
  };
}

import { PROCEDURAL } from "./procedural";
import { Book, Item, Page } from "./types";

const find = (id: string) => PROCEDURAL.find((s) => s.id === id);

// sticker by id: [id, x, y, width, rotation]
type S = [string, number, number, number, number?];

function stickers(list: S[], tag: string): Item[] {
  const out: Item[] = [];
  list.forEach(([id, x, y, w, r = 0], i) => {
    const s = find(id);
    if (s) out.push({ id: `${tag}-${i}-${id}`, kind: "img", src: s.src, x, y, w, h: (w * s.h) / s.w, r });
  });
  return out;
}

const text = (id: string, t: string, font: Item["font"], size: number, color: string, x: number, y: number, w: number, r = 0): Item => ({
  id,
  kind: "text",
  text: t,
  font,
  size,
  color,
  x,
  y,
  w,
  h: size * 1.3,
  r,
});

// Front cover: layered kraft board, patterned scraps, a torn paper label with the owner's name,
// ribbon, bow, buttons, stamp and postmark.
export function coverPage(book: Book, name: string): Page {
  const nameSize = name.length > 14 ? 34 : name.length > 10 ? 42 : name.length > 7 ? 52 : 62;
  const n = book.pages.length;
  return {
    id: "cover",
    bg: "kraft",
    items: [
      ...stickers(
        [
          ["pat-floral-plum", 20, 60, 340, -7],
          ["pat-gingham-rose", 290, 40, 290, 6],
          ["pat-lined-blue", 330, 470, 250, 5],
          ["paper-cream-wide", 70, 235, 470, 1.5],
          ["tape-stripes-lilac", 200, 205, 210, -4],
          ["tape-dots-peach", 10, 20, 190, -32],
          ["tape-checks-sage", 440, 350, 170, 52],
          ["ribbon-1", 10, 600, 580, -3],
          ["bow-0", 36, 610, 150, -8],
          ["button-3", 210, 665, 62, 0],
          ["button-5", 285, 690, 52, 0],
          ["clip-0", 98, 218, 40, 12],
          ["stamp-1-0", 420, 560, 120, 8],
          ["postmark-0", 350, 620, 230, -8],
          ["seal-0", 470, 120, 100, 0],
          ["doodle-sparkles-plum", 60, 360, 90, -10],
          ["doodle-star-rose", 500, 300, 60, 12],
        ],
        "cv",
      ),
      text("cv-sub1", "the patchlet of", "hand", 34, "#6b5744", 130, 290, 360, 1.5),
      text("cv-name", name, "type", nameSize, "#3b3128", 105, 335, 410, 1.5),
      ...stickers([["doodle-underline-plum", 160, 335 + nameSize * 1.5, 280, 1.5]], "cu"),
      text("cv-sub2", `${n} ${n === 1 ? "page" : "pages"} of little joys`, "hand", 30, "#6b5744", 150, 335 + nameSize * 1.5 + 36, 320, 1.5),
    ],
  };
}

// Back cover: a quieter mirror of the front with a thank-you and the owner's name.
export function backCover(name: string): Page {
  return {
    id: "back",
    bg: "kraft",
    items: [
      ...stickers(
        [
          ["pat-stripes-sage", 300, 50, 260, 7],
          ["pat-dots-rose", 40, 70, 250, -6],
          ["paper-cream-tall", 120, 220, 360, -2],
          ["tape-zigzag-sage", 230, 195, 200, 3],
          ["tape-stripes-rose", 440, 600, 190, -28],
          ["patch-2", 60, 560, 130, -8],
          ["button-1", 205, 640, 56, 0],
          ["seal-1", 250, 540, 100, 0],
          ["stamp-2-1", 420, 520, 100, -7],
          ["postmark-2", 330, 630, 220, 6],
          ["bow-2", 60, 480, 110, 14],
          ["doodle-sparkles-plum", 430, 190, 90, 10],
          ["doodle-heart-rose", 120, 310, 60, -12],
        ],
        "bk",
      ),
      text("bk-end", "the end", "script", 46, "#3b3128", 150, 330, 300, -2),
      text("bk-by", `made by ${name} ♡`, "hand", 40, "#3b3128", 140, 410, 320, -2),
      text("bk-thx", "thanks for stopping by", "hand", 28, "#6b5744", 170, 470, 260, -2),
    ],
  };
}

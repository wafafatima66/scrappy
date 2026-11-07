import { BY_ID } from "./catalog";
import { uid } from "./store";
import { FontKey, Item, TextStyle } from "./types";

// Ready-made page layouts. Every piece stays a normal item, so you can move, resize or delete anything.
const S = (ref: string, x: number, y: number, w: number, r = 0): Item | null => {
  const e = BY_ID[ref];
  if (!e) return null;
  return { id: uid(), kind: "img", ref, x, y, w, h: (w * e.h) / e.w, r };
};

const T = (text: string, font: FontKey, size: number, color: string, x: number, y: number, w: number, r = 0, style: TextStyle = "plain", accent?: string): Item => ({
  id: uid(),
  kind: "text",
  text,
  font,
  size,
  color,
  style,
  accent,
  x,
  y,
  w,
  h: size * 1.3,
  r,
});

const list = (...a: (Item | null)[]) => a.filter((i): i is Item => !!i);

export interface Template {
  id: string;
  label: string;
  bg: string;
  build: () => Item[];
}

export const TEMPLATES: Template[] = [
  {
    id: "last-page",
    label: "Last page of my journey",
    bg: "color:#f6f1e7",
    build: () =>
      list(
        S("jk-corner-kraft-tl-plain", 0, 0, 150),
        S("jk-grid-corner-white-tl", 8, 8, 120),
        S("clip-0", 38, 22, 34, 10),
        S("jk-leaf-vine-black", 108, 40, 70, -4),
        S("jk-corner-kraft-tr-heart", 450, 0, 150),
        S("jk-corner-kraft-bl-mountain", 0, 640, 160),
        S("jk-grid-corner-cream-br", 448, 650, 152),
        T("on to\nnew\nadventures", "neat", 20, "#2d2a33", 500, 712, 90, 0),
        T("it's my", "hand", 30, "#2d2a33", 220, 44, 160, 0),
        T("last", "brush", 96, "#1f1d1f", 190, 66, 220, 0, "shadow", "#e3b97a"),
        T("page of my", "hand", 34, "#2d2a33", 190, 168, 240, 0),
        T("journey", "dance", 88, "#1f1d1f", 130, 196, 360, 0, "shadow", "#e3b97a"),
        S("jk-quotes-black", 188, 66, 40, 0),
        S("jk-inkframe-portrait-black", 156, 300, 280, 0),
        S("jk-tape-check-black-s", 118, 296, 90, -28),
        S("jk-tape-check-black-s", 360, 548, 100, -24),
        T("add your photo here\n(Photos tab)", "hand", 22, "#8b8b92", 206, 420, 180, 0),
        S("jk-note-tan-tall", 28, 270, 135, -1),
        S("jk-tape-masking-kraft-short", 48, 248, 96, -3),
        T("so many\nmemories ♥\nso many\nlessons ♥\nso much\ngrateful ♥", "neat", 19, "#2d2a33", 44, 296, 110, -1),
        S("jk-brace-black", 458, 392, 36, 0),
        T("this is not\nthe end...\nit's just\nthe start of\nsomething\nbetter ♥", "neat", 21, "#2d2a33", 478, 384, 112, 0),
        S("jk-dried-gypsophila-ochre", 36, 470, 90, 0),
        S("jk-tape-masking-kraft-short", 44, 566, 90, -8),
        S("jk-brush-tan-wide", 130, 660, 340, 0),
        T("thank you to every moment,\nevery person and every lesson.", "neat", 20, "#2d2a33", 164, 683, 276, 0),
        S("jk-scatter-a-black", 440, 62, 110, 8),
        S("jk-scatter-b-black", 40, 150, 80, 0),
        S("jk-scatter-c-black", 24, 560, 100, 0),
        S("jk-trail-plane-black", 452, 560, 120, 0),
        S("jk-hearts-col-black", 566, 190, 22, 0),
        S("jk-trail-dash-curve-black", 462, 120, 100, 14),
      ),
  },
  {
    id: "memory",
    label: "A day I loved",
    bg: "cream",
    build: () =>
      list(
        S("jk-grid-note-white", 20, 24, 160, -4),
        S("jk-tape-masking-cream-short", 40, 14, 100, -3),
        S("jk-brush-peach-wide", 150, 56, 350, 0),
        T("a day I loved", "dance", 62, "#2d2a33", 150, 52, 350, -1),
        S("jk-inkframe-landscape-black", 100, 190, 400, 0),
        S("jk-tape-check-black-s", 90, 190, 100, -30),
        S("jk-tape-check-black-s", 420, 400, 100, -26),
        T("add your photo here", "hand", 24, "#8b8b92", 190, 300, 220, 0),
        S("datestamp-0-black", 330, 470, 150, -4),
        T("where we were:", "neat", 22, "#6b5744", 60, 540, 200, 0),
        S("jk-underline-swirl-black", 60, 575, 220, 0),
        T("what I felt:", "neat", 22, "#6b5744", 60, 620, 200, 0),
        S("jk-underline-swirl-black", 60, 655, 220, 0),
        S("jk-dried-leaf-branch-cream", 490, 560, 80, 12),
        S("jk-scatter-a-gold", 420, 640, 120, 0),
        S("jk-hearts-row-gold", 70, 720, 90, 0),
      ),
  },
  {
    id: "quote",
    label: "Quote & mood",
    bg: "color:#f1e9dc",
    build: () =>
      list(
        S("jk-corner-sand-tl-plain", 0, 0, 170),
        S("jk-corner-kraft-tr-heart", 430, 0, 170),
        S("jk-brush-sage-wide", 90, 190, 420, -1),
        T("slow down,", "brush", 70, "#2d2a33", 100, 180, 400, -1),
        T("you are doing", "dance", 50, "#2d2a33", 120, 300, 360, 1, "highlight", "#f4c9aa"),
        T("just fine", "dance", 80, "#2d2a33", 110, 380, 380, 0, "shadow", "#f0c3ca"),
        S("jk-tape-check-black-l", 30, 560, 180, -6),
        T("today I'm grateful for:", "neat", 24, "#2d2a33", 40, 600, 300, 0),
        S("jk-underline-swirl-black", 40, 640, 260, 0),
        S("jk-scatter-b-gold", 440, 80, 110, 0),
        S("jk-trail-circle-black", 380, 470, 110, 0),
        S("jk-leaf-vine-gold", 500, 300, 70, 8),
      ),
  },
];

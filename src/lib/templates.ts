import { BY_ID } from "./catalog";
import { uid } from "./store";
import { FontKey, Item, PhotoFrame, TextStyle } from "./types";

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

// a sticker stretched to an exact box (plain paper, strips)
const Sx = (ref: string, x: number, y: number, w: number, h: number, r = 0): Item | null => (BY_ID[ref] ? { id: uid(), kind: "img", ref, x, y, w, h, r } : null);

// an empty photo frame: tap it in the editor and pick a photo
const P = (x: number, y: number, w: number, h: number, r = 0, frame: PhotoFrame = "polaroid", seed = 3): Item => ({ id: uid(), kind: "photo", frame, x, y, w, h, r, seed });

const today = () => new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

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
  // ---------- layouts with empty photo frames: tap a frame, pick a photo ----------
  {
    id: "vlog",
    label: "Everyday vlog",
    bg: "lined",
    build: () =>
      list(
        T("everyday vlog", "pacifico", 48, "#2d2a33", 40, 30, 380, -2, "shadow", "#f4c9aa"),
        S("datestamp-0-black", 410, 40, 150, 4),
        T(today(), "type", 20, "#6b5744", 46, 108, 420, 0),
        P(30, 150, 255, 185, -1.5, "plain"),
        P(315, 160, 255, 185, 1.5, "plain"),
        P(30, 365, 255, 185, 1, "plain"),
        P(315, 375, 255, 185, -1, "plain"),
        S("tape-stripes-lilac", 110, 138, 100, -4),
        S("tape-dots-rose", 395, 148, 100, 3),
        S("tape-gingham-sky", 110, 353, 100, 2),
        S("tape-checks-peach", 395, 363, 100, -3),
        T("☀ morning:", "neat", 22, "#2d2a33", 40, 590, 220, 0),
        S("doodle-underline-ink", 40, 622, 230, 0),
        T("🍜 what I ate:", "neat", 22, "#2d2a33", 40, 650, 240, 0),
        S("doodle-underline-ink", 40, 682, 230, 0),
        T("♡ highlight of the day:", "neat", 22, "#2d2a33", 40, 710, 300, 0),
        S("doodle-underline-ink", 40, 742, 300, 0),
        T("mood: ☺ ☹ ☁", "neat", 22, "#2d2a33", 340, 590, 230, 0),
        T("weather: ☀ ☂ ❄", "neat", 22, "#2d2a33", 340, 650, 230, 0),
        S("doodle-sparkles-plum", 470, 690, 90, 0),
      ),
  },
  {
    id: "booth",
    label: "Photo booth strip",
    bg: "sky",
    build: () =>
      list(
        Sx("pat-gingham-blue", 0, 340, 600, 475, 0),
        Sx("paper-cream-tall", 190, 50, 220, 590, 0),
        P(206, 68, 188, 128, 0, "plain"),
        P(206, 206, 188, 128, 0, "plain"),
        P(206, 344, 188, 128, 0, "plain"),
        P(206, 482, 188, 128, 0, "plain"),
        S("tape-gingham-sky", 250, 32, 110, -2),
        T(today(), "type", 15, "#2d2a33", 206, 614, 188, 0),
        T("me &\nmy bestie", "hand", 36, "#2d2a33", 28, 70, 150, -4),
        S("doodle-arrow-curl-ink", 70, 170, 100, 8),
        S("doodle-star-sepia", 50, 280, 90, -8),
        T("we went to\nthe cinema!!", "neat", 22, "#2d2a33", 24, 380, 150, -4),
        S("doodle-heart-plum", 56, 450, 46, 0),
        T("I LOVE HER", "neat", 24, "#2d2a33", 425, 130, 150, 3),
        S("doodle-underline-ink", 430, 166, 140, 3),
        T("MAYBE THIS IS HOW IT STARTS", "bebas", 34, "#3d6a8a", 428, 240, 148, 0, "tag"),
        T("she is my\ncomfort person", "hand", 22, "#2d2a33", 430, 400, 150, -2),
        S("paper-cream-wide", 392, 640, 190, -2),
        T("dance, smile, be silly,\nbecause why not?", "neat", 18, "#2d2a33", 408, 676, 160, -2),
        S("doodle-sparkles-plum", 30, 690, 90, 0),
      ),
  },
  {
    id: "friends",
    label: "Friendship collage",
    bg: "blush",
    build: () =>
      list(
        P(26, 40, 236, 176, -2, "plain"),
        P(318, 140, 230, 285, 3),
        P(54, 262, 200, 250, -3, "torn", 7),
        P(300, 450, 226, 280, -2),
        T("FRIEND\nSHIP", "permanent", 54, "#7b4fc9", 290, 24, 270, 3, "sticker", "#ffffff"),
        T("with my best people ✦", "neat", 18, "#ffffff", 34, 232, 220, 0, "tag", "#a98bd8"),
        T("school mates ✦", "neat", 18, "#ffffff", 70, 520, 170, 0, "tag", "#a98bd8"),
        T("“my people ♥”", "hand", 28, "#2d2a33", 110, 566, 260, 0, "highlight", "#f7e27a"),
        S("paper-cream-wide", 22, 604, 262, -1),
        T("write about your\nfriends here…", "neat", 20, "#2d2a33", 46, 648, 220, -1),
        S("tape-dots-rose", 100, 250, 100, -4),
        S("tape-stripes-lilac", 380, 128, 100, 4),
        S("tape-checks-peach", 370, 440, 100, -3),
        S("doodle-star-plum", 522, 26, 60, 12),
        S("doodle-heart-plum", 536, 420, 40, -8),
        S("doodle-sparkles-plum", 240, 440, 70, 0),
        S("doodle-flower-ink", 530, 700, 50, 0),
      ),
  },
  {
    id: "olddays",
    label: "The good old days",
    bg: "color:#bcd6ea",
    build: () =>
      list(
        P(24, 34, 190, 225, -5),
        P(378, 28, 198, 228, 4),
        P(22, 540, 236, 218, -2, "plain"),
        P(326, 524, 236, 236, 3),
        S("jk-note-tan-tall", 176, 262, 248, 2),
        T("THE\nGOOD\nOLD\nDAYS", "permanent", 58, "#2d2a33", 196, 300, 210, 2),
        T("college.\na place where\nstrangers meet\nand become\nfamily.", "neat", 16, "#2d2a33", 30, 290, 130, -1),
        T("a day to look\nback at the\nmemories and\nlessons we made.", "neat", 16, "#2d2a33", 446, 300, 130, 1),
        S("tape-dots-rose", 60, 24, 100, -6),
        S("tape-gingham-sky", 420, 18, 100, 5),
        S("tape-stripes-lilac", 90, 530, 100, 3),
        S("doodle-star-sepia", 256, 150, 70, 10),
        S("doodle-heart-plum", 236, 470, 44, -6),
        S("doodle-sparkles-ink", 210, 20, 80, 0),
        S("doodle-arrow-loop-ink", 270, 760, 90, 0),
      ),
  },
  {
    id: "floral",
    label: "Floral memories",
    bg: "blush",
    build: () =>
      list(
        S("lace-corner-white", 0, 0, 150, 0),
        S("jk-dried-leaf-branch-cream", 470, 600, 110, 12),
        P(34, 66, 232, 288, -3),
        S("paper-cream-wide", 292, 40, 250, 2),
        T("Beach", "abril", 30, "#3b3128", 316, 74, 200, 2),
        T("write a few lines about\nthis moment here…", "type", 14, "#3b3128", 312, 118, 215, 2),
        P(376, 232, 190, 142, 2, "plain"),
        P(376, 392, 190, 142, -2, "plain"),
        P(376, 552, 190, 142, 1.5, "plain"),
        S("tape-stripes-lilac", 90, 52, 100, -4),
        S("tape-dots-rose", 430, 220, 90, 3),
        S("tape-checks-peach", 430, 380, 90, -3),
        T("Read books.\nBe kind.\nStay weird.", "type", 30, "#3b3128", 40, 420, 270, -2, "strip"),
        S("jk-dried-gypsophila-ochre", 60, 590, 110, 0),
        S("doodle-flower-plum", 200, 620, 70, 8),
        T("with love ♥", "script", 26, "#6a4c93", 40, 740, 240, 0),
      ),
  },
  {
    id: "timeline",
    label: "A day in my life",
    bg: "cream",
    build: () =>
      list(
        T("a day in my life", "dance", 54, "#2d2a33", 70, 26, 460, -1, "highlight", "#f4c9aa"),
        T("morning", "hand", 28, "#6b5744", 30, 150, 120, 0),
        P(160, 118, 200, 140, -1.5, "plain"),
        T("noon", "hand", 28, "#6b5744", 30, 305, 120, 0),
        P(160, 274, 200, 140, 1.5, "plain"),
        T("evening", "hand", 28, "#6b5744", 30, 462, 120, 0),
        P(160, 430, 200, 140, -1, "plain"),
        T("night", "hand", 28, "#6b5744", 30, 618, 120, 0),
        P(160, 586, 200, 140, 1, "plain"),
        T("what I did:", "neat", 19, "#2d2a33", 392, 126, 180, 0),
        S("doodle-underline-ink", 388, 160, 190, 0),
        S("doodle-underline-ink", 388, 205, 190, 0),
        T("what I did:", "neat", 19, "#2d2a33", 392, 282, 180, 0),
        S("doodle-underline-ink", 388, 316, 190, 0),
        S("doodle-underline-ink", 388, 361, 190, 0),
        T("what I did:", "neat", 19, "#2d2a33", 392, 438, 180, 0),
        S("doodle-underline-ink", 388, 472, 190, 0),
        S("doodle-underline-ink", 388, 517, 190, 0),
        T("what I did:", "neat", 19, "#2d2a33", 392, 594, 180, 0),
        S("doodle-underline-ink", 388, 628, 190, 0),
        S("doodle-underline-ink", 388, 673, 190, 0),
        S("tape-stripes-peach", 200, 106, 90, -3),
        S("tape-dots-sage", 200, 262, 90, 3),
        S("tape-gingham-sky", 200, 418, 90, -2),
        S("tape-checks-lilac", 200, 574, 90, 2),
        S("doodle-sparkles-plum", 480, 730, 80, 0),
      ),
  },
  {
    id: "six",
    label: "Six moments",
    bg: "white",
    build: () =>
      list(
        T("6 little moments", "brush", 56, "#2d2a33", 70, 24, 460, -1, "shadow", "#f0c3ca"),
        P(30, 112, 255, 175, -1, "plain"),
        P(315, 118, 255, 175, 1, "plain"),
        P(30, 318, 255, 175, 1, "plain"),
        P(315, 324, 255, 175, -1, "plain"),
        P(30, 524, 255, 175, -1, "plain"),
        P(315, 530, 255, 175, 1, "plain"),
        S("tape-dots-rose", 110, 100, 100, -3),
        S("tape-stripes-lilac", 395, 106, 100, 3),
        S("tape-gingham-sky", 110, 306, 100, 2),
        S("tape-checks-peach", 395, 312, 100, -2),
        S("tape-plain-sage", 110, 512, 100, -2),
        S("tape-zigzag-rose", 395, 518, 100, 3),
        T("moments I want to remember ♥", "neat", 22, "#6b5744", 90, 735, 420, 0),
        S("doodle-underline-double-ink", 150, 765, 300, 0),
      ),
  },
];

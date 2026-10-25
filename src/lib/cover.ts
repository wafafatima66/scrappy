import { BY_ID } from "./catalog";
import { uid } from "./store";
import { Item, Page } from "./types";

export type CoverTheme = "kraft" | "lilac" | "garden" | "night";

export const COVER_THEMES: { id: CoverTheme; label: string }[] = [
  { id: "kraft", label: "Kraft scrapbook" },
  { id: "lilac", label: "Lilac dream" },
  { id: "garden", label: "Pressed garden" },
  { id: "night", label: "Midnight" },
];

// catalog entry: [id, x, y, width, rotation]
type S = [string, number, number, number, number?];

function stickers(list: S[], tag: string): Item[] {
  const out: Item[] = [];
  list.forEach(([ref, x, y, w, r = 0], i) => {
    const s = BY_ID[ref];
    if (s) out.push({ id: `${tag}-${i}`, kind: "img", ref, x, y, w, h: (w * s.h) / s.w, r });
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

const fit = (name: string) => (name.length > 14 ? 34 : name.length > 10 ? 42 : name.length > 7 ? 52 : 62);

interface Look {
  bg: string;
  front: S[];
  back: S[];
  ink: string;
  soft: string;
  label: string;
  underline: string;
}

const LOOKS: Record<CoverTheme, Look> = {
  kraft: {
    bg: "kraft",
    ink: "#3b3128",
    soft: "#6b5744",
    label: "paper-cream-wide",
    underline: "doodle-underline-plum",
    front: [
      ["pat-floral-plum", 20, 60, 340, -7],
      ["pat-gingham-rose", 290, 40, 290, 6],
      ["pat-lined-blue", 330, 470, 250, 5],
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
    back: [
      ["pat-stripes-sage", 300, 50, 260, 7],
      ["pat-dots-rose", 40, 70, 250, -6],
      ["paper-cream-tall", 120, 220, 360, -2],
      ["tape-zigzag-sage", 230, 195, 200, 3],
      ["tape-stripes-rose", 440, 600, 190, -28],
      ["patch-2", 60, 560, 130, -8],
      ["button-1", 205, 640, 56, 0],
      ["seal-1", 250, 540, 100, 0],
      ["country-bd", 420, 500, 100, -7],
      ["postmark-2", 330, 630, 220, 6],
      ["bow-2", 60, 480, 110, 14],
      ["doodle-sparkles-plum", 430, 190, 90, 10],
    ],
  },
  lilac: {
    bg: "crumple-lilac",
    ink: "#4a3b63",
    soft: "#7a6a99",
    label: "paper-cream-wide",
    underline: "doodle-underline-plum",
    front: [
      ["lace-strip-white", 120, 40, 360, 0],
      ["pat-gingham-plum", 30, 90, 260, -6],
      ["pat-floral-plum", 320, 80, 250, 7],
      ["tape-stars-lilac", 190, 215, 220, -3],
      ["rose-lilac", 20, 560, 130, -10],
      ["rose-blush", 120, 620, 120, 8],
      ["blossom-lilac", 470, 560, 120, 12],
      ["lavender-0", 500, 400, 56, 8],
      ["lavender-1", 40, 400, 56, -8],
      ["seal-1", 450, 130, 90, 0],
      ["stk-sparkle-lilac", 70, 300, 70, 0],
      ["stk-star-lilac", 500, 300, 60, 10],
    ],
    back: [
      ["lace-strip-lilac", 120, 40, 360, 0],
      ["paper-lavender-tall", 120, 200, 360, -2],
      ["tape-stripes-lilac", 220, 185, 200, -3],
      ["rose-lilac", 60, 560, 120, -10],
      ["blossom-blush", 420, 540, 120, 12],
      ["lavender-0", 40, 360, 56, -8],
      ["lavender-2", 510, 360, 56, 8],
      ["stk-heart-lilac", 270, 580, 70, 0],
    ],
  },
  garden: {
    bg: "parchment",
    ink: "#3b3128",
    soft: "#5f7a4d",
    label: "paper-cream-wide",
    underline: "doodle-underline-forest",
    front: [
      ["pat-floral-sage", 30, 70, 300, -6],
      ["pat-lined-blue", 300, 60, 270, 6],
      ["tape-florals-sage", 200, 210, 210, -3],
      ["eucalyptus-0", 30, 430, 90, -12],
      ["eucalyptus-1", 480, 420, 90, 12],
      ["fern-0", 70, 560, 100, 6],
      ["daisy-0", 160, 640, 110, 0],
      ["daisy-2", 300, 660, 90, 0],
      ["tulip-blush", 400, 590, 80, 8],
      ["sunflower-0", 470, 110, 110, 0],
      ["wildflowers-0", 20, 250, 70, -6],
      ["seal-2", 520, 330, 70, 0],
    ],
    back: [
      ["pat-floral-sage", 40, 60, 280, 5],
      ["paper-sage-tall", 120, 210, 360, 2],
      ["tape-florals-sage", 230, 190, 200, -3],
      ["poppy-0", 60, 560, 110, 0],
      ["daisy-1", 220, 620, 100, 0],
      ["wildflowers-1", 440, 520, 80, 6],
      ["eucalyptus-2", 500, 60, 80, 10],
    ],
  },
  night: {
    bg: "night",
    ink: "#2d2a33",
    soft: "#6a5b8a",
    label: "paper-newsprint-wide",
    underline: "doodle-underline-plum",
    front: [
      ["stk-moon-butter", 410, 70, 120, 0],
      ["stk-star-butter", 60, 90, 70, -10],
      ["stk-star-butter", 200, 50, 40, 12],
      ["stk-sparkle-butter", 330, 160, 50, 0],
      ["stk-sparkle-sky", 90, 200, 60, 0],
      ["tape-stars-plum", 190, 205, 220, -3],
      ["stk-cloud-sky", 30, 520, 150, 0],
      ["stk-cloud-lilac", 420, 540, 150, 0],
      ["stk-rainbow-0", 200, 600, 200, 0],
      ["seal-3", 480, 330, 80, 0],
      ["film-h3-black", 80, 700, 440, -2],
    ],
    back: [
      ["stk-moon-butter", 60, 70, 100, 0],
      ["stk-star-butter", 450, 90, 60, 10],
      ["paper-newsprint-tall", 120, 220, 360, -2],
      ["tape-stars-plum", 220, 195, 200, -3],
      ["stk-cloud-sky", 380, 560, 150, 0],
      ["film-h3-black", 80, 690, 440, 2],
    ],
  },
};

export function makeCover(name: string, theme: CoverTheme = "kraft"): Page {
  const l = LOOKS[theme];
  const sz = fit(name);
  return {
    id: "cover",
    kind: "cover",
    bg: l.bg,
    items: [
      ...stickers([[l.label, 70, 235, 470, 1.5], ...l.front], "cv"),
      text("cv-sub1", "the patchlet of", "hand", 34, l.soft, 130, 290, 360, 1.5),
      text("cv-name", name, "type", sz, l.ink, 105, 335, 410, 1.5),
      ...stickers([[l.underline, 160, 335 + sz * 1.5, 280, 1.5]], "cu"),
      text("cv-sub2", "a scrapbook of little joys", "hand", 30, l.soft, 130, 335 + sz * 1.5 + 36, 360, 1.5),
    ],
    updated: Date.now(),
  };
}

export function makeBack(name: string, theme: CoverTheme = "kraft"): Page {
  const l = LOOKS[theme];
  return {
    id: "back",
    kind: "back",
    bg: l.bg,
    items: [
      ...stickers(l.back, "bk"),
      text("bk-end", "the end", "script", 46, l.ink, 150, 330, 300, -2),
      text("bk-by", `made by ${name} ♡`, "hand", 40, l.ink, 140, 410, 320, -2),
      text("bk-thx", "thanks for stopping by", "hand", 28, l.soft, 170, 470, 260, -2),
    ],
    updated: Date.now(),
  };
}

// fresh ids so a regenerated cover never collides with items already on the page
export const reId = (items: Item[]): Item[] => items.map((i) => ({ ...i, id: uid() }));

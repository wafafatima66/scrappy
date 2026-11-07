import { BY_ID } from "./catalog";
import { svgWrap, uri } from "./procedural";
import { uid } from "./store";
import { Item, Page } from "./types";

export type CoverTheme = "collage" | "kraft" | "lilac" | "garden" | "night";

export const COVER_THEMES: { id: CoverTheme; label: string }[] = [
  { id: "collage", label: "Daily journal (default)" },
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

const LOOKS: Record<Exclude<CoverTheme, "collage">, Look> = {
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

function classicCover(name: string, theme: Exclude<CoverTheme, "collage">): Page {
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

function classicBack(name: string, theme: Exclude<CoverTheme, "collage">): Page {
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

// ---------- the default "daily journal" collage: black cover with cut-out letters, red gingham end page ----------

const rnd = (seed: number) => {
  let x = (seed * 9301 + 49297) % 233280;
  return () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
};

const RANSOM_FONTS = [
  { f: "Impact, 'Arial Black', sans-serif", w: "900", s: 74 },
  { f: "Georgia, 'Times New Roman', serif", w: "bold", s: 78 },
  { f: "'Courier New', monospace", w: "bold", s: 70 },
  { f: "Arial, Helvetica, sans-serif", w: "bold", s: 76 },
  { f: "Georgia, 'Times New Roman', serif", w: "900", s: 80 },
];

// one cut-out magazine letter on a little scrap of paper
function ransomTile(ch: string, seed: number, mode: "dark" | "pastel"): string {
  const r = rnd(seed);
  const papers = mode === "dark" ? ["#f4efe4", "#1d1b1f", "#d5d3cf", "#f6d3df", "#e8dfc4", "#ffffff"] : ["#f8e27a", "#bfe3a8", "#f7b6cb", "#cfe0f5", "#fbf8f2", "#f9c9a0"];
  const inks = mode === "dark" ? { light: "#1d1b1f", dark: "#f4efe4" } : null;
  const ci = Math.floor(r() * papers.length);
  const paper = papers[ci];
  const f = RANSOM_FONTS[Math.floor(r() * RANSOM_FONTS.length)];
  const j = () => (r() - 0.5) * 7;
  const pts = [[6 + j(), 6 + j()], [50 + j(), 4 + j() / 2], [94 + j(), 6 + j()], [95 + j() / 2, 60 + j()], [94 + j(), 114 + j()], [50 + j(), 116 + j() / 2], [6 + j(), 114 + j()], [5 + j() / 2, 60 + j()]];
  const dark = paper === "#1d1b1f";
  const penColors = ["#8a5fd0", "#e0539b", "#3f9a58", "#3d7fd0", "#e28a2a"];
  const fill = mode === "dark" ? (dark ? inks!.dark : inks!.light) : penColors[Math.floor(r() * penColors.length)];
  const svg = svgWrap(
    100,
    120,
    `<polygon points="${pts.map((p) => p.map((n) => n.toFixed(1)).join(",")).join(" ")}" fill="${paper}" stroke="#000" stroke-opacity=".18" stroke-width="1"/>
     <text x="50" y="${f.s > 78 ? 88 : 86}" text-anchor="middle" font-family="${f.f}" font-weight="${f.w}" font-size="${f.s}" fill="${fill}">${ch}</text>`,
  );
  return uri(svg);
}

function ransomRow(text: string, y: number, seed: number, mode: "dark" | "pastel", maxW = 520): Item[] {
  const letters = Array.from(text.toUpperCase()).filter((c) => /[A-Z0-9]/.test(c));
  const n = letters.length;
  if (!n) return [];
  const r = rnd(seed + 3);
  const tw = Math.min(92, maxW / n - 4);
  const total = n * (tw + 4);
  const x0 = (600 - total) / 2;
  return letters.map((ch, i) => ({
    id: `rn-${seed}-${i}`,
    kind: "img" as const,
    src: ransomTile(ch, seed * 31 + i * 7 + ch.charCodeAt(0), mode),
    x: x0 + i * (tw + 4) + (r() - 0.5) * 8,
    y: y + (r() - 0.5) * 16,
    w: tw,
    h: tw * 1.2,
    r: (r() - 0.5) * 16,
  }));
}

const txt = (id: string, t: string, font: Item["font"], size: number, color: string, x: number, y: number, w: number, r = 0, style?: Item["style"]): Item => ({
  id,
  kind: "text",
  text: t,
  font,
  size,
  color,
  style,
  x,
  y,
  w,
  h: size * 1.3,
  r,
});

function collageCover(name: string): Page {
  const letters = Array.from(name.toUpperCase()).filter((c) => /[A-Z0-9]/.test(c));
  const rows = letters.length > 8 ? [letters.slice(0, Math.ceil(letters.length / 2)).join(""), letters.slice(Math.ceil(letters.length / 2)).join("")] : [letters.join("")];
  const nameItems = rows.flatMap((row, i) => ransomRow(row, rows.length === 1 ? 285 : 245 + i * 120, 5 + i, "dark", rows.length === 1 ? 500 : 440));
  const fallback = letters.length ? [] : [txt("cv-name", name, "type", 52, "#f4efe4", 90, 300, 420, 0, "strip")];
  return {
    id: "cover",
    kind: "cover",
    bg: "color:#131114",
    items: [
      ...stickers(
        [
          ["paper-rose-wide", 330, 24, 270, 7],
          ["deco-discoball", 90, 48, 190, 0],
          ["stk-star-butter", 12, 40, 50, -8],
          ["stk-star-butter", 18, 128, 56, 10],
          ["stk-star-butter", 8, 222, 48, -4],
          ["stk-sparkle-butter", 500, 250, 60, 0],
          ["stk-sparkle-sky", 40, 420, 52, 0],
        ],
        "cv",
      ),
      txt("cv-q", "now my life is sweet like cinnamon", "type", 17, "#3b3128", 22, 22, 230, -4, "strip"),
      ...nameItems,
      ...fallback,
      txt("cv-sub", "daily journal", "type", 22, "#3b3128", 190, rows.length === 1 ? 420 : 470, 230, -2, "strip"),
      ...stickers(
        [
          ["shape-heart-rose", 14, 480, 230, -6],
          ["bow-0", 420, 440, 170, 12],
          ["deco-idcard", 130, 600, 380, 0],
        ],
        "cw",
      ),
      txt("cv-badge", "my little joys", "script", 30, "#ffffff", 56, 552, 150, -6),
      txt("cv-idname", name.toUpperCase(), "type", 17, "#7a3a52", 346, 676, 150, 0),
    ],
    updated: 0,
  };
}

function collageBack(name: string): Page {
  const goldStars: S[] = [
    ["stk-star-butter", 22, 40, 62, 10],
    ["stk-star-butter", 500, 60, 54, -12],
    ["stk-star-butter", 540, 250, 50, 8],
    ["stk-star-butter", 18, 330, 48, -6],
    ["stk-star-butter", 70, 560, 52, 14],
    ["stk-star-butter", 480, 520, 60, -8],
    ["stk-star-butter", 250, 690, 46, 6],
    ["stk-star-butter", 546, 640, 44, 10],
    ["stk-star-butter", 120, 110, 40, -10],
  ];
  return {
    id: "back",
    kind: "back",
    bg: "gingham-red",
    items: [
      ...stickers(goldStars, "bk"),
      ...ransomRow("THE", 190, 21, "pastel", 400),
      ...ransomRow("END", 340, 22, "pastel", 400),
      txt("bk-by", `made by ${name} ♡`, "type", 24, "#3b3128", 150, 560, 300, -2, "strip"),
      txt("bk-thx", "thanks for stopping by", "hand", 28, "#ffffff", 160, 620, 280, 1),
    ],
    updated: 0,
  };
}

export function makeCover(name: string, theme: CoverTheme = "collage"): Page {
  return theme === "collage" ? collageCover(name) : { ...classicCover(name, theme), updated: 0 };
}

export function makeBack(name: string, theme: CoverTheme = "collage"): Page {
  return theme === "collage" ? collageBack(name) : { ...classicBack(name, theme), updated: 0 };
}

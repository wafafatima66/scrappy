import { FontKey } from "./types";

export const FONT_CSS: Record<FontKey, string> = {
  hand: "var(--font-caveat), cursive",
  type: "var(--font-special), 'Courier New', monospace",
  serif: "var(--font-playfair), Georgia, serif",
  script: "var(--font-apple), cursive",
  marker: "var(--font-reenie), cursive",
  dance: "var(--font-dancing), cursive",
  brush: "var(--font-kaushan), cursive",
  neat: "var(--font-kalam), cursive",
  pacifico: "var(--font-pacifico), cursive",
  permanent: "var(--font-permanent), cursive",
  shadows: "var(--font-shadows), cursive",
  amatic: "var(--font-amatic), cursive",
  bebas: "var(--font-bebas), Impact, sans-serif",
  abril: "var(--font-abril), Georgia, serif",
  lobster: "var(--font-lobster), cursive",
  indie: "var(--font-indie), cursive",
  cormorant: "var(--font-cormorant), Georgia, serif",
  rocksalt: "var(--font-rocksalt), cursive",
};

export const FONT_LABELS: Record<FontKey, string> = {
  hand: "Handwritten",
  type: "Typewriter",
  serif: "Serif",
  script: "Script",
  marker: "Marker",
  dance: "Calligraphy",
  brush: "Brush script",
  neat: "Neat note",
  pacifico: "Retro script",
  permanent: "Bold marker",
  shadows: "Quick scribble",
  amatic: "Tall hand",
  bebas: "Poster caps",
  abril: "Fancy headline",
  lobster: "Lobster",
  indie: "Indie hand",
  cormorant: "Elegant serif",
  rocksalt: "Rough pen",
};

export const TEXT_COLORS = ["#2d2a33", "#6b5744", "#6a4c93", "#b5546a", "#4a6a4a", "#3d6a8a", "#f6efe0", "#ffffff", "#e0b878", "#f2a7b8", "#9dc8ec", "#a9d8b8"];

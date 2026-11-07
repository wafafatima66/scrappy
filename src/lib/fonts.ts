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
};

export const TEXT_COLORS = ["#2d2a33", "#6b5744", "#6a4c93", "#b5546a", "#4a6a4a", "#3d6a8a", "#f6efe0", "#ffffff", "#e0b878", "#f2a7b8", "#9dc8ec", "#a9d8b8"];

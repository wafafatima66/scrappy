import { FontKey } from "./types";

export const FONT_CSS: Record<FontKey, string> = {
  hand: "var(--font-caveat), cursive",
  type: "var(--font-special), 'Courier New', monospace",
  serif: "var(--font-playfair), Georgia, serif",
  script: "var(--font-apple), cursive",
  marker: "var(--font-reenie), cursive",
};

export const FONT_LABELS: Record<FontKey, string> = {
  hand: "Handwritten",
  type: "Typewriter",
  serif: "Serif",
  script: "Script",
  marker: "Marker",
};

export const TEXT_COLORS = ["#2d2a33", "#6b5744", "#6a4c93", "#b5546a", "#4a6a4a", "#3d6a8a", "#f6efe0", "#ffffff"];

import type { PhotoBg } from "./photoBg";

export const PAGE_W = 600;
export const PAGE_H = 800;

export type FontKey = "hand" | "type" | "serif" | "script" | "marker" | "dance" | "brush" | "neat" | "pacifico" | "permanent" | "shadows" | "amatic" | "bebas" | "abril" | "lobster" | "indie" | "cormorant" | "rocksalt";
export type TextStyle = "plain" | "strip" | "tag" | "shadow" | "highlight" | "outline" | "neon" | "retro" | "stamp" | "sticker" | "underline" | "label";
export type PhotoFrame = "polaroid" | "plain" | "torn";
export type EdgeKind = "torn" | "wavy" | "zigzag" | "scallop" | "perf" | "deckle";
export type PenKind = "pen" | "dots" | "dash" | "marker";

export interface Item {
  id: string;
  kind: "img" | "text" | "photo" | "draw";
  ref?: string; // catalog id (keeps saved pages small)
  src?: string; // pack url, date-stamp svg or photo url / data uri
  text?: string;
  font?: FontKey;
  color?: string;
  style?: TextStyle;
  frame?: PhotoFrame;
  x: number; // top-left
  y: number;
  w: number;
  h: number;
  r: number; // degrees
  flip?: boolean;
  flipV?: boolean; // flipped upside-down
  size?: number; // text font size
  accent?: string; // text shadow / highlight colour
  edge?: EdgeKind; // cut edge style
  clip?: number[]; // freehand cut: x,y pairs as 0..1 of the item box
  path?: string; // pen stroke: SVG path in item pixels
  pen?: PenKind;
  sw?: number; // pen width
  seed?: number;
  cut?: string; // photo with the background removed (transparent PNG)
  pbg?: PhotoBg; // what sits behind a cut-out photo
  outline?: boolean; // white sticker outline around a cut-out
}

export type PageKind = "cover" | "day" | "back";

export interface Page {
  id: string;
  kind?: PageKind;
  date?: string; // YYYY-MM-DD the page was started
  bg: string; // background id, or "color:#rrggbb"
  frame?: string; // page border id
  items: Item[];
  updated?: number;
}

// pages[0] is the cover, pages[last] the back cover, everything between is a day page
export interface Book {
  id: string;
  title: string;
  pages: Page[];
  updated: number;
}

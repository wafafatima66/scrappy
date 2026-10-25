export const PAGE_W = 600;
export const PAGE_H = 800;

export type FontKey = "hand" | "type" | "serif" | "script" | "marker";
export type TextStyle = "plain" | "strip" | "tag";
export type PhotoFrame = "polaroid" | "plain" | "torn";

export interface Item {
  id: string;
  kind: "img" | "text" | "photo";
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
  size?: number; // text font size
  seed?: number;
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

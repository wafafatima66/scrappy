export const PAGE_W = 600;
export const PAGE_H = 800;

export type FontKey = "hand" | "type" | "serif" | "script" | "marker";
export type TextStyle = "plain" | "strip" | "tag";
export type PhotoFrame = "polaroid" | "plain" | "torn";

export interface Item {
  id: string;
  kind: "img" | "text" | "photo";
  src?: string; // sticker url / data uri / photo data url
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

export interface Page {
  id: string;
  date?: string; // YYYY-MM-DD the page was started
  bg: string;
  items: Item[];
}

export interface Book {
  id: string;
  title: string;
  pages: Page[];
  updated: number;
}

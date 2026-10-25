import { BY_ID } from "./catalog";
import { uid } from "./store";
import { Item, Page } from "./types";

export const PROMPTS = [
  "What made you smile today?",
  "Something small you want to remember",
  "Your favourite meal this week",
  "A song stuck in your head",
  "Someone you're grateful for",
  "Where would you go right now?",
  "A colour that feels like today",
  "Three things on your desk",
  "A tiny win",
  "What did you learn lately?",
  "Your perfect lazy morning",
  "A place that feels like home",
];

export const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const todayPrompt = () => {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return PROMPTS[dayOfYear % PROMPTS.length];
};

// A fresh page for today: date, the daily prompt and a strip of tape on lined paper.
export function todayPage(): Page {
  const date = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const tape = BY_ID["tape-stripes-lilac"];
  const items: Item[] = [
    { id: uid(), kind: "text", text: date, font: "type", color: "#6b5744", size: 26, x: 90, y: 98, w: 420, h: 40, r: -1 },
  ];
  if (tape) items.push({ id: uid(), kind: "img", ref: tape.id, x: 190, y: 28, w: 220, h: (220 * tape.h) / tape.w, r: -2 });
  return { id: uid(), kind: "day", bg: "lined", items, date: todayKey(), updated: Date.now() };
}

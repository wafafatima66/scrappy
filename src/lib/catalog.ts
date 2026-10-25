import { EMOJI } from "./emoji";
import { PROCEDURAL, Sticker } from "./procedural";
import { PROCEDURAL2 } from "./procedural2";
import { PROCEDURAL3 } from "./procedural3";

export interface Entry extends Sticker {
  gen?: () => string; // regenerates src at add-time (date stamps)
  emoji?: string; // added as a text item instead of an image
}

const emojiEntries: Entry[] = EMOJI.map((e, i) => ({ id: `emoji-${i}`, cat: "emoji", label: e, src: "", w: 90, h: 80, emoji: e }));

export const ALL: Entry[] = [...PROCEDURAL, ...PROCEDURAL2, ...PROCEDURAL3];
export const BY_ID: Record<string, Entry> = Object.fromEntries(ALL.map((s) => [s.id, s]));
// old pages stored the data URI itself; map it back to an id so the cloud copy stays small
export const BY_SRC: Record<string, string> = Object.fromEntries(ALL.filter((s) => !s.gen).map((s) => [s.src, s.id]));

export interface CatDef {
  id: string;
  label: string;
}

export const ELEMENT_CATS: CatDef[] = [
  { id: "tape", label: "Washi tape" },
  { id: "paper", label: "Torn paper" },
  { id: "pattern", label: "Pattern & notes" },
  { id: "notes", label: "Sticky notes" },
  { id: "envelopes", label: "Envelopes" },
  { id: "tickets", label: "Tickets" },
  { id: "countries", label: "Country stamps" },
  { id: "datestamps", label: "Date stamps" },
  { id: "stamps", label: "Postage & seals" },
  { id: "clips", label: "Clips & pins" },
  { id: "flowers", label: "Flowers" },
  { id: "film", label: "Film strips" },
  { id: "lace", label: "Lace" },
  { id: "borders", label: "Borders & dividers" },
  { id: "shapes", label: "Shapes" },
  { id: "doodles", label: "Doodles" },
  { id: "fabric", label: "Fabric & ribbon" },
  { id: "tags", label: "Tags & labels" },
];

export const STICKER_CAT_DEFS: CatDef[] = [
  { id: "emoji", label: "Emoji" },
  { id: "hearts", label: "Hearts & stars" },
  { id: "nature", label: "Sky & nature" },
];

export interface Category {
  id: string;
  label: string;
  items: Entry[];
}

export const byCat = (cat: string): Entry[] => (cat === "emoji" ? emojiEntries : ALL.filter((s) => s.cat === cat));

export const ELEMENTS: Category[] = ELEMENT_CATS.map((c) => ({ ...c, items: byCat(c.id) }));
export const STICKERS: Category[] = STICKER_CAT_DEFS.map((c) => ({ ...c, items: byCat(c.id) }));

// ---- optional cutout packs (public/packs/manifest.json) ----
export interface PackItem {
  id: string;
  src: string;
  w: number;
  h: number;
  label?: string;
}
export interface Pack {
  id: string;
  name: string;
  items: PackItem[];
}

export async function loadPacks(): Promise<Pack[]> {
  try {
    const r = await fetch("/packs/manifest.json", { cache: "no-cache" });
    if (!r.ok) return [];
    const m = (await r.json()) as { packs: Pack[] };
    return m.packs ?? [];
  } catch {
    return [];
  }
}

export const packCategories = (packs: Pack[]): Category[] =>
  packs.map((p) => ({
    id: `pack-${p.id}`,
    label: p.name,
    items: p.items.map((i) => ({ id: `${p.id}-${i.id}`, cat: p.id, label: i.label ?? i.id, src: i.src, w: i.w, h: i.h })),
  }));

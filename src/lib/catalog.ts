import { EMOJI } from "./emoji";
import { PROCEDURAL, Sticker } from "./procedural";
import { PROCEDURAL2 } from "./procedural2";
import { PROCEDURAL3 } from "./procedural3";
import { PROCEDURAL4 } from "./procedural4";
import { PROCEDURAL5 } from "./procedural5";

export interface Entry extends Sticker {
  gen?: () => string; // regenerates src at add-time (date stamps)
  emoji?: string; // added as a text item instead of an image
  family?: string; // same design in other colours
  variant?: string; // this colour's name
}

const emojiEntries: Entry[] = EMOJI.map((e, i) => ({ id: `emoji-${i}`, cat: "emoji", label: e, src: "", w: 90, h: 80, emoji: e }));

export const ALL: Entry[] = [...PROCEDURAL, ...PROCEDURAL2, ...PROCEDURAL3, ...PROCEDURAL4, ...PROCEDURAL5];

// ---- colour families: the same design in several colours is shown once, then recoloured on the page ----
const COLOR_WORDS = new Set([
  "lavender", "lilac", "rose", "peach", "butter", "sage", "sky", "kraft", "cream", "parchment", "blush", "newsprint", "mustard",
  "brown", "plum", "ivory", "clay", "blue", "black", "gold", "gray", "grey", "sepia", "forest", "ink", "sand", "tan", "white",
  "mint", "crimson", "red", "teal", "navy", "purple", "ochre", "yellow", "pink", "green", "orange", "violet",
  "charcoal", "burgundy", "aubergine", "espresso", "slate", "wine",
]);
const NUM_FAMILY = /^(ribbon|bow|button|patch|clip|pin|daisy|sunflower|lavender|eucalyptus|fern|poppy|wildflowers|binder|peg|slide|instant|photo-corners|stk-rainbow|seal|postmark|jk-seal)-(\d+)$/;

function familyOf(id: string): { fam: string; v: string } | null {
  const n = id.match(NUM_FAMILY);
  if (n) return { fam: `${n[1]}-*`, v: n[2] };
  const d = id.match(/^(doodle-.+)-(\d)$/);
  if (d) return { fam: `${d[1]}-*`, v: d[2] };
  const st = id.match(/^(stamp-\d)-(\d)$/);
  if (st) return { fam: `${st[1]}-*`, v: st[2] };
  const t = id.split("-");
  for (let i = 1; i < t.length; i++) {
    if (COLOR_WORDS.has(t[i])) {
      const v = t[i];
      t[i] = "*";
      return { fam: t.join("-"), v };
    }
  }
  return null;
}

const FAMILIES = new Map<string, Entry[]>();
ALL.forEach((e) => {
  const f = familyOf(e.id);
  if (!f) return;
  e.family = f.fam;
  e.variant = f.v;
  FAMILIES.set(f.fam, [...(FAMILIES.get(f.fam) ?? []), e]);
});
// a family of one is just a normal element
ALL.forEach((e) => {
  if (e.family && (FAMILIES.get(e.family)?.length ?? 0) < 2) e.family = undefined;
});

export const variantsOf = (e: Entry | undefined): Entry[] => (e?.family ? (FAMILIES.get(e.family) ?? []) : []);
export const BY_ID: Record<string, Entry> = Object.fromEntries(ALL.map((s) => [s.id, s]));
// old pages stored the data URI itself; map it back to an id so the cloud copy stays small
// Pages saved before the clean-up may use ids that no longer exist (other orientations / ink colours):
// fall back to the closest surviving design.
export function findEntry(ref: string | undefined): Entry | undefined {
  if (!ref) return undefined;
  if (BY_ID[ref]) return BY_ID[ref];
  const m = ref.match(/^(jk-(?:corner-[a-z]+|grid-corner-[a-z]+))-(?:tl|tr|bl|br)(-.+)?$/);
  if (m) return ALL.find((e) => e.id.startsWith(`${m[1]}-`) && (m[2] ? e.id.endsWith(m[2]) : true));
  const ink = ref.match(/^(jk-.+?)-(?:black|gold|gray|brown)$/);
  if (ink) return BY_ID[`${ink[1]}-black`] ?? ALL.find((e) => e.id.startsWith(`${ink[1]}-`));
  return undefined;
}

export const BY_SRC: Record<string, string> = Object.fromEntries(ALL.filter((s) => !s.gen).map((s) => [s.src, s.id]));

export interface CatDef {
  id: string;
  label: string;
}

export const ELEMENT_CATS: CatDef[] = [
  { id: "tape", label: "Washi tape" },
  { id: "paper", label: "Torn paper & corners" },
  { id: "brush", label: "Brush strokes" },
  { id: "frames", label: "Photo frames" },
  { id: "borders", label: "Borders & dividers" },
  { id: "pattern", label: "Pattern & notes" },
  { id: "envelopes", label: "Envelopes" },
  { id: "tickets", label: "Tickets" },
  { id: "countries", label: "Country stamps" },
  { id: "datestamps", label: "Date stamps" },
  { id: "stamps", label: "Postage & seals" },
  { id: "film", label: "Film strips" },
  { id: "lace", label: "Lace" },
  { id: "doodles", label: "Doodles" },
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

// one flat list for the panel: no category tabs
export const ALL_ELEMENTS: Entry[] = ELEMENT_CATS.flatMap((c) => byCat(c.id));

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

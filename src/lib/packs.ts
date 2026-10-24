import { PROCEDURAL, STICKER_CATS, Sticker } from "./procedural";

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

// AI / photo cutout packs are dropped into public/packs/<id>/ and listed in public/packs/manifest.json
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

export interface Category {
  id: string;
  label: string;
  items: Sticker[];
}

export function buildCategories(packs: Pack[]): Category[] {
  const cats: Category[] = [];
  for (const p of packs) {
    cats.push({
      id: `pack-${p.id}`,
      label: p.name,
      items: p.items.map((i) => ({ id: `${p.id}-${i.id}`, cat: p.id, label: i.label ?? i.id, src: i.src, w: i.w, h: i.h })),
    });
  }
  for (const c of STICKER_CATS) cats.push({ id: c.id, label: c.label, items: PROCEDURAL.filter((s) => s.cat === c.id) });
  return cats;
}

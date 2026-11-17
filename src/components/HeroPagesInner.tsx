"use client";
import React, { useEffect, useMemo, useState } from "react";
import { makeBack, makeCover } from "@/lib/cover";
import { TEMPLATES } from "@/lib/templates";
import { Item } from "@/lib/types";
import { Page } from "@/lib/types";
import PageStatic from "./PageStatic";

const dayFrom = (i: number): Page => {
  const t = TEMPLATES[i % TEMPLATES.length];
  return { id: `demo-${t.id}`, kind: "day", bg: t.bg, items: t.build(), updated: 0 };
};

// Real Patchlet pages, drawn by the same code as the app.
const PALETTES = [
  ["#f9d5c0", "#e8a0a0", "#7b9fc4"],
  ["#cfe3f2", "#8fb7d8", "#f4c58a"],
  ["#e4d7f4", "#b49be0", "#f2a7b8"],
  ["#d8ecd4", "#9cc99a", "#f6dc9a"],
];
// a soft illustration that stands in for a photo in the previews
const samplePhoto = (n: number) => {
  const [a, b, c] = PALETTES[n % PALETTES.length];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 220' preserveAspectRatio='xMidYMid slice'><defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/></linearGradient></defs><rect width='300' height='220' fill='url(#g)'/><circle cx='${70 + ((n * 37) % 160)}' cy='70' r='28' fill='#fff7e0' opacity='.9'/><path d='M0 220 L0 150 Q70 100 130 150 T300 140 L300 220Z' fill='${c}'/><path d='M0 220 L0 180 Q90 140 170 185 T300 175 L300 220Z' fill='${b}' opacity='.8'/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
const LAYOUT_IDS = ["vlog", "booth", "friends", "olddays", "floral", "timeline"];

export default function HeroPagesInner({ mode }: { mode: "hero" | "gallery" | "layouts" }) {
  const [small, setSmall] = useState(false);
  useEffect(() => {
    const on = () => setSmall(window.innerWidth < 640);
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  const pages = useMemo(() => ({ cover: makeCover("Maya"), back: makeBack("Maya"), a: dayFrom(0), b: dayFrom(1), c: dayFrom(2) }), []);

  if (mode === "layouts") {
    const w = small ? 150 : 168;
    return (
      <div className="lp-layouts">
        {LAYOUT_IDS.map((id, n) => {
          const t = TEMPLATES.find((x) => x.id === id);
          if (!t) return null;
          let k = n;
          const items: Item[] = t.build().map((i) => (i.kind === "photo" && !i.src ? { ...i, src: samplePhoto(k++) } : i));
          const page: Page = { id: `lay-${id}`, kind: "day", bg: t.bg, items, updated: 0 };
          return (
            <figure key={id} className="lp-lay">
              <div className="lp-pg g">
                <PageStatic page={page} width={w} />
              </div>
              <figcaption>{t.label}</figcaption>
            </figure>
          );
        })}
      </div>
    );
  }
  if (mode === "hero") {
    const w = small ? 150 : 230;
    return (
      <div className="lp-fan" style={{ height: w * 1.333 + 40 }}>
        <div className="lp-pg p1">
          <PageStatic page={pages.cover} width={w} />
        </div>
        <div className="lp-pg p2">
          <PageStatic page={pages.a} width={w * 1.12} />
        </div>
        <div className="lp-pg p3">
          <PageStatic page={pages.back} width={w} />
        </div>
      </div>
    );
  }
  const w = small ? 210 : 250;
  return (
    <div className="lp-gallery">
      {[pages.cover, pages.a, pages.b, pages.c, pages.back].map((p, i) => (
        <div key={p.id} className="lp-pg g" style={{ transform: `rotate(${[-1.5, 1, -0.8, 1.4, -1][i]}deg)` }}>
          <PageStatic page={p} width={w} />
        </div>
      ))}
    </div>
  );
}

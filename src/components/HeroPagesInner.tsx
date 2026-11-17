"use client";
import React, { useEffect, useMemo, useState } from "react";
import { makeBack, makeCover } from "@/lib/cover";
import { TEMPLATES } from "@/lib/templates";
import { Page } from "@/lib/types";
import PageStatic from "./PageStatic";

const dayFrom = (i: number): Page => {
  const t = TEMPLATES[i % TEMPLATES.length];
  return { id: `demo-${t.id}`, kind: "day", bg: t.bg, items: t.build(), updated: 0 };
};

// Real Patchlet pages, drawn by the same code as the app.
export default function HeroPagesInner({ mode }: { mode: "hero" | "gallery" }) {
  const [small, setSmall] = useState(false);
  useEffect(() => {
    const on = () => setSmall(window.innerWidth < 640);
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  const pages = useMemo(() => ({ cover: makeCover("Maya"), back: makeBack("Maya"), a: dayFrom(0), b: dayFrom(1), c: dayFrom(2) }), []);

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

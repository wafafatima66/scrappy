"use client";
import React from "react";
import { bgCss } from "@/lib/backgrounds";
import { PAGE_H, PAGE_W, Page } from "@/lib/types";
import ItemBody, { itemStyle } from "./ItemBody";

// Non-interactive page, scaled to `width` px. Used for thumbnails, flipbook and export.
export default function PageStatic({ page, width, className }: { page: Page; width: number; className?: string }) {
  const k = width / PAGE_W;
  return (
    <div className={className} style={{ width, height: PAGE_H * k, overflow: "hidden", position: "relative", flexShrink: 0 }}>
      <div
        data-page-inner
        style={{ width: PAGE_W, height: PAGE_H, transform: `scale(${k})`, transformOrigin: "0 0", background: bgCss(page.bg), backgroundSize: "100% 100%", position: "relative" }}
      >
        {page.items.map((it) => (
          <div key={it.id} style={itemStyle(it)}>
            <ItemBody item={it} />
          </div>
        ))}
      </div>
    </div>
  );
}

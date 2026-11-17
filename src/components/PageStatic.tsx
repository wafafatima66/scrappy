"use client";
import React from "react";
import { pageBackground } from "@/lib/pagebg";
import { PAGE_H, PAGE_W, Page } from "@/lib/types";
import ItemBody, { itemStyle } from "./ItemBody";

// Non-interactive page, scaled to `width` px. Used for thumbnails, flipbook and export.
export default function PageStatic({ page, width, className }: { page: Page; width: number; className?: string }) {
  const k = width / PAGE_W;
  if (page.flat) {
    return (
      <div className={className} style={{ width, height: PAGE_H * k, overflow: "hidden", position: "relative", flexShrink: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={page.flat} alt="" draggable={false} style={{ width: "100%", height: "100%", display: "block", objectFit: "fill" }} />
      </div>
    );
  }
  return (
    <div className={className} style={{ width, height: PAGE_H * k, overflow: "hidden", position: "relative", flexShrink: 0 }}>
      <div
        data-page-inner
        style={{ width: PAGE_W, height: PAGE_H, transform: `scale(${k})`, transformOrigin: "0 0", background: pageBackground(page), position: "relative" }}
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

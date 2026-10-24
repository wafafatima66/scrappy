import React from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { toPng } from "html-to-image";
import PageStatic from "@/components/PageStatic";
import { PAGE_H, PAGE_W, Book, Page } from "./types";

export async function pageToPng(page: Page, ratio = 2): Promise<string> {
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;left:-99999px;top:0;pointer-events:none;";
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    flushSync(() => root.render(<PageStatic page={page} width={PAGE_W} />));
    const imgs = Array.from(host.querySelectorAll("img"));
    await Promise.all(imgs.map((i) => i.decode().catch(() => undefined)));
    await document.fonts.ready;
    await new Promise((r) => setTimeout(r, 120));
    const node = host.firstElementChild as HTMLElement;
    // first call primes font/image embedding, second is the keeper
    await toPng(node, { pixelRatio: 1, width: PAGE_W, height: PAGE_H }).catch(() => undefined);
    return await toPng(node, { pixelRatio: ratio, width: PAGE_W, height: PAGE_H });
  } finally {
    root.unmount();
    host.remove();
  }
}

export function download(url: string, name: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "scrapbook";

export async function exportPagePng(book: Book, page: Page, index: number) {
  download(await pageToPng(page, 2), `${slug(book.title)}-page-${index + 1}.png`);
}

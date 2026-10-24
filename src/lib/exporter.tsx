import React from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { toPng } from "html-to-image";
import PageStatic from "@/components/PageStatic";
import { PAGE_H, PAGE_W, Book, Page } from "./types";
import { coverPage } from "./cover";

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

export async function exportBookPdf(book: Book, onProgress?: (n: number, total: number) => void) {
  const { jsPDF } = await import("jspdf");
  const pages = [coverPage(book), ...book.pages];
  const pdf = new jsPDF({ unit: "px", format: [PAGE_W, PAGE_H], orientation: "portrait", compress: true });
  for (let i = 0; i < pages.length; i++) {
    onProgress?.(i + 1, pages.length);
    const png = await pageToPng(pages[i], 2);
    if (i > 0) pdf.addPage([PAGE_W, PAGE_H], "portrait");
    pdf.addImage(png, "PNG", 0, 0, PAGE_W, PAGE_H, undefined, "FAST");
  }
  pdf.save(`${slug(book.title)}.pdf`);
}

// 1080x1920 story card: the page tilted on a soft backdrop, ready for Instagram / WhatsApp status
export async function exportStory(book: Book, page: Page, index: number) {
  const png = await pageToPng(page, 2);
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = png;
  });
  const c = document.createElement("canvas");
  c.width = 1080;
  c.height = 1920;
  const x = c.getContext("2d")!;
  const g = x.createLinearGradient(0, 0, 1080, 1920);
  g.addColorStop(0, "#efe6fb");
  g.addColorStop(0.55, "#f7e9ee");
  g.addColorStop(1, "#ead9f5");
  x.fillStyle = g;
  x.fillRect(0, 0, 1080, 1920);
  const w = 800;
  const h = (w * PAGE_H) / PAGE_W;
  x.save();
  x.translate(540, 900);
  x.rotate(-0.03);
  x.shadowColor = "rgba(60,40,80,.35)";
  x.shadowBlur = 60;
  x.shadowOffsetY = 24;
  x.drawImage(img, -w / 2, -h / 2, w, h);
  x.restore();
  x.fillStyle = "#4a3b63";
  x.textAlign = "center";
  x.font = "600 54px Georgia, serif";
  x.fillText(book.title, 540, 1650);
  x.font = "34px Georgia, serif";
  x.fillStyle = "#8a7ba3";
  x.fillText(`page ${index + 1}  ·  made with Scrappy`, 540, 1710);
  download(c.toDataURL("image/png"), `${slug(book.title)}-story-${index + 1}.png`);
}

export async function sharePage(book: Book, page: Page) {
  const png = await pageToPng(page, 2);
  const blob = await (await fetch(png)).blob();
  const file = new File([blob], `${slug(book.title)}.png`, { type: "image/png" });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    await nav.share({ files: [file], title: book.title });
    return true;
  }
  download(png, `${slug(book.title)}.png`);
  return false;
}

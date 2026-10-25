import React from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { toPng } from "html-to-image";
import PageStatic from "@/components/PageStatic";
import { beforeExport } from "./ads";
import { isNative, saveFile } from "./native";
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
    await new Promise((r) => setTimeout(r, 150));
    const node = host.firstElementChild as HTMLElement;
    // first call primes font/image embedding, second is the keeper
    await toPng(node, { pixelRatio: 1, width: PAGE_W, height: PAGE_H }).catch(() => undefined);
    return await toPng(node, { pixelRatio: ratio, width: PAGE_W, height: PAGE_H });
  } finally {
    root.unmount();
    host.remove();
  }
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "patchlet";

export async function exportPagePng(book: Book, page: Page, index: number) {
  await beforeExport("image");
  await saveFile(await pageToPng(page, 2), `${slug(book.title)}-page-${index + 1}.png`, "Save page as image");
}

async function buildPdf(pages: Page[], onProgress?: (n: number, total: number) => void) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "px", format: [PAGE_W, PAGE_H], orientation: "portrait", compress: true });
  for (let i = 0; i < pages.length; i++) {
    onProgress?.(i + 1, pages.length);
    const png = await pageToPng(pages[i], 2);
    if (i > 0) pdf.addPage([PAGE_W, PAGE_H], "portrait");
    pdf.addImage(png, "PNG", 0, 0, PAGE_W, PAGE_H, undefined, "FAST");
  }
  return pdf;
}

export async function exportPdf(book: Book, pages: Page[], name: string, onProgress?: (n: number, total: number) => void) {
  await beforeExport("pdf");
  const pdf = await buildPdf(pages, onProgress);
  await saveFile(pdf.output("blob"), `${slug(name)}.pdf`, "Save as PDF");
  void book;
}

// Print: browsers open the print dialog; in the Android app the PDF opens in the share sheet,
// where "Print" is one of the options.
export async function printPages(pages: Page[], name: string, onProgress?: (n: number, total: number) => void) {
  await beforeExport("print");
  if (isNative()) {
    const pdf = await buildPdf(pages, onProgress);
    await saveFile(pdf.output("blob"), `${slug(name)}-print.pdf`, "Print");
    return;
  }
  const urls: string[] = [];
  for (let i = 0; i < pages.length; i++) {
    onProgress?.(i + 1, pages.length);
    urls.push(await pageToPng(pages[i], 2));
  }
  const frame = document.createElement("iframe");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  document.body.appendChild(frame);
  const doc = frame.contentDocument!;
  doc.open();
  doc.write(
    `<!doctype html><title>${name}</title><style>@page{size:A4;margin:0}html,body{margin:0}img{display:block;width:210mm;height:280mm;object-fit:contain;page-break-after:always}</style>${urls.map((u) => `<img src="${u}">`).join("")}`,
  );
  doc.close();
  await Promise.all(Array.from(doc.images).map((i) => i.decode().catch(() => undefined)));
  frame.contentWindow!.focus();
  frame.contentWindow!.print();
  setTimeout(() => frame.remove(), 60000);
}

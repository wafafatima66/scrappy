"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadLocalAvatar, useSession } from "@/lib/auth";
import { BACKGROUNDS, PLAIN } from "@/lib/backgrounds";
import { addDayPage } from "@/lib/book";
import { loadBookFor } from "@/lib/bookload";
import { ALL_ELEMENTS, BY_ID, ELEMENTS, Entry, Pack, STICKERS, Category, findEntry, loadPacks, packCategories, variantsOf } from "@/lib/catalog";
import { COVER_THEMES, CoverTheme, makeBack, makeCover } from "@/lib/cover";
import { todayKey, todayPage } from "@/lib/daily";
import { exportPagePng, exportPdf, printPages, sharePageImage } from "@/lib/exporter";
import { isNative } from "@/lib/native";
import { FONT_CSS, FONT_LABELS, TEXT_COLORS } from "@/lib/fonts";
import { FRAMES } from "@/lib/frames";
import { scheduleStreakReminders } from "@/lib/notify";
import { pageBackground } from "@/lib/pagebg";
import { markDeleted, readStreak, saveBook, uid } from "@/lib/store";
import { autoCutout, bakeLasso, smallPhoto } from "@/lib/cutout";
import { PBG_COLORS, PBG_GRADIENTS, PhotoBg } from "@/lib/photoBg";
import { pushBook } from "@/lib/sync";
import { TEMPLATES } from "@/lib/templates";
import { Book, EdgeKind, FontKey, Item, PAGE_H, PAGE_W, Page, PenKind, PhotoFrame, TextStyle } from "@/lib/types";
import Avatar from "./Avatar";
import EditorCanvas, { CanvasMode, Pt } from "./EditorCanvas";
import Flipbook from "./Flipbook";
import PageStatic from "./PageStatic";

type Tab = "elements" | "stickers" | "text" | "photos" | "draw" | "edit" | "paper";

const PEN_COLORS = ["#1f1d1f", "#6b4a2e", "#c9a24a", "#8b8b92", "#b5546a", "#6a4c93", "#3d6a8a", "#4a6a4a", "#ffffff", "#f4efe6"];
const ACCENTS = ["#e3b97a", "#f4c9aa", "#f0c3ca", "#cbdbbb", "#c9deec", "#d9cdf0", "#f6e08f", "#2d2a33"];
const EDGES: [EdgeKind | "none", string][] = [
  ["none", "Straight"],
  ["torn", "Torn"],
  ["deckle", "Deckle"],
  ["wavy", "Wavy"],
  ["zigzag", "Zigzag"],
  ["scallop", "Scallop"],
  ["perf", "Stamp edge"],
];

// pen points -> smooth SVG path
function smoothPath(pts: Pt[]) {
  if (pts.length < 3) return `M${pts[0][0]} ${pts[0][1]}L${pts[pts.length - 1][0]} ${pts[pts.length - 1][1]}`;
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
    const my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += `Q${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  const l = pts[pts.length - 1];
  return d + `L${l[0].toFixed(1)} ${l[1].toFixed(1)}`;
}

const jitter = (n: number) => (Math.random() - 0.5) * n;

async function fileToPhoto(file: File): Promise<{ src: string; aspect: number }> {
  const bmp = await createImageBitmap(file);
  const max = 1100;
  const sc = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * sc);
  c.height = Math.round(bmp.height * sc);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return { src: c.toDataURL("image/jpeg", 0.86), aspect: c.height / c.width };
}

const photoHeight = (w: number, aspect: number, frame: PhotoFrame) => (frame === "polaroid" ? w * 0.88 * aspect + w * 0.26 : w * aspect);

export default function EditorApp() {
  const router = useRouter();
  const pageParam = useSearchParams().get("p");
  const s = useSession();
  const [book, setBook] = useState<Book | null>(null);
  const [pageIdx, setPageIdx] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("elements");
  const [panelOpen, setPanelOpen] = useState(true);
  const [narrow, setNarrow] = useState(false);
  const [catEl, setCatEl] = useState(ELEMENTS[0].id);
  const [catSt, setCatSt] = useState(STICKERS[0].id);
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(96);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [draft, setDraft] = useState<{ text: string; font: FontKey; color: string; style: TextStyle; accent: string }>({ text: "", font: "hand", color: "#2d2a33", style: "plain", accent: "#e3b97a" });
  const [pen, setPen] = useState<{ kind: PenKind; color: string; width: number }>({ kind: "pen", color: "#1f1d1f", width: 3 });
  const [cutting, setCutting] = useState(false);
  const [showFlip, setShowFlip] = useState(false);
  const [menu, setMenu] = useState(false);
  const [busy, setBusy] = useState("");
  const [toast, setToast] = useState("");
  const [area, setArea] = useState({ w: 0, h: 0 });
  const past = useRef<Page[][]>([]);
  const future = useRef<Page[][]>([]);
  const [, bump] = useState(0);
  const areaRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const bgFileRef = useRef<HTMLInputElement>(null);
  const dragY = useRef<number | null>(null);

  // ---- responsive: bottom sheet on phones / tablets, sidebar on laptops ----
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 979px)");
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // ---- load ----
  useEffect(() => {
    if (s.status === "out") router.replace("/");
    if (s.status !== "in") return;
    loadLocalAvatar();
    loadPacks().then(setPacks);
    loadBookFor(s).then((b) => {
      let cur = b;
      let at = -1;
      if (pageParam === "cover") at = 0;
      else if (pageParam === "back") at = b.pages.length - 1;
      else if (pageParam) at = b.pages.findIndex((p) => p.id === pageParam);
      if (at < 0) at = b.pages.findIndex((p) => p.kind === "day" && p.date === todayKey());
      if (at < 0) {
        cur = addDayPage(b, todayPage());
        at = cur.pages.length - 2; // just before the back cover
      }
      loaded.current = false;
      setBook(cur);
      setPageIdx(at);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.status, s.uid, pageParam]);

  // ---- autosave (device now, cloud a moment later) ----
  const bookRef = useRef<Book | null>(null);
  bookRef.current = book;
  useEffect(() => {
    if (!book) return;
    if (!loaded.current) {
      loaded.current = true;
      return;
    }
    const t = setTimeout(async () => {
      await saveBook(book);
      const done = book.pages.some((p) => p.kind === "day" && p.date === todayKey() && p.items.length > 0);
      void scheduleStreakReminders({ name: s.name, streak: readStreak().count, doneToday: done });
    }, 500);
    const c = s.uid
      ? setTimeout(async () => {
          try {
            const swapped = await pushBook(s.uid as string, book);
            if (Object.keys(swapped).length) {
              // photos now live in the cloud: swap their data URIs for URLs, but only where nothing changed meanwhile
              const sw = (v?: string) => (v && swapped[v] ? swapped[v] : v);
              setBook((b) =>
                b
                  ? {
                      ...b,
                      pages: b.pages.map((p) => ({
                        ...p,
                        items: p.items.map((i) => (i.kind === "photo" ? { ...i, src: sw(i.src), cut: sw(i.cut), pbg: i.pbg?.k === "photo" ? { ...i.pbg, v: sw(i.pbg.v) } : i.pbg } : i)),
                      })),
                    }
                  : b,
              );
            }
          } catch {
            /* offline: it will sync next time */
          }
        }, 2500)
      : null;
    return () => {
      clearTimeout(t);
      if (c) clearTimeout(c);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book]);

  // ---- canvas fit ----
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setArea({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setArea({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, [book === null]);

  const elementCats: Category[] = useMemo(() => ELEMENTS, []);
  const stickerCats: Category[] = useMemo(() => [...STICKERS, ...packCategories(packs)], [packs]);

  const note = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 2400);
  };

  const idx = book ? Math.min(pageIdx, book.pages.length - 1) : 0;
  const page = book?.pages[idx];

  // ---- state helpers ----
  const setPages = useCallback((fn: (pages: Page[]) => Page[]) => {
    setBook((b) => (b ? { ...b, pages: fn(b.pages), updated: Date.now() } : b));
  }, []);

  const patchPage = useCallback(
    (pid: string, p: Partial<Page>) => setPages((ps) => ps.map((x) => (x.id === pid ? { ...x, ...p, updated: Date.now() } : x))),
    [setPages],
  );

  const snapshot = useCallback(() => {
    setBook((b) => {
      if (b && past.current[past.current.length - 1] !== b.pages) {
        past.current.push(b.pages);
        if (past.current.length > 60) past.current.shift();
        future.current = [];
        bump((n) => n + 1);
      }
      return b;
    });
  }, []);

  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    setBook((b) => {
      if (b) future.current.push(b.pages);
      return b ? { ...b, pages: prev, updated: Date.now() } : b;
    });
    setSelectedId(null);
    bump((n) => n + 1);
  }, []);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    setBook((b) => {
      if (b) past.current.push(b.pages);
      return b ? { ...b, pages: next, updated: Date.now() } : b;
    });
    setSelectedId(null);
    bump((n) => n + 1);
  }, []);

  const setItems = useCallback(
    (items: Item[]) => {
      if (!book) return;
      patchPage(book.pages[Math.min(pageIdx, book.pages.length - 1)].id, { items });
    },
    [book, pageIdx, patchPage],
  );

  const selected = page?.items.find((i) => i.id === selectedId) ?? null;

  const patchSelected = (p: Partial<Item>) => {
    if (!page || !selected) return;
    setItems(page.items.map((i) => (i.id === selected.id ? { ...i, ...p } : i)));
  };

  const addItem = (it: Omit<Item, "id" | "x" | "y" | "r"> & { r?: number }) => {
    if (!page) return;
    snapshot();
    const item: Item = {
      ...it,
      id: uid(),
      x: PAGE_W / 2 - it.w / 2 + jitter(90),
      y: PAGE_H / 2 - it.h / 2 + jitter(160),
      r: it.r ?? jitter(12),
      seed: Math.floor(Math.random() * 1000),
    };
    setItems([...page.items, item]);
    setSelectedId(item.id);
    return item;
  };

  const deleteItem = (iid: string) => {
    if (!page) return;
    snapshot();
    setItems(page.items.filter((i) => i.id !== iid));
    setSelectedId(null);
  };

  const addEntry = (e: Entry) => {
    if (e.emoji) {
      addItem({ kind: "text", text: e.emoji, font: "hand", color: "#2d2a33", size: 72, w: 110, h: 90, r: jitter(16) });
    } else if (e.gen) {
      addItem({ kind: "img", ref: e.id, src: e.gen(), w: e.w, h: e.h });
    } else if (BY_ID[e.id]) {
      addItem({ kind: "img", ref: e.id, w: e.w, h: e.h });
    } else {
      addItem({ kind: "img", src: e.src, w: e.w, h: e.h });
    }
  };

  // ---- text ----
  const textTarget = selected?.kind === "text" ? selected : null;
  const form = textTarget
    ? { text: textTarget.text ?? "", font: textTarget.font ?? "hand", color: textTarget.color ?? "#2d2a33", style: textTarget.style ?? "plain", accent: textTarget.accent ?? "#e3b97a" }
    : draft;
  const setForm = (p: Partial<typeof draft>) => {
    if (textTarget) patchSelected(p as Partial<Item>);
    else setDraft((d) => ({ ...d, ...p }));
  };
  const addText = () => {
    if (!draft.text.trim()) return;
    addItem({ kind: "text", text: draft.text, font: draft.font, color: draft.color, style: draft.style, accent: draft.accent, size: draft.font === "script" ? 30 : draft.font === "brush" || draft.font === "dance" ? 52 : 38, w: 260, h: 60 });
    setDraft((d) => ({ ...d, text: "" }));
  };

  // ---- photos ----
  const onFiles = async (files: FileList | null) => {
    if (!files || !page) return;
    setBusy("Adding photos…");
    try {
      for (const f of Array.from(files)) {
        if (!f.type.startsWith("image/")) continue;
        const { src, aspect } = await fileToPhoto(f);
        const w = 230;
        addItem({ kind: "photo", src, frame: "polaroid", w, h: photoHeight(w, aspect, "polaroid") });
      }
    } finally {
      setBusy("");
      if (fileRef.current) fileRef.current.value = "";
    }
  };
  const setFrame = (frame: PhotoFrame) => {
    if (!selected || selected.kind !== "photo") return;
    const old = selected.frame ?? "polaroid";
    const aspect = old === "polaroid" ? (selected.h - selected.w * 0.26) / (selected.w * 0.88) : selected.h / selected.w;
    snapshot();
    patchSelected({ frame, h: photoHeight(selected.w, aspect, frame) });
  };

  // ---- pages ----
  const addPage = () => {
    if (!book || !page) return;
    snapshot();
    const base = page.kind === "day" ? page.bg : "lined";
    const np: Page = { id: uid(), kind: "day", bg: base, items: [], updated: Date.now(), date: todayKey() };
    setBook((b) => (b ? addDayPage(b, np) : b));
    setPageIdx(book.pages.length - 1);
    setSelectedId(null);
  };

  // delete the current day page (the cover and end page can't be deleted)
  const deletePage = () => {
    if (!book || !page || page.kind !== "day") return;
    if (!confirm("Delete this page? This can't be undone.")) return;
    markDeleted(s.uid ?? "local", { id: page.id, photos: page.items.filter((i) => i.kind === "photo").map((i) => i.id) });
    // older history snapshots still contain the page, so start fresh
    past.current = [];
    future.current = [];
    setBook((b) => (b ? { ...b, pages: b.pages.filter((p) => p.id !== page.id), updated: Date.now() } : b));
    setPageIdx(Math.max(1, idx - 1));
    setSelectedId(null);
    bump((n) => n + 1);
    note("Page deleted");
  };

  const restyleCover = (theme: CoverTheme) => {
    if (!page || !confirm("Replace this page with a fresh design? Your current items on it will be removed.")) return;
    snapshot();
    const fresh = page.kind === "back" ? makeBack(s.name, theme) : makeCover(s.name, theme);
    patchPage(page.id, { items: fresh.items, bg: fresh.bg, frame: undefined });
    setSelectedId(null);
  };

  const applyTemplate = (id: string) => {
    const t = TEMPLATES.find((x) => x.id === id);
    if (!t || !page) return;
    if (page.items.length && !confirm("This replaces everything on the page with the layout. Continue?")) return;
    snapshot();
    patchPage(page.id, { items: t.build(), bg: t.bg, frame: undefined });
    setSelectedId(null);
  };

  // layering: items keep their order; these move one item up or down the pile
  const reorder = (how: "up" | "down" | "front" | "back") => {
    if (!page || !selected) return;
    snapshot();
    const arr = [...page.items];
    const i = arr.findIndex((x) => x.id === selected.id);
    const [it] = arr.splice(i, 1);
    const j = how === "front" ? arr.length : how === "back" ? 0 : how === "up" ? Math.min(arr.length, i + 1) : Math.max(0, i - 1);
    arr.splice(j, 0, it);
    setItems(arr);
  };

  // patch one item by id, even after an await (only touches the page that holds it)
  const patchItemById = (id: string, patch: Partial<Item>) =>
    setBook((b) =>
      b
        ? {
            ...b,
            pages: b.pages.map((p) => (p.items.some((i) => i.id === id) ? { ...p, updated: Date.now(), items: p.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) } : p)),
          }
        : b,
    );

  const aspectOf = async (src: string) => {
    const im = new Image();
    im.src = src;
    await im.decode();
    return im.naturalHeight / im.naturalWidth;
  };

  // photos are cut at their own proportions, so drop the polaroid padding first
  const plainPhoto = async (it: Item) => {
    if (it.frame === "plain" && !it.cut) return;
    const a = await aspectOf(it.cut ?? it.src!);
    patchItemById(it.id, { frame: "plain", h: it.w * a });
  };

  const runAutoCutout = async () => {
    if (!selected || selected.kind !== "photo" || !selected.src) return;
    const it = selected;
    setBusy("Cutting out…");
    try {
      const png = await autoCutout(it.src!, (t, p) => setBusy(p !== undefined && p > 0 ? `${t} ${Math.round(p)}%` : t));
      const a = await aspectOf(png);
      snapshot();
      patchItemById(it.id, { cut: png, frame: "plain", h: it.w * a, pbg: undefined, edge: undefined, clip: undefined });
      note("Done! Pick a new background below.");
    } catch (e) {
      note(e instanceof Error ? e.message : "The cutout didn't work. Check your internet connection and try again.");
    } finally {
      setBusy("");
    }
  };

  const startDrawnCut = async () => {
    if (!selected) return;
    if (selected.kind === "photo") await plainPhoto(selected);
    setCutting(true);
  };

  const setPbg = (pbg: PhotoBg | undefined) => {
    if (!selected) return;
    snapshot();
    patchSelected({ pbg });
  };

  const pickBgPhoto = async (f: File | undefined) => {
    if (!f) return;
    setBusy("Adding background…");
    try {
      setPbg({ k: "photo", v: await smallPhoto(f) });
    } finally {
      setBusy("");
      if (bgFileRef.current) bgFileRef.current.value = "";
    }
  };

  const setEdge = (e: EdgeKind | "none") => {
    if (!selected) return;
    snapshot();
    patchSelected({ edge: e === "none" ? undefined : e, clip: undefined, seed: selected.seed ?? Math.floor(Math.random() * 1000) });
  };
  const clearCut = () => {
    if (!selected) return;
    snapshot();
    patchSelected({ edge: undefined, clip: undefined });
  };

  // pen stroke -> a movable item (so it can be resized, moved or deleted like anything else)
  const onStroke = (pts: Pt[]) => {
    if (!page) return;
    const pad = pen.width * (pen.kind === "marker" ? 3.2 : 1) + 6;
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const minX = Math.min(...xs) - pad;
    const minY = Math.min(...ys) - pad;
    const w = Math.max(14, Math.max(...xs) + pad - minX);
    const h = Math.max(14, Math.max(...ys) + pad - minY);
    const rel = pts.map((p) => [p[0] - minX, p[1] - minY] as Pt);
    const item: Item = { id: uid(), kind: "draw", x: minX, y: minY, w, h, r: 0, path: smoothPath(rel), color: pen.color, pen: pen.kind, sw: pen.width };
    snapshot();
    setItems([...page.items, item]);
  };

  // freehand scissors: the drawn loop becomes the new outline of the selected item
  const onCutPath = (pts: Pt[]) => {
    setCutting(false);
    if (!selected || selected.kind === "text") return;
    const cx = selected.x + selected.w / 2;
    const cy = selected.y + selected.h / 2;
    const a = (-selected.r * Math.PI) / 180;
    const clamp = (v: number) => Math.min(1, Math.max(0, v));
    const step = Math.max(1, Math.ceil(pts.length / 140));
    const clip: number[] = [];
    for (let i = 0; i < pts.length; i += step) {
      const dx = pts[i][0] - cx;
      const dy = pts[i][1] - cy;
      clip.push(clamp((dx * Math.cos(a) - dy * Math.sin(a) + selected.w / 2) / selected.w), clamp((dx * Math.sin(a) + dy * Math.cos(a) + selected.h / 2) / selected.h));
    }
    if (selected.kind === "photo" && selected.src) {
      const it = selected;
      setBusy("Cutting…");
      bakeLasso(it.src!, clip)
        .then((png) => {
          snapshot();
          patchItemById(it.id, { cut: png, pbg: undefined, edge: undefined, clip: undefined });
          note("Cut! Now choose a background below.");
        })
        .catch((e) => note(e instanceof Error ? e.message : "That cut didn't work."))
        .finally(() => setBusy(""));
      return;
    }
    snapshot();
    patchSelected({ clip, edge: undefined });
    note("Cut! Use Undo cut in the Edit tab to bring it back.");
  };

  // ---- export ----
  const run = async (label: string, fn: () => Promise<unknown>, done?: string | ((r: unknown) => string)) => {
    setMenu(false);
    setSelectedId(null);
    setBusy(label);
    try {
      await new Promise((r) => setTimeout(r, 60));
      const r = await fn();
      if (done) note(typeof done === "function" ? done(r) : done);
    } catch (e) {
      note(`That didn't work: ${e instanceof Error ? e.message : e}`);
    } finally {
      setBusy("");
    }
  };

  // ---- keyboard ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      } else if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        deleteItem(selectedId);
      } else if (selected && e.key.startsWith("Arrow")) {
        e.preventDefault();
        const d = e.shiftKey ? 10 : 2;
        patchSelected({
          x: selected.x + (e.key === "ArrowRight" ? d : e.key === "ArrowLeft" ? -d : 0),
          y: selected.y + (e.key === "ArrowDown" ? d : e.key === "ArrowUp" ? -d : 0),
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!book || !page) return <div className="center-msg">Opening today’s page…</div>;

  const k = Math.max(0.2, Math.min((area.w - 24) / PAGE_W, (area.h - 16) / PAGE_H));
  const q = query.trim().toLowerCase();
  const isStickers = tab === "stickers";
  const cats = isStickers ? stickerCats : elementCats;
  const catId = isStickers ? catSt : catEl;
  const activeCat = cats.find((c) => c.id === catId) ?? cats[0];
  const searchPool = isStickers ? stickerCats : [...elementCats];
  const pool: Entry[] = q ? ALL_ELEMENTS.filter((e) => e.label.toLowerCase().includes(q) || e.id.includes(q)) : ALL_ELEMENTS;
  const shown = pool.slice(0, limit);

  const pageLabel = (p: Page, i: number) => (p.kind === "cover" ? "Cover" : p.kind === "back" ? "End" : String(i));
  const title = page.kind === "cover" ? "Front cover" : page.kind === "back" ? "End page" : page.date === todayKey() ? "Today’s page" : `Page ${idx}`;

  const collapseForEditing = () => {
    if (narrow) setPanelOpen(false);
  };
  const mode: CanvasMode = cutting ? "cut" : tab === "draw" ? "draw" : "edit";
  const tabs: [Tab, string, string][] = [
    ["elements", "✦", "Elements"],
    ["text", "Aa", "Text"],
    ["photos", "🖼", "Photos"],
    ["draw", "✎", "Draw"],
    ["edit", "✂", "Edit"],
    ["paper", "▤", "Paper"],
  ];

  return (
    <div className="editor">
      <header className="ed-top">
        <Link href="/" className="btn round" aria-label="Back to home" title="Home">
          ‹
        </Link>
        <div className="ed-title">
          <b>{s.name}</b>
          <small>{title}</small>
        </div>
        <button className="btn round" onClick={undo} disabled={!past.current.length} aria-label="Undo" title="Undo (Ctrl+Z)">
          ↶
        </button>
        <button className="btn round" onClick={redo} disabled={!future.current.length} aria-label="Redo" title="Redo">
          ↷
        </button>
        <button
          className="btn primary"
          onClick={() => {
            setSelectedId(null);
            setShowFlip(true);
          }}
        >
          📖 <span className="hide-sm">Flip</span>
        </button>
        <div className="menu-wrap">
          <button className="btn" onClick={() => setMenu((m) => !m)} aria-haspopup="menu" aria-expanded={menu}>
            ⬇ <span className="hide-sm">Save</span>
          </button>
          {menu && (
            <>
              <div className="menu-shield" onClick={() => setMenu(false)} />
              <div className="menu" role="menu">
                <button onClick={() => run("Saving image…", () => exportPagePng(book, page, idx), (r) => (!isNative() ? "Saved as an image" : r === "saved" ? "Saved to your Photos (Patchlet album)" : "Image ready"))}>🖼 Save page as image</button>
                <button onClick={() => run("Getting ready to share…", () => sharePageImage(book, page, idx))}>📤 Share page…</button>
                <button onClick={() => run("Making PDF…", () => exportPdf(book, [page], `${book.title}-page-${idx}`), (r) => (!isNative() ? "PDF saved" : r === "saved" ? "PDF saved in Documents/Patchlet" : "PDF ready"))}>📄 Save page as PDF</button>
                <button
                  onClick={() => run("Building PDF…", () => exportPdf(book, book.pages, book.title, (n, t) => setBusy(`Building PDF ${n}/${t}…`)), (r) => (!isNative() ? "PDF saved" : r === "saved" ? "PDF saved in Documents/Patchlet" : "PDF ready"))}
                >
                  📚 Save whole book as PDF
                </button>
                <button onClick={() => run("Preparing print…", () => printPages([page], book.title))}>🖨 Print this page</button>
                <button onClick={() => run("Preparing print…", () => printPages(book.pages, book.title, (n, t) => setBusy(`Preparing ${n}/${t}…`)))}>🖨 Print whole book</button>
              </div>
            </>
          )}
        </div>
        <Link href="/profile" className="avatar-btn" aria-label="Profile">
          <Avatar name={s.name} url={s.photoURL} size={38} />
        </Link>
      </header>

      <div className="ed-body">
        <aside className={`panel ${panelOpen ? "" : "collapsed"}`}>
          <div
            className="sheet-handle"
            onPointerDown={(e) => {
              dragY.current = e.clientY;
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerUp={(e) => {
              if (dragY.current === null) return;
              const dy = e.clientY - dragY.current;
              dragY.current = null;
              if (dy > 24) setPanelOpen(false);
              else if (dy < -24) setPanelOpen(true);
              else setPanelOpen((o) => !o);
            }}
            role="button"
            aria-label={panelOpen ? "Slide the panel down" : "Slide the panel up"}
          >
            <span />
          </div>
          <nav className="tabs" role="tablist">
            {tabs.map(([t, ic, lb]) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                className={tab === t && panelOpen ? "on" : ""}
                onClick={() => {
                  setCutting(false);
                  setTab(t);
                  setQuery("");
                  setPanelOpen(tab === t && panelOpen && narrow ? false : true);
                }}
              >
                <span className="ic">{ic}</span>
                {lb}
              </button>
            ))}
          </nav>

          <div
            className="panel-body"
            onScroll={(e) => {
              const el = e.currentTarget;
              if (el.scrollTop + el.clientHeight > el.scrollHeight - 500) setLimit((l) => l + 96);
            }}
          >
            {(tab === "elements" || tab === "stickers") && (
              <>
                <input className="search" placeholder={tab === "stickers" ? "Search stickers…" : "Search tape, stamps, flowers…"} value={query} onChange={(e) => { setQuery(e.target.value); setLimit(96); }} />
                <div className="grid">
                  {shown.map((e) => (
                    <button key={e.id} className={`cell ${e.emoji ? "emoji" : ""}`} title={e.label} onClick={() => addEntry(e)}>
                      {e.emoji ? (
                        <span>{e.emoji}</span>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={e.src} alt={e.label} loading="lazy" draggable={false} />
                      )}
                    </button>
                  ))}
                  {shown.length === 0 && <p className="hint">Nothing matches “{query}”.</p>}
                </div>
              </>
            )}

            {tab === "text" && (
              <div className="form">
                <label className="lbl">{textTarget ? "Edit selected text" : "New text"}</label>
                <textarea
                  rows={3}
                  placeholder="Write something sweet…"
                  value={form.text}
                  onChange={(e) => setForm({ text: e.target.value })}
                  style={{ fontFamily: FONT_CSS[form.font], fontSize: 22 }}
                />
                <label className="lbl">Font</label>
                <div className="chips wrap">
                  {(Object.keys(FONT_LABELS) as FontKey[]).map((f) => (
                    <button key={f} className={`chip ${form.font === f ? "on" : ""}`} style={{ fontFamily: FONT_CSS[f], fontSize: 17 }} onClick={() => setForm({ font: f })}>
                      {FONT_LABELS[f]}
                    </button>
                  ))}
                </div>
                <label className="lbl">Style</label>
                <div className="chips wrap">
                  {(["plain", "shadow", "highlight", "strip", "tag"] as TextStyle[]).map((st) => (
                    <button key={st} className={`chip ${form.style === st ? "on" : ""}`} onClick={() => setForm({ style: st })}>
                      {st === "plain" ? "Plain" : st === "shadow" ? "Shadow" : st === "highlight" ? "Highlighter" : st === "strip" ? "Paper strip" : "Colour tag"}
                    </button>
                  ))}
                </div>
                {(form.style === "shadow" || form.style === "highlight") && (
                  <>
                    <label className="lbl">{form.style === "shadow" ? "Shadow colour" : "Highlighter colour"}</label>
                    <div className="dots">
                      {ACCENTS.map((c) => (
                        <button key={c} className={`dot ${form.accent === c ? "on" : ""}`} style={{ background: c }} onClick={() => setForm({ accent: c })} aria-label={c} />
                      ))}
                      <label className="dot picker" title="Pick any colour">
                        <input type="color" value={/^#[0-9a-f]{6}$/i.test(form.accent) ? form.accent : "#2d2a33"} onChange={(e) => setForm({ accent: e.target.value })} aria-label="Pick any colour" />
                        <span>＋</span>
                      </label>
                    </div>
                  </>
                )}
                <label className="lbl">Colour</label>
                <div className="dots">
                  {TEXT_COLORS.map((c) => (
                    <button key={c} className={`dot ${form.color === c ? "on" : ""}`} style={{ background: c }} onClick={() => setForm({ color: c })} aria-label={c} />
                  ))}
                  <label className="dot picker" title="Pick any colour">
                    <input type="color" value={/^#[0-9a-f]{6}$/i.test(form.color) ? form.color : "#2d2a33"} onChange={(e) => setForm({ color: e.target.value })} aria-label="Pick any colour" />
                    <span>＋</span>
                  </label>
                </div>
                {textTarget ? (
                  <p className="hint">Drag the corner handle to resize and rotate. Changes apply instantly.</p>
                ) : (
                  <button className="btn primary wide" onClick={addText} disabled={!draft.text.trim()}>
                    Add to page
                  </button>
                )}
              </div>
            )}

            {tab === "photos" && (
              <div className="form">
                <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
                <button className="btn primary wide" onClick={() => fileRef.current?.click()}>
                  + Add photos
                </button>
                <p className="hint">Photos arrive as polaroids. Select one to switch it to a plain print or a torn edge.</p>
                {selected?.kind === "photo" && (
                  <button className="btn wide" onClick={() => setTab("edit")}>
                    ✨ Cut out &amp; change background
                  </button>
                )}
                {selected?.kind === "photo" && (
                  <>
                    <label className="lbl">Photo style</label>
                    <div className="chips wrap">
                      {(["polaroid", "plain", "torn"] as PhotoFrame[]).map((f) => (
                        <button key={f} className={`chip ${(selected.frame ?? "polaroid") === f ? "on" : ""}`} onClick={() => setFrame(f)}>
                          {f === "polaroid" ? "Polaroid" : f === "plain" ? "Print" : "Torn edge"}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {tab === "draw" && (
              <div className="form">
                <label className="lbl">Pen</label>
                <div className="chips wrap">
                  {([["pen", "✎ Pen"], ["dots", "⋯ Dotted"], ["dash", "╌ Dashed"], ["marker", "▬ Highlighter"]] as [PenKind, string][]).map(([kd, lb]) => (
                    <button key={kd} className={`chip ${pen.kind === kd ? "on" : ""}`} onClick={() => setPen({ ...pen, kind: kd })}>
                      {lb}
                    </button>
                  ))}
                </div>
                <label className="lbl">Colour</label>
                <div className="dots">
                  {PEN_COLORS.map((c) => (
                    <button key={c} className={`dot ${pen.color === c ? "on" : ""}`} style={{ background: c }} onClick={() => setPen({ ...pen, color: c })} aria-label={c} />
                  ))}
                  <label className="dot picker" title="Pick any colour">
                    <input type="color" value={/^#[0-9a-f]{6}$/i.test(pen.color) ? pen.color : "#2d2a33"} onChange={(e) => setPen({ ...pen, color: e.target.value })} aria-label="Pick any colour" />
                    <span>＋</span>
                  </label>
                </div>
                <label className="lbl">Thickness</label>
                <input type="range" min={1.5} max={12} step={0.5} value={pen.width} onChange={(e) => setPen({ ...pen, width: Number(e.target.value) })} aria-label="Pen thickness" />
                <p className="hint">Draw straight on the page with your finger. Each line becomes an item you can move, resize or delete. To move other things, switch to another tab.</p>
              </div>
            )}

            {tab === "edit" && (
              <div className="form">
                {!selected ? (
                  <p className="hint">Tap an item on the page (or its scissors button) to cut, tear or re-layer it.</p>
                ) : (
                  <>
                    <label className="lbl">Layer</label>
                    <div className="chips wrap">
                      <button className="chip" onClick={() => reorder("up")}>↑ Bring forward</button>
                      <button className="chip" onClick={() => reorder("down")}>↓ Send back</button>
                    </div>
                    {selected.kind === "img" && variantsOf(findEntry(selected.ref)).length > 1 && (
                      <>
                        <label className="lbl">Colour</label>
                        <div className="swatches">
                          {variantsOf(findEntry(selected.ref)).map((v) => (
                            <button
                              key={v.id}
                              className={`swatch ${selected.ref === v.id ? "on" : ""}`}
                              title={v.variant}
                              onClick={() => {
                                snapshot();
                                patchSelected({ ref: v.id, src: v.gen ? v.gen() : undefined });
                              }}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={v.src} alt={v.variant ?? "colour"} draggable={false} />
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                    {selected.kind === "photo" && (
                      <>
                        <label className="lbl">Cut out</label>
                        <button className="btn primary wide" onClick={runAutoCutout} disabled={!selected.src}>
                          ✨ Remove background (people)
                        </button>
                        <button className="btn wide" onClick={startDrawnCut}>
                          ✂ Cut out by drawing (anything)
                        </button>
                        <p className="hint">The automatic cutout works best on people and downloads a small helper once (about 25 MB). For pets, objects or food, draw around the part you want to keep.</p>
                        {selected.cut && (
                          <>
                            <label className="lbl">Background</label>
                            <input ref={bgFileRef} type="file" accept="image/*" hidden onChange={(e) => pickBgPhoto(e.target.files?.[0])} />
                            <div className="chips wrap">
                              <button className={`chip ${!selected.pbg ? "on" : ""}`} onClick={() => setPbg(undefined)}>None</button>
                              <button className={`chip ${selected.pbg?.k === "blur" ? "on" : ""}`} onClick={() => setPbg({ k: "blur" })}>Blurred photo</button>
                              <button className={`chip ${selected.pbg?.k === "photo" ? "on" : ""}`} onClick={() => bgFileRef.current?.click()}>Another photo…</button>
                              <button className={`chip ${selected.outline ? "on" : ""}`} onClick={() => patchSelected({ outline: !selected.outline })}>White outline</button>
                            </div>
                            <div className="dots">
                              {PBG_COLORS.map((c) => (
                                <button key={c} className={`dot ${selected.pbg?.k === "color" && selected.pbg.v === c ? "on" : ""}`} style={{ background: c }} onClick={() => setPbg({ k: "color", v: c })} aria-label={c} />
                              ))}
                              {PBG_GRADIENTS.map(([n, g]) => (
                                <button key={n} className={`dot ${selected.pbg?.k === "gradient" && selected.pbg.v === n ? "on" : ""}`} style={{ background: g }} onClick={() => setPbg({ k: "gradient", v: n })} aria-label={n} title={n} />
                              ))}
                            </div>
                            <label className="lbl">Paper behind it</label>
                            <div className="dots">
                              {BACKGROUNDS.slice(0, 12).map((b) => (
                                <button key={b.id} className={`dot ${selected.pbg?.k === "paper" && selected.pbg.v === b.id ? "on" : ""}`} style={{ background: b.css }} onClick={() => setPbg({ k: "paper", v: b.id })} aria-label={b.label} title={b.label} />
                              ))}
                            </div>
                            <button
                              className="chip"
                              style={{ alignSelf: "flex-start" }}
                              onClick={() => {
                                snapshot();
                                patchSelected({ cut: undefined, pbg: undefined, outline: undefined });
                              }}
                            >
                              ↺ Back to the original photo
                            </button>
                          </>
                        )}
                      </>
                    )}
                    {(selected.kind === "photo" || selected.kind === "img") && (
                      <>
                        <label className="lbl">Edge</label>
                        <div className="chips wrap">
                          {EDGES.map(([e, lb]) => (
                            <button key={e} className={`chip ${(selected.edge ?? "none") === e && !selected.clip ? "on" : ""}`} onClick={() => setEdge(e)}>
                              {lb}
                            </button>
                          ))}
                        </div>
                        {selected.edge === "torn" && (
                          <button className="chip" style={{ alignSelf: "flex-start" }} onClick={() => patchSelected({ seed: Math.floor(Math.random() * 1000) })}>
                            ↻ Tear differently
                          </button>
                        )}
                        {selected.kind === "img" && (
                          <>
                            <label className="lbl">Scissors</label>
                            <button className="btn primary wide" onClick={() => setCutting(true)}>
                              ✂ Cut out by drawing
                            </button>
                            <p className="hint">Draw a loop around the part you want to keep, then lift your finger. Everything outside the loop is cut away.</p>
                          </>
                        )}
                        {(selected.clip || selected.edge) && (
                          <button className="chip" style={{ alignSelf: "flex-start" }} onClick={clearCut}>
                            ↺ Undo cut
                          </button>
                        )}
                      </>
                    )}
                    {selected.kind === "draw" && <p className="hint">Drag the corner handle to resize or rotate this line. Use the ✕ to delete it.</p>}
                    {selected.kind === "text" && <p className="hint">Use the Text tab to change this text&apos;s font, colour and style.</p>}
                  </>
                )}
              </div>
            )}

            {tab === "paper" && (
              <div className="form">
                {page.kind !== "day" && (
                  <>
                    <label className="lbl">{page.kind === "cover" ? "Cover style" : "End page style"}</label>
                    <div className="chips wrap">
                      {COVER_THEMES.map((t) => (
                        <button key={t.id} className="chip" onClick={() => restyleCover(t.id)}>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                <label className="lbl">Page layouts</label>
                <div className="chips wrap">
                  {TEMPLATES.map((t) => (
                    <button key={t.id} className="chip" onClick={() => applyTemplate(t.id)}>
                      {t.label}
                    </button>
                  ))}
                </div>
                <label className="lbl">Plain paper</label>
                <div className="dots">
                  {PLAIN.map((b) => (
                    <button
                      key={b.id}
                      className={`dot ${page.bg === b.id ? "on" : ""}`}
                      style={{ background: b.swatch }}
                      title={b.label}
                      aria-label={b.label}
                      onClick={() => {
                        snapshot();
                        patchPage(page.id, { bg: b.id });
                      }}
                    />
                  ))}
                  <label className="dot picker" title="Pick any colour">
                    <input
                      type="color"
                      value={page.bg.startsWith("color:") ? page.bg.slice(6) : "#ffffff"}
                      onChange={(e) => patchPage(page.id, { bg: `color:${e.target.value}` })}
                      onPointerDown={() => snapshot()}
                      aria-label="Custom paper colour"
                    />
                    <span>＋</span>
                  </label>
                </div>
                <label className="lbl">Textured paper</label>
                <div className="grid bgs">
                  {BACKGROUNDS.map((b) => (
                    <button
                      key={b.id}
                      className={`bgcell ${page.bg === b.id ? "on" : ""}`}
                      title={b.label}
                      onClick={() => {
                        snapshot();
                        patchPage(page.id, { bg: b.id });
                      }}
                    >
                      <span style={{ background: b.css }} />
                      <em>{b.label}</em>
                    </button>
                  ))}
                </div>
                <label className="lbl">Page border</label>
                <div className="grid bgs">
                  {FRAMES.map((f) => (
                    <button
                      key={f.id}
                      className={`bgcell ${(page.frame ?? "none") === f.id ? "on" : ""}`}
                      title={f.label}
                      onClick={() => {
                        snapshot();
                        patchPage(page.id, { frame: f.id === "none" ? undefined : f.id });
                      }}
                    >
                      <span style={{ background: pageBackground({ bg: page.bg, frame: f.id }) }} />
                      <em>{f.label}</em>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        <main className="stage">
          <div className="canvas-area" ref={areaRef}>
            {area.w > 0 && (
              <EditorCanvas
                page={page}
                k={k}
                selectedId={selectedId}
                mode={mode}
                penPreview={{ color: pen.color, width: pen.width, pen: pen.kind }}
                onSelect={(id) => {
                  setSelectedId(id);
                  if (id) collapseForEditing();
                }}
                onItems={setItems}
                onBegin={() => {
                  snapshot();
                  collapseForEditing();
                }}
                onDelete={deleteItem}
                onEditText={() => {
                  setTab("text");
                  setPanelOpen(true);
                }}
                onCutTool={() => {
                  setTab("edit");
                  setPanelOpen(true);
                }}
                onStroke={onStroke}
                onCutPath={onCutPath}
              />
            )}
          </div>

          <div className="strip">
            <div className="strip-scroll">
              {book.pages.map((p, i) => (
                <div key={p.id} className="pwrap">
                  <button
                    className={`pthumb ${i === idx ? "on" : ""}`}
                    onClick={() => {
                      setPageIdx(i);
                      setSelectedId(null);
                    }}
                    aria-label={p.kind === "cover" ? "Cover" : p.kind === "back" ? "End page" : `Page ${i}`}
                  >
                    <PageStatic page={p} width={42} />
                    <span>{pageLabel(p, i)}</span>
                  </button>
                  {i === idx && p.kind === "day" && (
                    <button className="pdel" onClick={deletePage} aria-label="Delete this page" title="Delete this page">
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button className="pthumb add" onClick={addPage} aria-label="Add page">
                +
              </button>
            </div>
          </div>
        </main>
      </div>

      {showFlip && <Flipbook book={book} onClose={() => setShowFlip(false)} />}
      {busy && <div className="busy">{busy}</div>}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

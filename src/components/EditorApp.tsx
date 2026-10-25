"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { loadLocalAvatar, useSession } from "@/lib/auth";
import { BACKGROUNDS, PLAIN } from "@/lib/backgrounds";
import { addDayPage } from "@/lib/book";
import { loadBookFor } from "@/lib/bookload";
import { BY_ID, ELEMENTS, Entry, Pack, STICKERS, Category, loadPacks, packCategories } from "@/lib/catalog";
import { COVER_THEMES, CoverTheme, makeBack, makeCover } from "@/lib/cover";
import { todayKey, todayPage } from "@/lib/daily";
import { exportPagePng, exportPdf, printPages } from "@/lib/exporter";
import { FONT_CSS, FONT_LABELS, TEXT_COLORS } from "@/lib/fonts";
import { FRAMES } from "@/lib/frames";
import { scheduleStreakReminders } from "@/lib/notify";
import { pageBackground } from "@/lib/pagebg";
import { readStreak, saveBook, uid } from "@/lib/store";
import { pushBook } from "@/lib/sync";
import { Book, FontKey, Item, PAGE_H, PAGE_W, Page, PhotoFrame, TextStyle } from "@/lib/types";
import Avatar from "./Avatar";
import EditorCanvas from "./EditorCanvas";
import Flipbook from "./Flipbook";
import PageStatic from "./PageStatic";

type Tab = "elements" | "stickers" | "text" | "photos" | "paper";

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
  const [packs, setPacks] = useState<Pack[]>([]);
  const [draft, setDraft] = useState<{ text: string; font: FontKey; color: string; style: TextStyle }>({ text: "", font: "hand", color: "#2d2a33", style: "plain" });
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
            const withUrls = await pushBook(s.uid as string, book);
            if (withUrls && bookRef.current) {
              // photos now live in the cloud: swap their data URIs for URLs without touching anything else
              const urlById = new Map(withUrls.pages.flatMap((p) => p.items.filter((i) => i.kind === "photo").map((i) => [i.id, i.src] as const)));
              setBook((b) => (b ? { ...b, pages: b.pages.map((p) => ({ ...p, items: p.items.map((i) => (i.kind === "photo" && urlById.has(i.id) ? { ...i, src: urlById.get(i.id) } : i)) })) } : b));
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
      addItem({ kind: "img", src: e.gen(), w: e.w, h: e.h });
    } else if (BY_ID[e.id]) {
      addItem({ kind: "img", ref: e.id, w: e.w, h: e.h });
    } else {
      addItem({ kind: "img", src: e.src, w: e.w, h: e.h });
    }
  };

  // ---- text ----
  const textTarget = selected?.kind === "text" ? selected : null;
  const form = textTarget
    ? { text: textTarget.text ?? "", font: textTarget.font ?? "hand", color: textTarget.color ?? "#2d2a33", style: textTarget.style ?? "plain" }
    : draft;
  const setForm = (p: Partial<typeof draft>) => {
    if (textTarget) patchSelected(p as Partial<Item>);
    else setDraft((d) => ({ ...d, ...p }));
  };
  const addText = () => {
    if (!draft.text.trim()) return;
    addItem({ kind: "text", text: draft.text, font: draft.font, color: draft.color, style: draft.style, size: draft.font === "script" ? 30 : 38, w: 260, h: 60 });
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

  const restyleCover = (theme: CoverTheme) => {
    if (!page || !confirm("Replace this page with a fresh design? Your current items on it will be removed.")) return;
    snapshot();
    const fresh = page.kind === "back" ? makeBack(s.name, theme) : makeCover(s.name, theme);
    patchPage(page.id, { items: fresh.items, bg: fresh.bg, frame: undefined });
    setSelectedId(null);
  };

  // ---- export ----
  const run = async (label: string, fn: () => Promise<unknown>, done?: string) => {
    setMenu(false);
    setSelectedId(null);
    setBusy(label);
    try {
      await new Promise((r) => setTimeout(r, 60));
      await fn();
      if (done) note(done);
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
  const shown = q ? searchPool.flatMap((c) => c.items).filter((e) => e.label.toLowerCase().includes(q) || e.id.includes(q)).slice(0, 150) : (activeCat?.items ?? []);

  const pageLabel = (p: Page, i: number) => (p.kind === "cover" ? "Cover" : p.kind === "back" ? "End" : String(i));
  const title = page.kind === "cover" ? "Front cover" : page.kind === "back" ? "End page" : page.date === todayKey() ? "Today’s page" : `Page ${idx}`;

  const collapseForEditing = () => {
    if (narrow) setPanelOpen(false);
  };
  const tabs: [Tab, string, string][] = [
    ["elements", "✦", "Elements"],
    ["stickers", "☺", "Stickers"],
    ["text", "Aa", "Text"],
    ["photos", "🖼", "Photos"],
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
                <button onClick={() => run("Saving image…", () => exportPagePng(book, page, idx), "Saved as an image")}>🖼 Save page as image</button>
                <button onClick={() => run("Making PDF…", () => exportPdf(book, [page], `${book.title}-page-${idx}`), "PDF ready")}>📄 Save page as PDF</button>
                <button
                  onClick={() => run("Building PDF…", () => exportPdf(book, book.pages, book.title, (n, t) => setBusy(`Building PDF ${n}/${t}…`)), "PDF ready")}
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

          <div className="panel-body">
            {(tab === "elements" || tab === "stickers") && (
              <>
                <input className="search" placeholder={tab === "stickers" ? "Search stickers…" : "Search tape, stamps, flowers…"} value={query} onChange={(e) => setQuery(e.target.value)} />
                {!q && (
                  <div className="chips">
                    {cats.map((c) => (
                      <button key={c.id} className={`chip ${c.id === activeCat?.id ? "on" : ""}`} onClick={() => (isStickers ? setCatSt(c.id) : setCatEl(c.id))}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                )}
                {isStickers && packs.length === 0 && !q && <p className="hint">More cutout sticker packs are coming soon.</p>}
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
                  {(["plain", "strip", "tag"] as TextStyle[]).map((st) => (
                    <button key={st} className={`chip ${form.style === st ? "on" : ""}`} onClick={() => setForm({ style: st })}>
                      {st === "plain" ? "Plain" : st === "strip" ? "Paper strip" : "Colour tag"}
                    </button>
                  ))}
                </div>
                <label className="lbl">Colour</label>
                <div className="dots">
                  {TEXT_COLORS.map((c) => (
                    <button key={c} className={`dot ${form.color === c ? "on" : ""}`} style={{ background: c }} onClick={() => setForm({ color: c })} aria-label={c} />
                  ))}
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
                onDuplicate={() => undefined}
                onEditText={() => {
                  setTab("text");
                  setPanelOpen(true);
                }}
              />
            )}
          </div>

          <div className="strip">
            <div className="strip-scroll">
              {book.pages.map((p, i) => (
                <button
                  key={p.id}
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

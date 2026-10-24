"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BACKGROUNDS } from "@/lib/backgrounds";
import { todayKey, todayPage } from "@/lib/daily";
import { exportPagePng } from "@/lib/exporter";
import { FONT_CSS, FONT_LABELS, TEXT_COLORS } from "@/lib/fonts";
import { Category, Pack, buildCategories, loadPacks } from "@/lib/packs";
import { getName, loadMainBook, readStreak, saveBook, uid } from "@/lib/store";
import { Book, FontKey, Item, PAGE_H, PAGE_W, Page, PhotoFrame, TextStyle } from "@/lib/types";
import EditorCanvas from "./EditorCanvas";
import Flipbook from "./Flipbook";
import PageStatic from "./PageStatic";

type Tab = "elements" | "text" | "photos" | "paper";

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
  const [book, setBook] = useState<Book | null>(null);
  const [name, setUserName] = useState("");
  const [streak, setStreak] = useState(0);
  const [pageIdx, setPageIdx] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("elements");
  const [panelOpen, setPanelOpen] = useState(true);
  const [catId, setCatId] = useState("");
  const [query, setQuery] = useState("");
  const [packs, setPacks] = useState<Pack[]>([]);
  const [draft, setDraft] = useState<{ text: string; font: FontKey; color: string; style: TextStyle }>({ text: "", font: "hand", color: "#2d2a33", style: "plain" });
  const [showFlip, setShowFlip] = useState(false);
  const [busy, setBusy] = useState("");
  const [toast, setToast] = useState("");
  const [area, setArea] = useState({ w: 0, h: 0 });
  const past = useRef<Page[][]>([]);
  const future = useRef<Page[][]>([]);
  const [, bump] = useState(0);
  const areaRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ---- load ----
  useEffect(() => {
    const n = getName();
    if (!n) {
      router.replace("/");
      return;
    }
    setUserName(n);
    setStreak(readStreak().count);
    loadPacks().then(setPacks);
    // open straight onto today's page, creating it if it's a new day
    loadMainBook(n).then((b) => {
      let pages = b.pages;
      const wanted = pageParam ? pages.findIndex((p) => p.id === pageParam) : -1;
      let at = wanted >= 0 ? wanted : pages.findIndex((p) => p.date === todayKey());
      if (at < 0) {
        pages = [...pages, todayPage()];
        at = pages.length - 1;
      }
      setBook({ ...b, pages });
      setPageIdx(at);
    });
  }, [router, pageParam]);

  // ---- autosave ----
  useEffect(() => {
    if (!book) return;
    if (!loaded.current) {
      loaded.current = true;
      return;
    }
    const t = setTimeout(() => saveBook(book), 500);
    return () => clearTimeout(t);
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

  const cats: Category[] = useMemo(() => buildCategories(packs), [packs]);
  useEffect(() => {
    if (!catId && cats.length) setCatId(cats[0].id);
  }, [cats, catId]);

  const note = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 2200);
  };

  const idx = book ? Math.min(pageIdx, book.pages.length - 1) : 0;
  const page = book?.pages[idx];

  // ---- state helpers ----
  const setPages = useCallback((fn: (pages: Page[]) => Page[]) => {
    setBook((b) => (b ? { ...b, pages: fn(b.pages), updated: Date.now() } : b));
  }, []);

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

  const withHistory = (fn: (pages: Page[]) => Page[]) => {
    snapshot();
    setPages(fn);
  };

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
      const pid = book.pages[idx].id;
      setPages((ps) => ps.map((p) => (p.id === pid ? { ...p, items } : p)));
    },
    [book, idx, setPages],
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

  const duplicateItem = (iid: string) => {
    if (!page) return;
    const src = page.items.find((i) => i.id === iid);
    if (!src) return;
    snapshot();
    const copy = { ...src, id: uid(), x: src.x + 24, y: src.y + 24 };
    setItems([...page.items, copy]);
    setSelectedId(copy.id);
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
    setPages((ps) => [...ps, { id: uid(), bg: page.bg, items: [] }]);
    setPageIdx(book.pages.length);
    setSelectedId(null);
  };

  // ---- export ----
  const run = async (label: string, fn: () => Promise<unknown>, done?: string) => {
    setSelectedId(null);
    setBusy(label);
    try {
      await fn();
      if (done) note(done);
    } catch (e) {
      note(`Export failed: ${e instanceof Error ? e.message : e}`);
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
  const activeCat = cats.find((c) => c.id === catId) ?? cats[0];
  const q = query.trim().toLowerCase();
  const shown = q ? cats.flatMap((c) => c.items).filter((s) => s.label.toLowerCase().includes(q) || s.id.includes(q)).slice(0, 150) : (activeCat?.items ?? []);

  return (
    <div className="editor">
      <header className="ed-top">
        <Link href="/" className="btn round" aria-label="Back to home" title="Home">
          ‹
        </Link>
        <div className="brand">
          <span className="orb" />
          <span className="hide-sm">Patchlet</span>
        </div>
        <div className="ed-title">
          <b>{name}</b>
          <small>
            {page.date === todayKey() ? "Today’s page" : `Page ${idx + 1}`}
            {streak > 0 && ` · 🔥 ${streak}`}
          </small>
        </div>
        <button className="btn round" onClick={undo} disabled={!past.current.length} aria-label="Undo" title="Undo (Ctrl+Z)">
          ↶
        </button>
        <button className="btn round" onClick={redo} disabled={!future.current.length} aria-label="Redo" title="Redo">
          ↷
        </button>
        <button className="btn primary" onClick={() => { setSelectedId(null); setShowFlip(true); }}>
          📖 <span className="hide-sm">Flip through</span>
        </button>
        <button className="btn" onClick={() => run("Saving image…", () => exportPagePng(book, page, idx), "Saved as an image")}>
          ⬇ <span className="hide-sm">Save as image</span>
        </button>
      </header>

      <div className="ed-body">
        <aside className={`panel ${panelOpen ? "" : "collapsed"}`}>
          <nav className="tabs" role="tablist">
            {(
              [
                ["elements", "✦", "Elements"],
                ["text", "Aa", "Text"],
                ["photos", "🖼", "Photos"],
                ["paper", "▤", "Paper"],
              ] as [Tab, string, string][]
            ).map(([t, ic, lb]) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                className={tab === t && panelOpen ? "on" : ""}
                onClick={() => {
                  if (tab === t) setPanelOpen((o) => !o);
                  else {
                    setTab(t);
                    setPanelOpen(true);
                  }
                }}
              >
                <span className="ic">{ic}</span>
                {lb}
              </button>
            ))}
          </nav>

          {panelOpen && (
            <div className="panel-body">
              {tab === "elements" && (
                <>
                  <input className="search" placeholder="Search tape, stamps, tags…" value={query} onChange={(e) => setQuery(e.target.value)} />
                  {!q && (
                    <div className="chips">
                      {cats.map((c) => (
                        <button key={c.id} className={`chip ${c.id === activeCat?.id ? "on" : ""}`} onClick={() => setCatId(c.id)}>
                          {c.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {packs.length === 0 && !q && <p className="hint">Tip: realistic cutout packs appear here automatically once they’re added to <code>public/packs</code>.</p>}
                  <div className="grid">
                    {shown.map((s) => (
                      <button key={s.id} className="cell" title={s.label} onClick={() => addItem({ kind: "img", src: s.src, w: s.w, h: s.h })}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={s.src} alt={s.label} loading="lazy" draggable={false} />
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
                    {(["plain", "strip", "tag"] as TextStyle[]).map((s) => (
                      <button key={s} className={`chip ${form.style === s ? "on" : ""}`} onClick={() => setForm({ style: s })}>
                        {s === "plain" ? "Plain" : s === "strip" ? "Paper strip" : "Colour tag"}
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
                  <p className="hint">Photos stay on this device. They arrive as polaroids — select one to switch it to a plain print or a torn edge.</p>
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
                <div className="grid bgs">
                  {BACKGROUNDS.map((b) => (
                    <button
                      key={b.id}
                      className={`bgcell ${page.bg === b.id ? "on" : ""}`}
                      title={b.label}
                      onClick={() => withHistory((ps) => ps.map((p, i) => (i === idx ? { ...p, bg: b.id } : p)))}
                    >
                      <span style={{ background: b.css, backgroundSize: "cover" }} />
                      <em>{b.label}</em>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>

        <main className="stage">
          <div className="canvas-area" ref={areaRef}>
            {area.w > 0 && (
              <EditorCanvas
                page={page}
                k={k}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onItems={setItems}
                onBegin={snapshot}
                onDelete={deleteItem}
                onDuplicate={duplicateItem}
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
                <button key={p.id} className={`pthumb ${i === idx ? "on" : ""}`} onClick={() => { setPageIdx(i); setSelectedId(null); }} aria-label={`Page ${i + 1}`}>
                  <PageStatic page={p} width={42} />
                  <span>{i + 1}</span>
                </button>
              ))}
              <button className="pthumb add" onClick={addPage} aria-label="Add page">+</button>
            </div>
          </div>
        </main>
      </div>

      {showFlip && <Flipbook book={book} name={name} onClose={() => setShowFlip(false)} />}
      {busy && <div className="busy">{busy}</div>}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

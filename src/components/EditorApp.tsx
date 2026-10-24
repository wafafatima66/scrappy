"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BACKGROUNDS } from "@/lib/backgrounds";
import { exportBookPdf, exportPagePng, exportStory, sharePage } from "@/lib/exporter";
import { FONT_CSS, FONT_LABELS, TEXT_COLORS } from "@/lib/fonts";
import { Category, Pack, buildCategories, loadPacks } from "@/lib/packs";
import { loadBooks, saveBook, uid } from "@/lib/store";
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
  const id = useSearchParams().get("id");
  const [book, setBook] = useState<Book | null>(null);
  const [missing, setMissing] = useState(false);
  const [pageIdx, setPageIdx] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("elements");
  const [panelOpen, setPanelOpen] = useState(true);
  const [catId, setCatId] = useState("");
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

  // ---- load ----
  useEffect(() => {
    loadPacks().then(setPacks);
    loadBooks().then((all) => {
      const b = all.find((x) => x.id === id);
      if (b) setBook(b);
      else setMissing(true);
    });
  }, [id]);

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
  const dupPage = () => {
    if (!page) return;
    snapshot();
    const copy: Page = { ...page, id: uid(), items: page.items.map((i) => ({ ...i, id: uid() })) };
    setPages((ps) => [...ps.slice(0, idx + 1), copy, ...ps.slice(idx + 1)]);
    setPageIdx(idx + 1);
  };
  const delPage = () => {
    if (!book) return;
    if (book.pages.length <= 1) return note("A scrapbook needs at least one page");
    if (!confirm("Delete this page?")) return;
    snapshot();
    setPages((ps) => ps.filter((_, i) => i !== idx));
    setPageIdx(Math.max(0, idx - 1));
    setSelectedId(null);
  };
  const movePage = (d: -1 | 1) => {
    if (!book) return;
    const j = idx + d;
    if (j < 0 || j >= book.pages.length) return;
    snapshot();
    setPages((ps) => {
      const a = [...ps];
      [a[idx], a[j]] = [a[j], a[idx]];
      return a;
    });
    setPageIdx(j);
  };

  // ---- export ----
  const run = async (label: string, fn: () => Promise<unknown>, done?: string) => {
    setMenu(false);
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

  if (missing)
    return (
      <div className="center-msg">
        <p>That scrapbook couldn’t be found on this device.</p>
        <Link href="/" className="btn">
          Back to my scrapbooks
        </Link>
      </div>
    );
  if (!book || !page) return <div className="center-msg">Opening your scrapbook…</div>;

  const k = Math.max(0.2, Math.min((area.w - 24) / PAGE_W, (area.h - 16) / PAGE_H));
  const activeCat = cats.find((c) => c.id === catId) ?? cats[0];
  const q = query.trim().toLowerCase();
  const shown = q ? cats.flatMap((c) => c.items).filter((s) => s.label.toLowerCase().includes(q) || s.id.includes(q)).slice(0, 150) : (activeCat?.items ?? []);

  return (
    <div className="editor">
      <header className="ed-top">
        <Link href="/" className="btn round" aria-label="Back to my scrapbooks">
          ‹
        </Link>
        <input
          className="title-input"
          value={book.title}
          maxLength={40}
          onChange={(e) => setBook({ ...book, title: e.target.value, updated: Date.now() })}
          aria-label="Scrapbook title"
        />
        <button className="btn round" onClick={undo} disabled={!past.current.length} aria-label="Undo" title="Undo (Ctrl+Z)">
          ↶
        </button>
        <button className="btn round" onClick={redo} disabled={!future.current.length} aria-label="Redo" title="Redo">
          ↷
        </button>
        <button className="btn primary" onClick={() => { setSelectedId(null); setShowFlip(true); }}>
          📖 <span className="hide-sm">Flip through</span>
        </button>
        <div className="menu-wrap">
          <button className="btn" onClick={() => setMenu((m) => !m)}>
            ⬇ <span className="hide-sm">Export</span>
          </button>
          {menu && (
            <div className="menu" onMouseLeave={() => setMenu(false)}>
              <button onClick={() => run("Saving page…", () => exportPagePng(book, page, idx), "Page saved as PNG")}>This page · PNG</button>
              <button onClick={() => run("Making story image…", () => exportStory(book, page, idx), "Story image saved")}>This page · Story (9:16)</button>
              <button onClick={() => run("Sharing…", () => sharePage(book, page))}>Share this page…</button>
              <button onClick={() => run("Building PDF…", () => exportBookPdf(book, (n, t) => setBusy(`Building PDF ${n}/${t}…`)), "PDF saved")}>Whole book · PDF</button>
            </div>
          )}
        </div>
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

          {selected && (
            <div className="ctx">
              <button onClick={() => reorder("front")} title="Bring to front">⤒</button>
              <button onClick={() => reorder("up")} title="Forward">↑</button>
              <button onClick={() => reorder("down")} title="Backward">↓</button>
              <button onClick={() => reorder("back")} title="Send to back">⤓</button>
              {selected.kind === "img" && <button onClick={() => patchSelected({ flip: !selected.flip })} title="Flip">⇋</button>}
              <button onClick={() => duplicateItem(selected.id)} title="Duplicate">⧉</button>
              <button className="danger" onClick={() => deleteItem(selected.id)} title="Delete">🗑</button>
            </div>
          )}

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
            <div className="strip-actions">
              <button onClick={() => movePage(-1)} disabled={idx === 0} title="Move page earlier">◀</button>
              <button onClick={() => movePage(1)} disabled={idx === book.pages.length - 1} title="Move page later">▶</button>
              <button onClick={dupPage} title="Duplicate page">⧉</button>
              <button onClick={delPage} className="danger" title="Delete page">🗑</button>
            </div>
          </div>
        </main>
      </div>

      {showFlip && <Flipbook book={book} onClose={() => setShowFlip(false)} onPdf={() => run("Building PDF…", () => exportBookPdf(book, (n, t) => setBusy(`Building PDF ${n}/${t}…`)), "PDF saved")} />}
      {busy && <div className="busy">{busy}</div>}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { PROCEDURAL } from "@/lib/procedural";
import { loadBooks, newBook, readStreak, saveBook, saveBooks, uid } from "@/lib/store";
import { Book, Item } from "@/lib/types";
import PageStatic from "./PageStatic";

const PROMPTS = [
  "What made you smile today?",
  "Something small you want to remember",
  "Your favourite meal this week",
  "A song stuck in your head",
  "Someone you're grateful for",
  "Where would you go right now?",
  "A colour that feels like today",
  "Three things on your desk",
  "A tiny win",
  "What did you learn lately?",
  "Your perfect lazy morning",
  "A place that feels like home",
];

const greet = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

export default function HomeApp() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[] | null>(null);
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState("");
  const [streak, setStreak] = useState({ count: 0, days: [] as string[] });

  useEffect(() => {
    loadBooks().then(setBooks);
    setStreak(readStreak());
  }, []);

  const create = async () => {
    const b = newBook(name.trim() || "My scrapbook");
    await saveBook(b);
    router.push(`/book?id=${b.id}`);
  };

  const remove = async (b: Book) => {
    if (!confirm(`Delete “${b.title}”? This can’t be undone.`)) return;
    const next = (books ?? []).filter((x) => x.id !== b.id);
    setBooks(next);
    await saveBooks(next);
  };

  const duplicate = async (b: Book) => {
    const copy: Book = { ...b, id: uid(), title: `${b.title} copy`, updated: Date.now(), pages: b.pages.map((p) => ({ ...p, id: uid(), items: p.items.map((i) => ({ ...i, id: uid() })) })) };
    await saveBook(copy);
    setBooks(await loadBooks());
  };

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const prompt = PROMPTS[dayOfYear % PROMPTS.length];

  const startDaily = async () => {
    const all = await loadBooks();
    let b = all.find((x) => x.title === "Daily pages");
    if (!b) b = newBook("Daily pages");
    const date = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
    const tape = PROCEDURAL.find((s) => s.id === "tape-stripes-lilac");
    const items: Item[] = [
      { id: uid(), kind: "text", text: date, font: "type", color: "#6b5744", size: 26, x: 90, y: 70, w: 420, h: 40, r: -1 },
      { id: uid(), kind: "text", text: prompt, font: "hand", color: "#2d2a33", size: 44, x: 80, y: 140, w: 440, h: 120, r: 1.5 },
    ];
    if (tape) items.push({ id: uid(), kind: "img", src: tape.src, x: 190, y: 28, w: 220, h: (220 * tape.h) / tape.w, r: -2 });
    const first = b.pages.length === 1 && b.pages[0].items.length === 0;
    b.pages = first ? [{ id: uid(), bg: "lined", items }] : [...b.pages, { id: uid(), bg: "lined", items }];
    b.updated = Date.now();
    await saveBook(b);
    router.push(`/book?id=${b.id}`);
  };

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return { key, label: d.toLocaleDateString(undefined, { weekday: "narrow" }), done: streak.days.includes(key), today: i === 6 };
  });

  return (
    <div className="home">
      <header className="home-head">
        <div className="brand">
          <span className="orb" />
          Scrappy
        </div>
        <div className="streak" title="Days in a row you've made something">
          <span className="flame">🔥</span>
          <b>{streak.count}</b>
          <span className="hide-sm">day streak</span>
        </div>
      </header>

      <section className="hero">
        <div>
          <h1>{greet()} ✿</h1>
          <p>Cut, tape and tuck little memories into pages that feel real — then flip through them like a book.</p>
          <div className="hero-actions">
            <button className="btn primary big" onClick={() => setNaming(true)}>
              + New scrapbook
            </button>
          </div>
        </div>
        <div className="daily">
          <div className="daily-tape" />
          <small>Today’s page prompt</small>
          <h3>{prompt}</h3>
          <div className="week">
            {week.map((d) => (
              <span key={d.key} className={`wd ${d.done ? "done" : ""} ${d.today ? "today" : ""}`}>
                <i>{d.done ? "✓" : ""}</i>
                {d.label}
              </span>
            ))}
          </div>
          <button className="btn" onClick={startDaily}>
            Start today’s page →
          </button>
        </div>
      </section>

      <h2 className="sec">My scrapbooks</h2>
      {books === null ? (
        <p className="hint">Loading…</p>
      ) : books.length === 0 ? (
        <div className="empty">
          <p>No scrapbooks yet. Your first one is a click away.</p>
          <button className="btn primary" onClick={() => setNaming(true)}>
            Create one
          </button>
        </div>
      ) : (
        <div className="books">
          {[...books]
            .sort((a, b) => b.updated - a.updated)
            .map((b) => (
              <article key={b.id} className="book-card">
                <Link href={`/book?id=${b.id}`} className="cover">
                  <PageStatic page={b.pages[0]} width={220} />
                </Link>
                <div className="meta">
                  <div>
                    <h3>{b.title}</h3>
                    <small>
                      {b.pages.length} {b.pages.length === 1 ? "page" : "pages"}
                    </small>
                  </div>
                  <div className="meta-actions">
                    <button onClick={() => duplicate(b)} title="Duplicate" aria-label="Duplicate">⧉</button>
                    <button onClick={() => remove(b)} title="Delete" aria-label="Delete" className="danger">🗑</button>
                  </div>
                </div>
              </article>
            ))}
        </div>
      )}

      {naming && (
        <div className="modal-back" onClick={() => setNaming(false)}>
          <form
            className="modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              create();
            }}
          >
            <h3>Name your scrapbook</h3>
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Summer memories…" maxLength={40} />
            <div className="row">
              <button type="button" className="btn ghost" onClick={() => setNaming(false)}>
                Cancel
              </button>
              <button className="btn primary">Create</button>
            </div>
          </form>
        </div>
      )}
      <footer className="foot">Everything is saved on this device. No account needed.</footer>
    </div>
  );
}

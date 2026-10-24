"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { todayKey } from "@/lib/daily";
import { getName, loadMainBook, readStreak, setName } from "@/lib/store";
import { Book } from "@/lib/types";
import Flipbook from "./Flipbook";
import PageStatic from "./PageStatic";

const greet = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

const label = (date: string | undefined, i: number) => {
  if (!date) return `Page ${i + 1}`;
  const d = new Date(`${date}T12:00:00`);
  return date === todayKey() ? "Today" : d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
};

export default function HomeApp() {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "welcome" | "home">("loading");
  const [name, setNameState] = useState("");
  const [input, setInput] = useState("");
  const [book, setBook] = useState<Book | null>(null);
  const [streak, setStreak] = useState({ count: 0, days: [] as string[] });
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    const n = getName();
    if (!n) {
      setState("welcome");
      return;
    }
    setNameState(n);
    setStreak(readStreak());
    loadMainBook(n).then((b) => {
      setBook(b);
      setState("home");
    });
  }, []);

  if (state === "loading") return <div className="center-msg">Opening Patchlet…</div>;

  if (state === "welcome") {
    const go = (e: React.FormEvent) => {
      e.preventDefault();
      const n = input.trim();
      if (!n) return;
      setName(n);
      router.push("/book");
    };
    return (
      <main className="welcome">
        <div className="brand big-brand">
          <span className="orb" />
          Patchlet
        </div>
        <form className="welcome-card" onSubmit={go}>
          <div className="daily-tape" />
          <small>Welcome</small>
          <h1>What should we call you?</h1>
          <p>Your name goes on the cover and the last page of your Patchlet book.</p>
          <input autoFocus value={input} onChange={(e) => setInput(e.target.value)} placeholder="Your name" maxLength={20} aria-label="Your name" />
          <button className="btn primary big" disabled={!input.trim()}>
            Start today’s page →
          </button>
        </form>
        <p className="foot">Everything stays on this device. No account needed.</p>
      </main>
    );
  }

  const pages = [...(book?.pages ?? [])].map((p, i) => ({ p, i })).reverse();
  const doneToday = !!book?.pages.some((p) => p.date === todayKey() && p.items.length > 0);
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { key, label: d.toLocaleDateString(undefined, { weekday: "narrow" }), done: streak.days.includes(key), today: i === 6 };
  });

  return (
    <div className="home">
      <header className="home-head">
        <div className="brand">
          <span className="orb" />
          Patchlet
        </div>
        <div className="streak" title="Days in a row you've made something">
          <span className="flame">🔥</span>
          <b>{streak.count}</b>
          <span className="hide-sm">day streak</span>
        </div>
      </header>

      <section className="hero">
        <div>
          <h1>
            {greet()}, {name} ✿
          </h1>
          <p>One little page a day. Cut, tape and tuck your memories in, then flip through them like a book.</p>
          <div className="hero-actions">
            <Link href="/book" className="btn primary big">
              {doneToday ? "Open today’s page" : "Start today’s page"} →
            </Link>
            <button className="btn big" onClick={() => setFlip(true)} disabled={!pages.length}>
              📖 Flip through
            </button>
          </div>
        </div>
        <div className="daily">
          <div className="daily-tape" />
          <small>This week</small>
          <div className="week big-week">
            {week.map((d) => (
              <span key={d.key} className={`wd ${d.done ? "done" : ""} ${d.today ? "today" : ""}`}>
                <i>{d.done ? "✓" : ""}</i>
                {d.label}
              </span>
            ))}
          </div>
          <h3>
            {streak.count > 0 ? `${streak.count} ${streak.count === 1 ? "day" : "days"} in a row` : "Make your first page today"}
          </h3>
        </div>
      </section>

      <h2 className="sec">My pages</h2>
      {pages.length === 0 ? (
        <div className="empty">
          <p>Nothing here yet. Your pages will show up as soon as you add something to today’s page.</p>
        </div>
      ) : (
        <div className="books">
          {pages.map(({ p, i }) => (
            <Link key={p.id} href={`/book?p=${p.id}`} className="book-card page-card">
              <div className="cover">
                <PageStatic page={p} width={220} />
              </div>
              <div className="meta">
                <div>
                  <h3>{label(p.date, i)}</h3>
                  <small>Page {i + 1}</small>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {flip && book && <Flipbook book={book} name={name} onClose={() => setFlip(false)} />}
      <footer className="foot">Everything is saved on this device. No account needed.</footer>
    </div>
  );
}

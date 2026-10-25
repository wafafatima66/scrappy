"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { loadLocalAvatar, useSession } from "@/lib/auth";
import { dayPages } from "@/lib/book";
import { loadBookFor } from "@/lib/bookload";
import { todayKey } from "@/lib/daily";
import { scheduleStreakReminders } from "@/lib/notify";
import { readStreak } from "@/lib/store";
import { Book } from "@/lib/types";
import AuthScreen from "./AuthScreen";
import Avatar from "./Avatar";
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
  const s = useSession();
  const [book, setBook] = useState<Book | null>(null);
  const [streak, setStreak] = useState({ count: 0, days: [] as string[] });
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    if (s.status !== "in") return;
    loadLocalAvatar();
    loadBookFor(s).then((b) => {
      setBook(b);
      const st = readStreak();
      setStreak(st);
      const done = b.pages.some((p) => p.kind === "day" && p.date === todayKey() && p.items.length > 0);
      void scheduleStreakReminders({ name: s.name, streak: st.count, doneToday: done });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.status, s.uid, s.name]);

  if (s.status === "loading") return <div className="center-msg">Opening Patchlet…</div>;
  if (s.status === "out") return <AuthScreen />;

  const days = book ? dayPages(book) : [];
  const pages = days.map((p, i) => ({ p, i })).reverse();
  const doneToday = days.some((p) => p.date === todayKey() && p.items.length > 0);
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { key, label: d.toLocaleDateString(undefined, { weekday: "narrow" }), done: streak.days.includes(key), today: i === 6 };
  });
  const cover = book?.pages[0];
  const back = book?.pages[book.pages.length - 1];

  return (
    <div className="home">
      <header className="home-head">
        <div className="brand">
          <span className="orb" />
          Patchlet
        </div>
        <div className="head-right">
          <div className="streak" title="Days in a row you've made something">
            <span className="flame">🔥</span>
            <b>{streak.count}</b>
            <span className="hide-sm">day streak</span>
          </div>
          <Link href="/profile" className="avatar-btn" aria-label="Profile and settings">
            <Avatar name={s.name} url={s.photoURL} size={44} />
          </Link>
        </div>
      </header>

      <section className="hero">
        <div>
          <h1>
            {greet()}, {s.name} ✿
          </h1>
          <p>One little page a day. Cut, tape and tuck your memories in, then flip through them like a book.</p>
          <div className="hero-actions">
            <Link href="/book" className="btn primary big">
              {doneToday ? "Open today’s page" : "Start today’s page"} →
            </Link>
            <button className="btn big" onClick={() => setFlip(true)} disabled={!book}>
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
          <h3>{streak.count > 0 ? `${streak.count} ${streak.count === 1 ? "day" : "days"} in a row` : "Make your first page today"}</h3>
        </div>
      </section>

      <h2 className="sec">Cover &amp; back page</h2>
      <div className="books small">
        {cover && (
          <Link href="/book?p=cover" className="book-card page-card">
            <div className="cover">
              <PageStatic page={cover} width={150} />
            </div>
            <div className="meta">
              <div>
                <h3>Front cover</h3>
                <small>Tap to customise</small>
              </div>
            </div>
          </Link>
        )}
        {back && (
          <Link href="/book?p=back" className="book-card page-card">
            <div className="cover">
              <PageStatic page={back} width={150} />
            </div>
            <div className="meta">
              <div>
                <h3>End page</h3>
                <small>Tap to customise</small>
              </div>
            </div>
          </Link>
        )}
      </div>

      <h2 className="sec">My pages</h2>
      {pages.length === 0 ? (
        <div className="empty">
          <p>Nothing here yet. Your pages show up as soon as you add something to today’s page.</p>
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

      {flip && book && <Flipbook book={book} name={s.name} onClose={() => setFlip(false)} />}
      <footer className="foot">
        {s.local ? "Saved on this device." : "Backed up to your account."} · <Link href="/privacy">Privacy</Link>
      </footer>
    </div>
  );
}

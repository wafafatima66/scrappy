"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { changeAvatar, changeName, deleteAccount, friendlyAuthError, loadLocalAvatar, logout, useSession } from "@/lib/auth";
import { todayKey } from "@/lib/daily";
import { isNative } from "@/lib/native";
import { readNotify, scheduleStreakReminders, writeNotify } from "@/lib/notify";
import { playClick, setSoundOn, soundOn } from "@/lib/sound";
import { readStreak, loadMainBook } from "@/lib/store";
import Avatar from "./Avatar";

export default function ProfileApp() {
  const s = useSession();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [sound, setSound] = useState(true);
  const [notify, setNotify] = useState({ enabled: true, hour: 20, minute: 0 });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pw, setPw] = useState("");

  useEffect(() => {
    if (s.status === "out") router.replace("/");
    if (s.status === "in") {
      setName(s.name);
      loadLocalAvatar();
    }
  }, [s.status, s.name, router]);

  useEffect(() => {
    setSound(soundOn());
    setNotify(readNotify());
  }, []);

  const flash = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(""), 2600);
  };

  const applyNotify = async (n: typeof notify) => {
    setNotify(n);
    writeNotify(n);
    const book = await loadMainBook(s.name);
    const done = book.pages.some((p) => p.kind === "day" && p.date === todayKey() && p.items.length > 0);
    await scheduleStreakReminders({ name: s.name, streak: readStreak().count, doneToday: done });
  };

  if (s.status !== "in") return <div className="center-msg">Loading…</div>;

  const time = `${String(notify.hour).padStart(2, "0")}:${String(notify.minute).padStart(2, "0")}`;

  return (
    <div className="home profile">
      <header className="home-head">
        <Link href="/" className="btn round" aria-label="Back home">
          ‹
        </Link>
        <h2 className="sec" style={{ margin: 0 }}>
          Profile
        </h2>
        <span style={{ width: 40 }} />
      </header>

      <section className="card">
        <div className="avatar-row">
          <button className="avatar-big" onClick={() => fileRef.current?.click()} aria-label="Change profile photo">
            <Avatar name={s.name} url={s.photoURL} size={96} />
            <span className="cam">📷</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setBusy(true);
              try {
                await changeAvatar(f);
                flash("Photo updated");
              } catch {
                flash("Couldn't upload the photo. Check your connection.");
              } finally {
                setBusy(false);
                e.target.value = "";
              }
            }}
          />
          <div>
            <b className="big-name">{s.name}</b>
            <div className="muted">{s.email || "Saved on this device"}</div>
            <button className="linklike" onClick={() => fileRef.current?.click()}>
              Change photo
            </button>
          </div>
        </div>
        <label className="lbl">Your name</label>
        <div className="row-input">
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={20} aria-label="Name" />
          <button
            className="btn primary"
            disabled={!name.trim() || name.trim() === s.name || busy}
            onClick={async () => {
              await changeName(name);
              flash("Name saved. Your cover keeps its old text until you edit it.");
            }}
          >
            Save
          </button>
        </div>
      </section>

      <section className="card">
        <label className="switch-row">
          <span>
            <b>Click sounds</b>
            <small>A soft tick when you tap</small>
          </span>
          <input
            type="checkbox"
            checked={sound}
            onChange={(e) => {
              setSound(e.target.checked);
              setSoundOn(e.target.checked);
              if (e.target.checked) playClick();
            }}
          />
        </label>
        <label className="switch-row">
          <span>
            <b>Streak reminder</b>
            <small>{isNative() ? "A daily nudge to add today's page" : "Reminders work in the Android app"}</small>
          </span>
          <input type="checkbox" checked={notify.enabled} onChange={(e) => applyNotify({ ...notify, enabled: e.target.checked })} />
        </label>
        {notify.enabled && (
          <label className="switch-row">
            <span>
              <b>Remind me at</b>
            </span>
            <input
              type="time"
              value={time}
              onChange={(e) => {
                const [h, m] = e.target.value.split(":").map(Number);
                if (!Number.isNaN(h)) applyNotify({ ...notify, hour: h, minute: m || 0 });
              }}
            />
          </label>
        )}
      </section>

      <section className="card">
        <Link href="/privacy" className="menu-link">
          Privacy policy ›
        </Link>
        {!s.local && (
          <>
            <button
              className="menu-link"
              onClick={async () => {
                await logout();
                router.replace("/");
              }}
            >
              Log out
            </button>
            <button className="menu-link danger-text" onClick={() => setDeleting((d) => !d)}>
              Delete my account
            </button>
            {deleting && (
              <div className="delete-box">
                <p>This permanently deletes your account, pages and photos. Type your password to confirm.</p>
                <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password" aria-label="Password" />
                <button
                  className="btn danger-btn"
                  disabled={!pw || busy}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await deleteAccount(pw);
                      router.replace("/");
                    } catch (e) {
                      flash(friendlyAuthError(e));
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Delete everything
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {msg && <div className="toast">{msg}</div>}
    </div>
  );
}

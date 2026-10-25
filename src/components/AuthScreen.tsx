"use client";
import React, { useState } from "react";
import { friendlyAuthError, resetPassword, setLocalName, signIn, signUp } from "@/lib/auth";
import { firebaseReady } from "@/lib/firebase";

// One screen: create an account or log in with email + password.
export default function AuthScreen() {
  const [mode, setMode] = useState<"up" | "in">("up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    if (!firebaseReady) return setLocalName(name);
    setBusy(true);
    try {
      if (mode === "up") await signUp(name, email, pw);
      else await signIn(email, pw);
    } catch (err) {
      setMsg(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    if (!email.trim()) return setMsg("Type your email above first, then tap “Forgot password”.");
    try {
      await resetPassword(email);
      setMsg("Reset link sent. Check your email.");
    } catch (err) {
      setMsg(friendlyAuthError(err));
    }
  };

  const local = !firebaseReady;
  const canSubmit = local ? !!name.trim() : mode === "up" ? !!name.trim() && !!email.trim() && pw.length >= 6 : !!email.trim() && !!pw;

  return (
    <main className="welcome">
      <div className="brand big-brand">
        <span className="orb" />
        Patchlet
      </div>
      <form className="welcome-card" onSubmit={submit}>
        <div className="daily-tape" />
        {!local && (
          <div className="seg" role="tablist">
            <button type="button" role="tab" aria-selected={mode === "up"} className={mode === "up" ? "on" : ""} onClick={() => setMode("up")}>
              Create account
            </button>
            <button type="button" role="tab" aria-selected={mode === "in"} className={mode === "in" ? "on" : ""} onClick={() => setMode("in")}>
              Log in
            </button>
          </div>
        )}
        <h1>{local ? "What should we call you?" : mode === "up" ? "Let’s make your Patchlet" : "Welcome back"}</h1>
        {(local || mode === "up") && (
          <>
            <p>Your name goes on the cover and the last page of your book.</p>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={20} aria-label="Your name" autoComplete="given-name" />
          </>
        )}
        {!local && (
          <>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" aria-label="Email" autoComplete="email" inputMode="email" />
            <div className="pw">
              <input type={show ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password (6+ characters)" aria-label="Password" autoComplete={mode === "up" ? "new-password" : "current-password"} />
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}>
                {show ? "🙈" : "👁"}
              </button>
            </div>
          </>
        )}
        {msg && <div className="auth-msg">{msg}</div>}
        <button className="btn primary big" disabled={!canSubmit || busy}>
          {busy ? "One moment…" : local ? "Start today’s page →" : mode === "up" ? "Create account →" : "Log in →"}
        </button>
        {!local && mode === "in" && (
          <button type="button" className="linklike" onClick={forgot}>
            Forgot password?
          </button>
        )}
        {local && <small className="hint">Cloud login isn’t set up yet, so your pages stay on this device.</small>}
      </form>
      <p className="foot">
        By continuing you agree to our <a href="/privacy">privacy policy</a>.
      </p>
    </main>
  );
}

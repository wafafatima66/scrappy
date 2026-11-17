"use client";
import { useEffect } from "react";
import { track } from "@/lib/analytics";
import { playLinkFor, readUtm } from "@/lib/site";

// Landing-page buttons carry data-track="play_store" / "try_web" / "request_access" and data-place="hero".
// One listener reports the click, and Play Store buttons carry the visitor's source (e.g. instagram) into Google Play.
export default function TrackClicks() {
  useEffect(() => {
    readUtm();
    const on = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-track]");
      if (!el) return;
      if (el instanceof HTMLAnchorElement && el.dataset.play !== undefined) el.href = playLinkFor(readUtm());
      track(el.dataset.track as string, { placement: el.dataset.place ?? "" });
    };
    document.addEventListener("click", on);
    return () => document.removeEventListener("click", on);
  }, []);
  return null;
}

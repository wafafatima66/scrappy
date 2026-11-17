"use client";
import dynamic from "next/dynamic";
import React from "react";

// The sample pages use the whole sticker catalogue, so they load after the page text instead of blocking it.
const Pages = dynamic(() => import("./HeroPagesInner"), { ssr: false, loading: () => <div className="lp-ph" aria-hidden="true" /> });

export default function HeroPages({ mode }: { mode: "hero" | "gallery" }) {
  return <Pages mode={mode} />;
}

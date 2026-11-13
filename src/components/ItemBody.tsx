"use client";
import React from "react";
import { bgCss } from "@/lib/backgrounds";
import { findEntry } from "@/lib/catalog";
import { FONT_CSS } from "@/lib/fonts";
import { PBG_GRADIENTS } from "@/lib/photoBg";
import { EdgeKind, Item } from "@/lib/types";

function rng(seed: number) {
  let s = (seed * 9301 + 49297) % 233280;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// jagged rectangle clip-path in %, deterministic per seed (used by torn photo frames)
export function jagged(seed: number, inset = 0, amp = 1.6, steps = 26) {
  const r = rng(seed + 11);
  const pts: string[] = [];
  const p = (x: number, y: number) => pts.push(`${(x + (r() - 0.5) * amp).toFixed(2)}% ${(y + (r() - 0.5) * amp).toFixed(2)}%`);
  const a = inset;
  const b = 100 - inset;
  for (let i = 0; i < steps; i++) p(a + ((b - a) * i) / steps, a);
  for (let i = 0; i < steps; i++) p(b, a + ((b - a) * i) / steps);
  for (let i = 0; i < steps; i++) p(b - ((b - a) * i) / steps, b);
  for (let i = 0; i < steps; i++) p(a, b - ((b - a) * i) / steps);
  return `polygon(${pts.join(",")})`;
}

// How far the cut edge dips inward at distance s along a side.
function dip(kind: EdgeKind, s: number, noise: number[], step: number): number {
  switch (kind) {
    case "torn": {
      const f = s / 11;
      const i = Math.floor(f);
      const t = f - i;
      const n = noise[i % noise.length] * (1 - t) + noise[(i + 1) % noise.length] * t;
      return 2 + n * 9;
    }
    case "deckle":
      return 1 + noise[Math.floor(s / step) % noise.length] * 3;
    case "wavy":
      return 4 + 4 * Math.sin((s / 30) * Math.PI * 2);
    case "zigzag": {
      const u = (s % 16) / 16;
      return 9 * (u < 0.5 ? u * 2 : 2 - u * 2);
    }
    case "scallop": {
      const r = 9;
      const u = (s % (2 * r)) - r;
      return r - Math.sqrt(Math.max(0, r * r - u * u));
    }
    case "perf": {
      const sp = 16;
      const rn = 4.5;
      const u = (s % sp) - sp / 2;
      return Math.abs(u) < rn ? Math.sqrt(rn * rn - u * u) : 0;
    }
  }
}

// px polygon following the item box with a decorative cut edge
export function edgePolygon(kind: EdgeKind, seed: number, w: number, h: number): string {
  const r = rng(seed + 5);
  const noise = Array.from({ length: 400 }, () => r());
  const step = kind === "torn" ? 5 : kind === "deckle" ? 4 : kind === "perf" || kind === "scallop" ? 2 : 3;
  const pts: string[] = [];
  const side = (len: number, place: (s: number, d: number) => [number, number]) => {
    for (let s = 0; s < len; s += step) {
      const [x, y] = place(s, dip(kind, s, noise, step));
      pts.push(`${x.toFixed(1)}px ${y.toFixed(1)}px`);
    }
  };
  side(w, (s, d) => [s, d]); // top, left → right
  side(h, (s, d) => [w - d, s]); // right, top → bottom
  side(w, (s, d) => [w - s, h - d]); // bottom, right → left
  side(h, (s, d) => [d, h - s]); // left, bottom → top
  return `polygon(${pts.join(",")})`;
}

const SHADOW = "drop-shadow(1px 2px 2px rgba(60,40,20,.32)) drop-shadow(0 6px 8px rgba(60,40,20,.12))";

function Draw({ item }: { item: Item }) {
  const sw = item.sw ?? 4;
  const pen = item.pen ?? "pen";
  const dash = pen === "dots" ? `0.1 ${sw * 2.6}` : pen === "dash" ? `${sw * 3.4} ${sw * 2.6}` : undefined;
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${item.w} ${item.h}`} style={{ display: "block", overflow: "visible" }}>
      <path
        d={item.path}
        fill="none"
        stroke={item.color ?? "#2d2a33"}
        strokeWidth={pen === "marker" ? sw * 3.2 : sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dash}
        opacity={pen === "marker" ? 0.45 : 0.95}
        style={pen === "marker" ? { mixBlendMode: "multiply" } : undefined}
      />
    </svg>
  );
}

export default function ItemBody({ item }: { item: Item }) {
  const clipPath = item.clip && item.clip.length >= 6
    ? `polygon(${Array.from({ length: item.clip.length / 2 }, (_, i) => `${(item.clip![i * 2] * 100).toFixed(2)}% ${(item.clip![i * 2 + 1] * 100).toFixed(2)}%`).join(",")})`
    : item.edge && item.kind !== "text" && item.kind !== "draw"
      ? edgePolygon(item.edge, item.seed ?? 7, item.w, item.h)
      : undefined;

  const body = <Inner item={item} cut={!!clipPath} />;
  if (!clipPath) return body;
  return (
    <div style={{ width: "100%", height: "100%", filter: SHADOW }}>
      <div style={{ width: "100%", height: "100%", clipPath }}>{body}</div>
    </div>
  );
}


// A photo with its background removed, optionally sitting on a colour, paper, gradient, blur or another photo.
function CutPhoto({ item }: { item: Item }) {
  const bg = item.pbg;
  const bgStyle: React.CSSProperties =
    bg?.k === "color" ? { background: bg.v } : bg?.k === "paper" ? { background: bgCss(bg.v ?? "cream") } : bg?.k === "gradient" ? { background: PBG_GRADIENTS.find((g) => g[0] === bg.v)?.[1] } : {};
  const outline = "drop-shadow(2px 0 0 #fff) drop-shadow(-2px 0 0 #fff) drop-shadow(0 2px 0 #fff) drop-shadow(0 -2px 0 #fff) drop-shadow(1px 3px 3px rgba(60,40,20,.35))";
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {bg && (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 4, boxShadow: "1px 3px 6px rgba(60,40,20,.3)", ...bgStyle }}>
          {bg.k === "blur" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.src} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(14px) saturate(1.15)", transform: "scale(1.15)" }} />
          )}
          {bg.k === "photo" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bg.v} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )}
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.cut}
        alt=""
        draggable={false}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none", filter: bg ? "drop-shadow(1px 2px 3px rgba(40,30,20,.35))" : item.outline ? outline : "drop-shadow(1px 3px 4px rgba(60,40,20,.3))" }}
      />
    </div>
  );
}

function Inner({ item, cut }: { item: Item; cut: boolean }) {
  if (item.kind === "draw") return <Draw item={item} />;

  if (item.kind === "img") {
    const src = item.src ?? findEntry(item.ref)?.src;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        draggable={false}
        style={{ width: "100%", height: "100%", display: "block", filter: cut ? undefined : SHADOW, transform: item.flip || item.flipV ? `scale(${item.flip ? -1 : 1}, ${item.flipV ? -1 : 1})` : undefined, pointerEvents: "none" }}
      />
    );
  }

  if (item.kind === "text") {
    const size = item.size ?? 34;
    const accent = item.accent ?? "#e8c58a";
    const base: React.CSSProperties = {
      fontFamily: FONT_CSS[item.font ?? "hand"],
      fontSize: size,
      lineHeight: 1.15,
      color: item.color ?? "#2d2a33",
      textAlign: "center",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      width: "100%",
    };
    if (item.style === "strip") {
      return (
        <div
          style={{
            ...base,
            color: "#3b3128",
            background: "linear-gradient(180deg,#f7efdd,#efe3c8)",
            padding: `${size * 0.3}px ${size * 0.5}px`,
            boxSizing: "border-box",
            clipPath: jagged(item.seed ?? 3, 0, 0.8, 14),
          }}
        >
          {item.text}
        </div>
      );
    }
    if (item.style === "tag") {
      return (
        <div
          style={{
            ...base,
            color: "#fff",
            background: item.color && item.color !== "#ffffff" ? item.color : "#8d7aa8",
            padding: `${size * 0.3}px ${size * 0.6}px`,
            boxSizing: "border-box",
            borderRadius: "4px 12px 12px 4px",
            boxShadow: "1px 2px 4px rgba(60,40,20,.35)",
          }}
        >
          {item.text}
        </div>
      );
    }
    if (item.style === "shadow") {
      const o = Math.max(2, size * 0.07);
      return <div style={{ ...base, textShadow: `${o}px ${o}px 0 ${accent}, ${o * 1.5}px ${o * 1.5}px 0 ${accent}88` }}>{item.text}</div>;
    }
    if (item.style === "outline") {
      return <div style={{ ...base, WebkitTextStroke: `${Math.max(1.5, size * 0.045)}px ${accent}`, paintOrder: "stroke fill" }}>{item.text}</div>;
    }
    if (item.style === "neon") {
      const g = Math.max(3, size * 0.12);
      return <div style={{ ...base, color: "#fffdf6", textShadow: `0 0 ${g * 0.5}px #fff, 0 0 ${g}px ${accent}, 0 0 ${g * 2}px ${accent}, 0 0 ${g * 3.5}px ${accent}` }}>{item.text}</div>;
    }
    if (item.style === "retro") {
      const o = Math.max(2, size * 0.06);
      const sh = Array.from({ length: 5 }, (_, i) => `${(i + 1) * o * 0.7}px ${(i + 1) * o * 0.7}px 0 ${i % 2 ? "#2d2a33" : accent}`).join(", ");
      return <div style={{ ...base, textShadow: sh }}>{item.text}</div>;
    }
    if (item.style === "stamp") {
      return (
        <div style={{ ...base, textTransform: "uppercase", letterSpacing: size * 0.08, opacity: 0.88 }}>
          <span style={{ display: "inline-block", border: `${Math.max(2, size * 0.09)}px double ${item.color ?? "#b5546a"}`, borderRadius: size * 0.18, padding: `${size * 0.12}px ${size * 0.4}px` }}>{item.text}</span>
        </div>
      );
    }
    if (item.style === "sticker") {
      const o = Math.max(2, size * 0.09);
      const ring = [[o, 0], [-o, 0], [0, o], [0, -o], [o * 0.7, o * 0.7], [-o * 0.7, o * 0.7], [o * 0.7, -o * 0.7], [-o * 0.7, -o * 0.7]].map(([x, y]) => `${x}px ${y}px 0 ${accent}`).join(", ");
      return <div style={{ ...base, textShadow: ring, filter: "drop-shadow(1px 2px 2px rgba(40,30,20,.4))" }}>{item.text}</div>;
    }
    if (item.style === "underline") {
      return (
        <div style={base}>
          <span style={{ textDecoration: "underline wavy", textDecorationColor: accent, textDecorationThickness: Math.max(2, size * 0.06), textUnderlineOffset: size * 0.14 }}>{item.text}</span>
        </div>
      );
    }
    if (item.style === "label") {
      return (
        <div style={{ ...base, color: "#f4f1ea", background: "linear-gradient(180deg,#34303a,#1f1c24)", padding: `${size * 0.22}px ${size * 0.5}px`, boxSizing: "border-box", borderRadius: size * 0.12, textTransform: "uppercase", letterSpacing: size * 0.1, textShadow: "0 -1px 0 rgba(0,0,0,.6), 0 1px 0 rgba(255,255,255,.15)", boxShadow: "inset 0 0 0 2px rgba(255,255,255,.12), 1px 2px 4px rgba(40,30,20,.4)" }}>
          {item.text}
        </div>
      );
    }
    if (item.style === "highlight") {
      return (
        <div style={base}>
          <span
            style={{
              background: `linear-gradient(176deg, transparent 18%, ${accent} 18%, ${accent} 88%, transparent 88%)`,
              padding: `0 ${size * 0.25}px`,
              boxDecorationBreak: "clone",
              WebkitBoxDecorationBreak: "clone",
            }}
          >
            {item.text}
          </span>
        </div>
      );
    }
    return (
      <div style={{ ...base, textShadow: item.color === "#ffffff" || item.color === "#f6efe0" ? "0 1px 2px rgba(0,0,0,.35)" : undefined }}>
        {item.text}
      </div>
    );
  }

  // photo
  if (item.cut) return <CutPhoto item={item} />;
  const frame = item.frame ?? "polaroid";
  const seed = item.seed ?? 5;
  if (frame === "polaroid") {
    const pad = item.w * 0.06;
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(160deg,#fbf9f3,#efece3)",
          padding: `${pad}px ${pad}px ${item.w * 0.2}px`,
          boxShadow: cut ? undefined : "1px 3px 8px rgba(60,40,20,.38), 0 1px 1px rgba(0,0,0,.2)",
          borderRadius: 2,
          boxSizing: "border-box",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.src}
          alt=""
          draggable={false}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "contrast(1.04) saturate(.92) sepia(.08)", pointerEvents: "none" }}
        />
      </div>
    );
  }
  if (frame === "torn") {
    return (
      <div style={{ width: "100%", height: "100%", filter: cut ? undefined : SHADOW }}>
        <div style={{ width: "100%", height: "100%", background: "#fbf9f3", clipPath: jagged(seed, 0, 2.2) }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.src}
            alt=""
            draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", clipPath: jagged(seed + 3, 2.4, 1.8), pointerEvents: "none" }}
          />
        </div>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.src}
      alt=""
      draggable={false}
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", border: cut ? undefined : "3px solid #fbf9f3", boxShadow: cut ? undefined : "1px 3px 6px rgba(60,40,20,.4)", boxSizing: "border-box", pointerEvents: "none" }}
    />
  );
}

export function itemStyle(it: Item): React.CSSProperties {
  return {
    position: "absolute",
    left: it.x,
    top: it.y,
    width: it.w,
    height: it.kind === "text" ? "auto" : it.h,
    transform: `rotate(${it.r}deg)`,
    transformOrigin: "50% 50%",
  };
}

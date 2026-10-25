"use client";
import React from "react";
import { BY_ID } from "@/lib/catalog";
import { FONT_CSS } from "@/lib/fonts";
import { Item } from "@/lib/types";

function rng(seed: number) {
  let s = (seed * 9301 + 49297) % 233280;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// jagged rectangle clip-path, deterministic per seed
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

const SHADOW = "drop-shadow(1px 2px 2px rgba(60,40,20,.32)) drop-shadow(0 6px 8px rgba(60,40,20,.12))";

export default function ItemBody({ item }: { item: Item }) {
  if (item.kind === "img") {
    const src = item.ref ? BY_ID[item.ref]?.src : item.src;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        draggable={false}
        style={{ width: "100%", height: "100%", display: "block", filter: SHADOW, transform: item.flip ? "scaleX(-1)" : undefined, pointerEvents: "none" }}
      />
    );
  }

  if (item.kind === "text") {
    const size = item.size ?? 34;
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
    return (
      <div style={{ ...base, textShadow: item.color === "#ffffff" || item.color === "#f6efe0" ? "0 1px 2px rgba(0,0,0,.35)" : undefined }}>
        {item.text}
      </div>
    );
  }

  // photo
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
          boxShadow: "1px 3px 8px rgba(60,40,20,.38), 0 1px 1px rgba(0,0,0,.2)",
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
      <div style={{ width: "100%", height: "100%", filter: SHADOW }}>
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
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", border: "3px solid #fbf9f3", boxShadow: "1px 3px 6px rgba(60,40,20,.4)", boxSizing: "border-box", pointerEvents: "none" }}
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

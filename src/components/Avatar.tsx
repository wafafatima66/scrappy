"use client";
import React from "react";

export default function Avatar({ name, url, size = 44 }: { name: string; url?: string; size?: number }) {
  const initial = (name.trim()[0] ?? "?").toUpperCase();
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={name} width={size} height={size} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", display: "block" }} />
  ) : (
    <span className="avatar-fallback" style={{ width: size, height: size, fontSize: size * 0.45 }}>
      {initial}
    </span>
  );
}

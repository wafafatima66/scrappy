"use client";
import React, { useRef } from "react";
import { bgCss } from "@/lib/backgrounds";
import { PAGE_H, PAGE_W, Item, Page } from "@/lib/types";
import ItemBody, { itemStyle } from "./ItemBody";

interface Props {
  page: Page;
  k: number; // screen px per page unit
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onItems: (items: Item[]) => void; // live update, no history
  onBegin: () => void; // call before a gesture so history can snapshot
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onEditText: (id: string) => void;
}

type Pt = { x: number; y: number };

export default function EditorCanvas({ page, k, selectedId, onSelect, onItems, onBegin, onDelete, onDuplicate, onEditText }: Props) {
  const pointers = useRef(new Map<number, Pt>());
  const g = useRef<
    | null
    | { mode: "move"; id: string; sx: number; sy: number; ox: number; oy: number }
    | { mode: "xform"; id: string; cx: number; cy: number; a0: number; d0: number; o: Item }
    | { mode: "pinch"; id: string; d0: number; a0: number; o: Item }
  >(null);
  const itemsRef = useRef(page.items);
  itemsRef.current = page.items;

  const patch = (id: string, p: Partial<Item>) => onItems(itemsRef.current.map((it) => (it.id === id ? { ...it, ...p } : it)));

  const downItem = (e: React.PointerEvent<HTMLDivElement>, it: Item) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (selectedId !== it.id) onSelect(it.id);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      g.current = { mode: "pinch", id: it.id, d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, a0: Math.atan2(b.y - a.y, b.x - a.x), o: { ...it } };
      return;
    }
    onBegin();
    g.current = { mode: "move", id: it.id, sx: e.clientX, sy: e.clientY, ox: it.x, oy: it.y };
  };

  const downHandle = (e: React.PointerEvent<HTMLDivElement>, it: Item) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    onBegin();
    const box = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    g.current = {
      mode: "xform",
      id: it.id,
      cx,
      cy,
      a0: Math.atan2(e.clientY - cy, e.clientX - cx),
      d0: Math.hypot(e.clientX - cx, e.clientY - cy) || 1,
      o: { ...it },
    };
  };

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = g.current;
    if (!s) return;
    if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (s.mode === "move" && pointers.current.size < 2) {
      patch(s.id, { x: s.ox + (e.clientX - s.sx) / k, y: s.oy + (e.clientY - s.sy) / k });
    } else if (s.mode === "xform") {
      const sc = Math.max(0.15, Math.hypot(e.clientX - s.cx, e.clientY - s.cy) / s.d0);
      const da = ((Math.atan2(e.clientY - s.cy, e.clientX - s.cx) - s.a0) * 180) / Math.PI;
      applyXform(s.o, sc, s.o.r + da);
    } else if (s.mode === "pinch" && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const sc = Math.max(0.15, Math.hypot(a.x - b.x, a.y - b.y) / s.d0);
      const da = ((Math.atan2(b.y - a.y, b.x - a.x) - s.a0) * 180) / Math.PI;
      applyXform(s.o, sc, s.o.r + da);
    }
  };

  const applyXform = (o: Item, sc: number, r: number) => {
    const w = Math.max(24, o.w * sc);
    const realSc = w / o.w;
    const p: Partial<Item> = { w, r, x: o.x + o.w / 2 - w / 2 };
    if (o.kind === "text") p.size = (o.size ?? 34) * realSc;
    else {
      p.h = o.h * realSc;
      p.y = o.y + o.h / 2 - p.h / 2;
    }
    patch(o.id, p);
  };

  const up = (e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) g.current = null;
    else if (g.current?.mode === "pinch") {
      // one finger left: resume moving from the current spot
      const it = itemsRef.current.find((i) => i.id === (g.current as { id: string }).id);
      const [rest] = [...pointers.current.values()];
      g.current = it ? { mode: "move", id: it.id, sx: rest.x, sy: rest.y, ox: it.x, oy: it.y } : null;
    }
  };

  const hs = 30 / k; // handle size in page units (≈30 screen px)

  return (
    <div
      style={{ width: PAGE_W * k, height: PAGE_H * k, position: "relative", touchAction: "none", boxShadow: "0 2px 4px rgba(60,40,20,.2), 0 18px 40px rgba(60,40,20,.22)", borderRadius: 3 }}
      id="editor-page"
    >
      <div style={{ width: PAGE_W * k, height: PAGE_H * k, overflow: "hidden", borderRadius: 3, position: "absolute", inset: 0 }}>
        <div
          data-page-inner
          onPointerDown={() => onSelect(null)}
          style={{ width: PAGE_W, height: PAGE_H, transform: `scale(${k})`, transformOrigin: "0 0", background: bgCss(page.bg), backgroundSize: "100% 100%", position: "relative" }}
        >
          {page.items.map((it) => {
            const sel = it.id === selectedId;
            return (
              <div
                key={it.id}
                style={{ ...itemStyle(it), touchAction: "none", cursor: "grab", zIndex: sel ? 9999 : undefined, outline: sel ? `${1.6 / k}px dashed #7c65d6` : "none", outlineOffset: 3 / k }}
                onPointerDown={(e) => downItem(e, it)}
                onPointerMove={move}
                onPointerUp={up}
                onPointerCancel={up}
                onDoubleClick={() => it.kind === "text" && onEditText(it.id)}
              >
                <ItemBody item={it} />
                {sel && (
                  <>
                    <Handle pos="tl" size={hs} title="Delete" onClick={() => onDelete(it.id)} icon="✕" />
                    <div
                      onPointerDown={(e) => downHandle(e, it)}
                      onPointerMove={move}
                      onPointerUp={up}
                      title="Drag to resize and rotate"
                      style={{ ...handleBase(hs), right: -hs * 0.6, bottom: -hs * 0.6, cursor: "nwse-resize", touchAction: "none", background: "#7c65d6", color: "#fff" }}
                    >
                      ⤡
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const handleBase = (s: number): React.CSSProperties => ({
  position: "absolute",
  width: s,
  height: s,
  borderRadius: "50%",
  background: "#fff",
  boxShadow: "0 1px 4px rgba(0,0,0,.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: s * 0.55,
  lineHeight: 1,
  userSelect: "none",
  color: "#2d2a33",
});

function Handle({ pos, size, icon, title, onClick }: { pos: "tl" | "tr"; size: number; icon: string; title: string; onClick: () => void }) {
  return (
    <div
      title={title}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{ ...handleBase(size), [pos === "tl" ? "left" : "right"]: -size * 0.6, top: -size * 0.6, cursor: "pointer" }}
    >
      {icon}
    </div>
  );
}

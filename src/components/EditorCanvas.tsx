"use client";
import React, { useLayoutEffect, useRef, useState } from "react";
import { pageBackground } from "@/lib/pagebg";
import { PAGE_H, PAGE_W, Item, Page } from "@/lib/types";
import ItemBody, { itemStyle } from "./ItemBody";

export type CanvasMode = "edit" | "draw" | "cut";
export type Pt = [number, number];

interface Props {
  page: Page;
  k: number; // screen px per page unit
  selectedId: string | null;
  mode: CanvasMode;
  penPreview?: { color: string; width: number; pen: string }; // how the live stroke looks while drawing
  onSelect: (id: string | null) => void;
  onItems: (items: Item[]) => void; // live update, no history
  onBegin: () => void; // call before a gesture so history can snapshot
  onDelete: (id: string) => void;
  onEditText: (id: string) => void;
  onCutTool: () => void; // scissors handle tapped
  onStroke: (pts: Pt[]) => void; // finished pen stroke (page coordinates)
  onCutPath: (pts: Pt[]) => void; // finished freehand cut (page coordinates)
}

export default function EditorCanvas({ page, k, selectedId, mode, penPreview, onSelect, onItems, onBegin, onDelete, onEditText, onCutTool, onStroke, onCutPath }: Props) {
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const g = useRef<
    | null
    | { mode: "move"; id: string; sx: number; sy: number; ox: number; oy: number }
    | { mode: "xform"; id: string; cx: number; cy: number; a0: number; d0: number; o: Item }
    | { mode: "pinch"; id: string; d0: number; a0: number; o: Item }
  >(null);
  const itemsRef = useRef(page.items);
  itemsRef.current = page.items;
  const nodes = useRef<Record<string, HTMLDivElement | null>>({});
  const innerRef = useRef<HTMLDivElement>(null);
  const [boxH, setBoxH] = useState(0);
  const [live, setLive] = useState<Pt[]>([]);
  const liveRef = useRef<Pt[]>([]);

  const patch = (id: string, p: Partial<Item>) => onItems(itemsRef.current.map((it) => (it.id === id ? { ...it, ...p } : it)));

  // the selected item's real height (text boxes size themselves)
  useLayoutEffect(() => {
    const n = selectedId ? nodes.current[selectedId] : null;
    const h = n ? n.offsetHeight : 0;
    if (h !== boxH) setBoxH(h);
  });

  const downItem = (e: React.PointerEvent<HTMLDivElement>, it: Item) => {
    e.stopPropagation();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
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
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
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

  const applyXform = (o: Item, sc: number, r: number) => {
    const w = Math.max(24, o.w * sc);
    const realSc = w / o.w;
    const p: Partial<Item> = { w, r, x: o.x + o.w / 2 - w / 2 };
    if (o.kind === "text") p.size = (o.size ?? 34) * realSc;
    else {
      p.h = o.h * realSc;
      p.y = o.y + o.h / 2 - p.h / 2;
      if (o.kind === "draw") p.sw = (o.sw ?? 4) * realSc;
    }
    patch(o.id, p);
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

  const up = (e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) g.current = null;
    else if (g.current?.mode === "pinch") {
      const it = itemsRef.current.find((i) => i.id === (g.current as { id: string }).id);
      const [rest] = [...pointers.current.values()];
      g.current = it ? { mode: "move", id: it.id, sx: rest.x, sy: rest.y, ox: it.x, oy: it.y } : null;
    }
  };

  // ---- pen / scissors: draw on a transparent sheet above the page ----
  const toPage = (e: React.PointerEvent): Pt => {
    const r = innerRef.current!.getBoundingClientRect();
    return [(e.clientX - r.left) / k, (e.clientY - r.top) / k];
  };
  const drawDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation(); // keep the selected item selected while cutting
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    liveRef.current = [toPage(e)];
    setLive(liveRef.current);
  };
  const drawMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!liveRef.current.length) return;
    const p = toPage(e);
    const last = liveRef.current[liveRef.current.length - 1];
    if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 2.2) return;
    liveRef.current = [...liveRef.current, p];
    setLive(liveRef.current);
  };
  const drawUp = () => {
    const pts = liveRef.current;
    liveRef.current = [];
    setLive([]);
    if (pts.length < 2) return;
    if (mode === "draw") onStroke(pts);
    else if (mode === "cut") onCutPath(pts);
  };

  const livePath = live.length ? `M${live.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L")}` : "";
  const hs = 30 / k; // handle size in page units (about 30 screen px)
  const sel = page.items.find((i) => i.id === selectedId);
  const pp = penPreview;
  const dash = pp?.pen === "dots" ? `0.1 ${pp.width * 2.6}` : pp?.pen === "dash" ? `${pp.width * 3.4} ${pp.width * 2.6}` : undefined;

  return (
    <div
      style={{ width: PAGE_W * k, height: PAGE_H * k, position: "relative", touchAction: "none", boxShadow: "0 2px 4px rgba(60,40,20,.2), 0 18px 40px rgba(60,40,20,.22)", borderRadius: 3 }}
      id="editor-page"
    >
      <div style={{ width: PAGE_W * k, height: PAGE_H * k, overflow: "hidden", borderRadius: 3, position: "absolute", inset: 0 }}>
        <div
          ref={innerRef}
          data-page-inner
          onPointerDown={() => onSelect(null)}
          style={{ width: PAGE_W, height: PAGE_H, transform: `scale(${k})`, transformOrigin: "0 0", background: pageBackground(page), position: "relative" }}
        >
          {/* items keep their stacking order; picking one never pops it above the others */}
          {page.items.map((it) => (
            <div
              key={it.id}
              ref={(n) => {
                nodes.current[it.id] = n;
              }}
              style={{ ...itemStyle(it), touchAction: "none", cursor: mode === "edit" ? "grab" : "default" }}
              onPointerDown={(e) => mode === "edit" && downItem(e, it)}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={up}
              onDoubleClick={() => it.kind === "text" && onEditText(it.id)}
            >
              <ItemBody item={it} />
            </div>
          ))}

          {/* selection box and handles live on their own top layer */}
          {sel && mode === "edit" && boxH > 0 && (
            <div
              style={{
                position: "absolute",
                left: sel.x,
                top: sel.y,
                width: sel.w,
                height: boxH,
                transform: `rotate(${sel.r}deg)`,
                transformOrigin: "50% 50%",
                outline: `${1.6 / k}px dashed #7c65d6`,
                outlineOffset: 3 / k,
                pointerEvents: "none",
                zIndex: 100000,
              }}
            >
              <Handle pos="tl" size={hs} title="Delete" icon="✕" onClick={() => onDelete(sel.id)} />
              {sel.kind !== "text" && <Handle pos="bl" size={hs} title="Cut or tear" icon="✂" onClick={onCutTool} />}
              <div
                onPointerDown={(e) => downHandle(e, sel)}
                onPointerMove={move}
                onPointerUp={up}
                title="Drag to resize and rotate"
                style={{ ...handleBase(hs), right: -hs * 0.6, bottom: -hs * 0.6, cursor: "nwse-resize", touchAction: "none", background: "#7c65d6", color: "#fff", pointerEvents: "auto" }}
              >
                ⤡
              </div>
            </div>
          )}

          {mode !== "edit" && (
            <div
              onPointerDown={drawDown}
              onPointerMove={drawMove}
              onPointerUp={drawUp}
              onPointerCancel={drawUp}
              style={{ position: "absolute", inset: 0, zIndex: 100001, cursor: "crosshair", touchAction: "none" }}
            >
              <svg width={PAGE_W} height={PAGE_H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                {livePath &&
                  (mode === "draw" ? (
                    <path
                      d={livePath}
                      fill="none"
                      stroke={pp?.color ?? "#2d2a33"}
                      strokeWidth={pp?.pen === "marker" ? (pp?.width ?? 4) * 3.2 : (pp?.width ?? 4)}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray={dash}
                      opacity={pp?.pen === "marker" ? 0.45 : 0.95}
                    />
                  ) : (
                    <path d={livePath} fill="rgba(124,101,214,.12)" stroke="#7c65d6" strokeWidth={2.4} strokeDasharray="7 6" strokeLinecap="round" />
                  ))}
              </svg>
            </div>
          )}
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

function Handle({ pos, size, icon, title, onClick }: { pos: "tl" | "bl"; size: number; icon: string; title: string; onClick: () => void }) {
  return (
    <div
      title={title}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{ ...handleBase(size), left: -size * 0.6, [pos === "tl" ? "top" : "bottom"]: -size * 0.6, cursor: "pointer", pointerEvents: "auto" }}
    >
      {icon}
    </div>
  );
}

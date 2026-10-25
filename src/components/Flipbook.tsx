"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { Book, Page } from "@/lib/types";
import PageStatic from "./PageStatic";

const PageBox = React.forwardRef<HTMLDivElement, { page: Page; width: number; hard?: boolean }>(function PageBox({ page, width, hard }, ref) {
  return (
    <div ref={ref} data-density={hard ? "hard" : "soft"} style={{ background: "#e9e0cf" }}>
      <PageStatic page={page} width={width} />
    </div>
  );
});

interface FlipApi {
  pageFlip: () => { flipNext: () => void; flipPrev: () => void; getCurrentPageIndex: () => number };
}

export default function Flipbook({ book, onClose }: { book: Book; name?: string; onClose: () => void }) {
  const ref = useRef<FlipApi | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [cur, setCur] = useState(0);

  // pages are already [cover, ...days, back]; keep the total even so the back cover lands on its own leaf
  const pages = useMemo(() => {
    const list = [...book.pages];
    if (list.length % 2 === 1) list.splice(list.length - 1, 0, { id: "blank", bg: "cream", items: [] });
    return list;
  }, [book]);

  useEffect(() => {
    const calc = () => {
      const narrow = window.innerWidth < 760;
      const availH = window.innerHeight - 150;
      const pw = narrow ? Math.min(window.innerWidth - 32, availH * 0.75) : Math.min((window.innerWidth - 80) / 2, availH * 0.75);
      setSize({ w: Math.floor(pw), h: Math.floor((pw * 4) / 3) });
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") ref.current?.pageFlip().flipNext();
      if (e.key === "ArrowLeft") ref.current?.pageFlip().flipPrev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose]);

  const Flip = HTMLFlipBook as unknown as React.ComponentType<Record<string, unknown>>;

  return (
    <div className="flip-overlay">
      <div className="flip-top">
        <button className="btn ghost" onClick={onClose}>
          ← Back to editing
        </button>
        <div className="flip-title">{book.title}</div>
        <span style={{ width: 120 }} />
      </div>
      <div className="flip-stage">
        {size.w > 0 && (
          <Flip
            ref={ref as never}
            width={size.w}
            height={size.h}
            size="fixed"
            minWidth={200}
            maxWidth={900}
            minHeight={260}
            maxHeight={1200}
            showCover
            drawShadow
            maxShadowOpacity={0.55}
            flippingTime={900}
            usePortrait
            startZIndex={0}
            autoSize
            mobileScrollSupport={false}
            clickEventForward
            useMouseEvents
            swipeDistance={30}
            showPageCorners
            disableFlipByClick={false}
            startPage={0}
            onFlip={(e: { data: number }) => setCur(e.data)}
            className="flipbook"
            style={{}}
          >
            {pages.map((p, i) => (
              <PageBox key={p.id + i} page={p} width={size.w} hard={i === 0 || i === pages.length - 1} />
            ))}
          </Flip>
        )}
      </div>
      <div className="flip-bar">
        <button className="btn round" onClick={() => ref.current?.pageFlip().flipPrev()} aria-label="Previous page">
          ‹
        </button>
        <span className="flip-count">
          {cur === 0 ? "Cover" : cur >= pages.length - 1 ? "The end" : `Page ${cur} of ${book.pages.length - 2}`}
        </span>
        <button className="btn round" onClick={() => ref.current?.pageFlip().flipNext()} aria-label="Next page">
          ›
        </button>
      </div>
    </div>
  );
}

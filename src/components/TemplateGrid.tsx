"use client";
import React, { useMemo } from "react";
import { TEMPLATES } from "@/lib/templates";
import { Page } from "@/lib/types";
import PageStatic from "./PageStatic";

// Little previews of every ready-made layout.
export default function TemplateGrid({ onPick }: { onPick: (id: string) => void }) {
  const items = useMemo(() => TEMPLATES.map((t) => ({ t, page: { id: `tpl-${t.id}`, kind: "day", bg: t.bg, items: t.build(), updated: 0 } as Page })), []);
  return (
    <div className="tplgrid">
      {items.map(({ t, page }) => (
        <button key={t.id} className="tpl" onClick={() => onPick(t.id)} title={t.label}>
          <PageStatic page={page} width={88} />
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

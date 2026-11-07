// More lace (many shapes, light and dark thread) and dark-colour labels.
import { Sticker, grain, inkFor, svgWrap, torn, uri } from "./procedural";

const out: Sticker[] = [];
const add = (id: string, cat: string, label: string, w: number, h: number, inner: string, dw?: number, dh?: number) =>
  out.push({ id, cat, label, src: uri(svgWrap(w, h, inner)), w: dw ?? w, h: dh ?? h });

export const LACE_COLS: [string, string][] = [
  ["white", "#fbf8f2"],
  ["cream", "#efe3c9"],
  ["blush", "#f5d6da"],
  ["lilac", "#dcd0ef"],
  ["sage", "#d4e1cd"],
  ["sky", "#d6e6f2"],
  ["butter", "#f6ecc4"],
  ["gold", "#d9bd7a"],
  ["black", "#26242a"],
  ["navy", "#2f3b57"],
  ["burgundy", "#6b2f3a"],
  ["forest", "#36503f"],
  ["aubergine", "#44335a"],
];

const ring = (cx: number, cy: number, r: number, n: number, hole: number, off = 0) =>
  Array.from({ length: n }, (_, k) => {
    const a = off + (k * Math.PI * 2) / n;
    return `<circle cx="${(cx + r * Math.cos(a)).toFixed(1)}" cy="${(cy + r * Math.sin(a)).toFixed(1)}" r="${hole}" fill="#000"/>`;
  }).join("");

// heart outline sampled from the classic parametric curve, centred in a box of size s
const heartPts = (cx: number, cy: number, s: number, n = 48) =>
  Array.from({ length: n }, (_, k) => {
    const t = (k / n) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return [cx + x * s, cy + y * s - s * 1.5] as const;
  });

LACE_COLS.forEach(([n, c], i) => {
  const g = (k: string) => `${k}${i}`;
  const wrap = (id: string, mask: string, body: string) =>
    `<defs><mask id="${g(id)}m">${`<rect width="400" height="400" fill="#fff"/>` + mask}</mask>${grain(g(id) + "g", i + 3, 0.9)}</defs><g filter="url(#${g(id)}g)"><g mask="url(#${g(id)}m)">${body}</g></g>`;

  // round crochet rosette
  add(
    `lace-rosette-${n}`,
    "lace",
    `${n} lace rosette`,
    200,
    200,
    wrap(
      "ro",
      `${ring(100, 100, 56, 12, 6.5)}${ring(100, 100, 30, 6, 9, 0.5)}<circle cx="100" cy="100" r="8" fill="#000"/>${ring(100, 100, 72, 24, 2.4, 0.13)}`,
      `${ring(100, 100, 80, 14, 0).replace(/fill="#000"/g, "")}${Array.from({ length: 14 }, (_, k) => `<circle cx="${100 + 84 * Math.cos((k * Math.PI * 2) / 14)}" cy="${100 + 84 * Math.sin((k * Math.PI * 2) / 14)}" r="13" fill="${c}"/>`).join("")}<circle cx="100" cy="100" r="84" fill="${c}"/>`,
    ),
    150,
    150,
  );

  // square doily
  const sq = Array.from({ length: 10 }, (_, k) => k);
  add(
    `lace-square-${n}`,
    "lace",
    `${n} square lace doily`,
    200,
    200,
    wrap(
      "sq",
      `${[0, 1, 2, 3].flatMap((a) => [0, 1, 2, 3].map((b) => `<circle cx="${50 + a * 33}" cy="${50 + b * 33}" r="6.5" fill="#000"/>`)).join("")}<circle cx="100" cy="100" r="9" fill="#000"/>${sq.map((k) => `<circle cx="${24 + k * 17}" cy="16" r="2.4" fill="#000"/><circle cx="${24 + k * 17}" cy="184" r="2.4" fill="#000"/><circle cx="16" cy="${24 + k * 17}" r="2.4" fill="#000"/><circle cx="184" cy="${24 + k * 17}" r="2.4" fill="#000"/>`).join("")}`,
      `<rect x="22" y="22" width="156" height="156" fill="${c}"/>${sq.map((k) => `<circle cx="${22 + k * 17.3}" cy="22" r="9" fill="${c}"/><circle cx="${22 + k * 17.3}" cy="178" r="9" fill="${c}"/><circle cx="22" cy="${22 + k * 17.3}" r="9" fill="${c}"/><circle cx="178" cy="${22 + k * 17.3}" r="9" fill="${c}"/>`).join("")}`,
    ),
    150,
    150,
  );

  // heart doily
  const outer = heartPts(100, 100, 5.2);
  const mid = heartPts(100, 104, 3.6, 28);
  const inner = heartPts(100, 108, 2.1, 14);
  add(
    `lace-heart-${n}`,
    "lace",
    `${n} lace heart`,
    200,
    200,
    wrap(
      "he",
      `${mid.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.4" fill="#000"/>`).join("")}${inner.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4" fill="#000"/>`).join("")}${heartPts(100, 100, 4.6, 40).map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.8" fill="#000"/>`).join("")}`,
      `<polygon points="${outer.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ")}" fill="${c}"/>${outer.filter((_, k) => k % 2 === 0).map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6" fill="${c}"/>`).join("")}`,
    ),
    140,
    140,
  );

  // narrow scalloped trim
  add(
    `lace-trim-${n}`,
    "lace",
    `${n} lace trim`,
    400,
    44,
    wrap(
      "tr",
      `${Array.from({ length: 26 }, (_, k) => `<circle cx="${12 + k * 15}" cy="15" r="3.2" fill="#000"/>`).join("")}${Array.from({ length: 25 }, (_, k) => `<circle cx="${19.5 + k * 15}" cy="25" r="2" fill="#000"/>`).join("")}`,
      `<rect x="2" y="4" width="396" height="26" fill="${c}"/>${Array.from({ length: 27 }, (_, k) => `<circle cx="${8 + k * 15}" cy="30" r="7.6" fill="${c}"/>`).join("")}`,
    ),
    330,
    36,
  );

  // wide floral band
  add(
    `lace-band-${n}`,
    "lace",
    `${n} floral lace band`,
    400,
    76,
    wrap(
      "ba",
      `${Array.from({ length: 7 }, (_, k) => `${ring(30 + k * 56, 38, 11, 6, 3.6)}<circle cx="${30 + k * 56}" cy="38" r="4.6" fill="#000"/>`).join("")}${Array.from({ length: 14 }, (_, k) => `<circle cx="${14 + k * 28}" cy="9" r="2.2" fill="#000"/><circle cx="${14 + k * 28}" cy="67" r="2.2" fill="#000"/>`).join("")}`,
      `<rect x="2" y="8" width="396" height="60" fill="${c}"/>${Array.from({ length: 27 }, (_, k) => `<circle cx="${8 + k * 15}" cy="8" r="7" fill="${c}"/><circle cx="${8 + k * 15}" cy="68" r="7" fill="${c}"/>`).join("")}`,
    ),
    340,
    64,
  );

  // quarter-fan corner piece
  add(
    `lace-corner-${n}`,
    "lace",
    `${n} lace corner`,
    190,
    190,
    wrap(
      "co",
      `${[40, 75, 110].map((r, ri) => Array.from({ length: 3 + ri * 2 }, (_, k) => { const a = ((k + 0.5) * Math.PI) / 2 / (3 + ri * 2); return `<circle cx="${(r * Math.cos(a)).toFixed(1)}" cy="${(r * Math.sin(a)).toFixed(1)}" r="${6 - ri}" fill="#000"/>`; }).join("")).join("")}<circle cx="12" cy="12" r="6" fill="#000"/>`,
      `<path d="M0 0H170A170 170 0 0 1 0 170Z" fill="${c}"/>${Array.from({ length: 9 }, (_, k) => { const a = ((k + 0.5) * Math.PI) / 2 / 9; return `<circle cx="${(170 * Math.cos(a)).toFixed(1)}" cy="${(170 * Math.sin(a)).toFixed(1)}" r="10" fill="${c}"/>`; }).join("")}`,
    ),
    130,
    130,
  );
});

// ---------- dark labels (readable cream text) ----------
const LABELS = ["Memories", "Happiness", "Dear diary,", "Little joys", "Golden hour", "Stay curious", "Hello, today", "Adventure awaits", "My dearest,", "Dream big", "Wish you were here", "Be kind"];
const DARK: [string, string][] = [
  ["charcoal", "#3d3b42"],
  ["navy", "#2f3b57"],
  ["forest", "#36503f"],
  ["burgundy", "#6b2f3a"],
  ["aubergine", "#44335a"],
  ["espresso", "#4a3528"],
];
LABELS.forEach((t, i) =>
  DARK.forEach(([cn, c], ci) => {
    const w = 250;
    const h = 62;
    const fs = t.length > 14 ? 21 : 25;
    const id = `lbd${i}${ci}`;
    add(
      `label-${i}-${cn}`,
      "tags",
      `${t} (${cn})`,
      w,
      h,
      `<defs>${torn(id, i * 7 + ci + 100, 8, 0.06)}</defs>
       <g filter="url(#${id})"><rect x="12" y="12" width="${w - 24}" height="${h - 24}" fill="${c}"/></g>
       <text x="${w / 2}" y="${h / 2 + 8}" text-anchor="middle" font-family="'Courier New', Courier, monospace" font-size="${fs}" font-weight="bold" fill="${inkFor(c)}" opacity=".92">${t}</text>`,
    );
  }),
);

export const PROCEDURAL5: Sticker[] = out;

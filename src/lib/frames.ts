// Page borders: transparent 600x800 overlays drawn between the paper and the items.
import { grain, svgWrap, torn, uri } from "./procedural";

export interface Frame {
  id: string;
  label: string;
  css: string; // CSS background layer
  swatch: string;
}

const W = 600;
const H = 800;
const layer = (svg: string) => `url("${uri(svgWrap(W, H, svg))}") 0 0 / 100% 100% no-repeat`;

const raggedBorder = (id: string, color: string, t: number, seed: number) =>
  `<defs>${torn(`${id}t`, seed, 16, 0.04)}<mask id="${id}m"><rect width="${W}" height="${H}" fill="#fff"/><g filter="url(#${id}t)"><rect x="${t}" y="${t}" width="${W - 2 * t}" height="${H - 2 * t}" fill="#000"/></g></mask>${grain(`${id}g`, seed, 0.8)}</defs>
   <g filter="url(#${id}g)"><rect width="${W}" height="${H}" fill="${color}" mask="url(#${id}m)"/></g>`;

const stitched = (color: string, inset: number) =>
  `<rect x="${inset}" y="${inset}" width="${W - 2 * inset}" height="${H - 2 * inset}" rx="14" fill="none" stroke="${color}" stroke-width="3" stroke-dasharray="12 9" stroke-linecap="round"/>`;

const lacePath = (c: string) => {
  const dots = (n: number, f: (k: number) => [number, number]) => Array.from({ length: n }, (_, k) => f(k));
  const top = dots(20, (k) => [15 + k * 30, 14]);
  const bottom = dots(20, (k) => [15 + k * 30, H - 14]);
  const left = dots(26, (k) => [14, 30 + k * 30]);
  const right = dots(26, (k) => [W - 14, 30 + k * 30]);
  return [...top, ...bottom, ...left, ...right].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="15" fill="${c}"/>`).join("");
};

const film = (c: string) =>
  [0, W - 56].map((x) => `<rect x="${x}" y="0" width="56" height="${H}" fill="${c}"/>${Array.from({ length: 24 }, (_, k) => `<rect x="${x + 18}" y="${14 + k * 33}" width="20" height="16" rx="3" fill="#efe7d6"/>`).join("")}`).join("");

const tapeEdge = (a: string, b: string) => {
  const id = "wf" + a.slice(1);
  return `<defs><pattern id="${id}" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="22" height="22" fill="${a}"/><rect width="11" height="22" fill="${b}"/></pattern></defs>
   <g opacity=".92"><rect x="0" y="0" width="${W}" height="30" fill="url(#${id})"/><rect x="0" y="${H - 30}" width="${W}" height="30" fill="url(#${id})"/><rect x="0" y="0" width="30" height="${H}" fill="url(#${id})"/><rect x="${W - 30}" y="0" width="30" height="${H}" fill="url(#${id})"/></g>`;
};

const corners = (c: string) =>
  [
    [0, 0, 1, 1],
    [W, 0, -1, 1],
    [0, H, 1, -1],
    [W, H, -1, -1],
  ]
    .map(([x, y, sx, sy]) => `<g transform="translate(${x} ${y}) scale(${sx} ${sy})"><path d="M0 0H110V12H12V110H0Z" fill="${c}"/><path d="M26 26H80V32H32V80H26Z" fill="${c}" opacity=".8"/><circle cx="46" cy="46" r="9" fill="${c}"/></g>`)
    .join("");

export const FRAMES: Frame[] = [
  { id: "none", label: "None", swatch: "#fff", css: "" },
  { id: "white-torn", label: "Torn white edge", swatch: "#fbf8f0", css: layer(raggedBorder("f1", "#fbf8f0", 34, 5)) },
  { id: "kraft-torn", label: "Kraft edge", swatch: "#c9a679", css: layer(raggedBorder("f2", "#c9a679", 34, 8)) },
  { id: "lilac-torn", label: "Lilac edge", swatch: "#d3c9e8", css: layer(raggedBorder("f3", "#d3c9e8", 34, 11)) },
  { id: "photo-mat", label: "Photo mat", swatch: "#fbf8f0", css: layer(`<path fill-rule="evenodd" fill="#fbf8f0" d="M0 0H${W}V${H}H0Z M26 26H${W - 26}V${H - 86}H26Z"/><rect x="26" y="26" width="${W - 52}" height="${H - 112}" fill="none" stroke="#000" stroke-opacity=".18"/>`) },
  { id: "lace", label: "Lace edge", swatch: "#fbf8f2", css: layer(`<defs>${grain("fl", 2, 0.9)}</defs><g filter="url(#fl)">${lacePath("#fbf8f2")}<rect x="0" y="0" width="${W}" height="14" fill="#fbf8f2"/><rect x="0" y="${H - 14}" width="${W}" height="14" fill="#fbf8f2"/><rect x="0" y="0" width="14" height="${H}" fill="#fbf8f2"/><rect x="${W - 14}" y="0" width="14" height="${H}" fill="#fbf8f2"/></g>`) },
  { id: "washi-lilac", label: "Washi frame", swatch: "#b9a8d8", css: layer(tapeEdge("#b9a8d8", "#efe9fa")) },
  { id: "washi-rose", label: "Rose washi frame", swatch: "#e8b4bc", css: layer(tapeEdge("#e8b4bc", "#fbecee")) },
  { id: "stitch-rose", label: "Stitched border", swatch: "#d9808f", css: layer(stitched("#d9808f", 22)) },
  { id: "stitch-ink", label: "Ink stitch", swatch: "#2d2a33", css: layer(stitched("#2d2a33", 22)) },
  { id: "double-line", label: "Double line", swatch: "#2d2a33", css: layer(`<rect x="20" y="20" width="${W - 40}" height="${H - 40}" fill="none" stroke="#2d2a33" stroke-width="3"/><rect x="30" y="30" width="${W - 60}" height="${H - 60}" fill="none" stroke="#2d2a33" stroke-width="1"/>`) },
  { id: "gold-ornate", label: "Gold frame", swatch: "#c9a24a", css: layer(`<rect x="18" y="18" width="${W - 36}" height="${H - 36}" fill="none" stroke="#c9a24a" stroke-width="5"/><rect x="30" y="30" width="${W - 60}" height="${H - 60}" fill="none" stroke="#c9a24a" stroke-width="1.5"/>${corners("#c9a24a")}`) },
  { id: "film", label: "Film border", swatch: "#1b1919", css: layer(film("#1b1919")) },
  { id: "scallop", label: "Scalloped edge", swatch: "#f5d6da", css: layer(`${Array.from({ length: 21 }, (_, k) => `<circle cx="${k * 30}" cy="0" r="22" fill="#f5d6da"/><circle cx="${k * 30}" cy="${H}" r="22" fill="#f5d6da"/>`).join("")}${Array.from({ length: 28 }, (_, k) => `<circle cx="0" cy="${k * 30}" r="22" fill="#f5d6da"/><circle cx="${W}" cy="${k * 30}" r="22" fill="#f5d6da"/>`).join("")}`) },
  { id: "perforated", label: "Postage edge", swatch: "#fbf8f0", css: layer(`<defs><mask id="pfm"><rect width="${W}" height="${H}" fill="#fff"/>${Array.from({ length: 30 }, (_, k) => `<circle cx="${10 + k * 20}" cy="5" r="6"/><circle cx="${10 + k * 20}" cy="${H - 5}" r="6"/>`).join("")}${Array.from({ length: 40 }, (_, k) => `<circle cx="5" cy="${10 + k * 20}" r="6"/><circle cx="${W - 5}" cy="${10 + k * 20}" r="6"/>`).join("")}</mask></defs><rect width="${W}" height="${H}" fill="none" stroke="#fbf8f0" stroke-width="40" mask="url(#pfm)"/>`) },
];

export const FRAME_MAP: Record<string, Frame> = Object.fromEntries(FRAMES.map((f) => [f.id, f]));

// Realistic paper backgrounds, drawn as SVG (lighting filter gives a real crumple / fibre feel).

export interface Bg {
  id: string;
  label: string;
  css: string; // value for CSS `background`
  swatch: string;
  dark?: boolean;
}

const uri = (svg: string) => `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}") 0 0 / 100% 100% no-repeat`;

function paper(base: string, opts: { crumple?: number; fibre?: number; overlay?: string; light?: string } = {}) {
  const { crumple = 0.6, fibre = 0.5, overlay = "", light = "#ffffff" } = opts;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
<defs>
<filter id="c" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.012 0.016" numOctaves="5" seed="8" result="n"/>
  <feDiffuseLighting in="n" lighting-color="${light}" surfaceScale="${crumple * 5}" diffuseConstant="1.05" result="l"><feDistantLight azimuth="235" elevation="62"/></feDiffuseLighting>
  <feComposite in="l" in2="SourceGraphic" operator="arithmetic" k1="1" k2="0" k3="0" k4="0"/>
</filter>
<filter id="f" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.9 0.5" numOctaves="3" seed="2" result="g"/>
  <feColorMatrix in="g" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.28  0 0 0 0 0.2  ${fibre * 1.6} 0 0 0 -${fibre * 0.62}"/>
</filter>
</defs>
<rect width="600" height="800" fill="${base}"/>
<rect width="600" height="800" fill="${base}" filter="url(#c)"/>
<rect width="600" height="800" filter="url(#f)"/>
${overlay}
</svg>`;
  return uri(svg);
}

const lines = (c: string) => Array.from({ length: 28 }, (_, i) => `<line x1="0" y1="${70 + i * 27}" x2="600" y2="${70 + i * 27}" stroke="${c}" stroke-width="1.4"/>`).join("");
const gridLines = (c: string) =>
  Array.from({ length: 31 }, (_, i) => `<line x1="${i * 20}" y1="0" x2="${i * 20}" y2="800" stroke="${c}" stroke-width="1"/>`).join("") +
  Array.from({ length: 41 }, (_, i) => `<line x1="0" y1="${i * 20}" x2="600" y2="${i * 20}" stroke="${c}" stroke-width="1"/>`).join("");
const dots = (c: string) => Array.from({ length: 30 * 40 }, (_, i) => `<circle cx="${(i % 30) * 20 + 10}" cy="${Math.floor(i / 30) * 20 + 10}" r="1.6" fill="${c}"/>`).join("");
const stripes = (c: string) => Array.from({ length: 12 }, (_, i) => `<rect x="${i * 50 + 10}" y="0" width="14" height="800" fill="${c}" opacity=".5"/>`).join("");
const gingham = (c: string) =>
  Array.from({ length: 10 }, (_, i) => `<rect x="${i * 60 + 0}" y="0" width="30" height="800" fill="${c}" opacity=".28"/>`).join("") +
  Array.from({ length: 14 }, (_, i) => `<rect x="0" y="${i * 60}" width="600" height="30" fill="${c}" opacity=".28"/>`).join("");
const margin = `<line x1="70" y1="0" x2="70" y2="800" stroke="#d98a98" stroke-width="1.6" opacity=".7"/>`;

export const BACKGROUNDS: Bg[] = [
  { id: "cream", label: "Cream paper", swatch: "#f1e6d0", css: paper("#f1e6d0", { crumple: 0.25 }) },
  { id: "kraft", label: "Kraft", swatch: "#c9a679", css: paper("#c9a679", { crumple: 0.9, fibre: 0.8 }) },
  { id: "parchment", label: "Parchment", swatch: "#e6d3a8", css: paper("#e6d3a8", { crumple: 0.8, fibre: 0.7 }) },
  { id: "crumple-cream", label: "Crumpled cream", swatch: "#eadfc8", css: paper("#eadfc8", { crumple: 1.6, fibre: 0.4 }) },
  { id: "crumple-lilac", label: "Crumpled lilac", swatch: "#d9d0ee", css: paper("#d9d0ee", { crumple: 1.5, fibre: 0.4 }) },
  { id: "lavender", label: "Lavender", swatch: "#d3c9e8", css: paper("#d3c9e8", { crumple: 0.35 }) },
  { id: "blush", label: "Blush", swatch: "#ecd0cb", css: paper("#ecd0cb", { crumple: 0.35 }) },
  { id: "sage", label: "Sage", swatch: "#cbd7bf", css: paper("#cbd7bf", { crumple: 0.35 }) },
  { id: "sky", label: "Sky", swatch: "#c9d9e6", css: paper("#c9d9e6", { crumple: 0.35 }) },
  { id: "white", label: "White", swatch: "#faf8f2", css: paper("#faf8f2", { crumple: 0.15 }) },
  { id: "newsprint", label: "Newsprint", swatch: "#dcd7c9", css: paper("#dcd7c9", { crumple: 0.9, fibre: 0.9 }) },
  { id: "lined", label: "Lined notebook", swatch: "#faf6ea", css: paper("#faf6ea", { crumple: 0.15, overlay: lines("#9db6d6") + margin }) },
  { id: "grid", label: "Grid", swatch: "#faf6ea", css: paper("#faf6ea", { crumple: 0.15, overlay: gridLines("#c3cfe2") }) },
  { id: "dotgrid", label: "Dot grid", swatch: "#f6efe0", css: paper("#f6efe0", { crumple: 0.2, overlay: dots("#a89c86") }) },
  { id: "stripes", label: "Cloth stripes", swatch: "#efe6d6", css: paper("#f1eadb", { crumple: 0.3, fibre: 1, overlay: stripes("#bfb4d6") }) },
  { id: "gingham", label: "Gingham", swatch: "#e9b9c0", css: paper("#fbf6ee", { crumple: 0.3, fibre: 0.9, overlay: gingham("#d9808f") }) },
  { id: "night", label: "Night", swatch: "#3a3358", dark: true, css: paper("#3a3358", { crumple: 0.5, fibre: 0.3, light: "#cfc6ff" }) },
];

// Plain, flat paper colours (no texture)
export const PLAIN: Bg[] = [
  ["#ffffff", "Plain white"],
  ["#fbf6ea", "Plain ivory"],
  ["#f6e3e6", "Plain pink"],
  ["#e6e0f5", "Plain lilac"],
  ["#dfeadb", "Plain mint"],
  ["#dcecf7", "Plain sky"],
  ["#f7efc9", "Plain butter"],
  ["#2b2833", "Plain charcoal"],
].map(([c, label]) => ({ id: `color:${c}`, label, swatch: c, css: `linear-gradient(${c}, ${c})`, dark: c === "#2b2833" }));

export const BG_MAP: Record<string, Bg> = Object.fromEntries([...BACKGROUNDS, ...PLAIN].map((b) => [b.id, b]));

export const bgCss = (id: string) => {
  if (id.startsWith("color:")) {
    const c = id.slice(6);
    return `linear-gradient(${c}, ${c})`;
  }
  return (BG_MAP[id] ?? BG_MAP.cream).css;
};

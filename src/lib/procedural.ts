// Procedurally generated, realistic-looking scrapbook elements (paper, tape, stamps, metal, fabric, ink).
// Each is an SVG with grain / displacement filters, returned as a data URI.

export interface Sticker {
  id: string;
  cat: string;
  label: string;
  src: string;
  w: number; // default size on a 600x800 page
  h: number;
}

export const STICKER_CATS = [
  { id: "paper", label: "Torn paper" },
  { id: "pattern", label: "Patterned" },
  { id: "tape", label: "Washi tape" },
  { id: "tags", label: "Tags & labels" },
  { id: "stamps", label: "Stamps" },
  { id: "doodles", label: "Ink doodles" },
  { id: "metal", label: "Clips & seals" },
  { id: "fabric", label: "Fabric & ribbon" },
];

const uri = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
const svgWrap = (w: number, h: number, inner: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${inner}</svg>`;

const out: Sticker[] = [];
const add = (id: string, cat: string, label: string, w: number, h: number, inner: string, dw?: number, dh?: number) =>
  out.push({ id, cat, label, src: uri(svgWrap(w, h, inner)), w: dw ?? w, h: dh ?? h });

// ---------- shared filters ----------

const grain = (id: string, seed = 3, strength = 1.2) => `
<filter id="${id}" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="${seed}" result="g"/>
  <feColorMatrix in="g" type="matrix" values="0 0 0 0 0.32  0 0 0 0 0.26  0 0 0 0 0.2  ${strength} 0 0 0 -0.5" result="ga"/>
  <feComposite in="ga" in2="SourceGraphic" operator="in" result="gin"/>
  <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="gin"/></feMerge>
</filter>`;

const torn = (id: string, seed: number, scale = 20, freq = 0.04) => `
<filter id="${id}" x="-12%" y="-12%" width="124%" height="124%">
  <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="4" seed="${seed}" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="${scale}" xChannelSelector="R" yChannelSelector="G" result="d"/>
  <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="${seed + 7}" result="g"/>
  <feColorMatrix in="g" type="matrix" values="0 0 0 0 0.32  0 0 0 0 0.26  0 0 0 0 0.2  1.3 0 0 0 -0.52" result="ga"/>
  <feComposite in="ga" in2="d" operator="in" result="gin"/>
  <feMerge><feMergeNode in="d"/><feMergeNode in="gin"/></feMerge>
</filter>`;

const rough = (id: string, scale = 3) => `
<filter id="${id}" x="-5%" y="-5%" width="110%" height="110%">
  <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="4" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="${scale}" xChannelSelector="R" yChannelSelector="G"/>
</filter>`;

// ---------- palettes ----------

const PAPERS: [string, string][] = [
  ["cream", "#efe3cc"],
  ["kraft", "#c9a679"],
  ["parchment", "#e3cfa6"],
  ["blush", "#ebcbc6"],
  ["lavender", "#d3c9e8"],
  ["sage", "#c9d5bc"],
  ["sky", "#c6d6e3"],
  ["newsprint", "#e2ddd0"],
  ["mustard", "#e0be6e"],
  ["rose", "#d9a1a8"],
  ["brown", "#a47c5a"],
  ["plum", "#8d7aa8"],
];

const TAPES: [string, string][] = [
  ["lilac", "#b9a8d8"],
  ["rose", "#e8b4bc"],
  ["peach", "#f2cf9a"],
  ["sage", "#a9c4a0"],
  ["sky", "#9bbbd4"],
  ["clay", "#cfa98a"],
  ["ivory", "#e6e0d0"],
  ["plum", "#8d7aa8"],
];

const INKS: [string, string][] = [
  ["ink", "#2d2a33"],
  ["sepia", "#6b5744"],
  ["plum", "#6a4c93"],
  ["rose", "#b5546a"],
  ["forest", "#4a6a4a"],
];

// ---------- TORN PAPER ----------

PAPERS.forEach(([name, c], i) => {
  const shapes: [string, number, number][] = [
    ["wide", 260, 190],
    ["tall", 190, 260],
    ["small", 150, 150],
  ];
  shapes.forEach(([sh, w, h], k) => {
    const seed = i * 5 + k + 2;
    add(
      `paper-${name}-${sh}`,
      "paper",
      `${name} torn paper`,
      w,
      h,
      `<defs>${torn(`t${seed}`, seed)}</defs>
       <g filter="url(#t${seed})">
         <rect x="22" y="22" width="${w - 44}" height="${h - 44}" fill="#fbf7ee"/>
         <rect x="28" y="28" width="${w - 56}" height="${h - 56}" fill="${c}"/>
       </g>`,
    );
  });
});

// ---------- PATTERNED PAPER ----------

const patternDefs: Record<string, (c: string) => string> = {
  lined: (c) => `<rect width="24" height="24" fill="#fbf8ef"/><line x1="0" y1="22" x2="24" y2="22" stroke="${c}" stroke-width="1.2"/>`,
  grid: (c) => `<rect width="20" height="20" fill="#fbf8ef"/><path d="M20 0H0V20" fill="none" stroke="${c}" stroke-width="1"/>`,
  dots: (c) => `<rect width="18" height="18" fill="#fbf8ef"/><circle cx="9" cy="9" r="1.7" fill="${c}"/>`,
  gingham: (c) => `<rect width="30" height="30" fill="#fbf8ef"/><rect width="15" height="30" fill="${c}" opacity=".45"/><rect width="30" height="15" fill="${c}" opacity=".45"/>`,
  stripes: (c) => `<rect width="28" height="28" fill="#fbf8ef"/><rect width="9" height="28" fill="${c}" opacity=".55"/>`,
  floral: (c) =>
    `<rect width="46" height="46" fill="#fbf8ef"/><g fill="${c}" opacity=".7"><circle cx="12" cy="12" r="4"/><circle cx="19" cy="12" r="4"/><circle cx="12" cy="19" r="4"/><circle cx="19" cy="19" r="4"/></g><circle cx="15.5" cy="15.5" r="2.4" fill="#e8c46a"/><g fill="${c}" opacity=".45"><circle cx="35" cy="34" r="3"/><circle cx="40" cy="34" r="3"/><circle cx="35" cy="39" r="3"/><circle cx="40" cy="39" r="3"/></g>`,
};
const patSize: Record<string, number> = { lined: 24, grid: 20, dots: 18, gingham: 30, stripes: 28, floral: 46 };
const patColors: [string, string][] = [
  ["blue", "#8fa8c8"],
  ["rose", "#d88a98"],
  ["sage", "#8fb08a"],
  ["plum", "#8d7aa8"],
];
Object.keys(patternDefs).forEach((pn, pi) => {
  patColors.forEach(([cn, c], ci) => {
    const seed = 40 + pi * 4 + ci;
    const w = 240;
    const h = 190;
    add(
      `pat-${pn}-${cn}`,
      "pattern",
      `${cn} ${pn} paper`,
      w,
      h,
      `<defs>${torn(`p${seed}`, seed, 16, 0.045)}
        <pattern id="pp${seed}" width="${patSize[pn]}" height="${patSize[pn]}" patternUnits="userSpaceOnUse">${patternDefs[pn](c)}</pattern></defs>
       <g filter="url(#p${seed})"><rect x="22" y="22" width="${w - 44}" height="${h - 44}" fill="url(#pp${seed})"/></g>`,
    );
  });
});

// ---------- WASHI TAPE ----------

const tapePat: Record<string, (c: string, id: string) => string> = {
  stripes: (c, id) => `<pattern id="${id}" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="16" height="16" fill="${c}" opacity=".55"/><rect width="8" height="16" fill="#fff" opacity=".75"/></pattern>`,
  dots: (c, id) => `<pattern id="${id}" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="${c}"/><circle cx="7" cy="7" r="2.8" fill="#fff" opacity=".85"/></pattern>`,
  gingham: (c, id) => `<pattern id="${id}" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#fff" opacity=".9"/><rect width="8" height="16" fill="${c}" opacity=".6"/><rect width="16" height="8" fill="${c}" opacity=".6"/></pattern>`,
  checks: (c, id) => `<pattern id="${id}" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#fff" opacity=".9"/><rect width="10" height="10" fill="${c}"/><rect x="10" y="10" width="10" height="10" fill="${c}"/></pattern>`,
  zigzag: (c, id) => `<pattern id="${id}" width="18" height="18" patternUnits="userSpaceOnUse"><rect width="18" height="18" fill="${c}" opacity=".5"/><path d="M0 13L4.5 5L9 13L13.5 5L18 13" fill="none" stroke="#fff" stroke-width="2.4"/></pattern>`,
  florals: (c, id) => `<pattern id="${id}" width="26" height="26" patternUnits="userSpaceOnUse"><rect width="26" height="26" fill="${c}" opacity=".55"/><g fill="#fff" opacity=".9"><circle cx="8" cy="8" r="3"/><circle cx="13" cy="8" r="3"/><circle cx="8" cy="13" r="3"/><circle cx="13" cy="13" r="3"/></g><circle cx="10.5" cy="10.5" r="1.8" fill="#e0b25a"/></pattern>`,
  plain: (c, id) => `<pattern id="${id}" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="${c}"/></pattern>`,
  stars: (c, id) => `<pattern id="${id}" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="${c}"/><path d="M12 5l1.8 4.6 4.9.3-3.8 3.1 1.2 4.8L12 15l-4.1 2.8 1.2-4.8-3.8-3.1 4.9-.3z" fill="#fff" opacity=".85"/></pattern>`,
};
Object.keys(tapePat).forEach((pn, pi) => {
  TAPES.forEach(([cn, c], ci) => {
    const id = `tp${pi}${ci}`;
    add(
      `tape-${pn}-${cn}`,
      "tape",
      `${cn} ${pn} tape`,
      220,
      56,
      `<defs>${tapePat[pn](c, `${id}p`)}${grain(`${id}g`, pi + ci + 1, 0.9)}
        <linearGradient id="${id}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".08"/></linearGradient>
        <clipPath id="${id}c"><path d="M8 6L212 6L207 12L213 18L207 24L213 30L207 36L213 42L212 50L8 50L13 44L7 38L13 32L7 26L13 20L7 14L13 9Z"/></clipPath></defs>
       <g clip-path="url(#${id}c)" filter="url(#${id}g)" opacity=".93"><rect width="220" height="56" fill="url(#${id}p)"/><rect width="220" height="56" fill="url(#${id}l)"/></g>`,
    );
  });
});

// ---------- TAGS & LABELS ----------

const LABELS = ["Memories", "Happiness", "Dear diary,", "Little joys", "Golden hour", "Stay curious", "Hello, today", "Adventure awaits", "My dearest,", "Dream big", "Wish you were here", "Be kind"];
LABELS.forEach((t, i) => {
  const [pn, c] = PAPERS[(i * 3) % PAPERS.length];
  const w = 250;
  const h = 62;
  const fs = t.length > 14 ? 21 : 25;
  add(
    `label-${i}`,
    "tags",
    t,
    w,
    h,
    `<defs>${torn(`lb${i}`, i + 60, 8, 0.06)}</defs>
     <g filter="url(#lb${i})"><rect x="12" y="12" width="${w - 24}" height="${h - 24}" fill="${i % 2 ? "#f4ecdb" : c}"/></g>
     <text x="${w / 2}" y="${h / 2 + 8}" text-anchor="middle" font-family="'Courier New', Courier, monospace" font-size="${fs}" font-weight="bold" fill="#3b3128" opacity=".88">${t}</text>`,
  );
});
PAPERS.slice(0, 8).forEach(([pn, c], i) => {
  add(
    `tag-${pn}`,
    "tags",
    `${pn} tag`,
    120,
    210,
    `<defs>${torn(`tg${i}`, i + 80, 5, 0.07)}${grain(`tgg${i}`, i, 1)}</defs>
     <path d="M60 205 L18 190 L18 52 L38 22 L82 22 L102 52 L102 190 Z" fill="none"/>
     <g filter="url(#tg${i})"><path d="M20 190 L20 56 L40 26 L80 26 L100 56 L100 190 Z" fill="${c}"/></g>
     <circle cx="60" cy="48" r="9" fill="#00000022"/><circle cx="60" cy="48" r="6.5" fill="#fff" opacity=".85"/><circle cx="60" cy="48" r="9" fill="none" stroke="#7a6a50" stroke-width="2"/>
     <path d="M60 48 C40 20 10 6 12 -10" fill="none" stroke="#9c7b52" stroke-width="2.2" transform="translate(0,14)"/>`,
  );
});
for (let i = 0; i < 6; i++) {
  const [, c] = PAPERS[(i * 2 + 1) % PAPERS.length];
  add(
    `ticket-${i}`,
    "tags",
    "ticket",
    250,
    110,
    `<defs>${grain(`tk${i}`, i + 3, 1)}</defs>
     <g filter="url(#tk${i})"><path d="M10 12H240V42a10 10 0 0 0 0 26V98H10V68a10 10 0 0 0 0-26Z" fill="${c}"/></g>
     <path d="M24 22H226V88H24Z" fill="none" stroke="#3b3128" stroke-opacity=".5" stroke-width="1.5" stroke-dasharray="4 3"/>
     <text x="125" y="56" text-anchor="middle" font-family="'Courier New', monospace" font-size="24" font-weight="bold" fill="#3b3128" opacity=".85">ADMIT ONE</text>
     <text x="125" y="78" text-anchor="middle" font-family="'Courier New', monospace" font-size="12" fill="#3b3128" opacity=".7">No. 00${i + 3}7  ·  GENERAL</text>`,
  );
}

// ---------- STAMPS ----------

const STAMP_ART: ((c: string) => string)[] = [
  (c) => `<path d="M60 92C28 70 24 46 40 38C50 34 58 40 60 48C62 40 70 34 80 38C96 46 92 70 60 92Z" fill="${c}" opacity=".85"/>`,
  (c) => `<g fill="${c}" opacity=".85">${[0, 1, 2, 3, 4].map((k) => `<ellipse cx="60" cy="44" rx="9" ry="16" transform="rotate(${k * 72} 60 62)"/>`).join("")}</g><circle cx="60" cy="62" r="8" fill="#e8c46a"/>`,
  (c) => `<path d="M60 30L68 52L92 54L73 69L80 92L60 78L40 92L47 69L28 54L52 52Z" fill="${c}" opacity=".85"/>`,
  (c) => `<path d="M24 86Q60 20 96 86Z" fill="${c}" opacity=".8"/><circle cx="60" cy="48" r="10" fill="#f2dc9a"/>`,
];
const STAMP_COLS = ["#a8566a", "#4f7a8f", "#7a8f4f", "#b07a3c"];
STAMP_ART.forEach((art, ai) =>
  STAMP_COLS.forEach((c, ci) => {
    const id = `st${ai}${ci}`;
    const sv = `<defs><mask id="${id}m"><rect width="120" height="144" fill="#fff"/>${Array.from({ length: 11 })
      .map((_, k) => `<circle cx="${6 + k * 10.8}" cy="3" r="3.4"/><circle cx="${6 + k * 10.8}" cy="141" r="3.4"/>`)
      .join("")}${Array.from({ length: 13 })
      .map((_, k) => `<circle cx="3" cy="${6 + k * 10.8}" r="3.4"/><circle cx="117" cy="${6 + k * 10.8}" r="3.4"/>`)
      .join("")}</mask>${grain(`${id}g`, ai + ci, 1)}</defs>
      <g mask="url(#${id}m)" filter="url(#${id}g)"><rect width="120" height="144" fill="#fbf7ec"/>
      <rect x="10" y="10" width="100" height="106" fill="#f1e6cd" stroke="${c}" stroke-width="1.5"/>${art(c)}
      <text x="106" y="136" text-anchor="end" font-family="Georgia, serif" font-size="16" font-weight="bold" fill="${c}">50</text>
      <text x="14" y="136" font-family="Georgia, serif" font-size="9" fill="${c}">POSTAGE</text></g>`;
    add(`stamp-${ai}-${ci}`, "stamps", "postage stamp", 120, 144, sv, 90, 108);
  }),
);
["#2d2a33", "#6a4c93", "#b5546a", "#3d6a8a"].forEach((c, i) =>
  add(
    `postmark-${i}`,
    "stamps",
    "postmark",
    260,
    120,
    `<defs>${rough(`pm${i}`, 3)}${grain(`pmg${i}`, i, 1.4)}</defs>
     <g filter="url(#pm${i})" opacity=".78"><g filter="url(#pmg${i})">
       <circle cx="64" cy="60" r="46" fill="none" stroke="${c}" stroke-width="3.5"/><circle cx="64" cy="60" r="36" fill="none" stroke="${c}" stroke-width="1.5"/>
       <text x="64" y="55" text-anchor="middle" font-family="'Courier New', monospace" font-size="13" font-weight="bold" fill="${c}">LONDON</text>
       <text x="64" y="72" text-anchor="middle" font-family="'Courier New', monospace" font-size="12" fill="${c}">12 JUL 1998</text>
       ${[34, 50, 66, 82].map((y) => `<path d="M122 ${y}q12 -8 24 0t24 0t24 0t24 0t20 0" fill="none" stroke="${c}" stroke-width="3.2"/>`).join("")}
     </g></g>`,
    180,
    83,
  ),
);

// ---------- INK DOODLES ----------

const doodles: [string, string, number, number][] = [
  ["arrow-curl", `<path d="M10 70C30 10 80 0 120 40C150 70 110 100 90 80C75 62 100 50 118 62C132 72 126 84 118 92M118 92L106 96M118 92L120 80" />`, 150, 110],
  ["arrow-loop", `<path d="M10 80C40 40 70 40 80 62C88 82 66 86 62 70C58 50 100 20 140 36M140 36L128 32M140 36L134 48" />`, 160, 110],
  ["swirl", `<path d="M20 60C20 20 70 10 80 40C88 66 54 74 50 52C46 32 80 28 96 44C110 58 110 80 100 92" />`, 120, 110],
  ["underline", `<path d="M6 20C40 8 80 26 120 14C150 6 180 20 214 12" />`, 220, 34],
  ["underline-double", `<path d="M6 14C60 6 120 20 214 10M10 28C70 22 130 34 208 24" />`, 220, 40],
  ["scribble-circle", `<path d="M60 12C20 10 6 40 14 66C24 96 80 100 104 76C124 54 112 14 70 10C46 8 30 20 26 30" />`, 124, 110],
  ["heart", `<path d="M60 96C20 66 10 36 32 22C46 14 58 24 60 36C62 24 76 14 90 22C112 36 100 66 60 96Z" />`, 120, 110],
  ["star", `<path d="M55 8L68 42L104 44L76 66L86 100L55 80L24 100L34 66L6 44L42 42Z" />`, 110, 108],
  ["sparkles", `<path d="M40 10C42 34 50 44 74 46C50 48 42 58 40 82C38 58 30 48 6 46C30 44 38 34 40 10ZM84 50C85 62 89 66 100 67C89 68 85 72 84 84C83 72 79 68 68 67C79 66 83 62 84 50Z" />`, 106, 94],
  ["flower", `<path d="M50 48C34 30 38 8 50 8C62 8 66 30 50 48C70 36 92 40 92 52C92 64 70 64 50 48C62 68 52 90 42 86C32 82 36 62 50 48C30 60 8 52 8 42C8 30 30 32 50 48" /><path d="M50 56L50 112" />`, 100, 116],
  ["dashed-line", `<path d="M6 10L214 10" stroke-dasharray="10 9" />`, 220, 20],
  ["bracket", `<path d="M30 6C10 6 14 30 14 40C14 52 6 56 6 56C6 56 14 60 14 72C14 82 10 106 30 106" />`, 40, 112],
  ["cross-stitch", `<path d="M6 8L18 20M18 8L6 20M26 8L38 20M38 8L26 20M46 8L58 20M58 8L46 20M66 8L78 20M78 8L66 20M86 8L98 20M98 8L86 20" />`, 106, 28],
  ["splat", `<g stroke="none"><circle cx="30" cy="30" r="5"/><circle cx="52" cy="20" r="3"/><circle cx="70" cy="42" r="6"/><circle cx="40" cy="58" r="3.5"/><circle cx="16" cy="48" r="2.5"/><circle cx="62" cy="68" r="2.5"/></g>`, 90, 84],
];
doodles.forEach(([name, body, w, h]) =>
  INKS.forEach(([cn, c], ci) =>
    add(
      `doodle-${name}-${cn}`,
      "doodles",
      `${name} (${cn})`,
      w + 12,
      h + 12,
      `<defs>${rough(`dd${ci}`, 2.6)}</defs><g transform="translate(6 6)" filter="url(#dd${ci})" fill="${name === "splat" ? c : "none"}" stroke="${c}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" opacity=".92">${body}</g>`,
      Math.round((w + 12) * 0.9),
      Math.round((h + 12) * 0.9),
    ),
  ),
);

// ---------- METAL: clips, pins, seals ----------

["#b8bcc4", "#c9a24a", "#d98a9a", "#8fb0d0", "#a9c4a0"].forEach((c, i) =>
  add(
    `clip-${i}`,
    "metal",
    "paper clip",
    60,
    150,
    `<defs><linearGradient id="cg${i}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="${c}"/><stop offset="1" stop-color="#555" stop-opacity=".7"/></linearGradient></defs>
     <path d="M20 112V40a14 14 0 0 1 28 0V118a22 22 0 0 1-44 0V50" fill="none" stroke="#00000030" stroke-width="7" transform="translate(2 3)" stroke-linecap="round"/>
     <path d="M20 112V40a14 14 0 0 1 28 0V118a22 22 0 0 1-44 0V50" fill="none" stroke="url(#cg${i})" stroke-width="6" stroke-linecap="round"/>`,
    44,
    110,
  ),
);
["#d9667a", "#6a8fd0", "#e0b24a", "#7fb08a", "#9a7ad0", "#f0f0f0"].forEach((c, i) =>
  add(
    `pin-${i}`,
    "metal",
    "push pin",
    90,
    120,
    `<defs><radialGradient id="pg${i}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".25" stop-color="${c}"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient></defs>
     <ellipse cx="50" cy="106" rx="18" ry="5" fill="#000" opacity=".25"/>
     <path d="M45 60L50 106L55 60Z" fill="#9aa0aa"/>
     <rect x="30" y="38" width="40" height="26" rx="6" fill="url(#pg${i})"/>
     <ellipse cx="50" cy="26" rx="26" ry="22" fill="url(#pg${i})"/>`,
    48,
    64,
  ),
);
["#8c2a35", "#5a3a7a", "#2f5f4a", "#b7863a", "#2a4a7a"].forEach((c, i) =>
  add(
    `seal-${i}`,
    "metal",
    "wax seal",
    130,
    130,
    `<defs><radialGradient id="wg${i}" cx=".38" cy=".32" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".3" stop-color="${c}"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient>${torn(`ws${i}`, i + 20, 14, 0.05)}</defs>
     <g filter="url(#ws${i})"><circle cx="65" cy="65" r="46" fill="url(#wg${i})"/></g>
     <circle cx="65" cy="65" r="30" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="3"/><circle cx="65" cy="65" r="30" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="1.2" transform="translate(1 1)"/>
     <path d="M65 84C46 70 44 56 54 51C60 48 65 52 65 57C65 52 70 48 76 51C86 56 84 70 65 84Z" fill="#000" fill-opacity=".25"/>
     <path d="M65 83C47 70 45 57 54.5 52C60 49.5 64 53 65 57" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1.2"/>`,
    92,
    92,
  ),
);

// ---------- FABRIC: ribbon, bows, buttons, patches ----------

["#d9a1a8", "#b9a8d8", "#e0be6e", "#a9c4a0", "#9bbbd4", "#a47c5a"].forEach((c, i) => {
  add(
    `ribbon-${i}`,
    "fabric",
    "satin ribbon",
    260,
    60,
    `<defs><linearGradient id="rg${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".3" stop-color="${c}"/><stop offset=".7" stop-color="${c}"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient></defs>
     <path d="M6 10H254L240 30L254 50H6Z" fill="url(#rg${i})"/>
     <path d="M6 14H250M6 46H250" stroke="#fff" stroke-opacity=".25" stroke-width="1"/>`,
  );
  add(
    `bow-${i}`,
    "fabric",
    "satin bow",
    170,
    130,
    `<defs><linearGradient id="bg${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".35" stop-color="${c}"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient></defs>
     <path d="M78 66L52 122L72 116L82 126L90 70Z" fill="url(#bg${i})"/><path d="M92 66L118 122L98 116L88 126L80 70Z" fill="url(#bg${i})" opacity=".92"/>
     <path d="M85 64C58 22 10 22 12 64C10 104 58 108 85 64Z" fill="url(#bg${i})"/><path d="M85 64C112 22 160 22 158 64C160 104 112 108 85 64Z" fill="url(#bg${i})"/>
     <path d="M30 50C44 40 62 46 78 62M140 50C126 40 108 46 92 62" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="2"/>
     <rect x="72" y="48" width="26" height="32" rx="9" fill="url(#bg${i})" stroke="#000" stroke-opacity=".15"/>`,
    120,
    92,
  );
});
["#d9667a", "#6a8fd0", "#e0b24a", "#7fb08a", "#9a7ad0", "#f2eadb", "#c98b5a", "#2f3a4f"].forEach((c, i) =>
  add(
    `button-${i}`,
    "fabric",
    "button",
    90,
    90,
    `<defs><radialGradient id="bt${i}" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset=".4" stop-color="${c}"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></radialGradient></defs>
     <ellipse cx="46" cy="50" rx="38" ry="36" fill="#000" opacity=".2"/>
     <circle cx="45" cy="45" r="38" fill="url(#bt${i})"/><circle cx="45" cy="45" r="28" fill="none" stroke="#000" stroke-opacity=".2" stroke-width="2"/>
     <g fill="#000" fill-opacity=".55"><circle cx="35" cy="35" r="4.2"/><circle cx="55" cy="35" r="4.2"/><circle cx="35" cy="55" r="4.2"/><circle cx="55" cy="55" r="4.2"/></g>
     <path d="M35 35L55 55M55 35L35 55" stroke="#f4efe4" stroke-width="2.4" stroke-linecap="round"/>`,
    54,
    54,
  ),
);
["#d9a1a8", "#b9a8d8", "#e0be6e", "#a9c4a0", "#9bbbd4", "#c98b5a"].forEach((c, i) =>
  add(
    `patch-${i}`,
    "fabric",
    "stitched patch",
    130,
    130,
    `<defs>${torn(`pa${i}`, i + 30, 5, 0.09)}<filter id="pw${i}"><feTurbulence type="fractalNoise" baseFrequency="1.4 0.9" numOctaves="2" seed="${i}" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -.9 .5" result="a"/><feComposite in="a" in2="SourceGraphic" operator="in" result="c"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="c"/></feMerge></filter></defs>
     <g filter="url(#pw${i})"><circle cx="65" cy="65" r="52" fill="${c}"/></g>
     <circle cx="65" cy="65" r="44" fill="none" stroke="#fffaf0" stroke-width="3" stroke-dasharray="7 5" stroke-linecap="round"/>
     <path d="M65 90C44 74 42 58 53 53C59 50 64 54 65 59C66 54 71 50 77 53C88 58 86 74 65 90Z" fill="#fffaf0" opacity=".9"/>`,
    96,
    96,
  ),
);

export const PROCEDURAL: Sticker[] = out;

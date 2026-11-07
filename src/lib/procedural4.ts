// "Journal kit": the pieces that make a hand-made journal page (torn kraft corners, graph-paper corners,
// masking tape, brush-stroke highlights, ink photo frames, dotted trails, dried flowers, tiny ink doodles).
import { Sticker, grain, rough, svgWrap, torn, uri } from "./procedural";

const out: Sticker[] = [];
const add = (id: string, label: string, w: number, h: number, inner: string, dw?: number, dh?: number) =>
  out.push({ id: `jk-${id}`, cat: "journal", label, src: uri(svgWrap(w, h, inner)), w: dw ?? w, h: dh ?? h });

function rnd(seed: number) {
  let s = (seed * 9301 + 49297) % 233280;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const INK: [string, string][] = [
  ["black", "#1f1d1f"],
  ["gold", "#c9a24a"],
  ["cream", "#f4efe6"],
];

// ---------- TORN CORNERS (kraft and graph paper) ----------

const CORNER_XF: Record<string, string> = {
  tl: "",
  tr: 'transform="translate(220 0) scale(-1 1)"',
  bl: 'transform="translate(0 220) scale(1 -1)"',
  br: 'transform="translate(220 220) scale(-1 -1)"',
};

// [paper, colour, orientation, decoration]; rotate or flip in the Edit tab for any other corner
const CORNER_SET: [string, string, string, string][] = [
  ["kraft", "#c99f72", "tl", "plain"],
  ["kraft", "#c99f72", "tr", "heart"],
  ["kraft", "#c99f72", "tl", "dashed"],
  ["kraft", "#c99f72", "bl", "mountain"],
  ["sand", "#d9bd94", "tl", "plain"],
  ["sand", "#d9bd94", "br", "dashed"],
  ["espresso", "#5a4535", "tl", "plain"],
  ["charcoal", "#3d3b42", "tr", "plain"],
];

CORNER_SET.forEach(([kn, kc, pos, deco], ci) => {
  const xf = CORNER_XF[pos];
  const g = `kc${ci}`;
  const base = `<g ${xf}>
    <defs>${torn(g, ci * 5 + 3, 13, 0.05)}</defs>
    <g filter="url(#${g})"><path d="M0 0H176L18 176Z" fill="${kc}"/></g>
    ${
      deco === "heart"
        ? `<g fill="none" stroke="#2a2420" stroke-width="2" stroke-dasharray="4 4" stroke-linecap="round"><path d="M64 118C34 98 32 70 48 62C58 58 64 64 64 70C64 64 70 58 80 62C96 70 94 98 64 118Z" transform="translate(6 -34)"/></g><path d="M58 52C54 48 58 42 63 45C68 42 72 48 68 52L63 57Z" fill="#2a2420" opacity=".85"/>`
        : deco === "dashed"
          ? `<path d="M10 150L150 10" stroke="#2a2420" stroke-width="2" stroke-dasharray="3 5" stroke-linecap="round" fill="none" opacity=".75"/>`
          : deco === "mountain"
            ? `<g fill="none" stroke="#2a2420" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"><path d="M16 118L48 62L66 90L78 74L104 118Z"/><path d="M48 62L56 76L44 82M78 74L86 88"/><path d="M118 96l-6 22h12zM132 104l-5 14h10z"/></g>`
            : ""
    }
  </g>`;
  add(`corner-${kn}-${pos}-${deco}`, `${kn} torn corner${deco === "plain" ? "" : ` (${deco})`}`, 220, 220, base, 120, 120);
});

const GRID: [string, string, string][] = [
  ["white", "#fbf8f0", "tl"],
  ["cream", "#f1e6cf", "br"],
];
GRID.forEach(([gn, gc, pos], gi) =>
  [pos].forEach((pos) => {
    const xf = CORNER_XF[pos];
    const g = `gc${gi}${pos}`;
    add(
      `grid-corner-${gn}-${pos}`,
      `${gn} graph paper corner`,
      220,
      220,
      `<g ${xf}><defs>${torn(g, gi * 5 + pos.charCodeAt(1), 10, 0.06)}<pattern id="${g}p" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="${gc}"/><path d="M14 0H0V14" fill="none" stroke="#2a2a30" stroke-opacity=".5" stroke-width=".9"/></pattern></defs>
       <g filter="url(#${g})"><path d="M0 0H190L12 190Z" fill="url(#${g}p)" stroke="#d8d0be" stroke-width="1"/></g></g>`,
      120,
      120,
    );
  }),
);
[["white", "#fbf8f0"], ["cream", "#f1e6cf"], ["blue", "#e6edf7"]].forEach(([n, c], i) =>
  add(
    `grid-note-${n}`,
    `${n} graph paper scrap`,
    200,
    230,
    `<defs>${torn(`gn${i}`, i + 31, 11, 0.055)}<pattern id="gn${i}p" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="${c}"/><path d="M14 0H0V14" fill="none" stroke="#2a2a30" stroke-opacity=".45" stroke-width=".9"/></pattern></defs>
     <g filter="url(#gn${i})"><rect x="16" y="16" width="168" height="198" fill="url(#gn${i}p)"/></g>`,
    130,
    150,
  ),
);

// ---------- TAN NOTE PAPER (like the note on the left of the sample) ----------
[["tan", "#d8c4a0"], ["sand", "#e4d5b8"], ["rose", "#e8cfc2"]].forEach(([n, c], i) =>
  [["tall", 170, 230], ["wide", 250, 150]].forEach(([sh, w, h]) =>
    add(
      `note-${n}-${sh}`,
      `${n} note paper`,
      Number(w) + 20,
      Number(h) + 20,
      `<defs>${torn(`jn${i}${sh}`, i * 3 + (sh === "tall" ? 1 : 2), 7, 0.07)}${grain(`jng${i}${sh}`, i + 2, 0.7)}</defs>
       <g filter="url(#jn${i}${sh})"><rect x="10" y="10" width="${w}" height="${h}" fill="${c}"/></g>`,
      Math.round(Number(w) * 0.85),
      Math.round(Number(h) * 0.85),
    ),
  ),
);

// ---------- MASKING & CHECKER TAPE ----------
const tapeShape = "M6 6L194 6L190 11L195 16L190 21L195 26L190 31L195 36L194 42L6 42L10 37L5 32L10 27L5 22L10 17L5 12Z";
[["black", "#1d1b1e", "#f5f1e8"], ["brown", "#5a4636", "#efe6d4"], ["navy", "#2a3550", "#f2efe8"]].forEach(([n, a, b], i) => {
  [["l", 10], ["s", 6]].forEach(([sz, cs]) => {
    const s = Number(cs);
    add(
      `tape-check-${n}-${sz}`,
      `${n} checkered tape`,
      200,
      48,
      `<defs><pattern id="tc${i}${sz}" width="${s * 2}" height="${s * 2}" patternUnits="userSpaceOnUse"><rect width="${s * 2}" height="${s * 2}" fill="${b}"/><rect width="${s}" height="${s}" fill="${a}"/><rect x="${s}" y="${s}" width="${s}" height="${s}" fill="${a}"/></pattern>${grain(`tcg${i}${sz}`, i + 5, 0.8)}<clipPath id="tcc${i}${sz}"><path d="${tapeShape}"/></clipPath></defs>
       <g clip-path="url(#tcc${i}${sz})" filter="url(#tcg${i}${sz})" opacity=".96"><rect width="200" height="48" fill="url(#tc${i}${sz})"/></g>`,
      150,
      36,
    );
  });
});
[["kraft", "#d6b88c"], ["cream", "#eadcc0"], ["sand", "#dfc9a2"], ["grey", "#cfcac0"], ["charcoal", "#4a4850"], ["navy", "#34476e"]].forEach(([n, c], i) =>
  [["long", 230], ["short", 130]].forEach(([sh, w]) => {
    const W = Number(w);
    add(
      `tape-masking-${n}-${sh}`,
      `${n} masking tape`,
      W,
      46,
      `<defs>${grain(`tm${i}${sh}`, i + 8, 1)}<linearGradient id="tml${i}${sh}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".07"/></linearGradient></defs>
       <g filter="url(#tm${i}${sh})" opacity=".92"><path d="M6 6L${W - 6} 6L${W - 10} 12L${W - 5} 18L${W - 10} 24L${W - 5} 30L${W - 10} 36L${W - 6} 41L6 41L10 35L5 29L10 23L5 17L10 11Z" fill="${c}"/><path d="M6 6H${W - 6}V41H6Z" fill="url(#tml${i}${sh})"/></g>`,
      W === 230 ? 170 : 100,
      34,
    );
  }),
);

// ---------- BRUSH-STROKE HIGHLIGHTS ----------
const PAINTS: [string, string][] = [
  ["tan", "#e3c79b"],
  ["peach", "#f4c9aa"],
  ["blush", "#f0c3ca"],
  ["sage", "#cbdbbb"],
  ["sky", "#c9deec"],
  ["lilac", "#d9cdf0"],
  ["butter", "#f6e08f"],
  ["kraft", "#d3b384"],
  ["charcoal", "#4a4850"],
  ["navy", "#34476e"],
  ["forest", "#3f5e4a"],
  ["burgundy", "#7a3a48"],
  ["aubergine", "#5a4478"],
];
PAINTS.forEach(([n, c], i) =>
  [["wide", 330, 84], ["short", 210, 70]].forEach(([sh, w, h]) => {
    const W = Number(w);
    const H = Number(h);
    const g = `bs${i}${sh}`;
    add(
      `brush-${n}-${sh}`,
      `${n} brush stroke`,
      W,
      H,
      `<defs>
         <filter id="${g}" filterUnits="userSpaceOnUse" x="-20" y="-20" width="${W + 40}" height="${H + 40}">
           <feTurbulence type="fractalNoise" baseFrequency="0.035 0.2" numOctaves="3" seed="${i + 4}" result="n"/>
           <feDisplacementMap in="SourceGraphic" in2="n" scale="12" xChannelSelector="R" yChannelSelector="G" result="d"/>
           <feTurbulence type="fractalNoise" baseFrequency="0.02 0.9" numOctaves="2" seed="${i + 9}" result="s"/>
           <feColorMatrix in="s" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -1.6 1.1" result="sa"/>
           <feComposite in="sa" in2="d" operator="in" result="sin"/>
           <feMerge><feMergeNode in="d"/><feMergeNode in="sin"/></feMerge>
         </filter>
       </defs>
       <g filter="url(#${g})"><path d="M18 ${H * 0.22}Q${W / 2} ${H * 0.08} ${W - 16} ${H * 0.26}L${W - 10} ${H * 0.72}Q${W / 2} ${H * 0.92} 14 ${H * 0.74}Z" fill="${c}" opacity=".95"/></g>`,
      Math.round(W * 0.85),
      Math.round(H * 0.85),
    );
  }),
);

// ---------- INK PHOTO FRAMES (transparent middle: place a photo underneath) ----------
INK.slice(0, 1).forEach(([n, c], i) =>
  [["portrait", 250, 330], ["landscape", 330, 250], ["square", 290, 290]].forEach(([sh, w, h]) => {
    const W = Number(w);
    const H = Number(h);
    add(
      `inkframe-${sh}-${n}`,
      `${sh} ink photo frame`,
      W,
      H,
      `<defs>${rough(`if${i}${sh}`, 2.2)}</defs>
       <g filter="url(#if${i}${sh})" fill="none" stroke="${c}" stroke-linecap="round" stroke-linejoin="round">
         <path d="M14 ${H * 0.32}V12H${W * 0.42}M${W * 0.58} 12H${W - 12}V${H * 0.4}M${W - 12} ${H * 0.58}V${H - 12}H${W * 0.6}M${W * 0.4} ${H - 12}H12V${H * 0.62}" stroke-width="2.2"/>
         <path d="M24 ${H * 0.2}V22H${W * 0.3}M${W - 24} ${H * 0.8}V${H - 22}H${W * 0.7}" stroke-width="1.4" stroke-dasharray="3 5"/>
         <path d="M${W * 0.46} 20h${W * 0.08}M20 ${H * 0.5}v${H * 0.08}M${W - 20} ${H * 0.46}v${H * 0.08}" stroke-width="1.8"/>
         <g stroke-width="1.6"><path d="M32 12v-8M${W - 32} ${H - 12}v8M12 ${H - 40}h-8M${W - 12} 40h8"/></g>
       </g>`,
      Math.round(W * 0.9),
      Math.round(H * 0.9),
    );
  }),
);


// two more, different frame styles
add(
  "inkframe-brackets-black",
  "corner bracket photo frame",
  300,
  300,
  `<defs>${rough("ifb", 2)}</defs><g filter="url(#ifb)" fill="none" stroke="#1f1d1f" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 64V14H64M236 14H286V64M286 236V286H236M64 286H14V236"/><path d="M26 76V26H76M224 26H274V76M274 224V274H224M76 274H26V224" stroke-width="1.2" stroke-dasharray="2 5"/></g>`,
  270,
  270,
);
add(
  "inkframe-dashed-black",
  "double dashed photo frame",
  300,
  360,
  `<defs>${rough("ifd", 2)}</defs><g filter="url(#ifd)" fill="none" stroke="#1f1d1f" stroke-linecap="round"><rect x="14" y="14" width="272" height="332" stroke-width="2" stroke-dasharray="10 6"/><rect x="26" y="26" width="248" height="308" stroke-width="1.2" stroke-dasharray="1 6"/></g>`,
  250,
  300,
);

// ---------- TINY INK DOODLES (sparkles, trails, plane, braces, hearts) ----------
INK.forEach(([n, c], i) => {
  const d = (id: string, label: string, w: number, h: number, body: string, scale = 0.9) =>
    add(`${id}-${n}`, `${label} (${n})`, w + 12, h + 12, `<defs>${rough(`dk${id}${i}`, 1.6)}</defs><g transform="translate(6 6)" filter="url(#dk${id}${i})" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${body}</g>`, Math.round((w + 12) * scale), Math.round((h + 12) * scale));
  const star = (x: number, y: number, r: number) => `<path d="M${x} ${y - r}C${x + r * 0.15} ${y - r * 0.15} ${x + r * 0.15} ${y - r * 0.15} ${x + r} ${y}C${x + r * 0.15} ${y + r * 0.15} ${x + r * 0.15} ${y + r * 0.15} ${x} ${y + r}C${x - r * 0.15} ${y + r * 0.15} ${x - r * 0.15} ${y + r * 0.15} ${x - r} ${y}C${x - r * 0.15} ${y - r * 0.15} ${x - r * 0.15} ${y - r * 0.15} ${x} ${y - r}Z" fill="${c}" stroke="none"/>`;
  const dot = (x: number, y: number, r = 1.8) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="none"/>`;
  d("scatter-a", "sparkle scatter", 140, 90, `${star(20, 18, 7)}${star(78, 52, 5)}${star(116, 20, 6)}${dot(48, 70)}${dot(100, 80)}${dot(34, 48, 1.4)}${dot(124, 56, 1.4)}${dot(66, 14, 1.4)}${star(10, 76, 4)}`);
  d("scatter-b", "star dots", 120, 120, `${star(30, 30, 8)}${star(90, 24, 5)}${star(70, 76, 7)}${star(20, 96, 4)}${dot(54, 54)}${dot(100, 100)}${dot(104, 62, 1.4)}${dot(12, 58, 1.4)}`);
  d("scatter-c", "tiny crosses", 140, 60, `<path d="M14 18l8 8M22 18l-8 8M66 34l7 7M73 34l-7 7M118 14l6 6M124 14l-6 6"/>${dot(40, 44)}${dot(94, 20)}${dot(130, 46, 1.4)}${star(100, 46, 4)}`);
  d("trail-plane", "paper plane with dotted trail", 150, 130, `<path d="M96 24L146 6L120 56L108 38Z" stroke-width="2"/><path d="M96 24L108 38L110 52" stroke-width="1.6"/><path d="M86 34C60 50 30 38 22 66C16 92 52 100 56 84C60 68 34 66 36 88C38 108 70 120 96 108" stroke-dasharray="1 7" stroke-width="3"/>`);
  d("trail-dots-curve", "dotted curve", 160, 90, `<path d="M6 80C40 10 100 10 154 70" stroke-dasharray="1 7" stroke-width="3.4"/>`);
  d("trail-dash-curve", "dashed curve", 170, 80, `<path d="M6 70C40 20 110 6 164 40" stroke-dasharray="9 7"/>`);
  d("trail-circle", "dotted circle trail", 120, 120, `<path d="M60 8C94 8 112 36 108 66C104 100 70 114 44 100C20 86 16 52 38 38" stroke-dasharray="1 7" stroke-width="3.2"/><circle cx="60" cy="60" r="9"/>`);
  d("quotes", "ink quote marks", 50, 40, `<path d="M8 10L16 2M20 14L28 6M34 10L42 2"/>`);
  d("brace", "curly brace", 40, 150, `<path d="M8 6C28 6 24 30 24 56C24 68 30 74 36 76C30 78 24 84 24 96C24 122 28 144 8 144"/>`, 0.9);
  d("hearts-row", "tiny hearts", 70, 20, `<path d="M12 18C2 11 2 3 8 3C11 3 12 6 12 7C12 6 13 3 16 3C22 3 22 11 12 18Z" fill="${c}"/><path d="M34 18C24 11 24 3 30 3C33 3 34 6 34 7C34 6 35 3 38 3C44 3 44 11 34 18Z" fill="${c}" opacity=".6"/><path d="M56 18C46 11 46 3 52 3C55 3 56 6 56 7C56 6 57 3 60 3C66 3 66 11 56 18Z" fill="${c}" opacity=".35"/>`);
  d("hearts-col", "stacked hearts", 20, 70, `<path d="M10 18C0 11 0 3 6 3C9 3 10 6 10 7C10 6 11 3 14 3C20 3 20 11 10 18Z" fill="${c}"/><path d="M10 42C0 35 0 27 6 27C9 27 10 30 10 31C10 30 11 27 14 27C20 27 20 35 10 42Z" fill="${c}" opacity=".6"/><path d="M10 66C0 59 0 51 6 51C9 51 10 54 10 55C10 54 11 51 14 51C20 51 20 59 10 66Z" fill="${c}" opacity=".35"/>`);
  d("mountains", "mountain drawing", 120, 90, `<path d="M6 80L40 22L60 52L74 36L112 80Z"/><path d="M40 22L50 40L36 46M74 36L84 54"/><path d="M92 62l-6 18h12zM104 68l-5 12h10z"/>`);
  d("leaf-vine", "leaf branch", 90, 190, `<path d="M20 186C8 140 30 100 46 60C54 40 52 20 46 6"/>${[[40, 150, -30], [26, 128, 150], [44, 108, -30], [34, 84, 150], [52, 62, -25], [44, 38, 150]].map(([x, y, r]) => `<path d="M${x} ${y}c14 -12 26 -6 28 4c-12 12 -22 8 -28 -4Z" transform="rotate(${r} ${x} ${y})"/>`).join("")}`, 0.9);
  d("arrow-swoop", "swoop arrow", 130, 70, `<path d="M6 54C34 6 86 6 118 40M118 40L102 34M118 40L112 24"/>`);
  d("underline-swirl", "swirl underline", 200, 34, `<path d="M6 22C50 8 90 30 130 16C160 6 180 18 194 14"/><path d="M40 30C80 22 120 32 170 26" stroke-width="1.4"/>`);
});

// ---------- DRIED & PRESSED FLOWERS ----------
const DRIED: [string, string, string][] = [
  ["ochre", "#b88a4a", "#8a6a45"],
  ["blush", "#d9a79a", "#8a6a55"],
  ["cream", "#e5d3a8", "#8f7650"],
];
DRIED.forEach(([n, bloom, stem], i) => {
  const r = rnd(i + 7);
  const sprig = (cx: number, top: number, bot: number, spread: number) => {
    let s = `<path d="M${cx} ${bot}C${cx - 6} ${(top + bot) / 2} ${cx + 6} ${top + 60} ${cx} ${top}" stroke="${stem}" stroke-width="1.6" fill="none"/>`;
    for (let k = 0; k < 7; k++) {
      const y = top + 8 + k * ((bot - top - 60) / 7);
      const dir = k % 2 ? 1 : -1;
      const ex = cx + dir * (spread * (0.5 + r() * 0.5));
      const ey = y - 16 - r() * 10;
      s += `<path d="M${cx} ${y + 10}Q${cx + dir * 8} ${y} ${ex} ${ey}" stroke="${stem}" stroke-width="1.1" fill="none"/>`;
      for (let b = 0; b < 4; b++) s += `<circle cx="${ex + (r() - 0.5) * 12}" cy="${ey + (r() - 0.5) * 12}" r="${2 + r() * 2.2}" fill="${bloom}" opacity=".9"/>`;
    }
    return s;
  };
  add(`dried-gypsophila-${n}`, `dried ${n} wildflower`, 130, 220, `${sprig(66, 10, 214, 44)}`, 84, 142);
  add(
    `dried-wheat-${n}`,
    `dried ${n} wheat`,
    70,
    220,
    `<path d="M34 216C36 150 32 90 34 24" stroke="${stem}" stroke-width="2" fill="none"/>${Array.from({ length: 10 }, (_, k) => `<ellipse cx="${26}" cy="${34 + k * 12}" rx="4" ry="8" transform="rotate(-24 26 ${34 + k * 12})" fill="${bloom}"/><ellipse cx="${42}" cy="${40 + k * 12}" rx="4" ry="8" transform="rotate(24 42 ${40 + k * 12})" fill="${bloom}"/>`).join("")}<ellipse cx="34" cy="14" rx="4" ry="9" fill="${bloom}"/>`,
    44,
    140,
  );
  add(
    `dried-leaf-branch-${n}`,
    `dried ${n} leaf branch`,
    110,
    210,
    `<path d="M56 206C48 150 66 100 58 20" stroke="${stem}" stroke-width="2" fill="none"/>${Array.from({ length: 8 }, (_, k) => { const y = 40 + k * 20; const dir = k % 2 ? 1 : -1; return `<path d="M58 ${y}q${dir * 22} -14 ${dir * 36} 2q-${dir * 14} 16 -${dir * 36} -2z" fill="${bloom}" opacity=".85" stroke="${stem}" stroke-opacity=".6" stroke-width=".8"/>`; }).join("")}`,
    70,
    134,
  );
});

// which section of the panel each piece belongs to
const where = (id: string) =>
  /^jk-(corner|grid-|note-)/.test(id)
    ? "paper"
    : id.startsWith("jk-tape-")
      ? "tape"
      : id.startsWith("jk-brush-")
        ? "brush"
        : id.startsWith("jk-inkframe-")
          ? "frames"
          : id.startsWith("jk-dried-")
            ? "flowers"
            : "doodles";
out.forEach((e) => {
  e.cat = where(e.id);
});

export const PROCEDURAL4: Sticker[] = out;

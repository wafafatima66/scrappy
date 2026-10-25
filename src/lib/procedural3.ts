// Realistic craft elements, part 2: flowers, film strips, lace, newspaper and handwritten paper,
// geometric shapes, borders and dividers, clips, extra doodles and vector stickers.
import { INKS, PAPERS, Sticker, grain, rough, svgWrap, torn, uri } from "./procedural";

const out: Sticker[] = [];
const add = (id: string, cat: string, label: string, w: number, h: number, inner: string, dw?: number, dh?: number) =>
  out.push({ id, cat, label, src: uri(svgWrap(w, h, inner)), w: dw ?? w, h: dh ?? h });

function rnd(seed: number) {
  let s = (seed * 9301 + 49297) % 233280;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// ---------- FLOWERS (soft gradients, pressed-flower look) ----------

const BLOOMS: [string, string, string][] = [
  ["rose", "#e88aa0", "#a8344f"],
  ["blush", "#f6c6cf", "#cf6f86"],
  ["peach", "#f7b894", "#c9683d"],
  ["lilac", "#cdb3ec", "#7c55b8"],
  ["butter", "#f8dd7a", "#c79a1e"],
  ["crimson", "#d4465c", "#7d1530"],
];
BLOOMS.forEach(([n, a, d], i) => {
  const id = `fl${i}`;
  // rose seen from above: rings of overlapping petals
  const petals = (r: number, count: number, size: number, off: number) =>
    Array.from({ length: count }, (_, k) => {
      const ang = ((360 / count) * k + off).toFixed(1);
      return `<ellipse cx="60" cy="${60 - r}" rx="${size}" ry="${size * 1.1}" transform="rotate(${ang} 60 60)" fill="url(#${id})" stroke="${d}" stroke-opacity=".45" stroke-width="1"/>`;
    }).join("");
  add(
    `rose-${n}`,
    "flowers",
    `${n} rose`,
    120,
    120,
    `<defs><radialGradient id="${id}" cx=".5" cy=".3" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".4" stop-color="${a}"/><stop offset="1" stop-color="${d}"/></radialGradient></defs>
     ${petals(36, 8, 20, 0)}${petals(24, 7, 16, 20)}${petals(13, 5, 12, 40)}
     <circle cx="60" cy="60" r="7" fill="${d}" opacity=".85"/><path d="M52 58q8 -9 16 0" stroke="#fff" stroke-opacity=".4" fill="none" stroke-width="1.6"/>`,
    96,
    96,
  );
  add(
    `blossom-${n}`,
    "flowers",
    `${n} blossom`,
    120,
    120,
    `<defs><radialGradient id="${id}b" cx=".5" cy=".6" r=".7"><stop offset="0" stop-color="${d}" stop-opacity=".6"/><stop offset=".35" stop-color="${a}"/><stop offset="1" stop-color="#fff"/></radialGradient></defs>
     ${Array.from({ length: 5 }, (_, k) => `<path d="M60 60C40 46 40 16 52 10L60 18L68 10C80 16 80 46 60 60Z" transform="rotate(${72 * k} 60 60)" fill="url(#${id}b)" stroke="${d}" stroke-opacity=".4" stroke-width="1"/>`).join("")}
     ${Array.from({ length: 9 }, (_, k) => `<line x1="60" y1="60" x2="${60 + 17 * Math.cos(k * 0.7)}" y2="${60 + 17 * Math.sin(k * 0.7)}" stroke="#7a2a3a" stroke-width="1"/><circle cx="${60 + 17 * Math.cos(k * 0.7)}" cy="${60 + 17 * Math.sin(k * 0.7)}" r="2.2" fill="#e8b94a"/>`).join("")}
     <circle cx="60" cy="60" r="5" fill="#d7a43a"/>`,
    92,
    92,
  );
});

["#ffffff", "#fde4ec", "#e6dcf7", "#fff1c2"].forEach((petal, i) =>
  add(
    `daisy-${i}`,
    "flowers",
    "daisy",
    120,
    120,
    `<defs><linearGradient id="dz${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${petal}"/><stop offset="1" stop-color="#d9d2c4"/></linearGradient><radialGradient id="dc${i}" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#ffe27a"/><stop offset="1" stop-color="#d9972a"/></radialGradient></defs>
     ${Array.from({ length: 16 }, (_, k) => `<ellipse cx="60" cy="24" rx="6" ry="21" transform="rotate(${22.5 * k} 60 60)" fill="url(#dz${i})" stroke="#b8ae9a" stroke-opacity=".6" stroke-width="1"/>`).join("")}
     <circle cx="60" cy="60" r="13" fill="url(#dc${i})" stroke="#a8721e" stroke-opacity=".6"/>`,
    90,
    90,
  ),
);
[["#f7c948", "#7a4b1e"], ["#f4a62a", "#5a3412"]].forEach(([p, c], i) =>
  add(
    `sunflower-${i}`,
    "flowers",
    "sunflower",
    130,
    130,
    `<defs><radialGradient id="sf${i}" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="#2e1a0a"/></radialGradient></defs>
     ${Array.from({ length: 22 }, (_, k) => `<path d="M65 6C75 22 74 36 65 44C56 36 55 22 65 6Z" transform="rotate(${(360 / 22) * k} 65 65)" fill="${p}" stroke="#b88a10" stroke-opacity=".6" stroke-width="1"/>`).join("")}
     <circle cx="65" cy="65" r="24" fill="url(#sf${i})"/>
     ${Array.from({ length: 40 }, (_, k) => `<circle cx="${65 + 2.4 * Math.sqrt(k) * 3 * Math.cos(k * 2.4) * 0.9}" cy="${65 + 2.4 * Math.sqrt(k) * 3 * Math.sin(k * 2.4) * 0.9}" r="1.2" fill="#c89a5a" opacity=".75"/>`).join("")}`,
    100,
    100,
  ),
);
BLOOMS.forEach(([n, a, d], i) =>
  add(
    `tulip-${n}`,
    "flowers",
    `${n} tulip`,
    80,
    150,
    `<defs><linearGradient id="tl${i}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${d}"/><stop offset=".35" stop-color="${a}"/><stop offset="1" stop-color="${d}" stop-opacity=".85"/></linearGradient></defs>
     <path d="M40 66V146" stroke="#5f8a4a" stroke-width="4" stroke-linecap="round"/>
     <path d="M40 140C14 130 12 104 22 96C32 104 38 120 40 140Z" fill="#7aa85f" stroke="#4d7339" stroke-opacity=".7"/>
     <path d="M40 130C66 122 68 96 60 90C50 98 42 112 40 130Z" fill="#8bb86e" stroke="#4d7339" stroke-opacity=".7"/>
     <path d="M12 22C12 50 22 68 40 68C58 68 68 50 68 22L54 36L40 8L26 36Z" fill="url(#tl${i})" stroke="${d}" stroke-opacity=".7" stroke-width="1.2"/>
     <path d="M40 10C34 30 34 52 40 66" stroke="#fff" stroke-opacity=".25" fill="none" stroke-width="2"/>`,
    56,
    105,
  ),
);
["#8c6fd6", "#a58be6", "#6f58b8"].forEach((c, i) =>
  add(
    `lavender-${i}`,
    "flowers",
    "lavender sprig",
    60,
    150,
    `<path d="M30 148V44" stroke="#6f9a58" stroke-width="2.6" stroke-linecap="round"/>
     ${Array.from({ length: 10 }, (_, k) => `<ellipse cx="22" cy="${36 + k * 9}" rx="5.4" ry="3.6" transform="rotate(-32 22 ${36 + k * 9})" fill="${c}" stroke="#4d3a8a" stroke-opacity=".4"/><ellipse cx="38" cy="${40 + k * 9}" rx="5.4" ry="3.6" transform="rotate(32 38 ${40 + k * 9})" fill="${c}" stroke="#4d3a8a" stroke-opacity=".4"/>`).join("")}
     <ellipse cx="30" cy="28" rx="4.5" ry="7" fill="${c}"/>`,
    42,
    105,
  ),
);
["#8fb08a", "#7a9f86", "#a8c3a0"].forEach((c, i) =>
  add(
    `eucalyptus-${i}`,
    "flowers",
    "eucalyptus branch",
    80,
    170,
    `<path d="M40 166C38 120 44 70 40 10" stroke="#6b8a64" stroke-width="2.4" fill="none"/>
     ${Array.from({ length: 9 }, (_, k) => `<ellipse cx="${k % 2 ? 54 : 26}" cy="${24 + k * 15}" rx="12" ry="9" transform="rotate(${k % 2 ? -25 : 25} ${k % 2 ? 54 : 26} ${24 + k * 15})" fill="${c}" stroke="#5c7a56" stroke-opacity=".7"/>`).join("")}
     <ellipse cx="40" cy="8" rx="8" ry="10" fill="${c}" stroke="#5c7a56" stroke-opacity=".7"/>`,
    56,
    120,
  ),
);
["#6f9a58", "#8bb86e"].forEach((c, i) =>
  add(
    `fern-${i}`,
    "flowers",
    "fern frond",
    90,
    170,
    `<path d="M45 168C44 110 48 50 45 8" stroke="#4d7339" stroke-width="2.4" fill="none"/>
     ${Array.from({ length: 14 }, (_, k) => { const y = 20 + k * 10.5; const l = 34 - k * 1.7; return `<path d="M45 ${y}Q${45 - l * 0.6} ${y - 6} ${45 - l} ${y + 4}Q${45 - l * 0.5} ${y + 2} 45 ${y}Z" fill="${c}"/><path d="M45 ${y}Q${45 + l * 0.6} ${y - 6} ${45 + l} ${y + 4}Q${45 + l * 0.5} ${y + 2} 45 ${y}Z" fill="${c}"/>`; }).join("")}`,
    60,
    113,
  ),
);
[["#e2412f", "#2b1d1a"], ["#f2753a", "#2b1d1a"], ["#f4a8b8", "#6a2a3a"]].forEach(([p, c], i) =>
  add(
    `poppy-${i}`,
    "flowers",
    "poppy",
    120,
    120,
    `<defs><radialGradient id="pp${i}" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="${c}" stop-opacity=".9"/><stop offset=".3" stop-color="${p}"/><stop offset="1" stop-color="${p}" stop-opacity=".88"/></radialGradient></defs>
     ${[0, 90, 180, 270].map((a, k) => `<path d="M60 60C30 56 14 36 22 22C40 8 70 24 60 60Z" transform="rotate(${a + 20} 60 60)" fill="url(#pp${i})" stroke="${p}" stroke-opacity=".6"/>`).join("")}
     <circle cx="60" cy="60" r="9" fill="${c}"/>${Array.from({ length: 12 }, (_, k) => `<line x1="60" y1="60" x2="${60 + 16 * Math.cos(k * 0.52)}" y2="${60 + 16 * Math.sin(k * 0.52)}" stroke="${c}" stroke-width="1.2"/>`).join("")}`,
    92,
    92,
  ),
);
["#f7e6a8", "#fbd8e0", "#dcd2f0"].forEach((c, i) =>
  add(
    `wildflowers-${i}`,
    "flowers",
    "wildflower stem",
    80,
    170,
    `<path d="M40 168C40 120 44 80 38 20" stroke="#5f8a4a" stroke-width="2.4" fill="none"/>
     <path d="M40 130L18 108M40 100L62 78M40 70L20 52" stroke="#5f8a4a" stroke-width="2" fill="none"/>
     ${[[38, 16], [16, 104], [64, 74], [18, 48]].map(([x, y]) => `${Array.from({ length: 5 }, (_, k) => `<circle cx="${x + 7 * Math.cos((k * 2 * Math.PI) / 5)}" cy="${y + 7 * Math.sin((k * 2 * Math.PI) / 5)}" r="5.4" fill="${c}" stroke="#a89a7a" stroke-opacity=".6"/>`).join("")}<circle cx="${x}" cy="${y}" r="3.2" fill="#e6a93a"/>`).join("")}`,
    56,
    120,
  ),
);

// ---------- FILM STRIPS ----------

const FILMS: [string, string, string][] = [
  ["black", "#1b1919", "#efe7d6"],
  ["sepia", "#4a3a2e", "#e8dcc0"],
  ["cream", "#e9dfc8", "#8a7a5c"],
];
FILMS.forEach(([n, base, hole], i) => {
  const strip = (frames: number) => {
    const w = 20 + frames * 100;
    const holes = Array.from({ length: frames * 6 }, (_, k) => `M${14 + k * 16.6} 8h9v7h-9zM${14 + k * 16.6} 95h9v7h-9z`).join("");
    const wins = Array.from({ length: frames }, (_, k) => `M${16 + k * 100} 22h88v66h-88z`).join("");
    return { w, svg: `<defs>${grain(`fg${i}${frames}`, i + frames, 0.8)}</defs><g filter="url(#fg${i}${frames})"><path fill-rule="evenodd" fill="${base}" d="M2 2H${w - 2}V108H2Z ${holes} ${wins}"/></g>${Array.from({ length: frames }, (_, k) => `<text x="${60 + k * 100}" y="98.6" font-family="'Courier New', monospace" font-size="6" fill="${hole}" text-anchor="middle" opacity=".7">${k + 1}A  ▸</text>`).join("")}` };
  };
  [3, 4, 5].forEach((f) => {
    const { w, svg } = strip(f);
    add(`film-h${f}-${n}`, "film", `${n} film strip (${f} frames)`, w, 110, svg, Math.round(w * 0.9), 99);
  });
  add(
    `film-v3-${n}`,
    "film",
    `${n} vertical film strip`,
    110,
    320,
    `<defs>${grain(`fv${i}`, i + 9, 0.8)}</defs><g filter="url(#fv${i})"><path fill-rule="evenodd" fill="${base}" d="M2 2H108V318H2Z ${Array.from({ length: 18 }, (_, k) => `M8 ${10 + k * 17}h7v10h-7zM95 ${10 + k * 17}h7v10h-7z`).join("")} ${[0, 1, 2].map((k) => `M20 ${12 + k * 102}h70v90h-70z`).join("")}"/></g>`,
    88,
    256,
  );
});
// slide mounts + instant-film frames (transparent windows so photos show through)
["#f4f1ea", "#1f1d1d", "#f3dcc9"].forEach((c, i) => {
  add(
    `slide-${i}`,
    "film",
    "photo slide frame",
    150,
    150,
    `<defs>${grain(`sl${i}`, i + 2, 0.8)}</defs><g filter="url(#sl${i})"><path fill-rule="evenodd" fill="${c}" d="M4 4H146V146H4Z M26 26H124V124H26Z"/></g><path d="M26 26H124V124H26Z" fill="none" stroke="#000" stroke-opacity=".25"/>`,
    130,
    130,
  );
  add(
    `instant-${i}`,
    "film",
    "instant photo frame",
    150,
    180,
    `<defs>${grain(`in${i}`, i + 6, 0.8)}</defs><g filter="url(#in${i})"><path fill-rule="evenodd" fill="${c}" d="M4 4H146V176H4Z M14 14H136V126H14Z"/></g><path d="M14 14H136V126H14Z" fill="none" stroke="#000" stroke-opacity=".22"/>`,
    140,
    168,
  );
});

// ---------- LACE ----------

const LACES: [string, string][] = [
  ["white", "#fbf8f2"],
  ["cream", "#efe3c9"],
  ["blush", "#f5d6da"],
  ["lilac", "#dcd0ef"],
  ["sage", "#d4e1cd"],
];
LACES.forEach(([n, c], i) => {
  const m = `lm${i}`;
  const holes = Array.from({ length: 24 }, (_, k) => `<circle cx="${14 + k * 16}" cy="24" r="4.6" fill="#000"/><circle cx="${22 + k * 16}" cy="38" r="3.4" fill="#000"/>`).join("");
  const scallops = Array.from({ length: 24 }, (_, k) => `<circle cx="${14 + k * 16}" cy="46" r="8" fill="#fff"/>`).join("");
  add(
    `lace-strip-${n}`,
    "lace",
    `${n} lace strip`,
    400,
    64,
    `<defs><mask id="${m}"><rect width="400" height="64" fill="#fff"/>${holes}</mask>${grain(`lg${i}`, i, 0.9)}</defs>
     <g filter="url(#lg${i})"><g mask="url(#${m})"><rect x="2" y="6" width="396" height="40" fill="${c}"/>${Array.from({ length: 24 }, (_, k) => `<circle cx="${14 + k * 16}" cy="46" r="8.6" fill="${c}"/>`).join("")}</g></g>
     <path d="M4 12H396" stroke="#000" stroke-opacity=".12" stroke-width="1.5" stroke-dasharray="2 3"/>`,
    330,
    53,
  );
  add(
    `lace-doily-${n}`,
    "lace",
    `${n} lace doily`,
    200,
    200,
    `<defs><mask id="${m}d"><rect width="200" height="200" fill="#fff"/>${Array.from({ length: 16 }, (_, k) => `<circle cx="${100 + 62 * Math.cos((k * Math.PI) / 8)}" cy="${100 + 62 * Math.sin((k * Math.PI) / 8)}" r="6" fill="#000"/>`).join("")}${Array.from({ length: 12 }, (_, k) => `<circle cx="${100 + 38 * Math.cos((k * Math.PI) / 6)}" cy="${100 + 38 * Math.sin((k * Math.PI) / 6)}" r="4.4" fill="#000"/>`).join("")}${Array.from({ length: 24 }, (_, k) => `<circle cx="${100 + 80 * Math.cos((k * Math.PI) / 12)}" cy="${100 + 80 * Math.sin((k * Math.PI) / 12)}" r="2.6" fill="#000"/>`).join("")}<circle cx="100" cy="100" r="12" fill="#000"/></mask>${grain(`lgd${i}`, i + 4, 0.9)}</defs>
     <g filter="url(#lgd${i})"><g mask="url(#${m}d)">${Array.from({ length: 24 }, (_, k) => `<circle cx="${100 + 88 * Math.cos((k * Math.PI) / 12)}" cy="${100 + 88 * Math.sin((k * Math.PI) / 12)}" r="11" fill="${c}"/>`).join("")}<circle cx="100" cy="100" r="88" fill="${c}"/></g></g>`,
    170,
    170,
  );
  add(
    `lace-v-${n}`,
    "lace",
    `${n} vertical lace`,
    64,
    400,
    `<defs><mask id="${m}v"><rect width="64" height="400" fill="#fff"/>${Array.from({ length: 24 }, (_, k) => `<circle cx="24" cy="${14 + k * 16}" r="4.6" fill="#000"/><circle cx="38" cy="${22 + k * 16}" r="3.4" fill="#000"/>`).join("")}</mask>${grain(`lgv${i}`, i + 2, 0.9)}</defs>
     <g filter="url(#lgv${i})"><g mask="url(#${m}v)"><rect x="6" y="2" width="40" height="396" fill="${c}"/>${Array.from({ length: 24 }, (_, k) => `<circle cx="46" cy="${14 + k * 16}" r="8.6" fill="${c}"/>`).join("")}</g></g>`,
    53,
    330,
  );
});

// ---------- NEWSPAPER & HANDWRITTEN PAPER (pattern paper) ----------

const NEWS: [string, string][] = [
  ["white", "#e8e3d6"],
  ["aged", "#d7c79e"],
  ["grey", "#cfcdc6"],
];
const NEWS_HEAD = ["THE DAILY POST", "EVENING STAR", "THE GAZETTE", "MORNING NEWS"];
NEWS.forEach(([n, c], i) => {
  const gid = `nw${i}`;
  const cols = (w: number, y0: number, h: number, seed: number) => {
    const r = rnd(seed);
    let s = "";
    const colW = (w - 28) / 3;
    for (let cI = 0; cI < 3; cI++)
      for (let y = y0; y < y0 + h; y += 7) {
        const len = colW - 4 - (r() < 0.12 ? colW * 0.4 : 0);
        s += `<rect x="${14 + cI * colW}" y="${y}" width="${len}" height="2.4" fill="#4a463e" opacity=".55"/>`;
      }
    return s;
  };
  add(
    `news-page-${n}`,
    "pattern",
    `${n} newspaper`,
    260,
    300,
    `<defs>${torn(gid, i + 70, 14, 0.05)}</defs>
     <g filter="url(#${gid})"><rect x="20" y="20" width="220" height="260" fill="${c}"/></g>
     <text x="130" y="56" text-anchor="middle" font-family="'Times New Roman', Georgia, serif" font-weight="bold" font-size="23" fill="#2a2722">${NEWS_HEAD[i % 4]}</text>
     <line x1="32" y1="63" x2="228" y2="63" stroke="#2a2722" stroke-width="2"/><line x1="32" y1="67" x2="228" y2="67" stroke="#2a2722" stroke-width=".8"/>
     <text x="32" y="82" font-family="'Times New Roman', serif" font-size="8" fill="#4a463e">VOL. XII · No. 148 · PRICE TWO PENCE</text>
     <rect x="34" y="90" width="90" height="62" fill="#8d887a"/><path d="M34 152L64 118L84 138L104 112L124 152Z" fill="#6c685c"/>
     ${cols(220, 90, 0, 1)}
     <g transform="translate(20,0)">${cols(220, 160, 100, i + 3)}</g>
     <g transform="translate(110,0)"><rect x="24" y="92" width="86" height="6" fill="#2a2722" opacity=".8"/>${Array.from({ length: 8 }, (_, k) => `<rect x="24" y="${104 + k * 7}" width="${k % 3 === 2 ? 60 : 86}" height="2.4" fill="#4a463e" opacity=".55"/>`).join("")}</g>`,
    210,
    242,
  );
  add(
    `news-strip-${n}`,
    "pattern",
    `${n} newspaper clipping`,
    300,
    110,
    `<defs>${torn(`${gid}s`, i + 77, 10, 0.07)}</defs>
     <g filter="url(#${gid}s)"><rect x="14" y="14" width="272" height="82" fill="${c}"/></g>
     <text x="150" y="44" text-anchor="middle" font-family="'Times New Roman', Georgia, serif" font-weight="bold" font-size="20" fill="#2a2722">LOCAL GIRL MAKES GOOD</text>
     ${Array.from({ length: 4 }, (_, k) => `<rect x="26" y="${54 + k * 9}" width="${k === 3 ? 140 : 248}" height="2.4" fill="#4a463e" opacity=".55"/>`).join("")}`,
    250,
    92,
  );
});

const HAND: [string, string][] = [
  ["blue", "#31446b"],
  ["black", "#26242b"],
  ["sepia", "#6b4a2e"],
  ["violet", "#5a3d8a"],
];
const scribble = (x0: number, x1: number, y: number, seed: number, ink: string) => {
  const r = rnd(seed);
  let d = `M${x0} ${y}`;
  let x = x0;
  while (x < x1) {
    const word = 18 + r() * 52;
    let wx = 0;
    while (wx < word && x < x1) {
      const a = 3 + r() * 6;
      const step = 4 + r() * 4;
      d += ` q${step / 2} ${-a} ${step} ${r() < 0.2 ? 3 : 0}`;
      wx += step;
      x += step;
    }
    x += 8;
    d += ` m8 0`;
  }
  return `<path d="${d}" fill="none" stroke="${ink}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>`;
};
const PAPER_STYLES: [string, string, boolean][] = [
  ["lined", "#faf6ea", true],
  ["kraft", "#cfae82", false],
  ["lilac", "#e6defa", false],
  ["blush", "#f8e3e6", false],
];
PAPER_STYLES.forEach(([pn, pc, lined], pi) =>
  HAND.forEach(([hn, ink], hi) => {
    const gid = `hw${pi}${hi}`;
    const w = 240;
    const h = 300;
    add(
      `hand-${pn}-${hn}`,
      "pattern",
      `handwritten ${pn} note (${hn} ink)`,
      w,
      h,
      `<defs>${torn(gid, pi * 4 + hi + 90, 10, 0.05)}</defs>
       <g filter="url(#${gid})"><rect x="16" y="16" width="${w - 32}" height="${h - 32}" fill="${pc}"/></g>
       ${lined ? Array.from({ length: 10 }, (_, k) => `<line x1="24" y1="${64 + k * 22}" x2="${w - 24}" y2="${64 + k * 22}" stroke="#9db6d6" stroke-width="1"/>`).join("") : ""}
       ${scribble(30, 120, 44, pi + hi * 3, ink)}
       ${Array.from({ length: 9 }, (_, k) => scribble(30, w - 34 - (k % 3 === 1 ? 40 : 0), 66 + k * 22 - 4, pi * 9 + hi * 5 + k, ink)).join("")}`,
      200,
      250,
    );
  }),
);

// ---------- GEOMETRIC SHAPES ----------

const SHAPES: [string, string][] = [
  ["circle", `<circle cx="60" cy="60" r="48"/>`],
  ["square", `<rect x="14" y="14" width="92" height="92" rx="4"/>`],
  ["rounded", `<rect x="12" y="12" width="96" height="96" rx="26"/>`],
  ["triangle", `<path d="M60 12L110 104H10Z" stroke-linejoin="round"/>`],
  ["hexagon", `<path d="M60 10L102 34V86L60 110L18 86V34Z"/>`],
  ["diamond", `<path d="M60 8L110 60L60 112L10 60Z"/>`],
  ["star", `<path d="M60 8L73 44L112 46L82 70L92 108L60 86L28 108L38 70L8 46L47 44Z" stroke-linejoin="round"/>`],
  ["arch", `<path d="M20 108V60A40 40 0 0 1 100 60V108Z"/>`],
  ["half", `<path d="M10 80A50 50 0 0 1 110 80Z"/>`],
  ["quarter", `<path d="M14 14A92 92 0 0 1 106 106H14Z"/>`],
  ["blob", `<path d="M30 20C56 2 96 14 104 44C112 74 92 108 58 108C24 108 4 78 12 50C16 36 22 26 30 20Z"/>`],
  ["plus", `<path d="M44 12H76V44H108V76H76V108H44V76H12V44H44Z" stroke-linejoin="round"/>`],
  ["heart", `<path d="M60 108C14 74 6 38 30 24C46 16 58 28 60 40C62 28 74 16 90 24C114 38 106 74 60 108Z"/>`],
  ["ring", `<path fill-rule="evenodd" d="M60 10A50 50 0 1 1 59.9 10ZM60 38A22 22 0 1 0 60.1 38Z"/>`],
  ["cloud", `<path d="M34 94C10 94 6 62 30 58C28 34 58 24 70 44C84 34 106 48 100 70C116 74 114 94 96 94Z"/>`],
  ["scallop", `<path d="M60 10l12 8 15-2 6 14 14 6-2 15 8 12-8 12 2 15-14 6-6 14-15-2-12 8-12-8-15 2-6-14-14-6 2-15-8-12 8-12-2-15 14-6 6-14 15 2z"/>`],
];
PAPERS.slice(0, 10).forEach(([cn, c], ci) =>
  SHAPES.forEach(([sn, path], si) => {
    const g = `sh${ci}${si}`;
    add(
      `shape-${sn}-${cn}`,
      "shapes",
      `${cn} ${sn}`,
      120,
      120,
      `<defs>${grain(g, ci + si, 1.1)}<linearGradient id="${g}l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity=".1"/></linearGradient></defs>
       <g filter="url(#${g})"><g fill="${c}" stroke="#000" stroke-opacity=".12" stroke-width="1">${path}</g><g fill="url(#${g}l)">${path}</g></g>`,
      80,
      80,
    );
  }),
);

// ---------- BORDERS & DIVIDERS ----------

INKS.slice(0, 5).forEach(([n, ink], i) => {
  const d = (id: string, label: string, w: number, h: number, body: string, dw = w, dh = h) => add(`div-${id}-${n}`, "borders", `${label} (${n})`, w, h, `<defs>${rough(`dv${id}${i}`, 1.6)}</defs><g filter="url(#dv${id}${i})" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${body}</g>`, dw, dh);
  d("dotted", "dotted line", 420, 20, `<line x1="10" y1="10" x2="410" y2="10" stroke-dasharray="0.1 10"/>`, 380, 18);
  d("dashed", "dashed line", 420, 20, `<line x1="10" y1="10" x2="410" y2="10" stroke-dasharray="14 9"/>`, 380, 18);
  d("double", "double line", 420, 24, `<line x1="10" y1="7" x2="410" y2="7" stroke-width="2"/><line x1="10" y1="17" x2="410" y2="17" stroke-width="2"/>`, 380, 22);
  d("zigzag", "zigzag line", 420, 28, `<path d="${Array.from({ length: 26 }, (_, k) => `${k ? "L" : "M"}${10 + k * 16} ${k % 2 ? 8 : 20}`).join(" ")}"/>`, 380, 25);
  d("wave", "wavy line", 420, 28, `<path d="M10 14${Array.from({ length: 10 }, () => "q10 -14 20 0t20 0").join(" ")}"/>`, 380, 25);
  d("stitch", "stitched line", 420, 20, `<line x1="10" y1="10" x2="410" y2="10" stroke-dasharray="12 8" stroke-width="2.6"/>`, 380, 18);
  d("stars", "star divider", 420, 36, `<line x1="10" y1="18" x2="170" y2="18"/><line x1="250" y1="18" x2="410" y2="18"/><path d="M210 4L216 15L228 16L219 24L222 36L210 29L198 36L201 24L192 16L204 15Z" fill="${ink}" stroke="none"/>`, 380, 33);
  d("diamond", "diamond divider", 420, 36, `<line x1="10" y1="18" x2="180" y2="18"/><line x1="240" y1="18" x2="410" y2="18"/><path d="M210 4L224 18L210 32L196 18Z" fill="${ink}" stroke="none"/>`, 380, 33);
  d("vine", "vine divider", 420, 44, `<path d="M10 22C60 4 90 40 140 22S220 4 280 22S360 40 410 22"/>${[60, 140, 220, 300, 380].map((x, k) => `<ellipse cx="${x}" cy="${k % 2 ? 34 : 10}" rx="9" ry="5" fill="${ink}" opacity=".7" stroke="none" transform="rotate(${k % 2 ? -25 : 25} ${x} ${k % 2 ? 34 : 10})"/>`).join("")}`, 380, 40);
  d("hearts", "heart divider", 420, 36, `<line x1="10" y1="18" x2="180" y2="18"/><line x1="240" y1="18" x2="410" y2="18"/><path d="M210 30C192 18 190 8 198 6C204 5 209 9 210 13C211 9 216 5 222 6C230 8 228 18 210 30Z" fill="${ink}" stroke="none"/>`, 380, 33);
  d("ticks", "ruler line", 420, 30, `<line x1="10" y1="22" x2="410" y2="22" stroke-width="2"/>${Array.from({ length: 41 }, (_, k) => `<line x1="${10 + k * 10}" y1="22" x2="${10 + k * 10}" y2="${k % 5 === 0 ? 8 : 15}" stroke-width="1.6"/>`).join("")}`, 380, 27);
  d("bracket", "scribble bracket", 420, 40, `<path d="M10 30C10 8 30 8 60 8H360C390 8 410 8 410 30"/>`, 380, 36);
});
PAPERS.slice(0, 8).forEach(([n, c], i) => {
  const g = `bt${i}`;
  add(
    `border-torn-top-${n}`,
    "borders",
    `${n} torn edge strip`,
    600,
    90,
    `<defs>${torn(g, i + 40, 22, 0.035)}</defs><g filter="url(#${g})"><rect x="-30" y="-40" width="660" height="110" fill="#fbf8f0"/><rect x="-30" y="-40" width="660" height="102" fill="${c}"/></g>`,
    480,
    72,
  );
  add(
    `border-scallop-${n}`,
    "borders",
    `${n} scalloped edge`,
    420,
    50,
    `<defs>${grain(`${g}s`, i, 0.9)}</defs><g filter="url(#${g}s)"><rect x="0" y="0" width="420" height="30" fill="${c}"/>${Array.from({ length: 14 }, (_, k) => `<circle cx="${15 + k * 30}" cy="30" r="15" fill="${c}"/>`).join("")}</g><path d="${Array.from({ length: 14 }, (_, k) => `M${k * 30} 30a15 15 0 0 0 30 0`).join(" ")}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2" stroke-dasharray="3 3"/>`,
    360,
    43,
  );
});
["#2d2a33", "#f4efe2", "#b4525f", "#4a6a8a"].forEach((c, i) =>
  add(
    `photo-corners-${i}`,
    "borders",
    "photo corners",
    200,
    200,
    `<defs>${grain(`pc${i}`, i, 0.8)}</defs><g filter="url(#pc${i})" fill="${c}">
       <path d="M6 6H62L6 62Z"/><path d="M194 6H138L194 62Z"/><path d="M6 194H62L6 138Z"/><path d="M194 194H138L194 138Z"/></g>`,
    150,
    150,
  ),
);

// ---------- MORE CLIPS ----------

["#1f1f24", "#d9667a", "#c9a24a", "#6a8fd0"].forEach((c, i) =>
  add(
    `binder-${i}`,
    "clips",
    "binder clip",
    110,
    130,
    `<defs><linearGradient id="bc${i}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".3" stop-color="${c}"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient></defs>
     <path d="M30 60C8 40 16 8 36 8M80 60C102 40 94 8 74 8" fill="none" stroke="#b8bcc4" stroke-width="5" stroke-linecap="round"/>
     <path d="M14 56H96L108 124H2Z" fill="url(#bc${i})" stroke="#000" stroke-opacity=".3"/>
     <path d="M20 66H90" stroke="#fff" stroke-opacity=".3" stroke-width="3"/>`,
    84,
    100,
  ),
);
["#d8b88a", "#f2c9d2", "#bfd9c2"].forEach((c, i) =>
  add(
    `peg-${i}`,
    "clips",
    "clothes peg",
    50,
    140,
    `<defs><linearGradient id="pg2${i}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".4" stop-color="${c}"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient></defs>
     <path d="M12 6H38V70L34 134H26L25 84L24 134H16L12 70Z" fill="url(#pg2${i})" stroke="#000" stroke-opacity=".3"/>
     <circle cx="25" cy="54" r="4" fill="#9aa0aa" stroke="#000" stroke-opacity=".3"/>`,
    38,
    106,
  ),
);
add(
  "safety-pin",
  "clips",
  "safety pin",
  120,
  60,
  `<path d="M16 22H88A12 12 0 0 1 88 46H24" fill="none" stroke="#b8bcc4" stroke-width="4" stroke-linecap="round"/><path d="M16 22A10 10 0 0 0 16 42H30" fill="none" stroke="#9aa0aa" stroke-width="4" stroke-linecap="round"/><path d="M16 22H88" stroke="#fff" stroke-opacity=".6" stroke-width="1.5"/>`,
  100,
  50,
);
add(
  "staples",
  "clips",
  "staples",
  120,
  50,
  `${[0, 1, 2].map((k) => `<path d="M${14 + k * 38} 14V34H${40 + k * 38}V14" fill="none" stroke="#a8aeb8" stroke-width="3.6" stroke-linejoin="round"/>`).join("")}`,
  90,
  38,
);

// ---------- MORE DOODLES ----------

const DOODLES: [string, string, number, number][] = [
  ["cloud", `<path d="M26 66C6 66 4 38 26 36C24 14 54 8 64 26C74 14 100 22 96 44C112 46 112 66 94 66Z"/>`, 116, 76],
  ["sun", `<circle cx="50" cy="50" r="18"/>${Array.from({ length: 10 }, (_, k) => `<line x1="50" y1="14" x2="50" y2="24" transform="rotate(${36 * k} 50 50)"/>`).join("")}`, 100, 100],
  ["moon", `<path d="M64 10A40 40 0 1 0 90 66A32 32 0 1 1 64 10Z"/>`, 100, 100],
  ["music", `<path d="M30 74V20L72 12V66"/><ellipse cx="22" cy="76" rx="9" ry="7"/><ellipse cx="64" cy="68" rx="9" ry="7"/>`, 90, 90],
  ["cup", `<path d="M14 30H66V56C66 72 54 80 40 80C26 80 14 72 14 56Z"/><path d="M66 36C86 34 86 60 64 60"/><path d="M28 20q-6 -6 0 -12M44 20q-6 -6 0 -12"/>`, 96, 90],
  ["plane", `<path d="M8 50L92 10L60 90L48 58Z"/><path d="M48 58L92 10"/>`, 100, 100],
  ["mountain", `<path d="M6 80L36 28L52 52L68 30L96 80Z"/><path d="M30 40L36 46L42 40"/>`, 104, 86],
  ["house", `<path d="M10 48L50 12L90 48"/><path d="M20 44V86H80V44"/><rect x="42" y="58" width="16" height="28"/>`, 100, 96],
  ["crown", `<path d="M10 76L16 26L38 52L50 18L62 52L84 26L90 76Z"/><line x1="12" y1="86" x2="88" y2="86"/>`, 100, 94],
  ["camera", `<rect x="8" y="26" width="84" height="56" rx="8"/><circle cx="50" cy="54" r="16"/><path d="M34 26L40 14H60L66 26"/>`, 100, 90],
  ["speech", `<path d="M10 14H90V62H44L26 80V62H10Z"/><path d="M26 32H74M26 46H58"/>`, 100, 90],
  ["leaf", `<path d="M14 82C10 40 40 12 88 14C90 60 62 90 14 82Z"/><path d="M14 82C34 56 54 38 76 26"/>`, 100, 96],
  ["chain-hearts", `${[0, 1, 2, 3].map((k) => `<path d="M${22 + k * 26} 44C${8 + k * 26} 32 ${10 + k * 26} 20 ${18 + k * 26} 20C${22 + k * 26} 20 ${22 + k * 26} 24 ${22 + k * 26} 26C${22 + k * 26} 24 ${26 + k * 26} 20 ${30 + k * 26} 20C${38 + k * 26} 20 ${36 + k * 26} 32 ${22 + k * 26} 44Z"/>`).join("")}`, 128, 60],
  ["arrow-straight", `<path d="M8 30H84M84 30L68 16M84 30L68 44"/>`, 100, 60],
  ["arrow-up", `<path d="M10 70C10 30 40 20 70 18M70 18L56 8M70 18L60 32"/>`, 90, 80],
  ["asterisk", `<path d="M50 10V90M16 30L84 70M16 70L84 30"/>`, 100, 100],
  ["bubbles", `<circle cx="30" cy="62" r="18"/><circle cx="64" cy="40" r="12"/><circle cx="76" cy="72" r="8"/><circle cx="52" cy="18" r="6"/>`, 100, 90],
  ["eye", `<path d="M6 40C24 8 76 8 94 40C76 72 24 72 6 40Z"/><circle cx="50" cy="40" r="12"/><circle cx="50" cy="40" r="4"/>`, 100, 80],
];
DOODLES.forEach(([name, body, w, h]) =>
  INKS.slice(0, 4).forEach(([cn, c], ci) =>
    add(
      `doodle2-${name}-${cn}`,
      "doodles",
      `${name} (${cn})`,
      w + 12,
      h + 12,
      `<defs>${rough(`d2${ci}`, 2.4)}</defs><g transform="translate(6 6)" filter="url(#d2${ci})" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" opacity=".92">${body}</g>`,
      Math.round((w + 12) * 0.9),
      Math.round((h + 12) * 0.9),
    ),
  ),
);

// ---------- VECTOR STICKERS (Stickers tab) ----------

const STK: [string, string, string][] = [
  ["rose", "#f2a7b8", "#c2566f"],
  ["lilac", "#c9b8f0", "#7c65d6"],
  ["peach", "#f8c3a4", "#d1794b"],
  ["butter", "#f8dd7a", "#c79a1e"],
  ["mint", "#a9d8b8", "#4a9a6a"],
  ["sky", "#9dc8ec", "#4a84bb"],
];
const HEART = "M50 88C10 60 4 28 26 18C38 13 48 21 50 31C52 21 62 13 74 18C96 28 90 60 50 88Z";
const starPts = (cx: number, cy: number, o: number, inn: number) =>
  Array.from({ length: 10 }, (_, i) => `${(cx + (i % 2 ? inn : o) * Math.cos((Math.PI * i) / 5 - Math.PI / 2)).toFixed(1)},${(cy + (i % 2 ? inn : o) * Math.sin((Math.PI * i) / 5 - Math.PI / 2)).toFixed(1)}`).join(" ");
STK.forEach(([n, a, d], i) => {
  const g = `st${i}`;
  const grad = `<defs><radialGradient id="${g}" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset=".45" stop-color="${a}"/><stop offset="1" stop-color="${d}" stop-opacity=".85"/></radialGradient></defs>`;
  const sticker = (inner: string) => `${grad}<g stroke="#fff" stroke-width="7" stroke-linejoin="round" paint-order="stroke">${inner}</g>`;
  add(`stk-heart-${n}`, "hearts", `${n} heart`, 100, 100, sticker(`<path d="${HEART}" fill="url(#${g})"/>`), 80, 80);
  add(`stk-star-${n}`, "hearts", `${n} star`, 100, 100, sticker(`<polygon points="${starPts(50, 52, 44, 20)}" fill="url(#${g})"/>`), 80, 80);
  add(`stk-sparkle-${n}`, "hearts", `${n} sparkle`, 100, 100, sticker(`<path d="M50 4C54 36 64 46 96 50C64 54 54 64 50 96C46 64 36 54 4 50C36 46 46 36 50 4Z" fill="url(#${g})"/>`), 70, 70);
  add(`stk-cloud-${n}`, "nature", `${n} cloud`, 120, 80, sticker(`<path d="M30 68C8 68 6 40 28 38C26 16 56 10 66 28C76 16 102 24 98 46C114 48 114 68 96 68Z" fill="url(#${g})"/>`), 100, 66);
  add(`stk-moon-${n}`, "nature", `${n} moon`, 100, 100, sticker(`<path d="M66 8A44 44 0 1 0 92 66A36 36 0 1 1 66 8Z" fill="url(#${g})"/>`), 74, 74);
  add(`stk-sun-${n}`, "nature", `${n} sun`, 100, 100, sticker(`${Array.from({ length: 12 }, (_, k) => `<line x1="50" y1="6" x2="50" y2="18" stroke="${d}" stroke-width="5" stroke-linecap="round" transform="rotate(${30 * k} 50 50)"/>`).join("")}<circle cx="50" cy="50" r="24" fill="url(#${g})"/>`), 76, 76);
  add(
    `stk-butterfly-${n}`,
    "nature",
    `${n} butterfly`,
    100,
    100,
    `${grad}<g stroke="#fff" stroke-width="6" stroke-linejoin="round" paint-order="stroke"><g><path d="M50 48C28 4 -2 10 6 40C10 56 32 56 50 50Z" fill="url(#${g})"/><path d="M50 52C34 56 12 62 20 84C30 98 46 76 50 54Z" fill="url(#${g})"/></g><g transform="translate(100,0) scale(-1,1)"><path d="M50 48C28 4 -2 10 6 40C10 56 32 56 50 50Z" fill="url(#${g})"/><path d="M50 52C34 56 12 62 20 84C30 98 46 76 50 54Z" fill="url(#${g})"/></g><ellipse cx="50" cy="52" rx="3.5" ry="20" fill="#3a304d"/></g>`,
    76,
    76,
  );
});
["#f2a7b8", "#b9a8f0", "#f6d879", "#a9c4a0", "#9dc8ec"].forEach((c, i) =>
  add(
    `stk-rainbow-${i}`,
    "nature",
    "rainbow",
    130,
    80,
    `<g stroke="#fff" stroke-width="3" paint-order="stroke" fill="none">${[0, 1, 2, 3].map((k) => `<path d="M${8 + k * 10} 76A${57 - k * 10} ${57 - k * 10} 0 0 1 ${122 - k * 10} 76" stroke="${["#e4505f", "#f4c430", "#5bb07a", "#5a8fd0"][(k + i) % 4]}" stroke-width="9"/>`).join("")}</g>`,
    110,
    68,
  ),
);

export const PROCEDURAL3: Sticker[] = out;

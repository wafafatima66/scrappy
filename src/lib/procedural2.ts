// More realistic craft elements: sticky notes, envelopes, tickets, country stamps and date stamps.
import { PAPERS, Sticker, grain, rough, svgWrap, torn, uri } from "./procedural";

export type Gen = Sticker & { gen?: () => string };

const out: Gen[] = [];
const add = (id: string, cat: string, label: string, w: number, h: number, inner: string, dw?: number, dh?: number) =>
  out.push({ id, cat, label, src: uri(svgWrap(w, h, inner)), w: dw ?? w, h: dh ?? h });

// ---------- STICKY NOTES ----------

const NOTE_COLORS: [string, string, string][] = [
  ["yellow", "#f8e682", "#e9cf55"],
  ["pink", "#f7b6c6", "#e592a8"],
  ["blue", "#aad6f2", "#7fb7de"],
  ["green", "#bde6ac", "#92c97c"],
  ["orange", "#f9c88e", "#eba65a"],
  ["lilac", "#d6c4f0", "#b59ee0"],
];
NOTE_COLORS.forEach(([n, c, d], i) => {
  const gid = `sn${i}`;
  const base = (w: number, h: number, lines: boolean) => `<defs>${grain(`${gid}g${w}${lines ? 1 : 0}`, i + 2, 0.7)}
    <linearGradient id="${gid}${w}${lines ? 1 : 0}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${d}"/><stop offset=".16" stop-color="${c}"/><stop offset="1" stop-color="${c}"/></linearGradient></defs>
    <g filter="url(#${gid}g${w}${lines ? 1 : 0})"><path d="M6 6H${w - 6}V${h - 44}L${w - 44} ${h - 6}H6Z" fill="url(#${gid}${w}${lines ? 1 : 0})"/>
    <path d="M${w - 6} ${h - 44}L${w - 44} ${h - 6}V${h - 34}Q${w - 44} ${h - 44} ${w - 34} ${h - 44}Z" fill="#000" opacity=".16"/></g>
    ${lines ? Array.from({ length: Math.floor((h - 70) / 24) }, (_, k) => `<line x1="20" y1="${52 + k * 24}" x2="${w - 20}" y2="${52 + k * 24}" stroke="#000" stroke-opacity=".14" stroke-width="1.2"/>`).join("") : ""}`;
  add(`note-sq-${n}`, "notes", `${n} sticky note`, 180, 180, base(180, 180, false), 150, 150);
  add(`note-lined-${n}`, "notes", `${n} lined sticky note`, 200, 220, base(200, 220, true), 160, 176);
  add(`note-wide-${n}`, "notes", `${n} wide sticky note`, 240, 140, base(240, 140, false), 190, 110);
});

// ---------- ENVELOPES ----------

PAPERS.slice(0, 8).forEach(([n, c], i) => {
  const gid = `ev${i}`;
  add(
    `env-closed-${n}`,
    "envelopes",
    `${n} envelope`,
    240,
    170,
    `<defs>${grain(`${gid}g`, i + 5, 0.9)}</defs>
     <g filter="url(#${gid}g)"><rect x="8" y="12" width="224" height="148" rx="3" fill="${c}"/></g>
     <path d="M8 14L120 92L232 14" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="1.6"/>
     <path d="M8 160L100 84M232 160L140 84" stroke="#000" stroke-opacity=".16" stroke-width="1.4"/>
     <path d="M8 14L120 96L232 14Z" fill="#fff" opacity=".18"/>
     <circle cx="120" cy="92" r="13" fill="#9b2f3d"/><circle cx="120" cy="92" r="9" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.5"/>`,
    180,
    128,
  );
  add(
    `env-open-${n}`,
    "envelopes",
    `${n} envelope with letter`,
    240,
    230,
    `<defs>${grain(`${gid}h`, i + 9, 0.9)}</defs>
     <g filter="url(#${gid}h)"><rect x="8" y="70" width="224" height="150" rx="3" fill="${c}"/></g>
     <path d="M8 70L120 6L232 70Z" fill="#000" opacity=".22"/>
     <rect x="30" y="34" width="180" height="140" fill="#fbf8ef" stroke="#e1dac8"/>
     ${[56, 72, 88, 104].map((y) => `<path d="M44 ${y}q10 -7 20 0t20 0t20 0t20 0t20 0t20 0t12 0" fill="none" stroke="#5a5a7a" stroke-width="1.5" opacity=".8"/>`).join("")}
     <path d="M8 220L8 74L120 150L232 74L232 220Z" fill="${c}"/>
     <path d="M8 220L120 140L232 220" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="1.4"/>
     <path d="M8 74L120 150L232 74" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="1.4"/>`,
    186,
    178,
  );
});
// airmail envelope
[["red", "#d0453c", "#2f5aa8"], ["teal", "#1f8a8a", "#d8863a"]].forEach(([n, a, b], i) =>
  add(
    `env-air-${n}`,
    "envelopes",
    "airmail envelope",
    250,
    176,
    `<defs><pattern id="am${i}" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="13" height="26" fill="${a}"/><rect x="13" width="13" height="26" fill="${b}"/></pattern>${grain(`amg${i}`, i, 0.9)}</defs>
     <g filter="url(#amg${i})"><rect x="8" y="10" width="234" height="156" fill="#f7f2e6"/><rect x="8" y="10" width="234" height="156" fill="none" stroke="url(#am${i})" stroke-width="12"/></g>
     <rect x="20" y="22" width="210" height="132" fill="#f7f2e6"/>
     <path d="M20 22L125 92L230 22" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="1.4"/>
     <text x="40" y="118" font-family="'Courier New', monospace" font-size="13" fill="#444">PAR AVION</text>
     <rect x="170" y="36" width="44" height="52" fill="#e8d9b0" stroke="${a}" stroke-width="2" stroke-dasharray="3 2"/>`,
    190,
    134,
  ),
);
// kraft envelope with twine and tag
add(
  "env-kraft-twine",
  "envelopes",
  "kraft envelope with twine",
  250,
  190,
  `<defs>${grain("kt", 4, 1.1)}${torn("ktt", 12, 3, 0.12)}</defs>
   <g filter="url(#kt)"><rect x="10" y="20" width="230" height="156" fill="#c4a173"/></g>
   <path d="M10 22L125 104L240 22" fill="none" stroke="#000" stroke-opacity=".3" stroke-width="1.6"/>
   <path d="M10 22L125 104L240 22Z" fill="#fff" opacity=".1"/>
   <path d="M125 20V176M10 98H240" stroke="#f3e7cf" stroke-width="3" stroke-dasharray="1 0"/>
   <circle cx="125" cy="98" r="7" fill="#f3e7cf"/>
   <g transform="rotate(14 196 122)"><path d="M178 100H214L220 112V148H172V112Z" fill="#efe4cc"/><circle cx="196" cy="108" r="3" fill="#8a7a58"/></g>`,
  200,
  152,
);

// ---------- TICKETS ----------

const TICKET_COLS: [string, string][] = [
  ["rose", "#e9b4b0"],
  ["mint", "#bcdcc8"],
  ["gold", "#ecd493"],
  ["sky", "#b9d3e6"],
  ["lilac", "#d3c6ec"],
  ["cream", "#efe5cf"],
];
TICKET_COLS.forEach(([n, c], i) => {
  const g = `tk2${i}`;
  add(
    `tix-cinema-${n}`,
    "tickets",
    `${n} cinema ticket`,
    260,
    110,
    `<defs>${grain(g, i + 1, 1)}</defs>
     <g filter="url(#${g})"><path d="M10 10H250V42a11 11 0 0 0 0 26V100H10V68a11 11 0 0 0 0-26Z" fill="${c}"/></g>
     <path d="M184 12V98" stroke="#3b3128" stroke-opacity=".5" stroke-dasharray="4 3" stroke-width="1.5"/>
     <text x="96" y="40" text-anchor="middle" font-family="'Courier New', monospace" font-size="20" font-weight="bold" fill="#3b3128">CINEMA</text>
     <text x="96" y="60" text-anchor="middle" font-family="'Courier New', monospace" font-size="11" fill="#3b3128">SCREEN 4  ·  ROW F</text>
     <text x="96" y="80" text-anchor="middle" font-family="'Courier New', monospace" font-size="11" fill="#3b3128">20:30  ·  SEAT ${12 + i}</text>
     <text x="218" y="62" text-anchor="middle" font-family="'Courier New', monospace" font-size="22" font-weight="bold" fill="#3b3128" transform="rotate(-90 218 56)">№ 0${i}47</text>`,
    200,
    85,
  );
  add(
    `tix-train-${n}`,
    "tickets",
    `${n} train ticket`,
    300,
    104,
    `<defs>${grain(`${g}t`, i + 3, 1)}</defs>
     <g filter="url(#${g}t)"><rect x="8" y="8" width="284" height="88" rx="4" fill="${c}"/></g>
     <rect x="8" y="8" width="52" height="88" fill="#000" opacity=".1"/>
     <text x="34" y="60" text-anchor="middle" font-family="'Courier New', monospace" font-size="14" font-weight="bold" fill="#3b3128" transform="rotate(-90 34 54)">EXPRESS</text>
     <text x="76" y="38" font-family="'Courier New', monospace" font-size="13" fill="#3b3128">FROM  LONDON</text>
     <text x="76" y="58" font-family="'Courier New', monospace" font-size="13" fill="#3b3128">TO    PARIS</text>
     <text x="76" y="80" font-family="'Courier New', monospace" font-size="11" fill="#3b3128">COACH 7  ·  SEAT 24A</text>
     <rect x="210" y="22" width="68" height="52" fill="none" stroke="#3b3128" stroke-opacity=".5"/>
     ${Array.from({ length: 16 }, (_, k) => `<rect x="${214 + k * 4}" y="28" width="${k % 3 === 0 ? 3 : 1.5}" height="40" fill="#3b3128"/>`).join("")}`,
    230,
    80,
  );
  add(
    `tix-boarding-${n}`,
    "tickets",
    `${n} boarding pass`,
    320,
    130,
    `<defs>${grain(`${g}b`, i + 5, 1)}</defs>
     <g filter="url(#${g}b)"><path d="M8 8H312V122H8Z" fill="#fbf8f0"/></g>
     <rect x="8" y="8" width="304" height="26" fill="${c}"/>
     <text x="20" y="27" font-family="'Courier New', monospace" font-size="14" font-weight="bold" fill="#3b3128">BOARDING PASS</text>
     <text x="20" y="62" font-family="'Courier New', monospace" font-size="22" font-weight="bold" fill="#3b3128">DAC → LHR</text>
     <text x="20" y="84" font-family="'Courier New', monospace" font-size="11" fill="#555">FLIGHT PT 0${i + 4}2   GATE B${i + 3}   SEAT 1${i + 2}A</text>
     <path d="M232 8V122" stroke="#3b3128" stroke-opacity=".45" stroke-dasharray="4 3"/>
     ${Array.from({ length: 22 }, (_, k) => `<rect x="${244 + k * 3}" y="48" width="${k % 3 === 0 ? 2 : 1}" height="50" fill="#222"/>`).join("")}`,
    240,
    97,
  );
  add(
    `tix-stub-${n}`,
    "tickets",
    `${n} event stub`,
    140,
    200,
    `<defs>${grain(`${g}s`, i + 7, 1)}</defs>
     <g filter="url(#${g}s)"><path d="M10 10H130V74a11 11 0 0 0 0 22V190H10V96a11 11 0 0 0 0-22Z" fill="${c}"/></g>
     <text x="70" y="52" text-anchor="middle" font-family="Georgia, serif" font-size="18" font-weight="bold" fill="#3b3128">ADMIT</text>
     <text x="70" y="70" text-anchor="middle" font-family="Georgia, serif" font-size="18" font-weight="bold" fill="#3b3128">ONE</text>
     <path d="M16 85H124" stroke="#3b3128" stroke-opacity=".5" stroke-dasharray="4 3"/>
     <text x="70" y="130" text-anchor="middle" font-family="'Courier New', monospace" font-size="12" fill="#3b3128">LIVE MUSIC</text>
     <text x="70" y="150" text-anchor="middle" font-family="'Courier New', monospace" font-size="12" fill="#3b3128">No. 00${i + 21}</text>
     <circle cx="70" cy="172" r="8" fill="none" stroke="#3b3128" stroke-opacity=".5"/>`,
    104,
    148,
  );
});

// ---------- COUNTRY STAMPS ----------

type FlagFn = () => string;
const W = 90;
const H = 60;
const hs = (cols: string[], ws?: number[]) => {
  const total = (ws ?? cols.map(() => 1)).reduce((a, b) => a + b, 0);
  let y = 0;
  return cols
    .map((c, i) => {
      const h = (H * (ws ? ws[i] : 1)) / total;
      const r = `<rect x="0" y="${y}" width="${W}" height="${h + 0.5}" fill="${c}"/>`;
      y += h;
      return r;
    })
    .join("");
};
const vs = (cols: string[], ws?: number[]) => {
  const total = (ws ?? cols.map(() => 1)).reduce((a, b) => a + b, 0);
  let x = 0;
  return cols
    .map((c, i) => {
      const w = (W * (ws ? ws[i] : 1)) / total;
      const r = `<rect x="${x}" y="0" width="${w + 0.5}" height="${H}" fill="${c}"/>`;
      x += w;
      return r;
    })
    .join("");
};
const disc = (cx: number, cy: number, r: number, c: string) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}"/>`;
const cross = (c: string, t = 10, cx = 45, cy = 30) => `<rect x="0" y="${cy - t / 2}" width="${W}" height="${t}" fill="${c}"/><rect x="${cx - t / 2}" y="0" width="${t}" height="${H}" fill="${c}"/>`;
const star = (cx: number, cy: number, r: number, c: string) => {
  const p = Array.from({ length: 10 }, (_, i) => {
    const rad = i % 2 ? r * 0.42 : r;
    const a = (Math.PI * i) / 5 - Math.PI / 2;
    return `${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  return `<polygon points="${p}" fill="${c}"/>`;
};
const crescent = (cx: number, cy: number, r: number, c: string, bg: string, dx = r * 0.35) => `${disc(cx, cy, r, c)}${disc(cx + dx, cy, r * 0.8, bg)}`;

const FLAGS: Record<string, [string, FlagFn]> = {
  Bangladesh: ["BD", () => `<rect width="${W}" height="${H}" fill="#006a4e"/>${disc(40, 30, 17, "#f42a41")}`],
  Japan: ["JP", () => `<rect width="${W}" height="${H}" fill="#fff"/>${disc(45, 30, 17, "#bc002d")}`],
  "United States": [
    "US",
    () =>
      Array.from({ length: 13 }, (_, i) => `<rect x="0" y="${(i * H) / 13}" width="${W}" height="${H / 13 + 0.4}" fill="${i % 2 ? "#fff" : "#b22234"}"/>`).join("") +
      `<rect width="40" height="${(H * 7) / 13}" fill="#3c3b6e"/>` +
      Array.from({ length: 12 }, (_, i) => disc(7 + (i % 4) * 9, 6 + Math.floor(i / 4) * 9, 1.6, "#fff")).join(""),
  ],
  "United Kingdom": [
    "GB",
    () =>
      `<rect width="${W}" height="${H}" fill="#012169"/><path d="M0 0L90 60M90 0L0 60" stroke="#fff" stroke-width="12"/><path d="M0 0L90 60M90 0L0 60" stroke="#c8102e" stroke-width="5"/>${cross("#fff", 18)}${cross("#c8102e", 10)}`,
  ],
  France: ["FR", () => vs(["#0055a4", "#fff", "#ef4135"])],
  Italy: ["IT", () => vs(["#009246", "#fff", "#ce2b37"])],
  Germany: ["DE", () => hs(["#000", "#dd0000", "#ffce00"])],
  India: ["IN", () => `${hs(["#ff9933", "#fff", "#138808"])}<circle cx="45" cy="30" r="7" fill="none" stroke="#000080" stroke-width="1.6"/>${disc(45, 30, 1.4, "#000080")}`],
  Pakistan: ["PK", () => `<rect width="${W}" height="${H}" fill="#01411c"/><rect width="22" height="${H}" fill="#fff"/>${crescent(56, 30, 15, "#fff", "#01411c", 5)}${star(64, 22, 6, "#fff")}`],
  Turkey: ["TR", () => `<rect width="${W}" height="${H}" fill="#e30a17"/>${crescent(36, 30, 16, "#fff", "#e30a17", 5)}${star(52, 30, 6, "#fff")}`],
  "United Arab Emirates": ["AE", () => `${hs(["#00732f", "#fff", "#000"])}<rect width="22" height="${H}" fill="#ff0000"/>`],
  "Saudi Arabia": ["SA", () => `<rect width="${W}" height="${H}" fill="#006c35"/><rect x="20" y="36" width="50" height="3" fill="#fff"/><rect x="26" y="20" width="38" height="4" fill="#fff" opacity=".9"/>`],
  Egypt: ["EG", () => `${hs(["#ce1126", "#fff", "#000"])}${disc(45, 30, 5, "#c09300")}`],
  Canada: ["CA", () => `${vs(["#d52b1e", "#fff", "#d52b1e"], [1, 2, 1])}<path d="M45 14L49 25L58 22L53 32L58 35L47 38L47 46L43 46L43 38L32 35L37 32L32 22L41 25Z" fill="#d52b1e"/>`],
  Australia: ["AU", () => `<rect width="${W}" height="${H}" fill="#00008b"/><rect width="40" height="28" fill="#012169"/><path d="M0 0L40 28M40 0L0 28" stroke="#fff" stroke-width="4"/>${cross("#fff", 8, 20, 14)}${cross("#c8102e", 4, 20, 14)}${star(22, 46, 5, "#fff")}${star(64, 20, 4, "#fff")}${star(72, 38, 4, "#fff")}${star(58, 46, 4, "#fff")}`],
  Spain: ["ES", () => hs(["#aa151b", "#f1bf00", "#aa151b"], [1, 2, 1])],
  Brazil: ["BR", () => `<rect width="${W}" height="${H}" fill="#009c3b"/><path d="M45 7L83 30L45 53L7 30Z" fill="#ffdf00"/>${disc(45, 30, 13, "#002776")}`],
  Mexico: ["MX", () => `${vs(["#006847", "#fff", "#ce1126"])}${disc(45, 30, 7, "#8a5a2b")}`],
  China: ["CN", () => `<rect width="${W}" height="${H}" fill="#de2910"/>${star(16, 14, 9, "#ffde00")}${star(32, 6, 3, "#ffde00")}${star(37, 13, 3, "#ffde00")}${star(37, 21, 3, "#ffde00")}${star(32, 28, 3, "#ffde00")}`],
  "South Korea": ["KR", () => `<rect width="${W}" height="${H}" fill="#fff"/><path d="M28 30A17 17 0 0 1 62 30Z" fill="#cd2e3a"/><path d="M28 30A17 17 0 0 0 62 30Z" fill="#0047a0"/>`],
  Thailand: ["TH", () => hs(["#a51931", "#f4f5f8", "#2d2a4a", "#f4f5f8", "#a51931"], [1, 1, 2, 1, 1])],
  Greece: ["GR", () => `${Array.from({ length: 9 }, (_, i) => `<rect x="0" y="${(i * H) / 9}" width="${W}" height="${H / 9 + 0.4}" fill="${i % 2 ? "#fff" : "#0d5eaf"}"/>`).join("")}<rect width="33" height="${(H * 5) / 9}" fill="#0d5eaf"/>${cross("#fff", 7, 16, 16)}`],
  Netherlands: ["NL", () => hs(["#ae1c28", "#fff", "#21468b"])],
  Switzerland: ["CH", () => `<rect width="${W}" height="${H}" fill="#d52b1e"/><rect x="38" y="13" width="14" height="34" fill="#fff"/><rect x="28" y="23" width="34" height="14" fill="#fff"/>`],
  Norway: ["NO", () => `<rect width="${W}" height="${H}" fill="#ba0c2f"/>${cross("#fff", 14, 30, 30)}${cross("#00205b", 7, 30, 30)}`],
  Sweden: ["SE", () => `<rect width="${W}" height="${H}" fill="#006aa7"/>${cross("#fecc00", 10, 30, 30)}`],
  Indonesia: ["ID", () => hs(["#ce1126", "#fff"])],
  Malaysia: ["MY", () => `${Array.from({ length: 14 }, (_, i) => `<rect x="0" y="${(i * H) / 14}" width="${W}" height="${H / 14 + 0.4}" fill="${i % 2 ? "#fff" : "#cc0001"}"/>`).join("")}<rect width="44" height="${(H * 8) / 14}" fill="#010066"/>${crescent(18, 16, 9, "#fc0", "#010066", 3)}${star(30, 16, 5, "#fc0")}`],
  Singapore: ["SG", () => `${hs(["#ed2939", "#fff"])}${crescent(18, 15, 10, "#fff", "#ed2939", 4)}`],
  Maldives: ["MV", () => `<rect width="${W}" height="${H}" fill="#d21034"/><rect x="16" y="12" width="58" height="36" fill="#007e3a"/>${crescent(45, 30, 11, "#fff", "#007e3a", 4)}`],
  Portugal: ["PT", () => `${vs(["#006600", "#ff0000"], [2, 3])}${disc(36, 30, 10, "#ffcc00")}`],
  Morocco: ["MA", () => `<rect width="${W}" height="${H}" fill="#c1272d"/><polygon points="45,14 50,27 64,27 53,35 57,48 45,40 33,48 37,35 26,27 40,27" fill="none" stroke="#006233" stroke-width="2.4"/>`],
  Russia: ["RU", () => hs(["#fff", "#0039a6", "#d52b1e"])],
  Qatar: ["QA", () => `<rect width="${W}" height="${H}" fill="#8a1538"/><path d="M0 0H28L36 6L28 12L36 18L28 24L36 30L28 36L36 42L28 48L36 54L28 60H0Z" fill="#fff"/>`],
  "New Zealand": ["NZ", () => `<rect width="${W}" height="${H}" fill="#00247d"/>${star(60, 14, 5, "#cc142b")}${star(70, 28, 5, "#cc142b")}${star(54, 34, 5, "#cc142b")}${star(62, 46, 5, "#cc142b")}`],
  Ireland: ["IE", () => vs(["#169b62", "#fff", "#ff883e"])],
  Nepal: ["NP", () => `<rect width="${W}" height="${H}" fill="#dc143c"/><path d="M14 4L58 28H32L58 56H14Z" fill="#003893" stroke="#003893"/>${disc(30, 22, 4, "#fff")}${disc(30, 42, 4, "#fff")}`],
  "Sri Lanka": ["LK", () => `<rect width="${W}" height="${H}" fill="#8d153a"/><rect x="4" y="4" width="14" height="52" fill="#eb7400"/><rect x="18" y="4" width="14" height="52" fill="#00534e"/><rect x="40" y="6" width="44" height="48" fill="#ffbe29"/>`],
};

Object.entries(FLAGS).forEach(([name, [code, flag]], i) => {
  const g = `cs${i}`;
  const fs = name.length > 14 ? 9.5 : name.length > 9 ? 11 : 13;
  const year = 1960 + ((i * 7) % 58);
  const tint = ["#c9ac7a", "#b9a4c9", "#a9c4a0", "#d9a1a8", "#9bbbd4"][i % 5];
  const sv = `<defs><mask id="${g}m"><rect width="130" height="156" fill="#fff"/>${Array.from({ length: 12 }, (_, k) => `<circle cx="${6 + k * 10.6}" cy="2.5" r="3.4"/><circle cx="${6 + k * 10.6}" cy="153.5" r="3.4"/>`).join("")}${Array.from({ length: 14 }, (_, k) => `<circle cx="2.5" cy="${6 + k * 10.6}" r="3.4"/><circle cx="127.5" cy="${6 + k * 10.6}" r="3.4"/>`).join("")}</mask>${grain(`${g}g`, i, 1)}</defs>
    <g mask="url(#${g}m)" filter="url(#${g}g)"><rect width="130" height="156" fill="#fbf6e8"/>
    <rect x="10" y="10" width="110" height="136" fill="${tint}" opacity=".55"/>
    <g transform="translate(20 22)"><g opacity=".92">${flag()}</g><rect width="${W}" height="${H}" fill="none" stroke="#3b3128" stroke-opacity=".35" stroke-width="1.2"/></g>
    <text x="65" y="108" text-anchor="middle" font-family="Georgia, serif" font-size="${fs}" font-weight="bold" fill="#3b3128" letter-spacing=".5">${name.toUpperCase()}</text>
    <text x="65" y="124" text-anchor="middle" font-family="Georgia, serif" font-size="9" fill="#3b3128" opacity=".8">POSTAGE · ${year}</text>
    <text x="112" y="140" text-anchor="end" font-family="Georgia, serif" font-size="14" font-weight="bold" fill="#3b3128">${10 + ((i * 5) % 90)}</text>
    <text x="16" y="140" font-family="Georgia, serif" font-size="9" fill="#3b3128" opacity=".8">${code}</text></g>`;
  add(`country-${code.toLowerCase()}`, "countries", `${name} stamp`, 130, 156, sv, 96, 115);
});

// ---------- DATE STAMPS (use today's date when added) ----------

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const dateText = () => {
  const d = new Date();
  return { d: String(d.getDate()).padStart(2, "0"), m: MONTHS[d.getMonth()], y: String(d.getFullYear()), wd: DAYS[d.getDay()] };
};
const STAMP_INKS: [string, string][] = [
  ["black", "#23212b"],
  ["navy", "#24408c"],
  ["red", "#b3262b"],
  ["purple", "#6a3d96"],
];

function dateStampSvg(style: number, ink: string): string {
  const { d, m, y, wd } = dateText();
  const f = `ds${style}${ink.slice(1)}`;
  const body =
    style === 0
      ? `<rect x="8" y="8" width="164" height="64" rx="6" fill="none" stroke="${ink}" stroke-width="4"/><rect x="14" y="14" width="152" height="52" rx="3" fill="none" stroke="${ink}" stroke-width="1.5"/><text x="90" y="49" text-anchor="middle" font-family="'Courier New', monospace" font-size="25" font-weight="bold" fill="${ink}">${d} ${m} ${y}</text>`
      : style === 1
        ? `<circle cx="80" cy="80" r="70" fill="none" stroke="${ink}" stroke-width="4"/><circle cx="80" cy="80" r="60" fill="none" stroke="${ink}" stroke-width="1.5"/><text x="80" y="62" text-anchor="middle" font-family="'Courier New', monospace" font-size="17" font-weight="bold" fill="${ink}">${wd}</text><text x="80" y="102" text-anchor="middle" font-family="'Courier New', monospace" font-size="38" font-weight="bold" fill="${ink}">${d}</text><text x="80" y="124" text-anchor="middle" font-family="'Courier New', monospace" font-size="16" font-weight="bold" fill="${ink}">${m} ${y}</text>`
        : style === 2
          ? `<rect x="8" y="8" width="204" height="84" fill="none" stroke="${ink}" stroke-width="4"/><text x="110" y="40" text-anchor="middle" font-family="Impact, 'Arial Black', sans-serif" font-size="26" fill="${ink}" letter-spacing="3">RECEIVED</text><line x1="14" y1="50" x2="206" y2="50" stroke="${ink}" stroke-width="2"/><text x="110" y="80" text-anchor="middle" font-family="'Courier New', monospace" font-size="22" font-weight="bold" fill="${ink}">${d} ${m} ${y}</text>`
          : `<rect x="8" y="8" width="180" height="46" rx="23" fill="none" stroke="${ink}" stroke-width="3.5"/><text x="98" y="39" text-anchor="middle" font-family="'Courier New', monospace" font-size="22" font-weight="bold" fill="${ink}">${d}·${m}·${y.slice(2)}</text>`;
  const [w, h] = style === 0 ? [180, 80] : style === 1 ? [160, 160] : style === 2 ? [220, 100] : [196, 62];
  return uri(
    svgWrap(
      w,
      h,
      `<defs>${rough(f, 2.2)}<filter id="${f}i" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="${style + 3}" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.55" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in"/></filter></defs><g filter="url(#${f}i)" opacity=".95"><g filter="url(#${f})">${body}</g></g>`,
    ),
  );
}
const STAMP_SIZES: [number, number][] = [[150, 67], [120, 120], [170, 77], [160, 51]];
const STAMP_NAMES = ["Date box", "Day circle", "Received", "Date pill"];
[0, 1, 2, 3].forEach((st) =>
  STAMP_INKS.forEach(([n, ink]) =>
    out.push({
      id: `datestamp-${st}-${n}`,
      cat: "datestamps",
      label: `${STAMP_NAMES[st]} (${n})`,
      src: dateStampSvg(st, ink),
      gen: () => dateStampSvg(st, ink),
      w: STAMP_SIZES[st][0],
      h: STAMP_SIZES[st][1],
    }),
  ),
);

export const PROCEDURAL2: Gen[] = out;

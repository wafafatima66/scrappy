import sharp from "sharp";

await sharp("assets/icon-only.png").resize(512, 512).png().toFile("store/icon-512.png");

const fg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#efe6fb"/><stop offset=".6" stop-color="#f7e9ee"/><stop offset="1" stop-color="#e6dcf7"/></linearGradient>
  <radialGradient id="o" cx=".32" cy=".28" r=".95"><stop offset="0" stop-color="#fff"/><stop offset=".4" stop-color="#c9b8f0"/><stop offset=".85" stop-color="#8a73e0"/></radialGradient>
  <pattern id="st" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="30" height="30" fill="#b9a8d8"/><rect width="15" height="30" fill="#efe9fa"/></pattern>
</defs>
<rect width="1024" height="500" fill="url(#bg)"/>
<g transform="rotate(-6 800 250)"><rect x="620" y="70" width="300" height="370" rx="8" fill="#faf6ea" stroke="#e5dfcf"/>
${Array.from({ length: 12 }, (_, k) => `<line x1="620" y1="${120 + k * 26}" x2="920" y2="${120 + k * 26}" stroke="#9db6d6"/>`).join("")}
<rect x="700" y="50" width="140" height="38" fill="url(#st)" opacity=".9"/>
<text x="770" y="160" text-anchor="middle" font-family="Georgia, serif" font-size="30" fill="#6b5744">Sunday, Oct 25</text>
<circle cx="700" cy="290" r="42" fill="#e8b4bc"/><rect x="780" y="250" width="110" height="80" fill="#f2cf9a" transform="rotate(8 835 290)"/>
<rect x="670" y="350" width="200" height="40" fill="#cdd8c0" transform="rotate(-4 770 370)"/></g>
<circle cx="130" cy="130" r="54" fill="url(#o)"/>
<text x="130" y="152" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="64" fill="#fff">P</text>
<text x="215" y="150" font-family="Georgia, serif" font-weight="700" font-size="72" fill="#2b2540">Patchlet</text>
<text x="70" y="250" font-family="Georgia, serif" font-size="40" fill="#4a3b63">One little scrapbook page</text>
<text x="70" y="305" font-family="Georgia, serif" font-size="40" fill="#4a3b63">a day.</text>
<text x="70" y="390" font-family="Arial, sans-serif" font-size="26" fill="#7a6a99">Tape · stamps · flowers · photos · flip-book</text>
</svg>`;
await sharp(Buffer.from(fg)).png().toFile("store/feature-graphic.png");
console.log("ok");

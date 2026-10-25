import sharp from "sharp";
import { mkdirSync } from "node:fs";

mkdirSync("assets", { recursive: true });

const orb = (size, pad = 0, solid = false) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024">
  <defs>
    <radialGradient id="o" cx=".32" cy=".28" r=".95"><stop offset="0" stop-color="#ffffff"/><stop offset=".38" stop-color="#c9b8f0"/><stop offset=".8" stop-color="#8a73e0"/><stop offset="1" stop-color="#f4b9a6"/></radialGradient>
    <filter id="n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="3"/><feColorMatrix type="matrix" values="0 0 0 0 .3 0 0 0 0 .25 0 0 0 0 .2 1.2 0 0 0 -.5"/></filter>
  </defs>
  ${solid ? '<rect width="1024" height="1024" fill="#f1e6fb"/>' : ""}
  <g transform="translate(${pad} ${pad}) scale(${(1024 - 2 * pad) / 1024})">
    <rect x="130" y="120" width="764" height="784" rx="70" fill="#fbf4e4" transform="rotate(-5 512 512)"/>
    <rect x="360" y="70" width="320" height="110" fill="#b9a8d8" opacity=".92" transform="rotate(-4 512 125)"/>
    <circle cx="512" cy="520" r="250" fill="url(#o)"/>
    <text x="512" y="610" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="330" fill="#ffffff" opacity=".95">P</text>
  </g>
</svg>`;

const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><rect width="1024" height="1024" fill="#f1e6fb"/></svg>`;
const splash = `<svg xmlns="http://www.w3.org/2000/svg" width="2732" height="2732"><rect width="2732" height="2732" fill="#f6f0fa"/><g transform="translate(866 866) scale(1)">${orb(1000, 0).replace(/<\/?svg[^>]*>/g, "")}</g></svg>`;

await sharp(Buffer.from(orb(1024, 0, true))).png().toFile("assets/icon-only.png");
await sharp(Buffer.from(orb(1024, 150))).png().toFile("assets/icon-foreground.png");
await sharp(Buffer.from(bg)).png().toFile("assets/icon-background.png");
await sharp(Buffer.from(splash)).png().toFile("assets/splash.png");
await sharp(Buffer.from(splash)).png().toFile("assets/splash-dark.png");
console.log("icons ready");

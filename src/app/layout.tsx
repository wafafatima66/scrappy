import type { Metadata, Viewport } from "next";
import { Abril_Fatface, Amatic_SC, Bebas_Neue, Caveat, Cormorant_Garamond, Dancing_Script, Homemade_Apple, Indie_Flower, Kalam, Kaushan_Script, Lobster, Nunito, Pacifico, Permanent_Marker, Playfair_Display, Reenie_Beanie, Rock_Salt, Shadows_Into_Light, Special_Elite } from "next/font/google";
import "./globals.css";

const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"], weight: ["600", "700"] });
const special = Special_Elite({ variable: "--font-special", subsets: ["latin"], weight: "400" });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], weight: ["500", "600", "700"] });
const apple = Homemade_Apple({ variable: "--font-apple", subsets: ["latin"], weight: "400" });
const reenie = Reenie_Beanie({ variable: "--font-reenie", subsets: ["latin"], weight: "400" });
const dancing = Dancing_Script({ variable: "--font-dancing", subsets: ["latin"], weight: ["500", "700"] });
const kaushan = Kaushan_Script({ variable: "--font-kaushan", subsets: ["latin"], weight: "400" });
const kalam = Kalam({ variable: "--font-kalam", subsets: ["latin"], weight: ["400", "700"] });
const pacifico = Pacifico({ variable: "--font-pacifico", subsets: ["latin"], weight: "400" });
const permanent = Permanent_Marker({ variable: "--font-permanent", subsets: ["latin"], weight: "400" });
const shadows = Shadows_Into_Light({ variable: "--font-shadows", subsets: ["latin"], weight: "400" });
const amatic = Amatic_SC({ variable: "--font-amatic", subsets: ["latin"], weight: ["400", "700"] });
const bebas = Bebas_Neue({ variable: "--font-bebas", subsets: ["latin"], weight: "400" });
const abril = Abril_Fatface({ variable: "--font-abril", subsets: ["latin"], weight: "400" });
const lobster = Lobster({ variable: "--font-lobster", subsets: ["latin"], weight: "400" });
const indie = Indie_Flower({ variable: "--font-indie", subsets: ["latin"], weight: "400" });
const cormorant = Cormorant_Garamond({ variable: "--font-cormorant", subsets: ["latin"], weight: ["500", "700"] });
const rocksalt = Rock_Salt({ variable: "--font-rocksalt", subsets: ["latin"], weight: "400" });
const nunito = Nunito({ variable: "--font-ui", subsets: ["latin"], weight: ["400", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "Patchlet — a scrapbook page a day",
  description: "Make real-looking scrapbook pages with paper, tape, stamps and photos, one day at a time. Flip through them like a book.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f4eefb" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${caveat.variable} ${special.variable} ${playfair.variable} ${apple.variable} ${reenie.variable} ${nunito.variable} ${dancing.variable} ${kaushan.variable} ${kalam.variable} ${pacifico.variable} ${permanent.variable} ${shadows.variable} ${amatic.variable} ${bebas.variable} ${abril.variable} ${lobster.variable} ${indie.variable} ${cormorant.variable} ${rocksalt.variable}`}>
      <body>{children}</body>
    </html>
  );
}

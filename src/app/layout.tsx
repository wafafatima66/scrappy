import type { Metadata, Viewport } from "next";
import { Caveat, Homemade_Apple, Nunito, Playfair_Display, Reenie_Beanie, Special_Elite } from "next/font/google";
import "./globals.css";

const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"], weight: ["600", "700"] });
const special = Special_Elite({ variable: "--font-special", subsets: ["latin"], weight: "400" });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], weight: ["500", "600", "700"] });
const apple = Homemade_Apple({ variable: "--font-apple", subsets: ["latin"], weight: "400" });
const reenie = Reenie_Beanie({ variable: "--font-reenie", subsets: ["latin"], weight: "400" });
const nunito = Nunito({ variable: "--font-ui", subsets: ["latin"], weight: ["400", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "Scrappy — digital scrapbooks",
  description: "Make real-looking scrapbook pages with paper, tape, stamps and photos. Flip through them like a book.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f4eefb" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${caveat.variable} ${special.variable} ${playfair.variable} ${apple.variable} ${reenie.variable} ${nunito.variable}`}>
      <body>{children}</body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Abril_Fatface, Amatic_SC, Bebas_Neue, Caveat, Cormorant_Garamond, Dancing_Script, Homemade_Apple, Indie_Flower, Kalam, Kaushan_Script, Lobster, Nunito, Pacifico, Permanent_Marker, Playfair_Display, Reenie_Beanie, Rock_Salt, Shadows_Into_Light, Special_Elite } from "next/font/google";
import Analytics from "@/components/Analytics";
import { SITE_URL } from "@/lib/site";
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

const TITLE = "Patchlet: a digital scrapbook journal, one page a day";
const DESC = "Make a scrapbook page every day with washi tape, torn paper, stamps, lace, doodles and your photos. Build a journaling habit, clear your head and keep your memories. Free on Android, with a web version to try.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESC,
  keywords: ["scrapbook app", "digital scrapbook", "journal app", "daily journal", "photo journal", "gratitude journal", "planner", "Android journal app"],
  alternates: { canonical: "/" },
  openGraph: { title: TITLE, description: DESC, url: "/", siteName: "Patchlet", type: "website", images: [{ url: "/og.png", width: 1024, height: 500, alt: "Patchlet scrapbook journal" }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: ["/og.png"] },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f4eefb" };

// Hides the website landing page inside the Android app before anything is drawn (the app opens straight into your journal).
const NATIVE_FLAG = `try{var c=window.Capacitor;if((c&&c.isNativePlatform&&c.isNativePlatform())||/; wv\\)/.test(navigator.userAgent))document.documentElement.setAttribute('data-native','1')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${caveat.variable} ${special.variable} ${playfair.variable} ${apple.variable} ${reenie.variable} ${nunito.variable} ${dancing.variable} ${kaushan.variable} ${kalam.variable} ${pacifico.variable} ${permanent.variable} ${shadows.variable} ${amatic.variable} ${bebas.variable} ${abril.variable} ${lobster.variable} ${indie.variable} ${cormorant.variable} ${rocksalt.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NATIVE_FLAG }} />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

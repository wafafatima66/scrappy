// Website-wide constants. Change them here (or with the NEXT_PUBLIC_* settings in Vercel).
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scrappy-jade.vercel.app";
export const PLAY_ID = "com.patchlet.app";
export const PLAY_URL = `https://play.google.com/store/apps/details?id=${PLAY_ID}`;
// The "Become a tester" link from Play Console (Testing → Closed testing → Testers). Leave empty until you have it.
export const TESTER_URL = process.env.NEXT_PUBLIC_TESTER_URL ?? "";
export const CONTACT_EMAIL = "awhs.family@gmail.com";
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

export const accessMail = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Patchlet early access")}&body=${encodeURIComponent("Hi! Please add me to the Patchlet testers.\n\nMy Gmail address (the one I use on my Android phone): ")}`;

export interface Utm {
  source: string;
  medium: string;
  campaign?: string;
}

// Remembers where the visitor came from (?utm_source=instagram…) so the Play Store click can carry it along.
export function readUtm(): Utm {
  try {
    const q = new URLSearchParams(location.search);
    if (q.get("utm_source")) {
      const u: Utm = { source: q.get("utm_source") as string, medium: q.get("utm_medium") ?? "referral", campaign: q.get("utm_campaign") ?? undefined };
      sessionStorage.setItem("patchlet.utm", JSON.stringify(u));
      return u;
    }
    const saved = sessionStorage.getItem("patchlet.utm");
    if (saved) return JSON.parse(saved) as Utm;
  } catch {}
  return { source: "patchlet_website", medium: "landing" };
}

// Play Console shows these in Statistics → Acquisition (store listing visitors by UTM source).
export function playLinkFor(u: Utm): string {
  const ref = `utm_source=${u.source}&utm_medium=${u.medium}${u.campaign ? `&utm_campaign=${u.campaign}` : ""}`;
  return `${PLAY_URL}&referrer=${encodeURIComponent(ref)}`;
}

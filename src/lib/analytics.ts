import { isNative } from "./native";

const KEY = "patchlet.analytics"; // "yes" | "no"

export const analyticsChoice = (): "yes" | "no" | null => {
  try {
    const v = localStorage.getItem(KEY);
    return v === "yes" || v === "no" ? v : null;
  } catch {
    return null;
  }
};

// Switches the Android app's usage statistics on or off (remembered on the device).
export async function setAppAnalytics(enabled: boolean) {
  try {
    localStorage.setItem(KEY, enabled ? "yes" : "no");
  } catch {}
  if (!isNative()) return;
  try {
    const { FirebaseAnalytics } = await import("@capacitor-firebase/analytics");
    await FirebaseAnalytics.setEnabled({ enabled });
  } catch {}
}

// Sends a named event: to Google Analytics on the website, to Firebase Analytics in the Android app.
// Nothing is sent unless the visitor / app user allowed it. Never pass names, emails or page content.
export function track(name: string, params: Record<string, string | number> = {}) {
  try {
    const g = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
    g?.("event", name, params);
  } catch {}
  if (isNative() && analyticsChoice() === "yes") {
    void import("@capacitor-firebase/analytics")
      .then((m) => m.FirebaseAnalytics.logEvent({ name, params }))
      .catch(() => undefined);
  }
}

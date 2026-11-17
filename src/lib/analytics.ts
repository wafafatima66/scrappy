// Sends a named event to Google Analytics (only when it is switched on and the visitor allowed it).
export function track(name: string, params: Record<string, string | number> = {}) {
  try {
    const g = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
    g?.("event", name, params);
  } catch {}
}

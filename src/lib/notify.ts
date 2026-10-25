import { isNative } from "./native";

const KEY = "patchlet.notify";
export interface NotifySettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

export const readNotify = (): NotifySettings => {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (s) return s;
  } catch {}
  return { enabled: true, hour: 20, minute: 0 };
};
export const writeNotify = (s: NotifySettings) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
};

const BASE_ID = 7000;
const DAYS_AHEAD = 14;

const lines = (streak: number, name: string) =>
  streak >= 2
    ? [`🔥 ${streak}-day streak, ${name}! Add today's page to keep it going.`, `Your Patchlet is waiting. Don't break your ${streak}-day streak!`]
    : [`Hi ${name}! Ready for today's little page?`, `A tiny page a day. What made you smile today?`, `Your Patchlet misses you ✿`];

// Rolling schedule: the next 14 evenings. Re-run whenever the app opens or a page is saved, so
// today's reminder disappears once today's page is done and the streak number stays fresh.
export async function scheduleStreakReminders(opts: { name: string; streak: number; doneToday: boolean }) {
  if (!isNative()) return;
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  const ids = Array.from({ length: DAYS_AHEAD }, (_, i) => ({ id: BASE_ID + i }));
  try {
    await LocalNotifications.cancel({ notifications: ids });
  } catch {}
  const s = readNotify();
  if (!s.enabled) return;
  const perm = await LocalNotifications.checkPermissions();
  if (perm.display !== "granted") {
    const r = await LocalNotifications.requestPermissions();
    if (r.display !== "granted") return;
  }
  try {
    await LocalNotifications.createChannel({ id: "streak", name: "Streak reminders", importance: 3, description: "Daily reminder to add today's page" });
  } catch {}
  const now = new Date();
  const list = [];
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, s.hour, s.minute, 0);
    if (at.getTime() <= now.getTime()) continue;
    if (i === 0 && opts.doneToday) continue;
    // the streak grows by one for each future day the user shows up
    const streak = opts.doneToday ? opts.streak + i : opts.streak + (i > 0 ? 0 : 0);
    const text = lines(streak, opts.name);
    list.push({ id: BASE_ID + i, title: "Patchlet", body: text[i % text.length], schedule: { at }, channelId: "streak" });
  }
  if (list.length) await LocalNotifications.schedule({ notifications: list });
}

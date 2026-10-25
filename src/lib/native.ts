import { Capacitor } from "@capacitor/core";

export const isNative = () => typeof window !== "undefined" && Capacitor.isNativePlatform();

const dataUrlToBase64 = (d: string) => d.slice(d.indexOf(",") + 1);

async function blobToBase64(b: Blob): Promise<string> {
  return await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(dataUrlToBase64(String(r.result)));
    r.onerror = rej;
    r.readAsDataURL(b);
  });
}

// Web: normal download. Android app: write to cache and open the share sheet
// (from there the user can save to Photos / Files, send it, or print a PDF).
export async function saveFile(data: string | Blob, filename: string, title = "Save"): Promise<void> {
  if (isNative()) {
    const { Filesystem, Directory } = await import("@capacitor/filesystem");
    const { Share } = await import("@capacitor/share");
    const base64 = typeof data === "string" ? dataUrlToBase64(data) : await blobToBase64(data);
    const res = await Filesystem.writeFile({ path: filename, data: base64, directory: Directory.Cache });
    await Share.share({ title, url: res.uri, dialogTitle: title });
    return;
  }
  const url = typeof data === "string" ? data : URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  if (typeof data !== "string") setTimeout(() => URL.revokeObjectURL(url), 4000);
}

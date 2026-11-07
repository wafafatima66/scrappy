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

export type SaveResult = "saved" | "shared";

// Web: normal download.
// Android app with a folder: write straight into Pictures/Patchlet (shows in the gallery) or
// Documents/Patchlet, no share sheet. If the phone refuses, fall back to the share sheet.
// Without a folder: always open the share sheet (where Print / Drive / WhatsApp live).
export async function saveFile(data: string | Blob, filename: string, title = "Save", folder?: "Pictures" | "Documents"): Promise<SaveResult> {
  if (isNative()) {
    const { Filesystem, Directory } = await import("@capacitor/filesystem");
    const base64 = typeof data === "string" ? dataUrlToBase64(data) : await blobToBase64(data);
    if (folder) {
      try {
        // Android 9 and older ask for storage permission first (newer versions don't need it)
        try {
          const p = await Filesystem.checkPermissions();
          if (p.publicStorage !== "granted") await Filesystem.requestPermissions();
        } catch {
          /* not needed on this Android version */
        }
        await Filesystem.writeFile({ path: `${folder}/Patchlet/${filename}`, data: base64, directory: Directory.ExternalStorage, recursive: true });
        return "saved";
      } catch {
        /* fall through to the share sheet */
      }
    }
    const { Share } = await import("@capacitor/share");
    const res = await Filesystem.writeFile({ path: filename, data: base64, directory: Directory.Cache });
    await Share.share({ title, url: res.uri, dialogTitle: title });
    return "shared";
  }
  // website, "Share" (no folder): use the browser's own share sheet when it has one (phones), otherwise download
  if (!folder && typeof navigator !== "undefined") {
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    try {
      const blob = typeof data === "string" ? await (await fetch(data)).blob() : data;
      const file = new File([blob], filename, { type: blob.type || "application/octet-stream" });
      if (nav.canShare?.({ files: [file] })) {
        await nav.share({ files: [file], title });
        return "shared";
      }
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return "shared"; // the user closed the share sheet
    }
  }
  const url = typeof data === "string" ? data : URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  if (typeof data !== "string") setTimeout(() => URL.revokeObjectURL(url), 4000);
  return "saved";
}

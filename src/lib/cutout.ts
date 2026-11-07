// Cutouts: turn a photo into a transparent PNG so it can sit on any background.
// - autoCutout: an on-device AI model (MODNet, Apache-2.0, ~25 MB, downloaded once and cached). Best for people.
// - bakeLasso: cut along a loop the user draws. Works for anything.

export type CutStatus = (text: string, progress?: number) => void;

async function toImage(src: string): Promise<HTMLImageElement> {
  let url = src;
  let revoke = "";
  if (/^https?:/i.test(src)) {
    try {
      const res = await fetch(src, { mode: "cors" });
      if (!res.ok) throw new Error(String(res.status));
      revoke = URL.createObjectURL(await res.blob());
      url = revoke;
    } catch {
      throw new Error("This photo is stored online and can't be edited yet. Add it again, or ask for the one-time CORS setup (see the guide).");
    }
  }
  const img = new Image();
  img.decoding = "async";
  img.src = url;
  await img.decode();
  if (revoke) setTimeout(() => URL.revokeObjectURL(revoke), 30000);
  return img;
}

// biome-ignore lint/suspicious/noExplicitAny: the pipeline type is heavy; we only call it
let pipe: Promise<any> | null = null;

export async function autoCutout(src: string, onStatus?: CutStatus): Promise<string> {
  const img = await toImage(src);
  if (!pipe) {
    pipe = (async () => {
      const { pipeline, env } = await import("@huggingface/transformers");
      env.allowLocalModels = false;
      env.useBrowserCache = true;
      onStatus?.("Getting the cutout model ready (one time, about 25 MB)…", 0);
      return pipeline("background-removal", "Xenova/modnet", {
        progress_callback: (p: { status?: string; progress?: number }) => {
          if (p.status === "progress" && typeof p.progress === "number") onStatus?.("Downloading the cutout model (one time)…", p.progress);
        },
      });
    })().catch((e) => {
      pipe = null; // allow a retry
      throw e;
    });
  }
  const run = await pipe;
  onStatus?.("Cutting out…");
  const out = await run(img.src);
  const result = Array.isArray(out) ? out[0] : out;
  const small: HTMLCanvasElement = result.toCanvas();
  // return at the photo's own size so the new picture lines up exactly with the original
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  c.getContext("2d")!.drawImage(small, 0, 0, c.width, c.height);
  return c.toDataURL("image/png");
}

// pts: x,y pairs in 0..1 of the photo
export async function bakeLasso(src: string, pts: number[]): Promise<string> {
  const img = await toImage(src);
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext("2d")!;
  ctx.beginPath();
  for (let i = 0; i < pts.length; i += 2) {
    const x = pts[i] * c.width;
    const y = pts[i + 1] * c.height;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, 0, 0);
  return c.toDataURL("image/png");
}

// a downscaled copy for the "another photo" background
export async function smallPhoto(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  const sc = Math.min(1, 900 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * sc);
  c.height = Math.round(bmp.height * sc);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.85);
}

// test hook: lets a developer run the cutout engine from the browser console on a device
if (typeof window !== "undefined" && typeof localStorage !== "undefined" && localStorage.getItem("patchlet.debug")) {
  (window as unknown as { __plCutout: unknown }).__plCutout = { autoCutout, bakeLasso };
}

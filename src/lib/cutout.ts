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

  // sanity check: how much of the photo was kept?
  const probe = document.createElement("canvas");
  probe.width = probe.height = 48;
  const pctx = probe.getContext("2d", { willReadFrequently: true })!;
  pctx.drawImage(c, 0, 0, 48, 48);
  const px = pctx.getImageData(0, 0, 48, 48).data;
  let kept = 0;
  for (let i = 3; i < px.length; i += 4) if (px[i] > 128) kept++;
  const share = kept / (48 * 48);
  if (share < 0.04) throw new Error("I couldn't find a person in this photo. For stickers and objects use \"Remove plain background\", or cut around it by drawing.");
  if (share > 0.985) throw new Error("Nothing was removed. If the background is plain, try \"Remove plain background\" instead.");
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

// Plain-background remover: flood-fills inward from the photo's edges, removing everything that is
// close to the background colour. Great for stickers, products, drawings and anything shot on a plain surface.
// tolerance: 8 (strict) .. 90 (very forgiving)
export async function plainBackgroundCutout(src: string, tolerance = 40): Promise<string> {
  const img = await toImage(src);
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const im = ctx.getImageData(0, 0, w, h);
  const d = im.data;

  // typical border colour (median of the edge pixels)
  const edge: number[][] = [];
  const step = Math.max(1, Math.floor(Math.max(w, h) / 200));
  for (let x = 0; x < w; x += step) {
    edge.push([x, 0], [x, h - 1]);
  }
  for (let y = 0; y < h; y += step) {
    edge.push([0, y], [w - 1, y]);
  }
  const med = (ch: number) => {
    const v = edge.map(([x, y]) => d[(y * w + x) * 4 + ch]).sort((a, b) => a - b);
    return v[Math.floor(v.length / 2)];
  };
  const bg = [med(0), med(1), med(2)];
  const dist = (i: number, ref: number[]) => Math.hypot((d[i] - ref[0]) * 0.9, (d[i + 1] - ref[1]) * 1.1, (d[i + 2] - ref[2]) * 0.8);

  const removed = new Uint8Array(w * h);
  const queue: number[] = [];
  const push = (p: number) => {
    if (!removed[p] && dist(p * 4, bg) <= tolerance) {
      removed[p] = 1;
      queue.push(p);
    }
  };
  for (let x = 0; x < w; x++) {
    push(x);
    push((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    push(y * w);
    push(y * w + w - 1);
  }
  const local = tolerance * 0.5; // allows gentle gradients in the background
  const far = tolerance * 2.2;
  for (let qi = 0; qi < queue.length; qi++) {
    const p = queue[qi];
    const x = p % w;
    const y = (p / w) | 0;
    const here = [d[p * 4], d[p * 4 + 1], d[p * 4 + 2]];
    for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const n = ny * w + nx;
      if (removed[n]) continue;
      if (dist(n * 4, here) <= local && dist(n * 4, bg) <= far) {
        removed[n] = 1;
        queue.push(n);
      }
    }
  }

  // soften the edge by one pixel so the cut doesn't look jagged
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      if (removed[p]) {
        d[p * 4 + 3] = 0;
        continue;
      }
      let near = 0;
      if (x > 0 && removed[p - 1]) near++;
      if (x < w - 1 && removed[p + 1]) near++;
      if (y > 0 && removed[p - w]) near++;
      if (y < h - 1 && removed[p + w]) near++;
      if (near) d[p * 4 + 3] = Math.round(255 * (1 - 0.22 * near));
    }
  }
  ctx.putImageData(im, 0, 0);
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
  (window as unknown as { __plCutout: unknown }).__plCutout = { autoCutout, bakeLasso, plainBackgroundCutout };
}

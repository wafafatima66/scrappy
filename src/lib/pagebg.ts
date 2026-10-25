import { bgCss } from "./backgrounds";
import { FRAME_MAP } from "./frames";

// Paper + optional border as one CSS background value.
export function pageBackground(p: { bg: string; frame?: string }) {
  const f = p.frame ? FRAME_MAP[p.frame] : undefined;
  return f && f.css ? `${f.css}, ${bgCss(p.bg)}` : bgCss(p.bg);
}

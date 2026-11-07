// Backgrounds that can sit behind a cut-out photo.
export const PBG_COLORS = [
  "#ffffff", "#f6efe0", "#f6e3e6", "#e6e0f5", "#dfeadb", "#dcecf7", "#f7efc9", "#f3c9b8", "#c9a679", "#8d7aa8", "#3a3358", "#1f1d1f",
];

export const PBG_GRADIENTS: [string, string][] = [
  ["sunset", "linear-gradient(160deg,#f9d29d,#f2a7b8 55%,#b9a8f0)"],
  ["lilac", "linear-gradient(160deg,#efe6fb,#cdb8f0)"],
  ["sky", "linear-gradient(180deg,#bfe0f7,#f6efe0)"],
  ["mint", "linear-gradient(160deg,#e3f2e0,#a9d4c0)"],
  ["peach", "linear-gradient(160deg,#fde7d8,#f4b9a6)"],
  ["night", "linear-gradient(180deg,#2b2540,#6a4c93)"],
];

export type PhotoBg = { k: "color" | "paper" | "gradient" | "blur" | "photo"; v?: string };

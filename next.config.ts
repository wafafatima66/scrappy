import type { NextConfig } from "next";

// Static export: the same build powers the website and the Android app (Capacitor loads ./out).
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;

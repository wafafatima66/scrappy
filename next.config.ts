import { networkInterfaces } from "node:os";
import type { NextConfig } from "next";

// Every address this PC has on your network (Wi-Fi, hotspot, VPN…), so the dev server can be opened
// from your phone without Next blocking it and reloading the page in a loop.
const lan = Object.values(networkInterfaces())
  .flat()
  .filter((n) => n && n.family === "IPv4")
  .map((n) => (n as { address: string }).address);

// Static export: the same build powers the website and the Android app (Capacitor loads ./out).
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  allowedDevOrigins: ["127.0.0.1", "localhost", ...lan],
};

export default nextConfig;

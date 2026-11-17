import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/privacy/", "/delete-account/"].map((p) => ({ url: `${SITE_URL}${p}`, lastModified: new Date() }));
}

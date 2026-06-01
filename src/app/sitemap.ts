import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return ["/", "/explore", "/trending", "/login", "/register"].map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: "daily",
    priority: path === "/" ? 1 : 0.7,
  }));
}

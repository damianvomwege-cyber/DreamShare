import type { MetadataRoute } from "next";

import { getDreamShareSitemap } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getDreamShareSitemap();
}

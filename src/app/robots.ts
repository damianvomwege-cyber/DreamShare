import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api",
        "/bookmarks",
        "/settings",
        "/notifications",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
      ],
    },
    sitemap: [absoluteUrl("/google-sitemap.xml"), absoluteUrl("/sitemap.xml")],
  };
}

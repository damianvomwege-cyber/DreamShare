import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DreamShare",
    short_name: "DreamShare",
    description: "Share and explore dreams from around the world.",
    start_url: "/",
    display: "standalone",
    background_color: "#080a12",
    theme_color: "#0891b2",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
    ],
  };
}

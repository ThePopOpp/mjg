import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Michael J. Gauthier",
    short_name: "MJG",
    description: "The Stewardship Blueprint — Created for More. Manage participants, communications, and content.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#111111",
    theme_color: "#c9aa70",
    orientation: "portrait-primary",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

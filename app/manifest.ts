import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Prestigia Agency — Marketing Digital Casablanca",
    short_name: "Prestigia",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0b",
    theme_color: "#0a0a0b",
    lang: "fr",
    dir: "ltr",
    orientation: "portrait-primary",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
        purpose: "any",
      },
      // Ajouter ces fichiers dans /public pour un PWA complet :
      // { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      // { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
    screenshots: [],
  };
}

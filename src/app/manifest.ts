import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site.config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description:
      "Aluminium ingots, cubes, shots, notch bars and deoxidizer products from HG Alutech, Kadi, Gujarat.",
    start_url: "/en",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f5f7fb",
    theme_color: "#0342ab",
    categories: ["business", "manufacturing"],
    icons: [
      {
        src: "/icons/icon-192x192.png?v=alutek",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png?v=alutek",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-192x192.png?v=alutek",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/maskable-512x512.png?v=alutek",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

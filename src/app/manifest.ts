import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site.config";
import {
  FALLBACK_BRAND_ICON,
  resolveBrandLogoSrc,
} from "@/features/public-site/lib/brand-logo";

export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const logoSrc = (await resolveBrandLogoSrc()) || FALLBACK_BRAND_ICON;

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
        src: logoSrc,
        sizes: "any",
        type: /\.svg(\?|$)/i.test(logoSrc) ? "image/svg+xml" : "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

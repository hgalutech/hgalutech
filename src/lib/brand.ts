/**
 * Brand asset constants — safe for components + features (no DB).
 */

/** Wide lockup when the CMS logo is empty (header / footer). */
export const FALLBACK_BRAND_ICON = "/brand/hg-alutek-logo.png";

/** Square mark used by the installed PWA and favicon routes. */
export const PWA_ICON_SRC = "/icons/icon-512x512.png";

/**
 * Same resolution as header / footer BrandLockup:
 * company PNG → company SVG → null (caller applies fallback).
 */
export function brandLogoSrcFromProfile(
  company:
    | {
        logo?: {
          png?: string | null;
          svg?: string | null;
        } | null;
      }
    | null
    | undefined,
): string | null {
  const png = company?.logo?.png?.trim();
  if (png) return png;
  const svg = company?.logo?.svg?.trim();
  if (svg) return svg;
  return null;
}

import Image from "next/image";
import Link from "next/link";

import { FALLBACK_BRAND_ICON } from "@/lib/brand";
import { cn } from "@/lib/utils";

const DEFAULT_HEIGHT = 40;

type BrandLockupProps = {
  href: string;
  className?: string;
  /** @deprecated Kept for call sites; no longer paints a background plate. */
  inverted?: boolean;
  /** CMS logo URL; falls back to packaged mark. */
  src?: string | null;
  /** Display height in px (28–72). */
  heightPx?: number;
};

function clampHeight(n: number | undefined): number {
  if (n == null || !Number.isFinite(n)) return DEFAULT_HEIGHT;
  return Math.min(72, Math.max(28, Math.round(n)));
}

/** Prefer a transparent PNG delivery for Cloudinary uploads (no baked plate). */
function displayLogoSrc(src: string): string {
  const m = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/i.exec(src);
  if (!m) return src;
  const [, prefix, rest] = m;
  if (/e_make_transparent|e_background_removal|b_transparent/i.test(src)) {
    return src;
  }
  // Top-left corner color (usually studio black/white) → alpha; keep mark only.
  return `${prefix}e_make_transparent:25,f_png,q_auto/${rest}`;
}

/** Fluid-width lockup — logo only, no background plate. */
export function BrandLockup({ href, className, src, heightPx }: BrandLockupProps) {
  const h = clampHeight(heightPx);
  const raw = src?.trim() || FALLBACK_BRAND_ICON;
  const imageSrc = displayLogoSrc(raw);
  const maxW = Math.round(h * 4.25);

  return (
    <Link
      href={href}
      className={cn("inline-flex min-w-0 shrink items-center", className)}
      aria-label="HG Alutek home"
    >
      <span
        className="relative inline-flex items-center justify-center overflow-hidden bg-transparent"
        style={{ height: h }}
      >
        <Image
          src={imageSrc}
          alt="HG Alutek"
          width={maxW * 2}
          height={h * 2}
          priority
          unoptimized={imageSrc.includes("res.cloudinary.com")}
          className="h-full w-auto bg-transparent object-contain"
          style={{
            maxWidth: `min(${maxW}px, 52vw)`,
            height: h,
          }}
        />
      </span>
    </Link>
  );
}

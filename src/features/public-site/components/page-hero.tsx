import Link from "next/link";

import { Container } from "@/components/atoms/container";
import { buttonVariants } from "@/components/ui/button";
import { localePath } from "@/config/nav.config";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  locale: string;
  eyebrow?: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  tone?: "brand" | "ink" | "surface";
  showCta?: boolean;
  /**
   * @deprecated Full-bleed stock photos are not used on inner pages.
   * Kept optional for callers; intentionally ignored (typography-first).
   */
  imageSrc?: string;
  imageAlt?: string;
};

/**
 * Inner-page hero — typography-first (Stripe / Linear / Apple product pages).
 * Brand + one headline + short support + optional CTA. No full-bleed photo plane.
 */
export function PageHero({
  locale,
  eyebrow = "HG Alutech",
  title,
  description,
  ctaLabel = "Inquire",
  ctaHref = "contact",
  secondaryLabel,
  secondaryHref,
  tone = "brand",
  showCta = true,
}: PageHeroProps) {
  const isSurface = tone === "surface";

  return (
    <section
      className={cn(
        "relative overflow-hidden border-b",
        isSurface
          ? "border-line bg-bg text-ink"
          : tone === "ink"
            ? "border-transparent bg-ink text-white"
            : "border-transparent bg-[linear-gradient(125deg,var(--brand-blue-darker)_0%,var(--ink)_55%,var(--brand-blue-dark)_100%)] text-white",
      )}
    >
      {!isSurface ? (
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 8% 0%, rgba(3,66,171,0.45), transparent 42%), radial-gradient(ellipse at 92% 100%, rgba(232,1,21,0.12), transparent 38%)",
          }}
          aria-hidden
        />
      ) : null}
      <Container className="relative py-[clamp(2rem,4.5vw,3.25rem)]">
        <p
          className={cn(
            "text-[0.72rem] font-bold tracking-[0.14em] uppercase",
            isSurface ? "text-brand-red" : "text-brand-red",
          )}
        >
          {eyebrow}
        </p>
        <h1 className="font-display mt-2.5 max-w-[20ch] text-[clamp(1.75rem,1.25rem+1.8vw,2.75rem)] font-semibold leading-[1.1] text-balance">
          {title}
        </h1>
        {description ? (
          <p
            className={cn(
              "mt-3 max-w-[40rem] text-[clamp(0.9375rem,0.9rem+0.2vw,1.05rem)] leading-relaxed",
              isSurface ? "text-muted-foreground" : "text-on-dark-muted",
            )}
          >
            {description}
          </p>
        ) : null}
        {showCta || (secondaryLabel && secondaryHref) ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {showCta ? (
              <Link
                href={localePath(locale, ctaHref)}
                className={cn(buttonVariants({ variant: "default" }), "min-h-10")}
              >
                {ctaLabel}
              </Link>
            ) : null}
            {secondaryLabel && secondaryHref ? (
              <Link
                href={localePath(locale, secondaryHref)}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "min-h-10",
                  !isSurface &&
                    "border-white/35 bg-transparent text-white hover:bg-white/10",
                )}
              >
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        ) : null}
      </Container>
    </section>
  );
}

/** @deprecated Prefer omitting images — kept so older imports compile. */
export const PAGE_HERO_IMAGES = {
  about: "",
  journey: "",
  leadership: "",
  capacity: "",
  customers: "",
  expansion: "",
  industries: "",
  manufacturing: "",
  quality: "",
  sustainability: "",
  procurement: "",
  careers: "",
  resources: "",
  contact: "",
  default: "",
} as const;

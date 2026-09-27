import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/atoms/container";
import { Eyebrow } from "@/components/atoms/eyebrow";
import { Reveal } from "@/components/atoms/reveal";
import { Section } from "@/components/atoms/section";
import { PublicEmptyState } from "@/features/public-site/components/cms-empty-state";
import { localePath } from "@/config/nav.config";
import industriesSeed from "../../../../config/industries.seed.json";

export type IndustrySegment = {
  key: string;
  label: string;
  description: string;
  productFocus: string[];
  applications: string[];
};

export function loadIndustrySegments(): IndustrySegment[] {
  return industriesSeed as IndustrySegment[];
}

/** Authentic industrial imagery per market segment. */
export const SECTOR_IMAGE: Record<string, string> = {
  architecture: "/products/extrusion-profiles.jpg",
  formwork: "/products/extrusion-profiles.jpg",
  extrusion_mfr: "/products/aluminium-billets.jpg",
  foundry_alloy: "/products/aluminium-ingots.jpg",
  steel_deox: "/products/aluminium-cubes.jpg",
  solar:
    "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80",
  industrial:
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
  electrical:
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
  automotive_transport:
    "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
  railways:
    "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80",
  hvac_cryogenic:
    "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=800&q=80",
};

const DEFAULT_SECTOR_IMAGE = "/products/extrusion-profiles.jpg";

/** Dynamically resolves authentic imagery even when industries are modified in Admin Desk. */
function resolveSectorImage(s: IndustrySegment): string {
  const direct = s.key ? SECTOR_IMAGE[s.key] : undefined;
  if (direct) {
    return direct;
  }
  const text =
    `${s.key} ${s.label} ${s.applications?.join(" ") ?? ""} ${s.description ?? ""}`.toLowerCase();
  if (text.includes("solar")) return SECTOR_IMAGE.solar ?? DEFAULT_SECTOR_IMAGE;
  if (text.includes("rail") || text.includes("train"))
    return SECTOR_IMAGE.railways ?? DEFAULT_SECTOR_IMAGE;
  if (
    text.includes("auto") ||
    text.includes("vehicle") ||
    text.includes("ev") ||
    text.includes("transport")
  ) {
    return SECTOR_IMAGE.automotive_transport ?? DEFAULT_SECTOR_IMAGE;
  }
  if (text.includes("electric") || text.includes("power") || text.includes("sink")) {
    return SECTOR_IMAGE.electrical ?? DEFAULT_SECTOR_IMAGE;
  }
  if (text.includes("billet")) return SECTOR_IMAGE.extrusion_mfr ?? DEFAULT_SECTOR_IMAGE;
  if (
    text.includes("ingot") ||
    text.includes("foundry") ||
    text.includes("casting") ||
    text.includes("remelt")
  ) {
    return SECTOR_IMAGE.foundry_alloy ?? DEFAULT_SECTOR_IMAGE;
  }
  if (
    text.includes("steel") ||
    text.includes("deox") ||
    text.includes("cube") ||
    text.includes("shot")
  ) {
    return SECTOR_IMAGE.steel_deox ?? DEFAULT_SECTOR_IMAGE;
  }
  if (text.includes("hvac") || text.includes("cryo") || text.includes("cool")) {
    return SECTOR_IMAGE.hvac_cryogenic ?? DEFAULT_SECTOR_IMAGE;
  }
  if (
    text.includes("formwork") ||
    text.includes("facade") ||
    text.includes("window") ||
    text.includes("door") ||
    text.includes("architect")
  ) {
    return SECTOR_IMAGE.architecture ?? DEFAULT_SECTOR_IMAGE;
  }
  if (text.includes("industry") || text.includes("machin") || text.includes("frame")) {
    return SECTOR_IMAGE.industrial ?? DEFAULT_SECTOR_IMAGE;
  }
  return DEFAULT_SECTOR_IMAGE;
}

/** Generates clean uppercase category tag matching the reference red tag. */
function getSectorCategory(s: IndustrySegment): string {
  const first = s.productFocus?.[0];
  if (first) {
    return first
      .replace(/^aluminium-/, "")
      .replace(/-/g, " ")
      .toUpperCase();
  }
  const text = `${s.key} ${s.label}`.toLowerCase();
  if (text.includes("solar")) return "SOLAR ENERGY";
  if (text.includes("architect") || text.includes("build")) return "ARCHITECTURE";
  if (text.includes("auto") || text.includes("transport")) return "AUTOMOTIVE";
  if (text.includes("electric") || text.includes("power")) return "ELECTRICAL";
  if (text.includes("rail")) return "RAILWAYS";
  if (text.includes("billet")) return "BILLETS";
  if (text.includes("ingot") || text.includes("foundry")) return "FOUNDRY";
  if (text.includes("steel") || text.includes("deox")) return "STEEL DEOX";
  if (text.includes("hvac")) return "HVAC & COOLING";
  if (text.includes("formwork")) return "FORMWORK";
  if (text.includes("indus")) return "ENGINEERING";
  return "MARKET";
}

type MarketsSectionProps = {
  locale: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  /** Prefer Industries CMS list from Admin Desk; seed is fallback only. */
  segments?: IndustrySegment[];
  limit?: number;
};

export function MarketsSection({
  locale,
  eyebrow = "Markets",
  title = "Markets we serve",
  description = "Application sectors shaped by extrusion, billet and remelt demand.",
  segments,
  limit = 8,
}: MarketsSectionProps) {
  const rows = (segments?.length ? segments : loadIndustrySegments()).slice(0, limit);
  if (!rows.length) {
    return (
      <Section data-block="markets">
        <Container>
          <PublicEmptyState
            locale={locale}
            density="section"
            title="No market segments configured yet."
            description="Publish industry rows on the Industries page to fill this band."
            primary={{ label: "Industries", href: "industries" }}
          />
        </Container>
      </Section>
    );
  }

  return (
    <Section data-block="markets">
      <Container>
        <Reveal>
          <div className="mb-6 flex flex-col gap-3 min-[720px]:mb-8 min-[720px]:flex-row min-[720px]:items-end min-[720px]:justify-between">
            <div className="max-w-xl">
              <Eyebrow>{eyebrow}</Eyebrow>
              <h2 className="text-fs-h2 mt-2 text-balance">{title}</h2>
              {description ? (
                <p className="text-fs-lead text-muted-foreground mt-2">{description}</p>
              ) : null}
            </div>
            <Link
              href={localePath(locale, "industries")}
              className="text-brand-blue inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold tracking-tight hover:text-brand-blue-dark"
            >
              Explore all industries
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>

        {/* Responsive mini cards: 2 cols on mobile, 3 on tablet, 4 on desktop */}
        <Reveal stagger>
          <ul className="grid grid-cols-2 gap-2.5 min-[640px]:grid-cols-3 min-[1024px]:grid-cols-4 sm:gap-3.5 lg:gap-4">
            {rows.map((s) => {
              const imageSrc = resolveSectorImage(s);
              const categoryTag = getSectorCategory(s);

              return (
                <li key={s.key} className="h-full">
                  <Link
                    href={`${localePath(locale, "industries")}#${s.key}`}
                    className="group relative flex aspect-square w-full flex-col justify-end overflow-hidden rounded-xl bg-slate-900 ring-1 ring-black/[0.08] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:ring-brand-blue/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue sm:aspect-[4/3.6] sm:rounded-2xl"
                  >
                    {/* Background image with smooth scale on card hover */}
                    <Image
                      src={imageSrc}
                      alt={s.label}
                      fill
                      sizes="(min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Dark gradient overlay matching reference aesthetic */}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 via-45% to-transparent pointer-events-none"
                      aria-hidden="true"
                    />

                    {/* Subtle border highlight ring */}
                    <div
                      className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 transition-colors group-hover:ring-white/25 pointer-events-none sm:rounded-2xl"
                      aria-hidden="true"
                    />

                    {/* Content overlaid at bottom - compact sizing */}
                    <div className="relative z-10 flex flex-col justify-end p-3 sm:p-4">
                      <span className="text-[9.5px] font-bold tracking-[0.14em] text-brand-red uppercase sm:text-[10.5px]">
                        {categoryTag}
                      </span>
                      <h3 className="font-display mt-0.5 text-xs font-bold leading-tight text-white flex items-center justify-between gap-1 sm:text-sm sm:leading-snug">
                        <span className="line-clamp-2">{s.label}</span>
                        <span
                          className="shrink-0 text-white/90 transition-transform duration-300 group-hover:translate-x-1"
                          aria-hidden="true"
                        >
                          →
                        </span>
                      </h3>
                      {s.applications && s.applications.length > 0 ? (
                        <p className="mt-0.5 text-[10px] text-white/70 line-clamp-1 font-normal sm:text-[11px]">
                          {s.applications.slice(0, 2).join(" · ")}
                        </p>
                      ) : s.description ? (
                        <p className="mt-0.5 text-[10px] text-white/70 line-clamp-1 font-normal sm:text-[11px]">
                          {s.description}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </Container>
    </Section>
  );
}

import type { ReactNode } from "react";

import { CapabilitySection } from "@/features/public-home/components/capability-section";
import { CareersTeaserSection } from "@/features/public-home/components/careers-teaser-section";
import { CustomersLogoStrip } from "@/features/public-home/components/customers-logo-strip";
import { FaqSection } from "@/features/public-home/components/faq-section";
import { HeroCarousel } from "@/features/public-home/components/hero-carousel";
import { InquireCtaBanner } from "@/features/public-home/components/inquire-cta-banner";
import { JointVenturesSection } from "@/features/public-home/components/joint-ventures-section";
import { MissionVideoSection } from "@/features/public-home/components/mission-video-section";
import { ProductsSection } from "@/features/public-home/components/products-section";
import { TestimonialsCarousel } from "@/features/public-home/components/testimonials-carousel";
import type { HomeContent } from "@/features/public-home/content/home.en";
import { normalizeHeroContent } from "@/features/public-home/lib/normalize-hero";
import {
  CertGridBlock,
  CompanyFactsBlock,
  CustomerLogoStripBlock,
  ExpansionRoadmapBlock,
  LeadershipGridBlock,
  StatsBlock,
  SustainabilityMetricsBlock,
} from "@/features/public-corporate";
import { MarketsSection } from "@/features/public-site/components/markets-section";
import { InquireBand } from "@/features/public-site/components/inquire-band";
import {
  IndustryListBlock,
  NumberedStepsBlock,
  PageIntroBlock,
  PillarListBlock,
  ResourceListBlock,
  TimelineBlock,
} from "@/features/public-site/components/corp-cms-blocks";
import { UpcomingProductsStrip } from "@/features/public-site/components/upcoming-products";
import { productImageUrl } from "@/features/public-catalog/lib/product-media";
import {
  groupProductsByCategory,
  type CategoryWithProducts,
} from "@/features/public-catalog/lib/catalogue-groups";
import {
  getCachedPublishedPage,
  getCachedPublishedProducts,
} from "@/features/public-site/lib/public-cache";
import {
  getCachedPublishedLogos,
  getCachedPublishedTestimonials,
} from "@/features/public-corporate/lib/public-cache";
import { listCategoriesFlat } from "@/modules/catalog";
import { PublicEmptyState } from "@/features/public-site/components/cms-empty-state";
import {
  loadIndustrySegments,
  type IndustrySegment,
} from "@/features/public-site/components/markets-section";

export type CmsBlock = {
  id: string;
  type: string;
  order: number;
  appearance?: string;
  data: unknown;
};

async function hydrateProductsBlock(content: HomeContent["products"]): Promise<{
  content: HomeContent["products"];
  groups: CategoryWithProducts[];
}> {
  const [cats, { items }] = await Promise.all([
    listCategoriesFlat().catch(() => []),
    getCachedPublishedProducts({ limit: 48, upcoming: false }),
  ]);
  const groups = groupProductsByCategory(cats, items);
  return {
    content: {
      eyebrow: content.eyebrow || "Our Products",
      title: content.title || "Shop by category",
      description:
        content.description ||
        "Each category holds the products you can enquire about — extrusion, billets and remelt.",
      items: groups.flatMap((g) =>
        g.products.slice(0, 2).map((p, index) => ({
          title: p.name.en,
          href: `products/${p.slug}`,
          imageSrc: productImageUrl(p),
          imageAlt: p.name.en,
          wide: index === 0,
        })),
      ),
    },
    groups,
  };
}

function parseUpcomingCopy(data: unknown): {
  eyebrow: string;
  title: string;
  description: string;
} {
  const d =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : {};
  return {
    eyebrow:
      typeof d.eyebrow === "string" && d.eyebrow
        ? d.eyebrow
        : "Steel & Deoxidation Solutions",
    title: typeof d.title === "string" && d.title ? d.title : "Upcoming products",
    description:
      typeof d.description === "string"
        ? d.description
        : "Aluminium Cubes, Shots, Notch Bars and Deoxidizer Products for steelmaking — register interest for early allocation.",
  };
}

async function hydrateCustomersBlock(content: HomeContent["customers"]): Promise<{
  content: HomeContent["customers"];
  items: Array<{ id: string; name: string; imageUrl: string | null }>;
}> {
  const logos = await getCachedPublishedLogos("confirmed");
  if (!logos.length) {
    return {
      content: {
        eyebrow: content.eyebrow || "Our Customers",
        title: content.title || "Confirmed existing customers",
        description:
          content.description ||
          "Approved partners appear here once logos are published in Admin.",
        logos: [],
      },
      items: [],
    };
  }
  return {
    content: {
      eyebrow: content.eyebrow || "Our Customers",
      title: content.title || "Confirmed existing customers",
      description:
        content.description ||
        "Confirmed customers only — potential accounts are listed separately on the Customers page.",
      logos: logos.map((l) => l.name),
    },
    items: logos.map((l) => ({
      id: l.id,
      name: l.name,
      imageUrl: l.imageUrl,
    })),
  };
}

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

async function hydrateTestimonialsBlock(
  content: HomeContent["testimonials"],
): Promise<HomeContent["testimonials"]> {
  const published = await getCachedPublishedTestimonials();
  if (!published.length) {
    return {
      eyebrow: content.eyebrow || "Testimonials",
      title: content.title || "What partners say",
      items: [],
    };
  }
  return {
    eyebrow: content.eyebrow || "Testimonials",
    title: content.title || "What partners say",
    items: published.map((t) => ({
      initials: initialsFromName(t.authorName) || "HG",
      name: t.authorName,
      role: t.authorTitle || t.company || "",
      quote: t.quote.en || Object.values(t.quote)[0] || "",
    })),
  };
}

async function hydrateMarketsSegments(): Promise<IndustrySegment[]> {
  try {
    const page = await getCachedPublishedPage("industries", "en");
    const block = page?.blocks?.find((b) => b.type === "industry-list");
    const data =
      block?.data && typeof block.data === "object"
        ? (block.data as Record<string, unknown>)
        : null;
    const items = Array.isArray(data?.items) ? data.items : [];
    const mapped = items
      .map((raw, i) => {
        const row =
          raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
        const label = typeof row.label === "string" ? row.label.trim() : "";
        if (!label) return null;
        const applications = Array.isArray(row.applications)
          ? row.applications.map(String).filter(Boolean)
          : [];
        return {
          key: `cms-${i}-${label.toLowerCase().replace(/\s+/g, "-")}`,
          label,
          description: typeof row.description === "string" ? row.description : "",
          productFocus: [] as string[],
          applications,
        } satisfies IndustrySegment;
      })
      .filter(Boolean) as IndustrySegment[];
    if (mapped.length) return mapped;
  } catch {
    /* fall through to seed */
  }
  return loadIndustrySegments();
}

function parseMarketsCopy(data: unknown): {
  eyebrow: string;
  title: string;
  description: string;
} {
  const d = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  return {
    eyebrow: typeof d.eyebrow === "string" ? d.eyebrow : "Markets",
    title: typeof d.title === "string" ? d.title : "Markets we serve",
    description:
      typeof d.description === "string"
        ? d.description
        : "Application sectors for ingots and steel-deoxidation forms.",
  };
}

function SoftFail({ type, locale = "en" }: { type: string; locale?: string }) {
  return (
    <PublicEmptyState
      locale={locale}
      density="section"
      title={`Section “${type}” unavailable.`}
      description="This block could not render. Other page sections still work."
      primary={{ label: "Contact / RFQ", href: "contact" }}
    />
  );
}

export async function renderCmsBlock(
  block: CmsBlock,
  locale: string,
): Promise<ReactNode> {
  const appearance = block.appearance ?? "default";
  const wrap = (node: ReactNode) => (
    <div data-block={block.type} data-appearance={appearance} key={block.id}>
      {node}
    </div>
  );

  try {
    switch (block.type) {
      case "hero":
        return wrap(
          <HeroCarousel locale={locale} content={normalizeHeroContent(block.data)} />,
        );
      case "capability":
        return wrap(
          <CapabilitySection content={block.data as HomeContent["capability"]} />,
        );
      case "products": {
        const hydrated = await hydrateProductsBlock(
          block.data as HomeContent["products"],
        );
        return wrap(
          <ProductsSection
            locale={locale}
            content={hydrated.content}
            groups={hydrated.groups}
          />,
        );
      }
      case "upcoming-products": {
        const copy = parseUpcomingCopy(block.data);
        return wrap(
          <UpcomingProductsStrip
            locale={locale}
            eyebrow={copy.eyebrow}
            title={copy.title}
            description={copy.description}
            showEmpty
          />,
        );
      }
      case "markets": {
        const copy = parseMarketsCopy(block.data);
        const segments = await hydrateMarketsSegments();
        return wrap(
          <MarketsSection
            locale={locale}
            eyebrow={copy.eyebrow}
            title={copy.title}
            description={copy.description}
            segments={segments}
            limit={8}
          />,
        );
      }
      case "mission": {
        const data = block.data as HomeContent["mission"] & {
          videoSrc?: string;
          videoPoster?: string;
        };
        return wrap(
          <MissionVideoSection
            content={{
              imageSrc: data.imageSrc,
              imageAlt: data.imageAlt,
              statement: data.statement,
            }}
            videoSrc={data.videoSrc ?? ""}
            videoPoster={data.videoPoster ?? ""}
          />,
        );
      }
      case "customers": {
        const hydrated = await hydrateCustomersBlock(
          block.data as HomeContent["customers"],
        );
        return wrap(
          <CustomersLogoStrip
            locale={locale}
            content={hydrated.content}
            items={hydrated.items}
          />,
        );
      }
      case "testimonials": {
        const hydrated = await hydrateTestimonialsBlock(
          block.data as HomeContent["testimonials"],
        );
        return wrap(<TestimonialsCarousel content={hydrated} />);
      }
      case "cta-banner":
        return wrap(
          <InquireCtaBanner
            locale={locale}
            content={block.data as HomeContent["ctaBanner"]}
          />,
        );
      case "joint-ventures":
        return wrap(
          <JointVenturesSection content={block.data as HomeContent["jointVentures"]} />,
        );
      case "careers-teaser":
        return wrap(
          <CareersTeaserSection
            locale={locale}
            content={block.data as HomeContent["careers"]}
          />,
        );
      case "faq":
        return wrap(<FaqSection content={block.data as HomeContent["faq"]} />);
      case "page-intro":
        return wrap(<PageIntroBlock locale={locale} data={block.data} />);
      case "pillar-list":
        return wrap(<PillarListBlock locale={locale} data={block.data} />);
      case "timeline":
        return wrap(<TimelineBlock locale={locale} data={block.data} />);
      case "numbered-steps":
        return wrap(<NumberedStepsBlock locale={locale} data={block.data} />);
      case "resource-list":
        return wrap(<ResourceListBlock locale={locale} data={block.data} />);
      case "industry-list":
        return wrap(<IndustryListBlock locale={locale} data={block.data} />);
      case "stats":
        return wrap(<StatsBlock locale={locale} />);
      case "company-facts":
        return wrap(<CompanyFactsBlock locale={locale} />);
      case "cert-grid":
        return wrap(<CertGridBlock locale={locale} />);
      case "sustainability-metrics":
        return wrap(<SustainabilityMetricsBlock locale={locale} />);
      case "leadership-grid":
        return wrap(<LeadershipGridBlock locale={locale} />);
      case "logo-strip":
      case "gallery":
        return wrap(<CustomerLogoStripBlock locale={locale} />);
      case "expansion-roadmap":
        return wrap(<ExpansionRoadmapBlock locale={locale} />);
      default:
        return <SoftFail key={block.id} type={block.type} locale={locale} />;
    }
  } catch {
    return <SoftFail key={block.id} type={block.type} locale={locale} />;
  }
}

export async function CmsPageBlocks({
  blocks,
  locale,
}: {
  blocks: CmsBlock[];
  locale: string;
}) {
  const ordered = [...blocks].sort((a, b) => a.order - b.order);
  const nodes = await Promise.all(ordered.map((b) => renderCmsBlock(b, locale)));
  const hasCtaBanner = ordered.some((b) => b.type === "cta-banner");
  return (
    <>
      {nodes}
      {!hasCtaBanner ? <InquireBand locale={locale} /> : null}
    </>
  );
}

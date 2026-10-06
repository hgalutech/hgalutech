import Link from "next/link";

import { Container } from "@/components/atoms/container";
import { Section } from "@/components/atoms/section";
import { buttonVariants } from "@/components/ui/button";
import { CatalogueBreadcrumbs } from "@/features/public-catalog/components/catalogue-breadcrumbs";
import {
  CatalogueByCategory,
  CategoryBrowseGrid,
} from "@/features/public-catalog/components/catalogue-by-category";
import { groupProductsByCategory } from "@/features/public-catalog/lib/catalogue-groups";
import {
  CmsEmptyState,
  PublicEmptyState,
} from "@/features/public-site/components/cms-empty-state";
import { InquireBand } from "@/features/public-site/components/inquire-band";
import { UpcomingProductsStrip } from "@/features/public-site/components/upcoming-products";
import {
  getCachedPublishedProducts,
  getCachedUpcomingProducts,
} from "@/features/public-site/lib/public-cache";
import { localePath } from "@/config/nav.config";
import { listCategoriesFlat } from "@/modules/catalog";
import { cn } from "@/lib/utils";

type ProductsIndexProps = {
  locale: string;
};

/**
 * Catalogue home: Categories first, then that category’s N products.
 * Visitor path matches admin: Categories → Products under each.
 */
export async function ProductsIndex({ locale }: ProductsIndexProps) {
  const [{ items }, cats, upcoming] = await Promise.all([
    getCachedPublishedProducts({
      limit: 100,
      upcoming: false,
    }),
    listCategoriesFlat(),
    getCachedUpcomingProducts({ limit: 1 }),
  ]);

  const groups = groupProductsByCategory(cats, items);
  const hasUpcoming = upcoming.items.length > 0;

  if (groups.length === 0 && items.length === 0) {
    return (
      <>
        <CatalogueIndexHero locale={locale} showUpcoming={false} />
        <CmsEmptyState locale={locale} title="No products published yet." />
      </>
    );
  }

  return (
    <>
      <CatalogueIndexHero locale={locale} showUpcoming={hasUpcoming} />

      {groups.length > 0 ? (
        <Section>
          <Container>
            <div className="mb-8">
              <p className="text-[0.7rem] font-bold tracking-[0.12em] text-brand-blue uppercase">
                Shop by category
              </p>
              <h2 className="font-display mt-1.5 text-[clamp(1.35rem,1.15rem+0.8vw,1.75rem)] font-semibold text-ink">
                Browse categories
              </h2>
              <p className="text-muted-foreground mt-2 max-w-[42ch] text-[0.9375rem] leading-relaxed">
                Pick a category, then open any product under it.
              </p>
            </div>
            <CategoryBrowseGrid locale={locale} groups={groups} />
          </Container>
        </Section>
      ) : (
        <Section>
          <Container>
            <PublicEmptyState
              locale={locale}
              density="section"
              title="No categories published yet."
              description="Publish categories in Admin, then attach products to each one."
              primary={{ label: "Contact / RFQ", href: "contact" }}
            />
          </Container>
        </Section>
      )}

      <CatalogueByCategory
        locale={locale}
        groups={groups}
        productsPerCategory={8}
        density="catalogue"
      />

      {hasUpcoming ? (
        <div id="upcoming" className="scroll-mt-24">
          <UpcomingProductsStrip
            locale={locale}
            showCatalogueLink={false}
            showEmpty={false}
          />
        </div>
      ) : null}
      <InquireBand locale={locale} />
    </>
  );
}

function CatalogueIndexHero({
  locale,
  showUpcoming,
}: {
  locale: string;
  showUpcoming: boolean;
}) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(125deg,var(--brand-blue-darker)_0%,var(--ink)_50%,var(--brand-blue-dark)_100%)] text-white">
      <Container className="relative py-[clamp(2.5rem,6vw,4.25rem)]">
        <CatalogueBreadcrumbs
          locale={locale}
          items={[{ label: "Home", href: "" }, { label: "Catalogue" }]}
          tone="dark"
          className="mb-5"
        />
        <p className="text-[0.72rem] font-bold tracking-[0.14em] text-brand-red uppercase">
          Products
        </p>
        <h1 className="font-display mt-2 text-[clamp(1.85rem,1.4rem+1.8vw,2.85rem)] font-semibold tracking-tight text-balance">
          Categories and products
        </h1>
        <p className="mt-3 max-w-xl text-white/80 text-[clamp(0.95rem,0.9rem+0.25vw,1.05rem)] leading-relaxed">
          Browse by category — each category holds the products you can enquire about.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={localePath(locale, "contact")}
            className={cn(buttonVariants({ variant: "default" }), "min-h-10")}
          >
            Contact / RFQ
          </Link>
          {showUpcoming ? (
            <Link
              href="#upcoming"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "min-h-10 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white",
              )}
            >
              Upcoming lines
            </Link>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

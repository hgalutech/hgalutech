import { PageHero } from "@/features/public-site/components/page-hero";
import { CmsPageBlocks } from "@/features/public-home/lib/block-registry";
import { PublicEmptyState } from "@/features/public-site/components/cms-empty-state";
import { getCachedPublishedPage } from "@/features/public-site/lib/public-cache";
import { getPageTemplate } from "@/modules/cms/browser";

type CmsPageViewProps = {
  locale: string;
  slug: string;
};

/**
 * CMS-rendered page: fixed template structure via blocks.
 * Typography PageHero for inner pages — home keeps its own HeroCarousel only.
 */
export async function CmsPageView({ locale, slug }: CmsPageViewProps) {
  const page = await getCachedPublishedPage(slug, locale);
  const template = getPageTemplate(slug);
  const isHome = slug === "home" || slug === "";

  if (!page || page.blocks.length === 0) {
    return (
      <>
        {!isHome ? (
          <PageHero
            locale={locale}
            title={template?.label ?? "Page"}
            description={
              template?.description ??
              "This page will show content once published in Admin."
            }
            showCta={false}
          />
        ) : null}
        <PublicEmptyState
          locale={locale}
          title="No published sections yet."
          description="Editors fill fixed template sections in Admin → Pages. Nothing is broken."
          primary={{ label: "Contact / RFQ", href: "contact" }}
          secondary={{ label: "Back to Home", href: "", variant: "outline" }}
        />
      </>
    );
  }

  return (
    <>
      {!isHome ? (
        <PageHero
          locale={locale}
          title={page.title || template?.label || "HG Alutech"}
          description={page.seo?.description || template?.description}
          showCta={false}
        />
      ) : null}
      <CmsPageBlocks blocks={page.blocks} locale={locale} />
    </>
  );
}

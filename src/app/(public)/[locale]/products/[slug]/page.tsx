import type { Metadata } from "next";

import { ProductDetail } from "@/features/public-catalog";
import { getCachedPublishedProductBySlug } from "@/features/public-site/lib/public-cache";

/** Always render from current build — avoid stale sticky-RFQ shells. */
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCachedPublishedProductBySlug(slug);
  if (!product) {
    return {
      title: "Product",
      description: "Product details from the HG catalogue.",
    };
  }

  const title = product.seo?.title?.trim() || product.name.en;
  const description =
    product.seo?.description?.trim() ||
    product.description?.trim() ||
    `${product.name.en} (${product.sku}) — HG Alutech catalogue.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(product.imageUrl
        ? { images: [{ url: product.imageUrl, alt: product.name.en }] }
        : {}),
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale, slug } = await params;
  return <ProductDetail locale={locale} slug={slug} />;
}

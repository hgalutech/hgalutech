import { loadEnvLocal } from "./load-env-local";
loadEnvLocal();

import { createPage, getPageBySlug, publishPage, updatePage } from "@/modules/cms";
import { homeContentEn } from "@/features/public-home/content/home.en";
import type { BlockType } from "@/modules/cms";

function blocksFromHomeContent() {
  const c = homeContentEn;
  return [
    {
      id: "hero",
      type: "hero" as BlockType,
      order: 0,
      appearance: "default" as const,
      data: c.hero,
    },
    {
      id: "capability",
      type: "capability" as BlockType,
      order: 1,
      appearance: "default" as const,
      data: c.capability,
    },
    {
      id: "products",
      type: "products" as BlockType,
      order: 2,
      appearance: "default" as const,
      data: c.products,
    },
    {
      id: "markets",
      type: "markets" as BlockType,
      order: 3,
      appearance: "default" as const,
      data: { seeded: true },
    },
    {
      id: "mission",
      type: "mission" as BlockType,
      order: 4,
      appearance: "default" as const,
      data: {
        ...c.mission,
        videoSrc: c.hero.slides[0]?.video?.src ?? "",
        videoPoster: c.hero.slides[0]?.video?.posterSrc ?? "",
      },
    },
    {
      id: "cta-banner",
      type: "cta-banner" as BlockType,
      order: 5,
      appearance: "default" as const,
      data: c.ctaBanner,
    },
    {
      id: "testimonials",
      type: "testimonials" as BlockType,
      order: 6,
      appearance: "default" as const,
      data: c.testimonials,
    },
    {
      id: "customers",
      type: "customers" as BlockType,
      order: 7,
      appearance: "default" as const,
      data: c.customers,
    },
    {
      id: "joint-ventures",
      type: "joint-ventures" as BlockType,
      order: 8,
      appearance: "default" as const,
      data: c.jointVentures,
    },
    {
      id: "careers-teaser",
      type: "careers-teaser" as BlockType,
      order: 9,
      appearance: "default" as const,
      data: c.careers,
    },
    {
      id: "faq",
      type: "faq" as BlockType,
      order: 10,
      appearance: "default" as const,
      data: c.faq,
    },
  ];
}

async function main() {
  const existing = await getPageBySlug("home", "en");
  const blocks = blocksFromHomeContent();
  let id: string;
  let version: number;
  if (existing) {
    const result = await updatePage(existing.id, {
      title: "Home",
      slug: "home",
      blocks,
      createRedirectOnSlugChange: false,
      version: existing.version,
    });
    if ("error" in result) {
      console.error(result);
      process.exit(1);
    }
    id = result.page.id;
    version = result.page.version;
    console.log(JSON.stringify({ updated: true, id }, null, 2));
  } else {
    const page = await createPage({
      title: "Home",
      slug: "home",
      locale: "en",
      blocks,
    });
    id = page.id;
    version = page.version;
    console.log(JSON.stringify({ created: true, id }, null, 2));
  }
  const published = await publishPage(id, version);
  if ("error" in published) {
    console.error(published);
    process.exit(1);
  }
  console.log(JSON.stringify({ published: true, id }, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .then(async () => {
    const mongoose = await import("mongoose");
    await mongoose.default.disconnect().catch(() => undefined);
    process.exit(0);
  });

/**
 * Seed every built CMS shell page with integrated corporate blocks.
 * Idempotent: creates or updates + publishes.
 */
import { loadEnvLocal } from "./load-env-local";
loadEnvLocal();

import { createPage, getPageBySlug, publishPage, type BlockType } from "@/modules/cms";

type Shell = {
  slug: string;
  title: string;
  description: string;
  blocks: Array<{
    id: string;
    type: BlockType;
    order: number;
    appearance: "default";
    data: Record<string, unknown>;
  }>;
};

const shells: Shell[] = [
  {
    slug: "about",
    title: "About HG Alutech",
    description: "About HG Alutech",
    blocks: [
      {
        id: "a-facts",
        type: "company-facts",
        order: 0,
        appearance: "default",
        data: { seeded: true },
      },
      {
        id: "a-stats",
        type: "stats",
        order: 1,
        appearance: "default",
        data: { seeded: true },
      },
      {
        id: "a-lead",
        type: "leadership-grid",
        order: 2,
        appearance: "default",
        data: { seeded: true },
      },
      {
        id: "a-certs",
        type: "cert-grid",
        order: 3,
        appearance: "default",
        data: { seeded: true },
      },
      {
        id: "a-exp",
        type: "expansion-roadmap",
        order: 4,
        appearance: "default",
        data: { seeded: true },
      },
    ],
  },
  {
    slug: "journey",
    title: "Our Journey",
    description: "Company journey and milestones",
    blocks: [
      {
        id: "j-facts",
        type: "company-facts",
        order: 0,
        appearance: "default",
        data: { seeded: true },
      },
      {
        id: "j-stats",
        type: "stats",
        order: 1,
        appearance: "default",
        data: { seeded: true },
      },
    ],
  },
  {
    slug: "industries",
    title: "Industries & Applications",
    description: "Markets we serve",
    blocks: [
      {
        id: "i-stats",
        type: "stats",
        order: 0,
        appearance: "default",
        data: { seeded: true },
      },
      {
        id: "i-gallery",
        type: "gallery",
        order: 1,
        appearance: "default",
        data: { seeded: true },
      },
    ],
  },
  {
    slug: "manufacturing",
    title: "Manufacturing & Infrastructure",
    description: "Plant and infrastructure",
    blocks: [
      {
        id: "m-stats",
        type: "stats",
        order: 0,
        appearance: "default",
        data: { seeded: true },
      },
      {
        id: "m-certs",
        type: "cert-grid",
        order: 1,
        appearance: "default",
        data: { seeded: true },
      },
    ],
  },
  {
    slug: "quality",
    title: "Quality & Certifications",
    description: "Quality systems",
    blocks: [
      {
        id: "q-certs",
        type: "cert-grid",
        order: 0,
        appearance: "default",
        data: { seeded: true },
      },
      {
        id: "q-facts",
        type: "company-facts",
        order: 1,
        appearance: "default",
        data: { seeded: true },
      },
    ],
  },
  {
    slug: "sustainability",
    title: "Sustainability / ESG",
    description: "ESG and sustainability",
    blocks: [
      {
        id: "s-metrics",
        type: "sustainability-metrics",
        order: 0,
        appearance: "default",
        data: { seeded: true },
      },
    ],
  },
  {
    slug: "procurement",
    title: "Global Procurement & Export",
    description: "Procurement and export",
    blocks: [
      {
        id: "p-facts",
        type: "company-facts",
        order: 0,
        appearance: "default",
        data: { seeded: true },
      },
    ],
  },
  {
    slug: "careers",
    title: "Careers",
    description: "Careers at HG",
    blocks: [
      {
        id: "c-facts",
        type: "company-facts",
        order: 0,
        appearance: "default",
        data: { seeded: true },
      },
    ],
  },
  {
    slug: "resources",
    title: "Resources / Downloads",
    description: "Resources",
    blocks: [
      {
        id: "r-certs",
        type: "cert-grid",
        order: 0,
        appearance: "default",
        data: { seeded: true },
      },
    ],
  },
  {
    slug: "contact",
    title: "Contact Us / RFQ",
    description: "Contact and RFQ",
    blocks: [
      {
        id: "ct-facts",
        type: "company-facts",
        order: 0,
        appearance: "default",
        data: { seeded: true },
      },
    ],
  },
  {
    slug: "products/billets",
    title: "Aluminium Billets",
    description: "Extrusion-ready billets",
    blocks: [
      {
        id: "b-stats",
        type: "stats",
        order: 0,
        appearance: "default",
        data: { seeded: true },
      },
      {
        id: "b-certs",
        type: "cert-grid",
        order: 1,
        appearance: "default",
        data: { seeded: true },
      },
    ],
  },
  {
    slug: "products/ingots-alloys",
    title: "Ingots & Alloys",
    description: "Remelt ingots and alloys",
    blocks: [
      {
        id: "ia-stats",
        type: "stats",
        order: 0,
        appearance: "default",
        data: { seeded: true },
      },
      {
        id: "ia-certs",
        type: "cert-grid",
        order: 1,
        appearance: "default",
        data: { seeded: true },
      },
    ],
  },
  {
    slug: "products/extrusion-profiles",
    title: "Extrusion Profiles",
    description: "Aluminium extrusion profiles",
    blocks: [
      {
        id: "ep-stats",
        type: "stats",
        order: 0,
        appearance: "default",
        data: { seeded: true },
      },
      {
        id: "ep-certs",
        type: "cert-grid",
        order: 1,
        appearance: "default",
        data: { seeded: true },
      },
    ],
  },
];

async function upsertShell(shell: Shell) {
  const existing = await getPageBySlug(shell.slug, "en");
  if (existing) {
    // Skip if already published with blocks — avoid Mixed-data bugs on update
    if (existing.status === "published" && existing.blocks.length > 0) {
      console.log(`  = ${shell.slug}`);
      return;
    }
    const { Page } = await import("@/modules/cms/repositories/mongo/page.model");
    await Page.deleteOne({ _id: existing.id });
  }
  const page = await createPage({
    title: shell.title,
    slug: shell.slug,
    locale: "en",
    seo: { title: shell.title, description: shell.description },
    blocks: shell.blocks,
  });
  const pub = await publishPage(page.id, page.version);
  if ("error" in pub) throw new Error(JSON.stringify(pub));
  console.log(`  + ${shell.slug}`);
}

async function main() {
  console.log("\n=== CMS shell pages ===\n");
  for (const shell of shells) {
    await upsertShell(shell);
  }
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

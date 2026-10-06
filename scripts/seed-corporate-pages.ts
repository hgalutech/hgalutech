/**
 * Seed corporate CMS narrative pages (about, journey, industries, etc.).
 * Idempotent by slug: create or update + publish.
 */
import { loadEnvLocal } from "./load-env-local";
loadEnvLocal();

import {
  createPage,
  getPageBySlug,
  publishPage,
  updatePage,
  type BlockType,
} from "@/modules/cms";

type Block = {
  id: string;
  type: BlockType;
  order: number;
  appearance: "default";
  data: Record<string, unknown>;
};

type PageSeed = {
  slug: string;
  title: string;
  description: string;
  blocks: Block[];
};

const entity = { seeded: true };

const pages: PageSeed[] = [
  {
    slug: "about",
    title: "Aluminium made for demanding programmes",
    description:
      "HG Alutech — aluminium ingots, cubes, shots, notch bars and deoxidizer products from Kadi / Mahesana, Gujarat.",
    blocks: [
      {
        id: "a-intro",
        type: "page-intro",
        order: 0,
        appearance: "default",
        data: {
          eyebrow: "Who we are",
          title: "Cast, homogenise and extrude — under one roof",
          body: "We cast, homogenise and extrude aluminium for architectural, industrial, solar and foundry customers. The campus focuses on reliable chemistry, dimensional control and programme delivery — from die development through mill certificates on every lot.",
          ctaLabel: "View products",
          ctaHref: "products",
        },
      },
      {
        id: "a-pillars",
        type: "pillar-list",
        order: 1,
        appearance: "default",
        data: {
          eyebrow: "Focus",
          title: "What buyers rely on",
          body: "",
          items: [
            {
              title: "Chemistry you can programme",
              body: "Cast and homogenised billets under the same roof as extrusion — lot identity from melt to mill certificate.",
            },
            {
              title: "Dies, dimensions, delivery",
              body: "Architectural, industrial and solar sections with CCD discipline and cut-to-length packing that survives the journey.",
            },
            {
              title: "Gujarat base, buyer-ready cadence",
              body: "Kadi / Mahesana operations built for repeat volume — not one-off spot metal with opaque origin.",
            },
          ],
        },
      },
      {
        id: "a-stats",
        type: "stats",
        order: 2,
        appearance: "default",
        data: entity,
      },
      {
        id: "a-facts",
        type: "company-facts",
        order: 3,
        appearance: "default",
        data: entity,
      },
      {
        id: "a-cta",
        type: "cta-banner",
        order: 4,
        appearance: "default",
        data: {
          title: "Talk to HG about your programme",
          ctaLabel: "Send RFQ",
          ctaHref: "contact",
        },
      },
    ],
  },
  {
    slug: "journey",
    title: "Built in Gujarat. Grown by programmes.",
    description:
      "From incorporation to a working extrusion and remelt platform — milestones that matter to buyers, not vanity timelines.",
    blocks: [
      {
        id: "j-intro",
        type: "page-intro",
        order: 0,
        appearance: "default",
        data: {
          eyebrow: "Our journey",
          title: "A short history of metal under control",
          body: "Each chapter is an operational step — plant, process, markets, then disclosed capacity. We keep the story scannable so engineers and procurement can place us quickly.",
          ctaLabel: "Expansion roadmap",
          ctaHref: "expansion",
        },
      },
      {
        id: "j-timeline",
        type: "timeline",
        order: 1,
        appearance: "default",
        data: {
          eyebrow: "Milestones",
          title: "Chapters that matter to buyers",
          body: "",
          items: [
            {
              year: "2018",
              title: "Company incorporation",
              body: "HG Alutech established to build secondary aluminium and extrusion capability in Gujarat — legal identity first, plant next.",
            },
            {
              year: "Plant",
              title: "Kadi / Mahesana campus online",
              body: "Factory at Laxmipura Nandasan, Taluka Kadi — melting, casting, homogenising and extrusion commissioned under one operational roof.",
            },
            {
              year: "Programmes",
              title: "Market-facing extrusion & remelt",
              body: "Repeat programmes across solar, infrastructure, industrial and cable buyers — chemistry control and mill certificates as the commercial language.",
            },
            {
              year: "Today",
              title: "Capacity with disclosure discipline",
              body: "Published metrics and roadmap projects only when verified or disclosure-approved — see Capacity and Expansion for the live numbers.",
            },
            {
              year: "Next",
              title: "Press & casting expansion",
              body: "Additional press and secondary casting programmes staged against demand — partnership and offtake conversations welcome.",
            },
          ],
        },
      },
    ],
  },
  {
    slug: "industries",
    title: "Industries We Serve",
    description:
      "From renewable energy and construction to engineering, transportation, electrical systems and metal processing — mapped to HG product families.",
    blocks: [
      {
        id: "i-intro",
        type: "page-intro",
        order: 0,
        appearance: "default",
        data: {
          eyebrow: "Industries We Serve",
          title: "Where our products are specified",
          body: "From renewable energy and construction to engineering, transportation, electrical systems and metal processing, HG Alutech supplies aluminium ingots and steel-deoxidation forms — cubes, shots, notch bars and deoxidizer products.",
          ctaLabel: "View products",
          ctaHref: "products",
        },
      },
      {
        id: "i-list",
        type: "industry-list",
        order: 1,
        appearance: "default",
        data: {
          eyebrow: "Sectors",
          title: "Industries we serve",
          body: "Current catalogue: aluminium ingots for foundry, casting and alloy manufacturing. Cubes, shots, notch bars and deoxidizer products for steel and deoxidation.",
          items: [
            {
              label: "Solar Energy",
              description:
                "Extrusion profiles for solar module frames, mounting rails, structural supports and tracker-related sections.",
              applications: [
                "Module frames",
                "Mounting rails",
                "Rooftop & utility structures",
              ],
              productHref: "products/aluminium-ingots",
            },
            {
              label: "Architecture & Construction",
              description:
                "Doors, windows, curtain walls, façades, partitions, railings and structural glazing profiles.",
              applications: ["Façade systems", "Fenestration", "Building trims"],
              productHref: "products/aluminium-ingots",
            },
            {
              label: "Aluminium Formwork",
              description:
                "High-strength profiles for reusable formwork panels, beams and monolithic building systems.",
              applications: ["Formwork panels", "Beam sections", "Mass housing systems"],
              productHref: "products/aluminium-ingots",
            },
            {
              label: "Industrial Engineering",
              description:
                "Machine frames, automation structures, conveyors, racks and custom mechanical profiles.",
              applications: ["Machine frames", "Automation", "Conveyor systems"],
              productHref: "products/aluminium-ingots",
            },
            {
              label: "Electrical & Power",
              description:
                "Heat sinks, enclosures, busbar housings and suitable conductor-grade aluminium when specified.",
              applications: ["Heat sinks", "Electrical enclosures", "Conductor feed"],
              productHref: "products/aluminium-ingots",
            },
            {
              label: "Automotive & Transportation",
              description:
                "Lightweight structural and mobility-related aluminium — subject to customer technical requirements.",
              applications: [
                "Structural profiles",
                "EV-related sections",
                "Transport sections",
              ],
              productHref: "products/aluminium-ingots",
            },
            {
              label: "Railways & Transport",
              description:
                "Lightweight aluminium extrusion profiles for railway, transportation and mobility applications.",
              applications: [
                "Railway profiles",
                "Transport sections",
                "Interior rail sections",
              ],
              productHref: "products/aluminium-ingots",
            },
            {
              label: "HVAC & Cryogenic",
              description:
                "Profiles for heat dissipation, HVAC, thermal management and specialized cryogenic engineering where grade allows.",
              applications: ["Heat sinks", "HVAC sections", "Thermal management"],
              productHref: "products/aluminium-ingots",
            },
            {
              label: "Aluminium Extrusion Manufacturers",
              description:
                "Homogenized aluminium billets engineered as raw material for extrusion manufacturers producing profiles for solar, architecture, industrial, automotive, electrical and transport applications.",
              applications: [
                "Extrusion billets",
                "6xxx series programmes",
                "Merchant press feed",
              ],
              productHref: "products/aluminium-ingots",
            },
            {
              label: "Foundry & Alloy Manufacturing",
              description:
                "Aluminium ingots and alloy products for foundries, die-casting, remelting units and secondary aluminium processors.",
              applications: ["Die casting", "Gravity casting", "Alloy remelting"],
              productHref: "products/aluminium-ingots",
            },
            {
              label: "Steel & Deoxidation Solutions",
              description:
                "Aluminium cubes, shots, notch bars and deoxidizer products for steelmaking deoxidation and metallurgical treatment.",
              applications: [
                "Steel deoxidation",
                "Metallurgical treatment",
                "Melt chemistry adjustment",
              ],
              productHref: "products/aluminium-deoxidizer",
            },
          ],
        },
      },
    ],
  },
  {
    slug: "manufacturing",
    title: "Infrastructure built around metal flow",
    description:
      "Integrated melting, casting and extrusion at our Kadi / Mahesana campus — process you can tour through an RFQ.",
    blocks: [
      {
        id: "m-intro",
        type: "page-intro",
        order: 0,
        appearance: "default",
        data: {
          eyebrow: "Infrastructure",
          title: "One campus. Four disciplined stages.",
          body: "Buyers evaluate plants by how metal moves — not by brochure floor area. This page maps the flow; Capacity publishes the verified numbers.",
          ctaLabel: "Capacity metrics",
          ctaHref: "capacity",
        },
      },
      {
        id: "m-steps",
        type: "numbered-steps",
        order: 1,
        appearance: "default",
        data: {
          eyebrow: "Process",
          title: "From charge to certificate",
          body: "Each stage has a job. Together they produce extrusion, billets and remelt with traceable release.",
          items: [
            {
              title: "Melt & chemistry",
              body: "Secondary pathways and melt practice tuned for billet and remelt programmes — identity held from charge to cast.",
            },
            {
              title: "Cast & homogenise",
              body: "Billet casting with homogenising cycles that set the extrusion window before metal ever sees a die.",
            },
            {
              title: "Extrude",
              body: "Press cycles with die control, temperature discipline and first-piece gates shared with QC.",
            },
            {
              title: "Finish & dispatch",
              body: "Cut-to-length, packing and mill certificates with every consignment — release criteria before wheels turn.",
            },
          ],
        },
      },
      {
        id: "m-campus",
        type: "pillar-list",
        order: 2,
        appearance: "default",
        data: {
          eyebrow: "Campus",
          title: "What “integrated” means here",
          body: "",
          items: [
            {
              title: "Integrated campus",
              body: "Melting, casting, homogenising and extrusion share one Gujarat site — fewer handoffs, clearer lot identity.",
            },
            {
              title: "Utilities that hold the line",
              body: "Hydraulics, furnaces and plant utilities maintained for uptime — process windows only matter if equipment does.",
            },
            {
              title: "QC adjacent to flow",
              body: "Dimensional and chemistry gates sit next to production — certificates are an output of the line, not an afterthought.",
            },
          ],
        },
      },
      {
        id: "m-stats",
        type: "stats",
        order: 3,
        appearance: "default",
        data: entity,
      },
      {
        id: "m-certs",
        type: "cert-grid",
        order: 4,
        appearance: "default",
        data: entity,
      },
    ],
  },
  {
    slug: "quality",
    title: "Quality that survives the buyer’s QA pack",
    description:
      "Process control, mill certificates and ISO-aligned practices — built for engineers who open the folder before they open the PO.",
    blocks: [
      {
        id: "q-intro",
        type: "page-intro",
        order: 0,
        appearance: "default",
        data: {
          eyebrow: "Quality systems",
          title: "Control the lot. Prove the lot. Ship the lot.",
          body: "Dimensional checks, chemistry verification and documented release criteria underpin extrusion and remelt programmes. Certificates are an output of the line — not a PDF bolted on after dispatch.",
          ctaLabel: "Request resources",
          ctaHref: "resources",
        },
      },
      {
        id: "q-gates",
        type: "numbered-steps",
        order: 1,
        appearance: "default",
        data: {
          eyebrow: "Release flow",
          title: "How a lot clears the gate",
          body: "Scannable stages — the same pattern top industrial suppliers use so procurement and plant QA share one mental model.",
          items: [
            {
              title: "Incoming & melt identity",
              body: "Charge and cast identity held so chemistry claims survive the shift handoff.",
            },
            {
              title: "In-process dimensional gates",
              body: "First-piece and running checks against drawings / CCD limits before volume continues.",
            },
            {
              title: "Release & mill certificates",
              body: "Documented release criteria; certificates travel with consignments for buyer QA packs.",
            },
            {
              title: "Audit & improvement loop",
              body: "ISO-aligned practices with scheduled third-party audits and NCR learning cycles.",
            },
          ],
        },
      },
      {
        id: "q-lab",
        type: "pillar-list",
        order: 2,
        appearance: "default",
        data: {
          eyebrow: "Lab & inspection",
          title: "What we measure when it matters",
          body: "",
          items: [
            {
              title: "Chemistry",
              body: "Spectro sampling aligned to programme requirements — not decorative lab photos.",
            },
            {
              title: "Mechanicals",
              body: "Hardness / tensile where the temper and alloy demand it for the lot.",
            },
            {
              title: "Surface & finish",
              body: "Visual and finish gates for architectural and anodising-bound sections.",
            },
          ],
        },
      },
      {
        id: "q-certs",
        type: "cert-grid",
        order: 3,
        appearance: "default",
        data: entity,
      },
    ],
  },
  {
    slug: "sustainability",
    title: "Sustainability with disclosure discipline",
    description:
      "Secondary aluminium pathways, responsible operations and transparent tiers — built for assessors and buyers who read footnotes.",
    blocks: [
      {
        id: "s-intro",
        type: "page-intro",
        order: 0,
        appearance: "default",
        data: {
          eyebrow: "Approach",
          title: "Clarity over green theatre",
          body: "Industrial buyers and ESG assessors need scannable truth. We publish what we can verify, name what we are working on, and keep commitments labelled as commitments.",
        },
      },
      {
        id: "s-pillars",
        type: "pillar-list",
        order: 1,
        appearance: "default",
        data: {
          eyebrow: "Principles",
          title: "How we talk about impact",
          body: "",
          items: [
            {
              title: "Secondary pathways",
              body: "Remelt reduces primary intensity for many applications — we say so only where the process actually uses secondary routes.",
            },
            {
              title: "Plant discipline",
              body: "Energy, scrap handling and process yield sit next to production KPIs — not in a separate brochure chapter.",
            },
            {
              title: "Disclosure tiers",
              body: "Verified metrics, named initiatives, or commitments — never unverified claims dressed as data.",
            },
          ],
        },
      },
      {
        id: "s-metrics",
        type: "sustainability-metrics",
        order: 2,
        appearance: "default",
        data: entity,
      },
    ],
  },
  {
    slug: "procurement",
    title: "Procurement & export without the black box",
    description:
      "A clear buyer path for domestic programmes and export enquiries — contacts, steps and packing expectations in one place.",
    blocks: [
      {
        id: "p-intro",
        type: "page-intro",
        order: 0,
        appearance: "default",
        data: {
          eyebrow: "How to buy",
          title: "Four steps from RFQ to programme",
          body: "Top B2B suppliers remove ambiguity: what to send, who answers, what happens next. Same pattern here.",
          ctaLabel: "Send RFQ",
          ctaHref: "contact",
        },
      },
      {
        id: "p-steps",
        type: "numbered-steps",
        order: 1,
        appearance: "default",
        data: {
          eyebrow: "Buyer path",
          title: "From enquiry to kickoff",
          body: "",
          items: [
            {
              title: "Share the programme",
              body: "Alloy, temper, geometry / SKU, monthly tonnage and destination — the RFQ fields that unlock a real answer.",
            },
            {
              title: "Feasibility & lead time",
              body: "We confirm die / casting feasibility, packing scope and certificate expectations against capacity.",
            },
            {
              title: "Commercial offer",
              body: "Price, Incoterms discussion and despatch cadence — domestic or export path named up front.",
            },
            {
              title: "Programme kickoff",
              body: "QC gates and logistics rhythm locked with your buyer and plant QA — not a one-shot spot deal.",
            },
          ],
        },
      },
      {
        id: "p-export",
        type: "pillar-list",
        order: 2,
        appearance: "default",
        data: {
          eyebrow: "Export",
          title: "What export buyers usually ask first",
          body: "",
          items: [
            {
              title: "Documentation ready",
              body: "Mill certificates, packing lists and commercial docs aligned to the consignment — request samples via Resources.",
            },
            {
              title: "Packing for distance",
              body: "Bundle, stretch and crate options tuned to profile geometry and destination risk.",
            },
            {
              title: "Corridor clarity",
              body: "Export enquiries route to a dedicated mailbox — sales owns domestic programmes.",
            },
          ],
        },
      },
      {
        id: "p-facts",
        type: "company-facts",
        order: 3,
        appearance: "default",
        data: entity,
      },
    ],
  },
  {
    slug: "resources",
    title: "Technical packs for serious RFQs",
    description:
      "Request datasheets, certificate samples and capability notes — gated by enquiry so packs stay current and relevant.",
    blocks: [
      {
        id: "r-intro",
        type: "page-intro",
        order: 0,
        appearance: "default",
        data: {
          eyebrow: "Resources",
          title: "Ask for the pack. Get the right files.",
          body: "FAANG-grade B2B sites treat downloads as a workflow, not a dusty FTP dump. Tell us which programme you are qualifying — we send the matching set.",
          ctaLabel: "Request a pack",
          ctaHref: "contact",
        },
      },
      {
        id: "r-packs",
        type: "resource-list",
        order: 1,
        appearance: "default",
        data: {
          eyebrow: "Packs",
          title: "What you can request",
          body: "",
          items: [
            {
              title: "Mill test certificate samples",
              body: "Example MTC layout for extrusion and billet lots — request the pack that matches your programme.",
              tag: "Certificates",
              requestHref: "contact",
            },
            {
              title: "Alloy / temper capability note",
              body: "Working window for common 6xxx grades and tempers on our press and billet lines.",
              tag: "Capability",
              requestHref: "contact",
            },
            {
              title: "Extrusion CCD & length guide",
              body: "Dimensional and cut-length guidance for RFQ geometry conversations.",
              tag: "Technical",
              requestHref: "contact",
            },
            {
              title: "Packing & logistics overview",
              body: "Bundle, stretch and crate options — what travels with the metal for domestic and export.",
              tag: "Logistics",
              requestHref: "contact",
            },
            {
              title: "ISO / QMS summary",
              body: "High-level quality system note aligned to published certifications.",
              tag: "Quality",
              requestHref: "contact",
            },
            {
              title: "RFQ field checklist",
              body: "Alloy, temper, CCD, tonnage, destination — the minimum set for a fast commercial answer.",
              tag: "Buying",
              requestHref: "contact",
            },
          ],
        },
      },
      {
        id: "r-certs",
        type: "cert-grid",
        order: 2,
        appearance: "default",
        data: entity,
      },
    ],
  },
];

async function ensurePage(seed: PageSeed) {
  const existing = await getPageBySlug(seed.slug, "en");
  const seo = { title: seed.title, description: seed.description };
  let id: string;
  let version: number;

  if (existing) {
    const result = await updatePage(existing.id, {
      title: seed.title,
      slug: seed.slug,
      blocks: seed.blocks,
      seo,
      createRedirectOnSlugChange: false,
      version: existing.version,
    });
    if ("error" in result) {
      console.error(seed.slug, result);
      process.exit(1);
    }
    id = result.page.id;
    version = result.page.version;
    console.log(JSON.stringify({ slug: seed.slug, updated: true, id }));
  } else {
    const page = await createPage({
      title: seed.title,
      slug: seed.slug,
      locale: "en",
      blocks: seed.blocks,
      seo,
    });
    id = page.id;
    version = page.version;
    console.log(JSON.stringify({ slug: seed.slug, created: true, id }));
  }

  const published = await publishPage(id, version);
  if ("error" in published) {
    console.error(seed.slug, published);
    process.exit(1);
  }
  console.log(JSON.stringify({ slug: seed.slug, published: true, id }));
}

async function main() {
  for (const page of pages) {
    await ensurePage(page);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .then(async () => {
    const mongoose = await import("mongoose");
    await mongoose.disconnect();
  });

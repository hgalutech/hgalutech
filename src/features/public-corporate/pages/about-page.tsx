import Link from "next/link";

import { Container } from "@/components/atoms/container";
import { Reveal } from "@/components/atoms/reveal";
import { Section } from "@/components/atoms/section";
import { localePath } from "@/config/nav.config";
import {
  CompanyFactsBlock,
  StatsBlock,
} from "@/features/public-corporate/components/corporate-pages";
import {
  FluidSplit,
  PillarList,
  SectionIntro,
  TextLinkRow,
} from "@/features/public-site/components/corp-kit";
import { InquireBand } from "@/features/public-site/components/inquire-band";
import { PageHero } from "@/features/public-site/components/page-hero";

const PILLARS = [
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
] as const;

export async function AboutPage({ locale }: { locale: string }) {
  return (
    <>
      <PageHero
        locale={locale}
        title="Aluminium made for demanding programmes"
        description="HG Alutek — aluminium ingots, cubes, shots, notch bars and deoxidizer products from Kadi / Mahesana, Gujarat."
        secondaryLabel="View products"
        secondaryHref="products"
      />

      <Section>
        <Container>
          <SectionIntro
            eyebrow="Who we are"
            title="Cast, homogenise and extrude — under one roof"
            body="We cast, homogenise and extrude aluminium for architectural, industrial, solar and foundry customers. The campus focuses on reliable chemistry, dimensional control and programme delivery — from die development through mill certificates on every lot."
          />
          <PillarList items={PILLARS} />
          <Reveal className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            <TextLinkRow locale={locale} href="leadership" label="Leadership" />
            <TextLinkRow locale={locale} href="capacity" label="Capacity" />
            <TextLinkRow locale={locale} href="journey" label="Our journey" />
            <TextLinkRow locale={locale} href="manufacturing" label="Infrastructure" />
          </Reveal>
        </Container>
      </Section>

      <StatsBlock />
      <CompanyFactsBlock />

      <Section appearance="tinted">
        <Container>
          <FluidSplit>
            <SectionIntro
              eyebrow="How buyers use this site"
              title="Specs first. Claims second. RFQ when ready."
              body="Explore capacity and quality systems, pull resources for your pack, then send alloy, temper and volume — sales answers with feasibility and lead time."
            />
            <Reveal className="flex flex-wrap gap-3 self-end">
              <Link
                href={localePath(locale, "quality")}
                className="bg-ink hover:bg-ink/90 inline-flex min-h-11 items-center rounded-[var(--radius-md)] px-5 text-[0.875rem] font-semibold text-white transition-colors"
              >
                Quality systems
              </Link>
              <Link
                href={localePath(locale, "contact")}
                className="border-line hover:bg-surface inline-flex min-h-11 items-center rounded-[var(--radius-md)] border bg-white px-5 text-[0.875rem] font-semibold text-ink transition-colors"
              >
                Send RFQ
              </Link>
            </Reveal>
          </FluidSplit>
        </Container>
      </Section>

      <InquireBand locale={locale} title="Talk to HG about your programme" />
    </>
  );
}

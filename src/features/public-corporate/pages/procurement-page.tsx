import { Container } from "@/components/atoms/container";
import { Reveal } from "@/components/atoms/reveal";
import { Section } from "@/components/atoms/section";
import { getCachedCompanyProfile } from "@/features/public-corporate/lib/public-cache";
import {
  FluidAutoGrid,
  FluidSplit,
  NumberedRail,
  SectionIntro,
} from "@/features/public-site/components/corp-kit";
import { InquireBand } from "@/features/public-site/components/inquire-band";
import { PageHero } from "@/features/public-site/components/page-hero";

const BUY_STEPS = [
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
] as const;

const EXPORT = [
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
    body: "Export and domestic enquiries both reach the sales inbox.",
  },
] as const;

export async function ProcurementPage({ locale }: { locale: string }) {
  const profile = await getCachedCompanyProfile();
  const contacts = [
    { key: "sales", label: "Sales", value: profile?.emails.sales?.trim() },
    { key: "export", label: "Export", value: profile?.emails.export?.trim() },
    { key: "purchase", label: "Purchase", value: profile?.emails.purchase?.trim() },
  ].filter(
    (c, index, all): c is { key: string; label: string; value: string } =>
      Boolean(c.value) && all.findIndex((item) => item.value === c.value) === index,
  );

  return (
    <>
      <PageHero
        locale={locale}
        title="Procurement & export without the black box"
        description="A clear buyer path for domestic programmes and export enquiries — contacts, steps and packing expectations in one place."
        ctaLabel="Send RFQ"
        ctaHref="contact"
      />

      <Section>
        <Container>
          <FluidSplit>
            <div>
              <SectionIntro
                eyebrow="How to buy"
                title="Four steps from RFQ to programme"
                body="Top B2B suppliers remove ambiguity: what to send, who answers, what happens next. Same pattern here."
              />
              <div className="mt-8">
                <NumberedRail items={BUY_STEPS} />
              </div>
            </div>
            <Reveal>
              <div className="border-line rounded-[var(--radius-lg)] border bg-white p-[clamp(1.25rem,3vw,1.75rem)]">
                <p className="text-[0.7rem] font-bold tracking-[0.12em] text-brand-blue uppercase">
                  Direct lines
                </p>
                <ul className="mt-4 space-y-3">
                  {contacts.length ? (
                    contacts.map((c) => (
                      <li key={c.key}>
                        <span className="text-muted-foreground text-sm">{c.label}</span>
                        <a
                          href={`mailto:${c.value}`}
                          className="mt-0.5 block font-semibold text-ink hover:underline"
                        >
                          {c.value}
                        </a>
                      </li>
                    ))
                  ) : (
                    <li className="text-muted-foreground text-sm">
                      Contact emails publish with the company profile.
                    </li>
                  )}
                </ul>
              </div>
            </Reveal>
          </FluidSplit>
        </Container>
      </Section>

      <Section className="bg-bg-alt/40">
        <Container>
          <SectionIntro eyebrow="Export" title="What export buyers usually ask first" />
          <FluidAutoGrid min="15rem" className="mt-8">
            {EXPORT.map((item) => (
              <div key={item.title} className="border-t-2 border-brand-blue/55 pt-4">
                <p className="font-semibold text-ink">{item.title}</p>
                <p className="text-muted-foreground mt-2 text-[0.9375rem] leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </FluidAutoGrid>
        </Container>
      </Section>

      <InquireBand locale={locale} title="Ready with an RFQ?" ctaLabel="Enquire" />
    </>
  );
}

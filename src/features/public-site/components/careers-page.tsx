import Link from "next/link";

import { Container } from "@/components/atoms/container";
import { Eyebrow } from "@/components/atoms/eyebrow";
import { Reveal } from "@/components/atoms/reveal";
import { Section } from "@/components/atoms/section";
import { localePath } from "@/config/nav.config";
import {
  getCachedCompanyProfile,
  getCachedPublishedOpenings,
} from "@/features/public-corporate/lib/public-cache";
import { PublicEmptyState } from "@/features/public-site/components/cms-empty-state";
import { InquireBand } from "@/features/public-site/components/inquire-band";
import { OpenRolesBoard } from "@/features/public-site/components/open-roles-board";
import { PageHero } from "@/features/public-site/components/page-hero";

const LIFE = [
  {
    title: "Safety first, every shift",
    body: "Plant discipline, PPE culture and process control — the same standards we promise customers.",
  },
  {
    title: "Craft at industrial scale",
    body: "Extrusion, homogenising and remelt work that rewards people who care about metal, dies and finish.",
  },
  {
    title: "Grow with capacity",
    body: "As presses and billets expand, operators, QC and commercial roles grow with the programme.",
  },
] as const;

export async function CareersPage({ locale }: { locale: string }) {
  const [profile, openingsResult] = await Promise.all([
    getCachedCompanyProfile(),
    getCachedPublishedOpenings(),
  ]);
  const openings = openingsResult.items;
  const hrEmail = profile?.emails.hr ?? null;
  const contactHref = localePath(locale, "contact");

  return (
    <>
      <PageHero
        locale={locale}
        title="Build aluminium with people who take craft seriously"
        description="Open roles across operations, quality, maintenance and commercial — at our Kadi / Mahesana plant and supporting teams."
        ctaLabel="Browse open roles"
        ctaHref="careers#open-roles"
        secondaryLabel="Contact HR"
        secondaryHref="contact"
      />

      <Section>
        <Container className="max-w-3xl">
          <Reveal>
            <Eyebrow>Life at HG</Eyebrow>
            <h2 className="text-fs-h2 mt-2.5 text-balance">
              A growing Gujarat manufacturer, not a desk-only brochure
            </h2>
            <p className="text-fs-lead text-muted-foreground mt-3.5 max-w-[42ch]">
              We hire for the floor and the office — people who can run a press shift,
              hold a QC gate, keep hydraulics honest, or carry a customer programme.
            </p>
            <ul className="mt-8 space-y-5">
              {LIFE.map((item) => (
                <li key={item.title}>
                  <p className="font-semibold text-ink">{item.title}</p>
                  <p className="text-muted-foreground mt-1 text-[0.9375rem] leading-relaxed">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </Section>

      <Section id="open-roles" className="bg-bg-alt/40">
        <Container>
          <Reveal>
            <Eyebrow>Open roles</Eyebrow>
            <h2 className="text-fs-h2 mt-2.5 text-balance">
              Find a team that matches how you work
            </h2>
            <p className="text-fs-lead text-muted-foreground mt-3 max-w-[48ch]">
              Filter by department, open a role for scope, then apply by email — the same
              path used by serious industrial employers, without a black-box ATS.
            </p>
          </Reveal>
          <div className="mt-8">
            {openings.length ? (
              <OpenRolesBoard
                openings={openings}
                hrEmail={hrEmail}
                contactHref={contactHref}
              />
            ) : (
              <PublicEmptyState
                locale={locale}
                density="section"
                title="No open roles yet."
                description="Published openings appear here when HR posts them in Admin. Open applications are still welcome below."
                primary={{ label: "Contact HR", href: "contact" }}
              />
            )}
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="max-w-3xl">
          <Reveal>
            <Eyebrow>Open application</Eyebrow>
            <h2 className="text-fs-h2 mt-2.5 text-balance">Don&apos;t see your role?</h2>
            <p className="text-muted-foreground mt-3 text-[1.05rem] leading-relaxed">
              Capacity and finishing programmes open new seats through the year. Send a
              short note and CV — we keep strong profiles for matching openings.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {hrEmail ? (
                <a
                  href={`mailto:${hrEmail}?subject=${encodeURIComponent("Open application — HG Alutech")}`}
                  className="bg-ink hover:bg-ink/90 inline-flex min-h-11 items-center rounded-[var(--radius-md)] px-5 text-[0.875rem] font-semibold text-white transition-colors"
                >
                  Email HR
                </a>
              ) : null}
              <Link
                href={contactHref}
                className="border-line hover:bg-bg-alt inline-flex min-h-11 items-center rounded-[var(--radius-md)] border bg-white px-5 text-[0.875rem] font-semibold text-ink transition-colors"
              >
                Contact form
              </Link>
            </div>
            {hrEmail ? (
              <p className="text-muted-foreground mt-4 text-sm">
                HR:{" "}
                <a
                  className="font-semibold text-ink hover:underline"
                  href={`mailto:${hrEmail}`}
                >
                  {hrEmail}
                </a>
              </p>
            ) : null}
          </Reveal>
        </Container>
      </Section>

      <InquireBand locale={locale} title="Introduce yourself to HG" />
    </>
  );
}

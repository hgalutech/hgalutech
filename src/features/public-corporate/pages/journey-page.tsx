import Link from "next/link";

import { Container } from "@/components/atoms/container";
import { Eyebrow } from "@/components/atoms/eyebrow";
import { Reveal } from "@/components/atoms/reveal";
import { Section } from "@/components/atoms/section";
import { localePath } from "@/config/nav.config";
import { FluidSplit, SectionIntro } from "@/features/public-site/components/corp-kit";
import { InquireBand } from "@/features/public-site/components/inquire-band";
import { PageHero } from "@/features/public-site/components/page-hero";
import { cn } from "@/lib/utils";

const MILESTONES = [
  {
    year: "2018",
    title: "Company incorporation",
    body: "HG Alutek established to build secondary aluminium and extrusion capability in Gujarat — legal identity first, plant next.",
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
] as const;

export async function JourneyPage({ locale }: { locale: string }) {
  return (
    <>
      <PageHero
        locale={locale}
        title="Built in Gujarat. Grown by programmes."
        description="From incorporation to a working extrusion and remelt platform — milestones that matter to buyers, not vanity timelines."
        secondaryLabel="Expansion roadmap"
        secondaryHref="expansion"
      />

      <Section>
        <Container>
          <SectionIntro
            eyebrow="Our journey"
            title="A short history of metal under control"
            body="Each chapter is an operational step — plant, process, markets, then disclosed capacity. We keep the story scannable so engineers and procurement can place us quickly."
          />
        </Container>
      </Section>

      <Section appearance="compact" className="pt-0">
        <Container>
          <ol className="space-y-[clamp(2.5rem,6vw,4.5rem)]">
            {MILESTONES.map((m, i) => (
              <li
                key={m.title}
                className={cn(
                  "max-w-[42rem]",
                  i % 2 === 1 && "min-[768px]:ml-auto min-[768px]:text-right",
                )}
              >
                <Reveal>
                  <Eyebrow>{m.year}</Eyebrow>
                  <h3 className="text-fs-h3 mt-2 text-balance">{m.title}</h3>
                  <p
                    className={cn(
                      "text-muted-foreground mt-3 max-w-[42ch] text-[1.02rem] leading-relaxed",
                      i % 2 === 1 && "min-[768px]:ml-auto",
                    )}
                  >
                    {m.body}
                  </p>
                </Reveal>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section className="bg-bg-alt/50">
        <Container>
          <FluidSplit>
            <SectionIntro
              eyebrow="Where this goes next"
              title="Capacity you can plan against"
              body="Live metrics and disclosure-gated projects sit on dedicated pages — this journey page stays narrative; those pages stay numerical."
            />
            <Reveal className="flex flex-wrap gap-3 self-end">
              <Link
                href={localePath(locale, "capacity")}
                className="bg-brand-blue hover:bg-brand-blue-dark inline-flex min-h-11 items-center rounded-[var(--radius-md)] px-5 text-[0.875rem] font-semibold text-white transition-colors"
              >
                Capacity
              </Link>
              <Link
                href={localePath(locale, "expansion")}
                className="border-line hover:bg-white inline-flex min-h-11 items-center rounded-[var(--radius-md)] border bg-white/80 px-5 text-[0.875rem] font-semibold text-ink transition-colors"
              >
                Expansion
              </Link>
            </Reveal>
          </FluidSplit>
        </Container>
      </Section>

      <InquireBand locale={locale} />
    </>
  );
}

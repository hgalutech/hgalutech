import type { Metadata } from "next";
import Image from "next/image";

import { Container } from "@/components/atoms/container";
import { PageHero } from "@/features/public-site/components/page-hero";
import { Section } from "@/components/atoms/section";
import { getCachedPublishedChairmen } from "@/features/public-corporate/lib/public-cache";
import { PublicEmptyState } from "@/features/public-site/components/cms-empty-state";
import { CATALOGUE_PLACEHOLDER } from "@/lib/media/resolve-media-url";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Chairman’s Message",
  description: "Messages from the leadership of HG Alutek.",
};

export default async function ChairmansMessagePage({ params }: PageProps) {
  const { locale } = await params;
  const chairmen = await getCachedPublishedChairmen();

  return (
    <>
      <PageHero
        locale={locale}
        title="Chairman’s Message"
        description="Leadership messages from HG Alutek."
        ctaLabel="Contact us"
        ctaHref="contact"
      />
      <Section>
        <Container className="max-w-5xl space-y-16">
          {chairmen.length === 0 ? (
            <PublicEmptyState
              locale={locale}
              density="section"
              title="No chairman messages yet."
              description="Publish people marked for the Chairman’s Message page in Admin → People."
              primary={{ label: "Contact / RFQ", href: "contact" }}
            />
          ) : null}
          {chairmen.map((person) => {
            const photo = person.photoUrl?.trim() || CATALOGUE_PLACEHOLDER;
            return (
              <article
                key={person.id}
                className="grid gap-8 min-[800px]:grid-cols-[14rem_1fr] min-[800px]:items-start"
              >
                <div className="relative mx-auto aspect-[3/4] w-full max-w-[14rem] overflow-hidden rounded-[var(--radius-lg)] bg-muted">
                  <Image
                    src={photo}
                    alt={person.name.en}
                    fill
                    className="object-cover"
                    sizes="14rem"
                  />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-ink">
                    {person.name.en}
                  </h2>
                  <p className="text-brand mt-1 text-sm font-medium">
                    {person.boardDesignation ||
                      (person.role === "chairman" ? "Chairman" : person.role)}
                  </p>
                  <div className="text-muted-foreground mt-6 space-y-4 text-base leading-relaxed whitespace-pre-line">
                    {person.bio?.en?.trim() || "Message coming soon."}
                  </div>
                </div>
              </article>
            );
          })}
        </Container>
      </Section>
    </>
  );
}

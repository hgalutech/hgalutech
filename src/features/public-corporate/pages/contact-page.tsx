import { Mail, MapPin, Phone } from "lucide-react";

import { Container } from "@/components/atoms/container";
import { Reveal } from "@/components/atoms/reveal";
import { Section } from "@/components/atoms/section";
import { getCachedCompanyProfile } from "@/features/public-corporate/lib/public-cache";
import { EnquiryForm } from "@/features/public-site/components/enquiry-form";

function formatAddress(parts?: {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}) {
  if (!parts) return "";
  return [
    parts.line1,
    parts.line2,
    [parts.city, parts.state].filter(Boolean).join(", "),
    parts.postalCode,
    parts.country,
  ]
    .filter(Boolean)
    .join(", ");
}

export async function ContactPage({
  locale,
  defaultProduct,
}: {
  locale: string;
  defaultProduct?: string;
}) {
  const profile = await getCachedCompanyProfile();
  const salesEmail = profile?.emails?.sales?.trim() || "";
  const exportEmail = profile?.emails?.export?.trim() || "";
  const phones = profile?.phones?.filter((p) => p.number?.trim()) ?? [];
  const officeAddress =
    formatAddress(profile?.registeredOffice) || formatAddress(profile?.factoryAddress);
  const locations =
    profile?.locations?.filter((l) => l.embedUrl || l.mapsUrl || l.address) ?? [];
  const fallbackQuery =
    profile?.registeredOffice?.line1 || "Laxmipura Nandasan Kadi Mahesana Gujarat";
  const primaryLocation =
    locations[0] ??
    ({
      id: "default",
      label: "Plant / office",
      address: officeAddress,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallbackQuery)}`,
      embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(fallbackQuery)}&z=14&output=embed`,
      order: 0,
    } as const);

  return (
    <>
      <header className="border-line border-b bg-bg">
        <Container className="py-[clamp(1.35rem,3vw,2rem)]">
          <p className="text-[0.7rem] font-bold tracking-[0.14em] text-brand-red uppercase">
            HG Alutech
          </p>
          <h1 className="font-display mt-1.5 text-[clamp(1.5rem,1.2rem+1.2vw,2rem)] font-semibold tracking-tight text-ink">
            Contact
          </h1>
          <p className="text-muted-foreground mt-2 max-w-[36rem] text-[0.9375rem] leading-relaxed">
            Share alloy, geometry and volume — we confirm feasibility and lead time before
            a commercial offer.
          </p>
        </Container>
      </header>

      <Section appearance="compact">
        <Container>
          <div className="grid gap-8 min-[900px]:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.85fr)] min-[900px]:gap-10 min-[1100px]:gap-14">
            <Reveal>
              <div className="mb-5">
                <p className="text-[0.7rem] font-bold tracking-[0.12em] text-brand-blue uppercase">
                  RFQ
                </p>
                <h2 className="font-display mt-1.5 text-[clamp(1.25rem,1.05rem+0.8vw,1.5rem)] font-semibold tracking-tight text-ink">
                  Programme brief
                </h2>
              </div>
              <EnquiryForm
                locale={locale}
                defaultProduct={defaultProduct}
                className="border-line rounded-[var(--radius-lg)] border bg-surface p-4 shadow-[var(--shadow-sm)] sm:p-5"
              />
              <p className="text-muted-foreground mt-4 text-[0.8125rem] leading-relaxed">
                Feasibility first, quote second — the same cadence industrial buyers
                expect.
              </p>
            </Reveal>

            <aside className="min-[900px]:sticky min-[900px]:top-24 min-[900px]:self-start">
              <Reveal className="border-line space-y-5 rounded-[var(--radius-lg)] border bg-bg-alt/50 p-4 sm:p-5">
                <div>
                  <h2 className="font-display text-base font-semibold text-ink">
                    {profile?.displayNames?.primary || profile?.legalName || "HG Alutech"}
                  </h2>
                  {profile?.legalName &&
                  profile.legalName !== profile.displayNames?.primary ? (
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {profile.legalName}
                    </p>
                  ) : null}
                </div>

                <ul className="space-y-3 text-sm">
                  {officeAddress ? (
                    <li className="flex gap-2.5">
                      <MapPin className="text-brand-red mt-0.5 size-4 shrink-0" />
                      <span className="text-muted-foreground leading-relaxed">
                        {officeAddress}
                      </span>
                    </li>
                  ) : null}
                  {phones.slice(0, 2).map((p) => (
                    <li key={`${p.label}-${p.number}`} className="flex gap-2.5">
                      <Phone className="text-brand-red mt-0.5 size-4 shrink-0" />
                      <div>
                        {p.label ? (
                          <span className="text-text-faint block text-[0.7rem] uppercase tracking-wide">
                            {p.label}
                          </span>
                        ) : null}
                        <a
                          href={`tel:${p.number.replace(/\s/g, "")}`}
                          className="font-medium text-ink hover:underline"
                        >
                          {p.number}
                        </a>
                      </div>
                    </li>
                  ))}
                  {salesEmail ? (
                    <li className="flex gap-2.5">
                      <Mail className="text-brand-red mt-0.5 size-4 shrink-0" />
                      <div>
                        <span className="text-text-faint block text-[0.7rem] uppercase tracking-wide">
                          Sales
                        </span>
                        <a
                          href={`mailto:${salesEmail}`}
                          className="font-medium break-all text-ink hover:underline"
                        >
                          {salesEmail}
                        </a>
                      </div>
                    </li>
                  ) : null}
                  {exportEmail && exportEmail !== salesEmail ? (
                    <li className="flex gap-2.5">
                      <Mail className="text-brand-red mt-0.5 size-4 shrink-0" />
                      <div>
                        <span className="text-text-faint block text-[0.7rem] uppercase tracking-wide">
                          Export
                        </span>
                        <a
                          href={`mailto:${exportEmail}`}
                          className="font-medium break-all text-ink hover:underline"
                        >
                          {exportEmail}
                        </a>
                      </div>
                    </li>
                  ) : null}
                </ul>

                {primaryLocation.embedUrl ? (
                  <div className="border-line border-t pt-4">
                    <p className="text-text-faint mb-2.5 text-[0.7rem] font-semibold tracking-[0.1em] uppercase">
                      Location
                    </p>
                    <div className="border-line overflow-hidden rounded-[var(--radius-md)] border">
                      <iframe
                        title={`Map — ${primaryLocation.label || "Location"}`}
                        src={primaryLocation.embedUrl}
                        className="aspect-[16/9] w-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        allowFullScreen
                      />
                    </div>
                    {primaryLocation.mapsUrl ? (
                      <a
                        href={primaryLocation.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-blue mt-2 inline-flex text-sm font-semibold underline-offset-2 hover:underline"
                      >
                        Open in Maps
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </Reveal>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}

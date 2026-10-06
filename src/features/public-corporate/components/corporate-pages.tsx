import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/atoms/container";
import { Section } from "@/components/atoms/section";
import { InquireBand } from "@/features/public-site/components/inquire-band";
import { LogoMarquee } from "@/features/public-site/components/logo-marquee";
import { PageHero } from "@/features/public-site/components/page-hero";
import { PublicEmptyState } from "@/features/public-site/components/cms-empty-state";
import {
  getCachedPublishedCapacity,
  getCachedPublishedCertifications,
  getCachedPublishedLogos,
  getCachedPublishedPeople,
  getCachedPublishedSustainability,
  getCachedCompanyProfile,
  getCachedPublishedExpansion,
} from "@/features/public-corporate/lib/public-cache";
import { localePath } from "@/config/nav.config";
import type { Address, CompanyProfileDTO } from "@/modules/corporate/types";

function formatAddress(a: Address) {
  return [a.line1, a.line2, `${a.city}, ${a.state} ${a.postalCode}`, a.country]
    .filter(Boolean)
    .join(", ");
}

function roleLabel(role: string) {
  return role.replace(/_/g, " ");
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Curated executive portraits fallback when photos are not yet uploaded in Admin Desk. */
const DEFAULT_LEADERSHIP_PHOTOS: Record<string, string> = {
  "rajeshbhai-patel":
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
  "hardik-patel":
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
  "nirav-shah":
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80",
  "priya-mehta":
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
  "amit-desai":
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
  "smit-patel":
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
  chairman:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
  md: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
  director:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80",
  company_secretary:
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
  executive:
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
};

function resolveLeaderPhoto(p: {
  slug?: string;
  role: string;
  photoUrl?: string | null;
}): string | null {
  if (p.photoUrl) return p.photoUrl;
  const slugMatch = p.slug ? DEFAULT_LEADERSHIP_PHOTOS[p.slug] : undefined;
  if (slugMatch) return slugMatch;
  const roleMatch = p.role ? DEFAULT_LEADERSHIP_PHOTOS[p.role] : undefined;
  if (roleMatch) return roleMatch;
  return null;
}

export async function LeadershipGridBlock({
  locale = "en",
}: {
  locale?: string;
} = {}) {
  const people = await getCachedPublishedPeople();
  if (!people.length) {
    return (
      <Section>
        <Container>
          <PublicEmptyState
            locale={locale}
            density="section"
            title="No leadership profiles yet."
            description="Published people appear here after editors release them in Admin."
            primary={{ label: "About HG", href: "about" }}
            secondary={{ label: "Contact", href: "contact", variant: "outline" }}
          />
        </Container>
      </Section>
    );
  }
  const sorted = [...people].sort((a, b) => a.sortOrder - b.sortOrder);
  const primaryLeaders = sorted.filter(
    (p) => (p.leadershipSection ?? "board") === "board",
  );
  const secondaryLeaders = sorted.filter((p) => p.leadershipSection === "operational");

  return (
    <Section>
      <Container>
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.14em] text-brand-blue uppercase sm:text-[11px]">
              Stewardship
            </p>
            <h2 className="font-display mt-1 text-2xl font-bold text-ink sm:text-3xl">
              Leadership
            </h2>
            <p className="text-muted-foreground mt-1 max-w-xl text-xs sm:text-sm">
              Board and executive stewardship of HG Alutech.
            </p>
          </div>
          <Link
            href={localePath(locale, "leadership")}
            className="text-brand-blue inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold hover:text-brand-blue-dark"
          >
            <span>View all leadership</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Primary executive tier: Photo-first compact cards (3 in line) */}
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 sm:gap-5 lg:gap-6">
          {primaryLeaders.map((p) => {
            const photoSrc = resolveLeaderPhoto(p);
            return (
              <li
                key={p.id}
                className="group relative flex aspect-[3/3.8] w-full flex-col justify-between overflow-hidden rounded-2xl bg-slate-950 shadow-md ring-1 ring-black/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl sm:rounded-3xl"
              >
                {/* 1. Full-bleed portrait hero */}
                {photoSrc ? (
                  <Image
                    src={photoSrc}
                    alt={p.name.en}
                    fill
                    sizes="(min-width: 1024px) 28vw, (min-width: 768px) 30vw, (min-width: 640px) 45vw, 100vw"
                    className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-[#021d4c]">
                    <span className="font-display text-4xl font-bold tracking-wider text-white/50">
                      {initials(p.name.en)}
                    </span>
                  </div>
                )}

                {/* 2. Gradient overlays */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 via-45% to-transparent pointer-events-none"
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-slate-950/40 to-transparent pointer-events-none"
                  aria-hidden="true"
                />

                {/* 3. Floating top badges */}
                <div className="relative z-10 flex items-center justify-between p-4 sm:p-4.5">
                  <span className="inline-flex items-center rounded-full border border-white/15 bg-black/40 px-2.5 py-0.5 text-[9.5px] font-bold tracking-wider text-white uppercase backdrop-blur-md sm:text-[10px]">
                    {roleLabel(p.role)}
                  </span>
                  {p.yearsExperience ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[9.5px] font-semibold text-white/90 backdrop-blur-md sm:text-[10px]">
                      <span className="size-1.5 rounded-full bg-brand-red inline-block" />
                      {p.yearsExperience}+ yrs
                    </span>
                  ) : null}
                </div>

                {/* 4. Bottom information with bio reveal on hover */}
                <div className="relative z-10 flex flex-col justify-end p-4 sm:p-5">
                  <h3 className="font-display text-lg font-bold tracking-tight text-white sm:text-xl">
                    {p.name.en}
                  </h3>
                  <p className="mt-0.5 text-xs font-medium text-white/80 line-clamp-1">
                    {p.boardDesignation || roleLabel(p.role)}
                  </p>

                  <div className="max-h-0 overflow-hidden opacity-0 transition-all duration-500 group-hover:max-h-36 group-hover:opacity-100 group-hover:mt-2">
                    {p.bio.en ? (
                      <p className="border-t border-white/15 pt-2 text-[11px] leading-relaxed text-white/85 line-clamp-2 sm:text-xs">
                        {p.bio.en}
                      </p>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Secondary operational tier: mini compact horizontal cards */}
        {secondaryLeaders.length > 0 && (
          <div className="mt-6 border-t border-line/70 pt-5 sm:mt-8 sm:pt-6">
            <p className="text-text-faint mb-3 text-xs font-bold tracking-wider uppercase">
              Operational & Governance Leads
            </p>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-3">
              {secondaryLeaders.map((p) => {
                const photoSrc = resolveLeaderPhoto(p);
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-xl border border-line/60 bg-surface/80 p-2.5 text-xs transition-colors hover:border-brand-blue/30"
                  >
                    <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-slate-900 ring-1 ring-black/[0.08]">
                      {photoSrc ? (
                        <Image
                          src={photoSrc}
                          alt={p.name.en}
                          fill
                          sizes="3rem"
                          className="object-cover object-top"
                        />
                      ) : (
                        <div className="font-display flex h-full w-full items-center justify-center bg-slate-100 text-xs font-bold text-brand-blue/60">
                          {initials(p.name.en)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink truncate">{p.name.en}</p>
                      <p className="text-muted-foreground text-[11px] truncate">
                        {p.boardDesignation || roleLabel(p.role)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
}

export async function LeadershipPage({ locale }: { locale: string }) {
  const people = await getCachedPublishedPeople();
  if (!people.length) {
    return (
      <>
        <PageHero
          locale={locale}
          title="Leadership"
          description="Board and executive stewardship of HG Alutech."
          secondaryLabel="About HG"
          secondaryHref="about"
        />
        <PublicEmptyState
          locale={locale}
          title="No leadership profiles yet."
          description="Board and executive profiles appear here once published in Admin."
          primary={{ label: "Contact / RFQ", href: "contact" }}
        />
        <InquireBand locale={locale} />
      </>
    );
  }
  const sorted = [...people].sort((a, b) => a.sortOrder - b.sortOrder);

  // Data-driven section split based on leadershipSection field (default: board)
  const boardLeaders = sorted.filter((p) => (p.leadershipSection ?? "board") === "board");
  const operationalLeaders = sorted.filter((p) => p.leadershipSection === "operational");

  return (
    <>
      <PageHero
        locale={locale}
        title="Leadership"
        description="Board and executive stewardship of HG Alutech."
        secondaryLabel="About HG"
        secondaryHref="about"
      />
      <Section>
        <Container>
          {/* Primary executive tier: Photo-first compact cards (exactly 3 in line on md/lg desktop) */}
          <div className="mb-12 sm:mb-16">
            <div className="mb-6 sm:mb-8">
              <span className="text-[10px] font-bold tracking-[0.14em] text-brand-blue uppercase sm:text-[11px]">
                Executive Committee
              </span>
              <h2 className="font-display mt-1 text-2xl font-bold text-ink sm:text-3xl">
                Board & Executive Stewardship
              </h2>
              <p className="text-muted-foreground mt-1 max-w-2xl text-xs sm:text-sm">
                Strategic oversight, plant capacity governance, and long-term extrusion
                expansion.
              </p>
            </div>

            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 md:gap-6 lg:gap-8">
              {boardLeaders.map((p) => {
                const photoSrc = resolveLeaderPhoto(p);
                return (
                  <li
                    key={p.id}
                    className="group relative flex aspect-[3/3.8] w-full flex-col justify-between overflow-hidden rounded-2xl bg-slate-950 shadow-md ring-1 ring-black/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl sm:rounded-3xl"
                  >
                    {/* 1. Full-bleed portrait hero */}
                    {photoSrc ? (
                      <Image
                        src={photoSrc}
                        alt={p.name.en}
                        fill
                        sizes="(min-width: 1024px) 28vw, (min-width: 768px) 30vw, (min-width: 640px) 45vw, 100vw"
                        className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-[#021d4c]">
                        <span className="font-display text-4xl font-bold tracking-wider text-white/50">
                          {initials(p.name.en)}
                        </span>
                        <span className="text-text-faint mt-1 text-[10px] font-semibold tracking-widest uppercase">
                          Executive Board
                        </span>
                      </div>
                    )}

                    {/* 2. Gradient overlays */}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 via-45% to-transparent pointer-events-none"
                      aria-hidden="true"
                    />
                    <div
                      className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-950/45 to-transparent pointer-events-none"
                      aria-hidden="true"
                    />

                    {/* 3. Floating top badges (glassmorphic pill) */}
                    <div className="relative z-10 flex items-center justify-between p-4 sm:p-5">
                      <span className="inline-flex items-center rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase backdrop-blur-md sm:text-[10.5px]">
                        {roleLabel(p.role)}
                      </span>
                      {p.yearsExperience ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-md sm:text-[10.5px]">
                          <span className="size-1.5 rounded-full bg-brand-red inline-block" />
                          {p.yearsExperience}+ yrs
                        </span>
                      ) : null}
                    </div>

                    {/* 4. Bottom information with interactive slide-up bio */}
                    <div className="relative z-10 flex flex-col justify-end p-5 sm:p-6">
                      <h3 className="font-display text-xl font-bold tracking-tight text-white leading-tight sm:text-2xl">
                        {p.name.en}
                      </h3>
                      <p className="mt-1 text-xs font-medium text-white/80 line-clamp-1 sm:text-sm">
                        {p.boardDesignation || roleLabel(p.role)}
                      </p>

                      {/* Interactive slide-up bio reveal on hover without layout shift */}
                      <div className="max-h-0 overflow-hidden opacity-0 transition-all duration-500 group-hover:max-h-40 group-hover:opacity-100 group-hover:mt-2.5">
                        {p.bio.en ? (
                          <p className="border-t border-white/15 pt-2 text-xs leading-relaxed text-white/85 line-clamp-3">
                            {p.bio.en}
                          </p>
                        ) : null}
                        {p.role === "chairman" ? (
                          <div className="mt-2.5">
                            <Link
                              href={localePath(locale, "chairmans-message")}
                              className="group/link inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-brand-blue-light transition-colors"
                            >
                              <span>Chairman’s message</span>
                              <ArrowRight className="size-3 transition-transform group-hover/link:translate-x-1" />
                            </Link>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Operational tier: mini & compact directory layout */}
          {operationalLeaders.length > 0 && (
            <div className="border-t border-line/80 pt-8 sm:pt-12">
              <div className="mb-5 sm:mb-6 max-w-xl">
                <span className="text-text-faint text-[10px] font-bold tracking-[0.14em] uppercase sm:text-[11px]">
                  Operational & Corporate Governance
                </span>
                <h3 className="font-display mt-1 text-lg font-bold text-ink sm:text-xl lg:text-2xl">
                  Senior Management & Operational Leads
                </h3>
                <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
                  Functional leads executing metallurgy, quality assurance, compliance,
                  and campus financial controls.
                </p>
              </div>

              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
                {operationalLeaders.map((p) => {
                  const photoSrc = resolveLeaderPhoto(p);
                  return (
                    <li
                      key={p.id}
                      className="group relative flex items-start gap-3.5 rounded-2xl border border-line/70 bg-surface p-3.5 shadow-sm transition-all duration-300 hover:border-brand-blue/30 hover:shadow-md sm:p-4"
                    >
                      {/* Compact photo thumbnail */}
                      <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-slate-900 ring-1 ring-black/[0.08] shadow-sm sm:size-16">
                        {photoSrc ? (
                          <Image
                            src={photoSrc}
                            alt={p.name.en}
                            fill
                            sizes="4rem"
                            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-brand-blue-light/50">
                            <span className="font-display text-base font-bold text-brand-blue/50 sm:text-lg">
                              {initials(p.name.en)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[9.5px] font-bold tracking-wider text-brand-blue uppercase sm:text-[10px]">
                            {roleLabel(p.role)}
                          </span>
                          {p.yearsExperience ? (
                            <span className="text-text-faint shrink-0 text-[9.5px] font-medium sm:text-[10px]">
                              {p.yearsExperience}+ yrs
                            </span>
                          ) : null}
                        </div>
                        <h4 className="font-display mt-0.5 text-sm font-semibold leading-tight text-ink truncate sm:text-base">
                          {p.name.en}
                        </h4>
                        <p className="text-muted-foreground mt-0.5 line-clamp-1 text-[11px] font-medium sm:text-xs">
                          {p.boardDesignation || roleLabel(p.role)}
                        </p>
                        {p.bio.en ? (
                          <p className="text-muted-foreground/80 mt-1 line-clamp-2 text-[11px] leading-relaxed sm:text-xs">
                            {p.bio.en}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </Container>
      </Section>
      <InquireBand locale={locale} />
    </>
  );
}

function FactsGrid({ profile }: { profile: CompanyProfileDTO }) {
  const emails = Object.entries(profile.emails).filter(([, v]) => Boolean(v));
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h2 className="font-display text-2xl font-semibold">
          {profile.displayNames.primary || profile.legalName}
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">{profile.legalName}</p>
        <dl className="mt-6 space-y-3 text-sm">
          {profile.gst ? (
            <div>
              <dt className="text-text-faint">GSTIN</dt>
              <dd className="font-medium">{profile.gst}</dd>
            </div>
          ) : null}
          {profile.cin ? (
            <div>
              <dt className="text-text-faint">CIN</dt>
              <dd className="font-medium">{profile.cin}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-text-faint">Registered office</dt>
            <dd className="mt-1 leading-relaxed">
              {formatAddress(profile.registeredOffice)}
            </dd>
          </div>
          <div>
            <dt className="text-text-faint">Factory</dt>
            <dd className="mt-1 leading-relaxed">
              {formatAddress(profile.factoryAddress)}
            </dd>
          </div>
        </dl>
      </div>
      <div className="border-line bg-bg-alt rounded-[var(--radius-lg)] border p-6">
        <h3 className="font-display text-lg font-semibold">Direct lines</h3>
        <ul className="mt-4 space-y-3 text-sm">
          {profile.phones.map((p) => (
            <li key={`${p.label}-${p.number}`}>
              <span className="text-text-faint">{p.label}: </span>
              <a href={`tel:${p.number}`} className="font-medium hover:underline">
                {p.number}
              </a>
            </li>
          ))}
          {emails.map(([key, value]) => (
            <li key={key}>
              <span className="text-text-faint capitalize">{key}: </span>
              <a href={`mailto:${value}`} className="font-medium hover:underline">
                {value}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export async function CompanyFactsBlock({
  embedded = false,
  locale = "en",
}: {
  embedded?: boolean;
  locale?: string;
} = {}) {
  const profile = await getCachedCompanyProfile();
  if (!profile) {
    const empty = (
      <PublicEmptyState
        locale={locale}
        density="section"
        title="Company profile not published yet."
        description="Legal name, addresses and direct lines appear once the company profile is saved."
        primary={{ label: "Contact / RFQ", href: "contact" }}
      />
    );
    if (embedded) return empty;
    return (
      <Section>
        <Container>{empty}</Container>
      </Section>
    );
  }
  if (embedded) {
    return <FactsGrid profile={profile} />;
  }
  return (
    <Section>
      <Container>
        <FactsGrid profile={profile} />
      </Container>
    </Section>
  );
}

export async function StatsBlock({ locale = "en" }: { locale?: string } = {}) {
  const metrics = await getCachedPublishedCapacity();
  if (!metrics.length) {
    return (
      <Section alt>
        <Container>
          <PublicEmptyState
            locale={locale}
            density="section"
            title="No capacity metrics yet."
            description="Verified figures appear here after publish in Admin."
            primary={{ label: "View capacity page", href: "capacity" }}
            secondary={{ label: "Contact", href: "contact", variant: "outline" }}
          />
        </Container>
      </Section>
    );
  }
  return (
    <Section alt>
      <Container>
        <p className="text-[0.7rem] font-bold tracking-[0.12em] text-brand-blue uppercase">
          At a glance
        </p>
        <h2 className="font-display mt-2 text-fs-h2">Published capacity</h2>
        <dl
          className="mt-8 grid gap-[clamp(1.25rem,3vw,1.75rem)]"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 12rem), 1fr))",
          }}
        >
          {metrics.slice(0, 8).map((m) => (
            <div key={m.id} className="border-t border-black/[0.08] pt-4">
              <dt className="text-muted-foreground text-sm">{m.label.en}</dt>
              <dd className="font-display mt-1.5 text-[clamp(1.35rem,1.1rem+0.8vw,1.75rem)] font-semibold text-ink">
                {m.value} {m.unit}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  );
}

export async function CertGridBlock({ locale = "en" }: { locale?: string } = {}) {
  const certs = await getCachedPublishedCertifications();
  if (!certs.length) {
    return (
      <Section>
        <Container>
          <PublicEmptyState
            locale={locale}
            density="section"
            title="No certifications published yet."
            description="ISO and related certificates appear here once verified and published."
            primary={{ label: "Quality", href: "quality" }}
            secondary={{ label: "Contact", href: "contact", variant: "outline" }}
          />
        </Container>
      </Section>
    );
  }
  return (
    <Section>
      <Container>
        <p className="text-[0.7rem] font-bold tracking-[0.12em] text-brand-blue uppercase">
          Certifications
        </p>
        <h2 className="font-display mt-2 text-fs-h2">Systems on the record</h2>
        <ul
          className="mt-8 grid gap-[clamp(1rem,2.5vw,1.5rem)]"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 16rem), 1fr))",
          }}
        >
          {certs.map((c) => (
            <li key={c.id} className="flex flex-col border-t-2 border-brand-blue/50 pt-4">
              <p className="font-display text-lg font-semibold text-ink">{c.name}</p>
              <p className="text-muted-foreground mt-1 text-sm">{c.issuer}</p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

export async function SustainabilityMetricsBlock({
  locale = "en",
}: {
  locale?: string;
} = {}) {
  const metrics = await getCachedPublishedSustainability();
  if (!metrics.length) {
    return (
      <Section>
        <Container>
          <PublicEmptyState
            locale={locale}
            density="section"
            title="No sustainability metrics yet."
            description="Verified metrics and labelled initiatives appear after disclosure review."
            primary={{ label: "Contact", href: "contact" }}
          />
        </Container>
      </Section>
    );
  }
  return (
    <Section>
      <Container>
        <p className="text-[0.7rem] font-bold tracking-[0.12em] text-brand-blue uppercase">
          Disclosure
        </p>
        <h2 className="font-display mt-2 text-fs-h2">Published metrics</h2>
        <ul
          className="mt-8 grid gap-[clamp(1rem,2.5vw,1.5rem)]"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 16rem), 1fr))",
          }}
        >
          {metrics.map((m) => (
            <li key={m.id} className="border-t-2 border-brand-blue/55 pt-4">
              <p className="text-[0.65rem] font-bold tracking-[0.12em] text-brand-blue uppercase">
                {m.disclosureTier.replace(/_/g, " ")}
              </p>
              <p className="mt-2 font-semibold text-ink">{m.label.en}</p>
              {m.disclosureTier === "verified_metric" && m.value ? (
                <p className="font-display mt-2 text-[clamp(1.35rem,1.1rem+0.7vw,1.75rem)] font-semibold">
                  {m.value} {m.unit}
                </p>
              ) : (
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {m.methodologyNote || "Initiative / commitment."}
                </p>
              )}
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

export async function ExpansionRoadmapBlock({
  locale = "en",
}: {
  locale?: string;
} = {}) {
  const projects = await getCachedPublishedExpansion();
  if (!projects.length) {
    return (
      <Section alt>
        <Container>
          <PublicEmptyState
            locale={locale}
            density="section"
            title="No expansion projects yet."
            description="Disclosure-approved programmes appear here after publish."
            primary={{ label: "Expansion", href: "expansion" }}
            secondary={{ label: "Contact", href: "contact", variant: "outline" }}
          />
        </Container>
      </Section>
    );
  }
  return (
    <Section alt>
      <Container>
        <h2 className="font-display text-2xl font-semibold">Expansion roadmap</h2>
        <ol className="mt-6 divide-y divide-black/[0.08] border-y border-black/[0.08]">
          {projects.map((p) => (
            <li key={p.id} className="py-4">
              <p className="font-semibold text-ink">
                {p.title.en}{" "}
                <span className="text-muted-foreground text-sm font-normal">
                  ({p.status})
                </span>
              </p>
              {p.expectedCommissioning ? (
                <p className="text-muted-foreground mt-1 text-sm">
                  Commissioning: {p.expectedCommissioning}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

/** Logo marquee — CMS logo-strip / gallery embeds (no page H1). */
export async function CustomerLogoStripBlock({
  locale = "en",
}: {
  locale?: string;
} = {}) {
  const logos = await getCachedPublishedLogos("confirmed");
  if (!logos.length) {
    return (
      <Section>
        <Container>
          <PublicEmptyState
            locale={locale}
            density="section"
            title="No customer logos published yet."
            description="Upload approved logos in Admin → Customers, then publish with website approval."
            primary={{ label: "Customers", href: "customers" }}
            secondary={{ label: "Contact", href: "contact", variant: "outline" }}
          />
        </Container>
      </Section>
    );
  }
  return (
    <Section alt>
      <Container>
        <LogoMarquee
          items={logos.map((l) => ({
            id: l.id,
            name: l.name,
            imageUrl: l.imageUrl,
          }))}
        />
      </Container>
    </Section>
  );
}

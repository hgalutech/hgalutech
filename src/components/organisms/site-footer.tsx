import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { Container } from "@/components/atoms/container";
import { BrandLockup } from "@/components/molecules/brand-lockup";
import { SocialLinks, type SocialLinkItem } from "@/components/molecules/social-links";
import {
  footerCompanyAllowlist,
  footerContactFallback,
  footerUtilityAllowlist,
  localePath,
  productNavAllowlist,
  type NavLink,
} from "@/config/nav.config";

type FooterContact = {
  address: string;
  email: string;
  phone: string;
  mapsUrl: string;
};

type SiteFooterProps = {
  locale: string;
  products?: NavLink[];
  company?: NavLink[];
  support?: NavLink[];
  contact?: FooterContact;
  socialLinks?: SocialLinkItem[];
  /** @deprecated Prefer products/company/support columns. */
  quickLinks?: NavLink[];
  blurb?: string;
  brandLogoSrc?: string | null;
  brandLogoHeightPx?: number;
};

function FooterColumn({
  title,
  links,
  locale,
}: {
  title: string;
  links: NavLink[];
  locale: string;
}) {
  if (!links.length) return null;
  return (
    <div>
      <h5 className="font-display mb-4 text-sm font-semibold tracking-wide text-white uppercase">
        {title}
      </h5>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link
              href={localePath(locale, link.href)}
              className="text-on-dark-muted hover:text-white text-sm transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const defaultProducts: NavLink[] = [
  ...productNavAllowlist.map(({ label, href }) => ({ label, href })),
  { label: "View full catalogue", href: "products" },
];

export function SiteFooter({
  locale,
  products = defaultProducts,
  company = footerCompanyAllowlist,
  support = footerUtilityAllowlist,
  contact = footerContactFallback,
  socialLinks = [],
  quickLinks,
  blurb = "Aluminium ingots, cubes, shots, notch bars and deoxidizer products from Kadi, Gujarat.",
  brandLogoSrc = null,
  brandLogoHeightPx,
}: SiteFooterProps) {
  const year = new Date().getFullYear();

  /** Legacy flat quickLinks: put them under Products if structured columns omitted. */
  const productLinks =
    products.length > 0 ? products : quickLinks?.length ? quickLinks : defaultProducts;

  return (
    <footer id="site-footer" className="bg-ink text-on-dark">
      <Container className="grid gap-10 py-[var(--section-pad)] max-[640px]:grid-cols-1 min-[640px]:grid-cols-2 min-[980px]:grid-cols-4">
        <div className="space-y-4">
          <BrandLockup
            href={localePath(locale)}
            inverted
            src={brandLogoSrc}
            heightPx={brandLogoHeightPx}
          />
          <p className="text-on-dark-muted text-sm leading-relaxed">{blurb}</p>
        </div>

        <FooterColumn title="Products" links={productLinks} locale={locale} />

        <div className="space-y-8">
          <FooterColumn title="Company" links={company} locale={locale} />
          <FooterColumn title="Support" links={support} locale={locale} />
        </div>

        <div className="space-y-6">
          <div>
            <h5 className="font-display mb-4 text-sm font-semibold tracking-wide text-white uppercase">
              Contact Us
            </h5>
            <ul className="text-on-dark-muted space-y-3 text-sm">
              <li className="flex gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-red" />
                <span>{contact.address}</span>
              </li>
              <li className="flex gap-2">
                <Mail className="mt-0.5 size-4 shrink-0 text-brand-red" />
                <a href={`mailto:${contact.email}`} className="hover:text-white">
                  {contact.email}
                </a>
              </li>
              <li className="flex gap-2">
                <Phone className="mt-0.5 size-4 shrink-0 text-brand-red" />
                <a
                  href={`tel:${contact.phone.replace(/\s/g, "")}`}
                  className="hover:text-white"
                >
                  {contact.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-3 py-4 min-[640px]:flex-row min-[640px]:items-center min-[640px]:justify-between">
          <p className="text-center text-xs text-on-dark-muted min-[640px]:text-left">
            <span className="text-white/90">HG Alutek</span>
            {" · "}
            Copyright © {year}
          </p>
          <SocialLinks
            links={socialLinks}
            variant="footer"
            className="justify-center min-[640px]:justify-end"
          />
        </Container>
      </div>
    </footer>
  );
}

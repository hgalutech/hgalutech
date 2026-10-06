/**
 * Config-driven public navigation — allowlists of **built** public routes only.
 * Runtime filters by published CMS pages / catalog so unpublished links hide.
 * Locale prefix is applied by helpers — paths are locale-relative.
 */

export type NavLink = {
  label: string;
  href: string;
  description?: string;
  icon?: "drop" | "ingot" | "billet" | "recycle" | "factory" | "leaf" | "handshake";
};

export type NavSection = {
  title: string;
  href?: string;
  items: NavLink[];
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavLink[];
  /** Column groups for scaled mega menus (Apple/Stripe pattern). */
  sections?: NavSection[];
  feature?: {
    href: string;
    imageSrc: string;
    imageAlt: string;
    eyebrow: string;
    title: string;
  };
};

export const localeDefault = "en" as const;

/** Every built public page slug (no invented routes). */
export const publicPages = [
  { slug: "", title: "Home", description: "HG Alutech home" },
  { slug: "about", title: "About HG", description: "About HG Alutech" },
  {
    slug: "journey",
    title: "Our Journey",
    description: "Company profile and journey",
  },
  {
    slug: "leadership",
    title: "Leadership",
    description: "Board and leadership",
  },
  {
    slug: "capacity",
    title: "Capacity",
    description: "Production capacity",
  },
  {
    slug: "customers",
    title: "Customers",
    description: "Customer proof",
  },
  {
    slug: "expansion",
    title: "Expansion",
    description: "Expansion roadmap",
  },
  {
    slug: "products",
    title: "Products",
    description: "Product catalogue",
  },
  {
    slug: "industries",
    title: "Industries & Applications",
    description: "Industries we serve",
  },
  {
    slug: "manufacturing",
    title: "Manufacturing & Infrastructure",
    description: "Plants and infrastructure",
  },
  {
    slug: "quality",
    title: "Quality & Certifications",
    description: "Quality systems and certifications",
  },
  {
    slug: "sustainability",
    title: "Sustainability / ESG",
    description: "Sustainability and ESG",
  },
  {
    slug: "procurement",
    title: "Global Procurement & Export",
    description: "Procurement and export",
  },
  { slug: "careers", title: "Careers", description: "Careers at HG" },
  {
    slug: "resources",
    title: "Resources / Downloads",
    description: "Resources and downloads",
  },
  {
    slug: "contact",
    title: "Contact Us / RFQ",
    description: "Contact and RFQ",
  },
] as const;

export function localePath(locale: string, slug = "") {
  const clean = slug.replace(/^\/+|\/+$/g, "");
  return clean ? `/${locale}/${clean}` : `/${locale}`;
}

/**
 * Product mega-menu allowlist — must match built routes under products/*.
 * Runtime may replace labels with catalog product names when hydrating.
 */
export const productNavAllowlist: NavLink[] = [
  {
    label: "Aluminium",
    href: "products/category/aluminium",
    description: "Ingots, cubes, shots, notch bars and deoxidizer",
    icon: "ingot",
  },
  {
    label: "Aluminium Ingots",
    href: "products/aluminium-ingots",
    description: "Remelt and alloy ingots for foundries",
    icon: "drop",
  },
];

export const productNavFeatureDefault = {
  href: "products",
  imageSrc: "/products/aluminium-ingots.jpg",
  imageAlt: "Stacked aluminium ingots at HG plant",
  eyebrow: "Catalogue",
  title: "View all products & specs →",
} as const;

export const companyNavFeatureDefault = {
  href: "about",
  imageSrc: "/products/extrusion-profiles.jpg",
  imageAlt: "Aluminium extrusion profiles from HG plant",
  eyebrow: "Company",
  title: "People, plant and programme discipline →",
} as const;

/** @deprecated use resolvePublicNav — kept for Storybook fallbacks */
export const productNav: NavGroup = {
  id: "products",
  label: "Products",
  items: productNavAllowlist,
  feature: { ...productNavFeatureDefault },
};

/** Company mega-menu allowlist — built company routes only. */
export const companyNavAllowlist: NavLink[] = [
  {
    label: "About Us",
    href: "about",
    description: "Who we are and how we operate",
  },
  {
    label: "Our Journey",
    href: "journey",
    description: "Milestones from casting to campus",
  },
  {
    label: "Chairman’s Message",
    href: "chairmans-message",
    description: "Direction from the chair",
  },
  {
    label: "Leadership",
    href: "leadership",
    description: "Board and executive team",
  },
  {
    label: "Customers",
    href: "customers",
    description: "Programmes we support",
  },
  {
    label: "Capacity",
    href: "capacity",
    description: "Press, melt and dispatch scale",
  },
  {
    label: "Expansion",
    href: "expansion",
    description: "Roadmap and growth investments",
  },
  {
    label: "Quality",
    href: "quality",
    description: "Systems, labs and certificates",
  },
  {
    label: "Infrastructure",
    href: "manufacturing",
    description: "Plant and process capability",
  },
  {
    label: "Sustainability",
    href: "sustainability",
    description: "ESG and responsible operations",
  },
  {
    label: "Procurement & Export",
    href: "procurement",
    description: "Sourcing and global dispatch",
  },
  {
    label: "Careers",
    href: "careers",
    description: "Roles across melt, press and QC",
  },
  {
    label: "Resources",
    href: "resources",
    description: "Specs, downloads and documents",
  },
];

/** @deprecated use resolvePublicNav */
export const companyNav: NavGroup = {
  id: "company",
  label: "Company",
  items: companyNavAllowlist,
  feature: { ...companyNavFeatureDefault },
};

export const primaryNavAllowlist: NavLink[] = [
  { label: "Industries", href: "industries" },
  { label: "Contact Us", href: "contact" },
];

/** @deprecated use resolvePublicNav */
export const primaryNavLinks: NavLink[] = primaryNavAllowlist;

/** Footer Company column — durable corporate links (not SKUs). */
export const footerCompanyAllowlist: NavLink[] = [
  { label: "About Us", href: "about" },
  { label: "Chairman’s Message", href: "chairmans-message" },
  { label: "Capacity", href: "capacity" },
  { label: "Quality", href: "quality" },
  { label: "Careers", href: "careers" },
];

/** Footer Support / utility links. */
export const footerUtilityAllowlist: NavLink[] = [
  { label: "Resources", href: "resources" },
  { label: "Contact / RFQ", href: "contact" },
];

/** @deprecated use resolvePublicNav().footer — kept for Storybook fallbacks */
export const footerQuickLinks: NavLink[] = [
  ...productNavAllowlist.map(({ label, href }) => ({ label, href })),
  { label: "View full catalogue", href: "products" },
  ...footerCompanyAllowlist,
  ...footerUtilityAllowlist,
];

export const footerContactFallback = {
  address:
    "Survey No. 671/3, Laxmipura Nandasan, Rajpur, Kadi, Mahesana, Gujarat – 384450, India",
  email: "sales@hgalutech.com",
  phone: "+91 2764 000000",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Laxmipura+Nandasan+Kadi+Mahesana",
} as const;

/** @deprecated */
export const footerContact = footerContactFallback;

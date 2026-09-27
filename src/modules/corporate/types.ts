export type LocalizedString = { en: string };

export type Address = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

/** Public map / office pin for Contact page (N locations). */
export type CompanyLocationDTO = {
  id: string;
  label: string;
  address: string;
  mapsUrl: string;
  embedUrl: string;
  order: number;
};

export type SocialPlatform =
  "linkedin" | "facebook" | "instagram" | "youtube" | "x" | "whatsapp" | "other";

/** CMS-managed social profile link (footer, drawer, contact, sameAs). */
export type SocialLinkDTO = {
  id: string;
  platform: SocialPlatform;
  url: string;
  /** Display / aria label; required when platform is `other`. */
  label?: string;
  order: number;
};

export type CompanyProfileDTO = {
  id: string;
  legalName: string;
  displayNames: { primary: string; alsoMention: string[] };
  cin: string;
  gst: string;
  registeredOffice: Address;
  factoryAddress: Address;
  phones: { label: string; number: string }[];
  emails: {
    sales: string;
    export: string;
    purchase: string;
    investor: string;
    hr: string;
    quality: string;
  };
  logo: { png?: string | null; svg?: string | null; pdf?: string | null };
  /** Header / footer lockup height in px (28–64). */
  logoDisplayHeightPx: number;
  brandColors: { primary?: string; secondary?: string; accent?: string };
  locations: CompanyLocationDTO[];
  socialLinks: SocialLinkDTO[];
  locale: string;
  version: number;
  updatedAt: string;
};

export type PersonDTO = {
  id: string;
  name: LocalizedString;
  slug: string;
  role: "director" | "chairman" | "md" | "company_secretary" | "executive";
  boardDesignation: string;
  yearsExperience: number;
  bio: LocalizedString;
  photoId: string | null;
  photoUrl: string | null;
  sortOrder: number;
  leadershipSection: "board" | "operational";
  status: "draft" | "published";
  showOnInvestorPage: boolean;
  showOnChairmansPage: boolean;
  version: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CapacityMetricDTO = {
  id: string;
  key: string;
  label: LocalizedString;
  value: string;
  unit: string;
  category:
    "extrusion" | "billet" | "ingot" | "melting" | "press" | "dimension" | "commercial";
  sourceNote: string;
  verificationStatus: "draft" | "needs_verification" | "verified";
  verifiedBy: string | null;
  verifiedAt: string | null;
  publishStatus: "hidden" | "published";
  displayOrder: number;
  version: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CertificationDTO = {
  id: string;
  name: string;
  type: "iso" | "quality_policy" | "test_certificate_template" | "other";
  issuer: string;
  validFrom: string | null;
  validTo: string | null;
  documentId: string | null;
  publishStatus: "draft" | "published";
  version: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SustainabilityMetricDTO = {
  id: string;
  key: string;
  label: LocalizedString;
  value: string | null;
  unit: string;
  disclosureTier: "verified_metric" | "initiative" | "commitment";
  evidenceMediaIds: string[];
  methodologyNote: string;
  verificationStatus: "draft" | "verified";
  publishStatus: "hidden" | "published";
  version: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CustomerLogoDTO = {
  id: string;
  name: string;
  logoId: string | null;
  imageUrl: string | null;
  /** confirmed = Our Customers; potential = Future Business Opportunities */
  listingKind: "confirmed" | "potential";
  approvedForWebsite: boolean;
  permissionNote: string;
  publishStatus: "draft" | "published";
  sortOrder: number;
  version: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CaseStudyDTO = {
  id: string;
  title: LocalizedString;
  slug: string;
  industry: string;
  region: string;
  summary: LocalizedString;
  imageIds: string[];
  productIds: string[];
  approvedForWebsite: boolean;
  publishStatus: "draft" | "published";
  version: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TestimonialDTO = {
  id: string;
  quote: LocalizedString;
  authorName: string;
  authorTitle: string;
  company: string;
  approvedForWebsite: boolean;
  publishStatus: "draft" | "published";
  sortOrder: number;
  version: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ExpansionProjectDTO = {
  id: string;
  title: LocalizedString;
  slug: string;
  status: "confirmed" | "proposed" | "planned";
  description: LocalizedString;
  locationNote: string;
  expectedStart: string;
  expectedCommissioning: string;
  projectCostInr: number | null;
  estimatedRevenueInr: number | null;
  publicDisclosureApproved: boolean;
  publishStatus: "draft" | "published";
  sortOrder: number;
  version: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Public-safe view: INR omitted unless disclosure approved */
export type ExpansionProjectPublicDTO = Omit<
  ExpansionProjectDTO,
  "projectCostInr" | "estimatedRevenueInr" | "version" | "deletedAt"
> & {
  projectCostInr?: number | null;
  estimatedRevenueInr?: number | null;
};

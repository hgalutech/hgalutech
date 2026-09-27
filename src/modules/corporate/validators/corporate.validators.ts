import { z } from "zod";

export const localizedStringSchema = z.object({ en: z.string().min(1) });

export const addressSchema = z.object({
  line1: z.string().default(""),
  line2: z.string().optional(),
  city: z.string().default(""),
  state: z.string().default(""),
  postalCode: z.string().default(""),
  country: z.string().default("India"),
});

export const socialPlatformSchema = z.enum([
  "linkedin",
  "facebook",
  "instagram",
  "youtube",
  "x",
  "whatsapp",
  "other",
]);

const httpsUrl = z
  .string()
  .url()
  .refine((u) => u.startsWith("https://"), {
    message: "URL must use https://",
  });

export const socialLinkSchema = z
  .object({
    id: z.string().min(1),
    platform: socialPlatformSchema,
    url: httpsUrl,
    label: z.string().optional(),
    order: z.number().int().default(0),
  })
  .superRefine((link, ctx) => {
    if (link.platform === "other" && !link.label?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Label is required for custom links",
        path: ["label"],
      });
    }
  });

export const companyProfileSchema = z.object({
  legalName: z.string().min(1),
  displayNames: z.object({
    primary: z.string().min(1),
    alsoMention: z.array(z.string()).default([]),
  }),
  cin: z.string().default(""),
  gst: z.string().default(""),
  registeredOffice: addressSchema,
  factoryAddress: addressSchema,
  phones: z.array(z.object({ label: z.string(), number: z.string() })).default([]),
  emails: z.object({
    sales: z.string().default(""),
    export: z.string().default(""),
    purchase: z.string().default(""),
    investor: z.string().default(""),
    hr: z.string().default(""),
    quality: z.string().default(""),
  }),
  logo: z
    .object({
      png: z.string().nullable().optional(),
      svg: z.string().nullable().optional(),
      pdf: z.string().nullable().optional(),
    })
    .optional(),
  logoDisplayHeightPx: z.number().int().min(28).max(72).optional().default(40),
  brandColors: z
    .object({
      primary: z.string().optional(),
      secondary: z.string().optional(),
      accent: z.string().optional(),
    })
    .optional(),
  locations: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().default(""),
        address: z.string().default(""),
        mapsUrl: z.string().default(""),
        embedUrl: z.string().default(""),
        order: z.number().int().default(0),
      }),
    )
    .optional()
    .default([]),
  socialLinks: z.array(socialLinkSchema).optional().default([]),
  locale: z.string().default("en"),
  version: z.number().int(),
});

export const createPersonSchema = z.object({
  name: localizedStringSchema,
  slug: z.string().min(1),
  role: z.enum(["director", "chairman", "md", "company_secretary", "executive"]),
  boardDesignation: z.string().default(""),
  yearsExperience: z.number().default(0),
  bio: z.object({ en: z.string() }).default({ en: "" }),
  photoId: z.string().nullable().optional(),
  photoUrl: z.string().nullable().optional(),
  sortOrder: z.number().int().default(0),
  leadershipSection: z.enum(["board", "operational"]).optional().default("board"),
  status: z.enum(["draft", "published"]).optional(),
  showOnInvestorPage: z.boolean().optional().default(false),
  showOnChairmansPage: z.boolean().optional().default(false),
});

export const updatePersonSchema = z.object({
  name: localizedStringSchema.optional(),
  slug: z.string().min(1).optional(),
  role: z
    .enum(["director", "chairman", "md", "company_secretary", "executive"])
    .optional(),
  boardDesignation: z.string().optional(),
  yearsExperience: z.number().optional(),
  bio: z.object({ en: z.string() }).optional(),
  photoId: z.string().nullable().optional(),
  photoUrl: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  leadershipSection: z.enum(["board", "operational"]).optional(),
  status: z.enum(["draft", "published"]).optional(),
  showOnInvestorPage: z.boolean().optional(),
  showOnChairmansPage: z.boolean().optional(),
  version: z.number().int(),
});

export const createCapacityMetricSchema = z.object({
  key: z.string().min(1),
  label: localizedStringSchema,
  value: z.union([z.string(), z.number()]).transform(String),
  unit: z.string().default(""),
  category: z.enum([
    "extrusion",
    "billet",
    "ingot",
    "melting",
    "press",
    "dimension",
    "commercial",
  ]),
  sourceNote: z.string().default(""),
  verificationStatus: z
    .enum(["draft", "needs_verification", "verified"])
    .default("draft"),
  publishStatus: z.enum(["hidden", "published"]).default("hidden"),
  displayOrder: z.number().int().default(0),
});

/** No Zod defaults — a publish-only PATCH must not inject verificationStatus:"draft" and block publish. */
export const updateCapacityMetricSchema = z.object({
  key: z.string().min(1).optional(),
  label: localizedStringSchema.optional(),
  value: z.union([z.string(), z.number()]).transform(String).optional(),
  unit: z.string().optional(),
  category: z
    .enum(["extrusion", "billet", "ingot", "melting", "press", "dimension", "commercial"])
    .optional(),
  sourceNote: z.string().optional(),
  verificationStatus: z.enum(["draft", "needs_verification", "verified"]).optional(),
  publishStatus: z.enum(["hidden", "published"]).optional(),
  displayOrder: z.number().int().optional(),
  version: z.number().int(),
});

export const createCertificationSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["iso", "quality_policy", "test_certificate_template", "other"]),
  issuer: z.string().default(""),
  validFrom: z.string().nullable().optional(),
  validTo: z.string().nullable().optional(),
  documentId: z.string().nullable().optional(),
  publishStatus: z.enum(["draft", "published"]).default("draft"),
});

/** No Zod defaults — leaked publishStatus:"draft" from .partial() would silently downgrade on empty PATCHes. */
export const updateCertificationSchema = z.object({
  name: z.string().min(1).optional(),
  type: z
    .enum(["iso", "quality_policy", "test_certificate_template", "other"])
    .optional(),
  issuer: z.string().optional(),
  validFrom: z.string().nullable().optional(),
  validTo: z.string().nullable().optional(),
  documentId: z.string().nullable().optional(),
  publishStatus: z.enum(["draft", "published"]).optional(),
  version: z.number().int(),
});

export const createSustainabilityMetricSchema = z.object({
  key: z.string().min(1),
  label: localizedStringSchema,
  value: z.string().nullable().optional(),
  unit: z.string().default(""),
  disclosureTier: z.enum(["verified_metric", "initiative", "commitment"]),
  evidenceMediaIds: z.array(z.string()).default([]),
  methodologyNote: z.string().default(""),
  verificationStatus: z.enum(["draft", "verified"]).default("draft"),
  publishStatus: z.enum(["hidden", "published"]).default("hidden"),
});

/** No Zod defaults — a publish-only PATCH must not inject verificationStatus:"draft" and block verified_metric publish. */
export const updateSustainabilityMetricSchema = z.object({
  key: z.string().min(1).optional(),
  label: localizedStringSchema.optional(),
  value: z.string().nullable().optional(),
  unit: z.string().optional(),
  disclosureTier: z.enum(["verified_metric", "initiative", "commitment"]).optional(),
  evidenceMediaIds: z.array(z.string()).optional(),
  methodologyNote: z.string().optional(),
  verificationStatus: z.enum(["draft", "verified"]).optional(),
  publishStatus: z.enum(["hidden", "published"]).optional(),
  version: z.number().int(),
});

export const createCustomerLogoSchema = z.object({
  name: z.string().min(1),
  logoId: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  listingKind: z.enum(["confirmed", "potential"]).default("confirmed"),
  approvedForWebsite: z.boolean().default(false),
  permissionNote: z.string().default(""),
  publishStatus: z.enum(["draft", "published"]).default("draft"),
  sortOrder: z.number().int().default(0),
});

/** No Zod defaults — publish-only PATCH must not wipe approvedForWebsite. */
export const updateCustomerLogoSchema = z.object({
  name: z.string().min(1).optional(),
  logoId: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  listingKind: z.enum(["confirmed", "potential"]).optional(),
  approvedForWebsite: z.boolean().optional(),
  permissionNote: z.string().optional(),
  publishStatus: z.enum(["draft", "published"]).optional(),
  sortOrder: z.number().int().optional(),
  version: z.number().int(),
});

export const createCaseStudySchema = z.object({
  title: localizedStringSchema,
  slug: z.string().min(1),
  industry: z.string().default(""),
  region: z.string().default(""),
  summary: z.object({ en: z.string() }).default({ en: "" }),
  imageIds: z.array(z.string()).default([]),
  productIds: z.array(z.string()).default([]),
  approvedForWebsite: z.boolean().default(false),
  publishStatus: z.enum(["draft", "published"]).default("draft"),
});

/** No Zod defaults on approvedForWebsite — a publish-only PATCH must not inject false. */
export const updateCaseStudySchema = z.object({
  title: localizedStringSchema.optional(),
  slug: z.string().min(1).optional(),
  industry: z.string().optional(),
  region: z.string().optional(),
  summary: z.object({ en: z.string() }).optional(),
  imageIds: z.array(z.string()).optional(),
  productIds: z.array(z.string()).optional(),
  approvedForWebsite: z.boolean().optional(),
  publishStatus: z.enum(["draft", "published"]).optional(),
  version: z.number().int(),
});

export const createTestimonialSchema = z.object({
  quote: localizedStringSchema,
  authorName: z.string().min(1),
  authorTitle: z.string().default(""),
  company: z.string().default(""),
  approvedForWebsite: z.boolean().default(false),
  publishStatus: z.enum(["draft", "published"]).default("draft"),
  sortOrder: z.number().int().default(0),
});

/** No Zod defaults on approvedForWebsite — a publish-only PATCH must not inject false. */
export const updateTestimonialSchema = z.object({
  quote: localizedStringSchema.optional(),
  authorName: z.string().min(1).optional(),
  authorTitle: z.string().optional(),
  company: z.string().optional(),
  approvedForWebsite: z.boolean().optional(),
  publishStatus: z.enum(["draft", "published"]).optional(),
  sortOrder: z.number().int().optional(),
  version: z.number().int(),
});

export const createExpansionProjectSchema = z.object({
  title: localizedStringSchema,
  slug: z.string().min(1),
  status: z.enum(["confirmed", "proposed", "planned"]).default("planned"),
  description: z.object({ en: z.string() }).optional().default({ en: "" }),
  locationNote: z.string().optional().default(""),
  expectedStart: z.string().optional().default(""),
  expectedCommissioning: z.string().optional().default(""),
  projectCostInr: z.number().nullable().optional(),
  estimatedRevenueInr: z.number().nullable().optional(),
  publicDisclosureApproved: z.boolean().optional().default(false),
  publishStatus: z.enum(["draft", "published"]).optional().default("draft"),
  sortOrder: z.number().int().optional().default(0),
});

/** No Zod defaults — leaked publishStatus:"draft" from .partial() would silently downgrade on empty PATCHes. */
export const updateExpansionProjectSchema = z.object({
  title: localizedStringSchema.optional(),
  slug: z.string().min(1).optional(),
  status: z.enum(["confirmed", "proposed", "planned"]).optional(),
  description: z.object({ en: z.string() }).optional(),
  locationNote: z.string().optional(),
  expectedStart: z.string().optional(),
  expectedCommissioning: z.string().optional(),
  projectCostInr: z.number().nullable().optional(),
  estimatedRevenueInr: z.number().nullable().optional(),
  publicDisclosureApproved: z.boolean().optional(),
  publishStatus: z.enum(["draft", "published"]).optional(),
  sortOrder: z.number().int().optional(),
  version: z.number().int(),
});

import { z } from "zod";

export const localizedStringSchema = z.object({
  en: z.string().min(1),
});

export const catalogStatusSchema = z.enum(["draft", "published"]);
export const productStatusSchema = z.enum(["draft", "scheduled", "published"]);

export const DICTIONARY_KEYS = [
  "alloy_grade",
  "temper",
  "surface_finish",
  "anodizing_color",
  "ral_color",
  "tolerance_standard",
  "packaging",
] as const;

export type DictionaryKey = (typeof DICTIONARY_KEYS)[number];

export const dictionaryKeySchema = z.enum(DICTIONARY_KEYS);

export const dictionaryItemSchema = z.object({
  value: z.string().min(1),
  label: localizedStringSchema,
  sortOrder: z.number().int().default(0),
  active: z.boolean().default(true),
});

export const createCategorySchema = z.object({
  name: localizedStringSchema,
  slug: z.string().min(1),
  parentId: z.string().nullable().optional(),
  description: localizedStringSchema.partial().optional(),
  imageUrl: z.string().optional(),
  order: z.number().int().optional(),
  status: catalogStatusSchema.optional(),
});

export const updateCategorySchema = z.object({
  name: localizedStringSchema.optional(),
  slug: z.string().min(1).optional(),
  description: localizedStringSchema.partial().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  order: z.number().int().optional(),
  status: catalogStatusSchema.optional(),
  version: z.number().int(),
});

export const reorderCategoriesSchema = z.object({
  parentId: z.string().nullable(),
  orderedIds: z.array(z.string().min(1)).min(1),
});

export const moveCategorySchema = z.object({
  parentId: z.string().nullable(),
  version: z.number().int(),
});

export const productFormTypeSchema = z.enum([
  "extrusion",
  "billet",
  "ingot",
  "remelt",
  "deoxidizer",
  "other",
]);

export const chemicalCompositionRowSchema = z.object({
  element: z.string().min(1),
  range: z.string().default(""),
});

export const createProductSchema = z.object({
  sku: z.string().min(1),
  name: localizedStringSchema,
  slug: z.string().min(1),
  /** Every product must belong to at least one published category. */
  categoryIds: z
    .array(z.string().min(1))
    .min(1, "Select a category before saving the product"),
  formType: productFormTypeSchema.optional().default("other"),
  alloyGrades: z.array(z.string()).default([]),
  tempers: z.array(z.string()).default([]),
  surfaceFinishes: z.array(z.string()).default([]),
  anodizingColors: z.array(z.string()).default([]),
  ralColors: z.array(z.string()).default([]),
  toleranceStandards: z.array(z.string()).default([]),
  packaging: z.array(z.string()).default([]),
  applications: z.array(z.string()).default([]),
  otherApplications: z.array(z.string()).default([]),
  directCustomers: z.array(z.string()).default([]),
  endUseIndustries: z.array(z.string()).default([]),
  capabilityApplications: z.array(z.string()).default([]),
  highlights: z.array(z.string()).default([]),
  chemicalComposition: z.array(chemicalCompositionRowSchema).default([]),
  maxLengthMm: z.number().optional(),
  minLengthMm: z.number().optional(),
  maxWidthMm: z.number().optional(),
  weightPerMeterKg: z.number().optional(),
  typicalDiameterMm: z.number().optional(),
  typicalPieceWeightKg: z.number().optional(),
  standardsNote: z.string().optional(),
  moqNote: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  imageMediaId: z.string().nullable().optional(),
  drawingMediaIds: z.array(z.string()).optional(),
  blocks: z.array(z.unknown()).optional(),
  seo: z
    .object({ title: z.string().optional(), description: z.string().optional() })
    .optional(),
  status: productStatusSchema.optional(),
  scheduledPublishAt: z.string().datetime().nullable().optional(),
  isUpcoming: z.boolean().optional(),
  /** Lower numbers appear first on the public catalogue. */
  sortOrder: z.number().int().optional(),
  createRedirectOnSlugChange: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema
  .omit({
    // Defaults on create must not apply during partial updates (publish wipe bug).
    categoryIds: true,
    formType: true,
    alloyGrades: true,
    tempers: true,
    surfaceFinishes: true,
    anodizingColors: true,
    ralColors: true,
    toleranceStandards: true,
    packaging: true,
    applications: true,
    otherApplications: true,
    directCustomers: true,
    endUseIndustries: true,
    capabilityApplications: true,
    highlights: true,
    chemicalComposition: true,
  })
  .extend({
    categoryIds: z
      .array(z.string().min(1))
      .min(1, "Select a category before saving the product")
      .optional(),
    formType: productFormTypeSchema.optional(),
    alloyGrades: z.array(z.string()).optional(),
    tempers: z.array(z.string()).optional(),
    surfaceFinishes: z.array(z.string()).optional(),
    anodizingColors: z.array(z.string()).optional(),
    ralColors: z.array(z.string()).optional(),
    toleranceStandards: z.array(z.string()).optional(),
    packaging: z.array(z.string()).optional(),
    applications: z.array(z.string()).optional(),
    otherApplications: z.array(z.string()).optional(),
    directCustomers: z.array(z.string()).optional(),
    endUseIndustries: z.array(z.string()).optional(),
    capabilityApplications: z.array(z.string()).optional(),
    highlights: z.array(z.string()).optional(),
    chemicalComposition: z.array(chemicalCompositionRowSchema).optional(),
  })
  .partial()
  .extend({
    version: z.number().int(),
  });

export const upsertDictionarySchema = z.object({
  key: dictionaryKeySchema,
  items: z.array(dictionaryItemSchema),
  version: z.number().int().optional(),
});

export const addDictionaryItemSchema = z.object({
  key: dictionaryKeySchema,
  item: dictionaryItemSchema,
  version: z.number().int(),
});

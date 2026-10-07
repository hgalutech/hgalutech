export type LocalizedString = { en: string };

export type CategoryDTO = {
  id: string;
  name: LocalizedString;
  slug: string;
  parentId: string | null;
  ancestorIds: string[];
  level: number;
  path: string;
  description?: Partial<LocalizedString>;
  imageUrl?: string | null;
  order: number;
  status: "draft" | "published";
  version: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  children?: CategoryDTO[];
  productCount?: number;
};

export type ProductFormType =
  "extrusion" | "billet" | "ingot" | "remelt" | "deoxidizer" | "other";

export type ChemicalCompositionRow = {
  element: string;
  range: string;
};

export type ProductDTO = {
  id: string;
  sku: string;
  name: LocalizedString;
  slug: string;
  categoryIds: string[];
  /** Product family — drives which dimension fields matter on the PDP. */
  formType: ProductFormType;
  alloyGrades: string[];
  tempers: string[];
  surfaceFinishes: string[];
  anodizingColors: string[];
  ralColors: string[];
  toleranceStandards: string[];
  packaging: string[];
  applications: string[];
  /** Secondary applications shown under "Other Applications" (e.g. extrusion). */
  otherApplications: string[];
  /** Who buys this product directly (e.g. foundries for ingots). */
  directCustomers: string[];
  /** Downstream end-use after customer processing. */
  endUseIndustries: string[];
  /** Capability / potential only — not claimed as current supply. */
  capabilityApplications: string[];
  highlights: string[];
  chemicalComposition: ChemicalCompositionRow[];
  maxLengthMm?: number | null;
  minLengthMm?: number | null;
  maxWidthMm?: number | null;
  weightPerMeterKg?: number | null;
  typicalDiameterMm?: number | null;
  typicalPieceWeightKg?: number | null;
  standardsNote?: string | null;
  moqNote?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  imageMediaId?: string | null;
  drawingMediaIds: string[];
  blocks: unknown[];
  seo: { title?: string; description?: string };
  status: "draft" | "scheduled" | "published";
  scheduledPublishAt: string | null;
  publishedAt: string | null;
  publishedVersion: unknown | null;
  isUpcoming: boolean;
  /** Public catalogue order. Lower comes first. */
  sortOrder: number;
  version: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DictionaryItemDTO = {
  value: string;
  label: LocalizedString;
  sortOrder: number;
  active: boolean;
};

export type DictionaryDTO = {
  id: string;
  key: string;
  items: DictionaryItemDTO[];
  version: number;
  updatedAt: string;
};

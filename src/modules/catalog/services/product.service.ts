import { dbConnect } from "@/lib/db/connect";
import { assertVersionMatch } from "@/lib/http/conflict";
import { createRedirect } from "@/modules/cms";
import { Product } from "../repositories/mongo/product.model";
import type { LocalizedString, ProductDTO } from "../types";
import {
  createProductSchema,
  updateProductSchema,
} from "../validators/catalog.validators";
import type { z } from "zod";

async function requireDb() {
  const conn = await dbConnect();
  if (!conn) throw new Error("MONGODB_URI is not configured");
}

function mapToObj(map: unknown): LocalizedString {
  if (!map) return { en: "" };
  if (map instanceof Map) {
    return { en: String(map.get("en") ?? "") };
  }
  const obj = map as Record<string, string>;
  return { en: String(obj.en ?? "") };
}

function toDTO(doc: Record<string, unknown>): ProductDTO {
  return {
    id: String(doc._id),
    sku: String(doc.sku),
    name: mapToObj(doc.name),
    slug: String(doc.slug),
    categoryIds: ((doc.categoryIds as unknown[]) ?? []).map(String),
    formType: (doc.formType as ProductDTO["formType"]) || "other",
    alloyGrades: (doc.alloyGrades as string[]) ?? [],
    tempers: (doc.tempers as string[]) ?? [],
    surfaceFinishes: (doc.surfaceFinishes as string[]) ?? [],
    anodizingColors: (doc.anodizingColors as string[]) ?? [],
    ralColors: (doc.ralColors as string[]) ?? [],
    toleranceStandards: (doc.toleranceStandards as string[]) ?? [],
    packaging: (doc.packaging as string[]) ?? [],
    applications: (doc.applications as string[]) ?? [],
    otherApplications: (doc.otherApplications as string[]) ?? [],
    directCustomers: (doc.directCustomers as string[]) ?? [],
    endUseIndustries: (doc.endUseIndustries as string[]) ?? [],
    capabilityApplications: (doc.capabilityApplications as string[]) ?? [],
    highlights: (doc.highlights as string[]) ?? [],
    chemicalComposition: (
      (doc.chemicalComposition as { element?: string; range?: string }[]) ?? []
    )
      .filter((r) => r.element?.trim())
      .map((r) => ({
        element: String(r.element).trim(),
        range: String(r.range ?? "").trim(),
      })),
    maxLengthMm: (doc.maxLengthMm as number | null) ?? null,
    minLengthMm: (doc.minLengthMm as number | null) ?? null,
    maxWidthMm: (doc.maxWidthMm as number | null) ?? null,
    weightPerMeterKg: (doc.weightPerMeterKg as number | null) ?? null,
    typicalDiameterMm: (doc.typicalDiameterMm as number | null) ?? null,
    typicalPieceWeightKg: (doc.typicalPieceWeightKg as number | null) ?? null,
    standardsNote: (doc.standardsNote as string | null) ?? null,
    moqNote: (doc.moqNote as string | null) ?? null,
    description: (doc.description as string | null) ?? null,
    imageUrl: (doc.imageUrl as string | null) ?? null,
    imageMediaId: (doc.imageMediaId as string | null) ?? null,
    drawingMediaIds: ((doc.drawingMediaIds as string[]) ?? []).map(String),
    blocks: (doc.blocks as unknown[]) ?? [],
    seo: (doc.seo as ProductDTO["seo"]) ?? {},
    status: doc.status as ProductDTO["status"],
    scheduledPublishAt: doc.scheduledPublishAt
      ? new Date(doc.scheduledPublishAt as string).toISOString()
      : null,
    publishedAt: doc.publishedAt
      ? new Date(doc.publishedAt as string).toISOString()
      : null,
    publishedVersion: (doc.publishedVersion as unknown) ?? null,
    isUpcoming: Boolean(doc.isUpcoming),
    sortOrder: Number(doc.sortOrder ?? 0),
    version: Number(doc.version ?? 1),
    deletedAt: doc.deletedAt ? new Date(doc.deletedAt as string).toISOString() : null,
    createdAt: new Date(doc.createdAt as string).toISOString(),
    updatedAt: new Date(doc.updatedAt as string).toISOString(),
  };
}

export async function listProducts(opts: {
  q?: string;
  cursor?: string;
  limit?: number;
  includeDeleted?: boolean;
  categoryId?: string;
}) {
  await requireDb();
  const limit = Math.min(opts.limit ?? 20, 100);
  const filter: Record<string, unknown> = opts.includeDeleted
    ? { deletedAt: { $ne: null } }
    : { deletedAt: null };
  if (opts.q) {
    filter.$or = [
      { sku: { $regex: opts.q, $options: "i" } },
      { slug: { $regex: opts.q, $options: "i" } },
      { "name.en": { $regex: opts.q, $options: "i" } },
    ];
  }
  if (opts.categoryId) {
    filter.categoryIds = opts.categoryId;
  }
  if (opts.cursor) {
    filter._id = { $lt: opts.cursor };
  }
  const rows = await Product.find(filter)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .lean();
  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit).map((r) => toDTO(r as Record<string, unknown>));
  const nextCursor = hasMore ? items[items.length - 1]?.id : null;
  return { items, nextCursor };
}

export async function getProductById(id: string, opts?: { includeDeleted?: boolean }) {
  await requireDb();
  const filter: Record<string, unknown> = { _id: id };
  if (!opts?.includeDeleted) filter.deletedAt = null;
  const doc = await Product.findOne(filter).lean();
  if (!doc) return null;
  return toDTO(doc as Record<string, unknown>);
}

export async function listPublishedProducts(
  opts: {
    q?: string;
    cursor?: string;
    limit?: number;
    categoryId?: string;
    categoryIds?: string[];
    /** default present only; true = upcoming; "all" = both */
    upcoming?: boolean | "all";
  } = {},
) {
  await requireDb();
  const limit = Math.min(opts.limit ?? 20, 100);
  const filter: Record<string, unknown> = {
    deletedAt: null,
    status: "published",
    // Uncategorized products never appear on the public catalogue.
    "categoryIds.0": { $exists: true },
  };
  if (opts.upcoming === true) {
    filter.isUpcoming = true;
  } else if (opts.upcoming !== "all") {
    filter.isUpcoming = { $ne: true };
  }
  if (opts.q) {
    filter.$or = [
      { sku: { $regex: opts.q, $options: "i" } },
      { slug: { $regex: opts.q, $options: "i" } },
      { "name.en": { $regex: opts.q, $options: "i" } },
    ];
  }
  const catIds = [
    ...(opts.categoryIds ?? []),
    ...(opts.categoryId ? [opts.categoryId] : []),
  ].filter(Boolean);
  if (catIds.length === 1) {
    filter.categoryIds = catIds[0];
  } else if (catIds.length > 1) {
    filter.categoryIds = { $in: catIds };
  }
  if (opts.cursor) {
    const cursorDoc = await Product.findById(opts.cursor).select({ sortOrder: 1 }).lean();
    const cursorOrder = Number(
      (cursorDoc as { sortOrder?: number } | null)?.sortOrder ?? 0,
    );
    const page = {
      $or: [
        { sortOrder: { $gt: cursorOrder } },
        { sortOrder: cursorOrder, _id: { $gt: opts.cursor } },
      ],
    };
    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, page];
      delete filter.$or;
    } else {
      Object.assign(filter, page);
    }
  }
  const rows = await Product.find(filter)
    .sort({ sortOrder: 1, _id: 1 })
    .limit(limit + 1)
    .lean();
  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit).map((r) => toDTO(r as Record<string, unknown>));
  const nextCursor = hasMore ? items[items.length - 1]?.id : null;
  return { items, nextCursor };
}

export async function listUpcomingProducts(opts: { limit?: number } = {}) {
  return listPublishedProducts({ ...opts, upcoming: true });
}

export async function getPublishedProductBySlug(slug: string) {
  await requireDb();
  const doc = await Product.findOne({
    slug,
    status: "published",
    deletedAt: null,
    "categoryIds.0": { $exists: true },
  }).lean();
  if (!doc) return null;
  return toDTO(doc as Record<string, unknown>);
}

export async function createProduct(input: z.input<typeof createProductSchema>) {
  const data = createProductSchema.parse(input);
  await requireDb();
  const doc = await Product.create({
    ...data,
    name: data.name,
    status: data.status ?? "draft",
    version: 1,
  });
  return toDTO(doc.toObject() as Record<string, unknown>);
}

export async function updateProduct(
  id: string,
  input: z.infer<typeof updateProductSchema>,
) {
  // Zod `.default()` on createProductSchema still fires under `.partial()` —
  // so publish({ status }) would wipe categoryIds to []. Only apply keys
  // the caller actually sent.
  const providedKeys = new Set(Object.keys(input));
  const data = updateProductSchema.parse(input);
  await requireDb();
  const existing = await Product.findOne({ _id: id, deletedAt: null });
  if (!existing) return { error: "NOT_FOUND" as const };

  assertVersionMatch(existing.version, data.version);

  const oldSlug = existing.slug;
  const { version: _v, createRedirectOnSlugChange, ...fields } = data;

  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    if (!providedKeys.has(key)) continue;
    if (key === "scheduledPublishAt") {
      existing.scheduledPublishAt = value ? new Date(value as string) : null;
      continue;
    }
    (existing as unknown as Record<string, unknown>)[key] = value;
  }

  if (data.status === "published") {
    const cats = (existing.categoryIds as unknown[] | undefined) ?? [];
    if (!cats.length) {
      return {
        error: "CATEGORY_REQUIRED" as const,
        message:
          "Assign a category before publishing. Uncategorized products cannot go live.",
      };
    }
    const upcoming = Boolean(existing.isUpcoming);
    const hasImage = Boolean(
      (typeof existing.imageUrl === "string" && existing.imageUrl.trim()) ||
      (typeof existing.imageMediaId === "string" && existing.imageMediaId.trim()),
    );
    if (!upcoming && !hasImage) {
      return {
        error: "IMAGE_REQUIRED" as const,
        message:
          "Present catalogue products need a photo before publish. Upload in Media and attach it on the Basic tab.",
      };
    }
    existing.publishedAt = new Date();
    existing.publishedVersion = {
      name: existing.name,
      slug: existing.slug,
      sku: existing.sku,
      blocks: existing.blocks,
      seo: existing.seo,
      publishedAt: existing.publishedAt.toISOString(),
    };
    existing.scheduledPublishAt = null;
  }
  if (data.status === "draft") {
    existing.scheduledPublishAt = null;
  }

  existing.version = (existing.version ?? 1) + 1;
  await existing.save();

  if (
    data.slug !== undefined &&
    data.slug !== oldSlug &&
    createRedirectOnSlugChange !== false
  ) {
    await createRedirect({
      fromPath: `/en/products/${oldSlug}`,
      toPath: `/en/products/${data.slug}`,
      statusCode: 301,
      active: true,
    }).catch(() => undefined);
  }

  return { product: toDTO(existing.toObject() as Record<string, unknown>) };
}

export async function publishProduct(id: string, version: number) {
  return updateProduct(id, { status: "published", version });
}

export async function unpublishProduct(id: string, version: number) {
  return updateProduct(id, {
    status: "draft",
    scheduledPublishAt: null,
    version,
  });
}

export async function listDueScheduledProducts(now = new Date()) {
  await requireDb();
  const rows = await Product.find({
    deletedAt: null,
    status: "scheduled",
    scheduledPublishAt: { $lte: now },
  }).lean();
  return rows.map((r) => toDTO(r as Record<string, unknown>));
}

export async function applyScheduledProductPublish(id: string) {
  await requireDb();
  const existing = await Product.findOne({ _id: id, deletedAt: null });
  if (!existing) return null;
  existing.status = "published";
  existing.publishedAt = new Date();
  existing.publishedVersion = {
    name: existing.name,
    slug: existing.slug,
    sku: existing.sku,
    blocks: existing.blocks,
    seo: existing.seo,
    publishedAt: existing.publishedAt.toISOString(),
  };
  existing.scheduledPublishAt = null;
  existing.version = (existing.version ?? 1) + 1;
  await existing.save();
  return toDTO(existing.toObject() as Record<string, unknown>);
}

export async function duplicateProduct(id: string) {
  await requireDb();
  const src = await Product.findOne({ _id: id, deletedAt: null }).lean();
  if (!src) return null;
  const stamp = Date.now().toString(36);
  const doc = await Product.create({
    ...src,
    _id: undefined,
    sku: `${src.sku}-COPY-${stamp}`,
    slug: `${src.slug}-copy-${stamp}`,
    status: "draft",
    version: 1,
    deletedAt: null,
    createdAt: undefined,
    updatedAt: undefined,
  });
  return toDTO(doc.toObject() as Record<string, unknown>);
}

export async function softDeleteProduct(id: string) {
  await requireDb();
  const doc = await Product.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date(), $inc: { version: 1 } },
    { new: true },
  ).lean();
  if (!doc) return null;
  return toDTO(doc as Record<string, unknown>);
}

export async function restoreProduct(id: string) {
  await requireDb();
  const doc = await Product.findOneAndUpdate(
    { _id: id, deletedAt: { $ne: null } },
    { deletedAt: null, $inc: { version: 1 } },
    { new: true },
  ).lean();
  if (!doc) return null;
  return toDTO(doc as Record<string, unknown>);
}

export async function purgeProduct(id: string) {
  await requireDb();
  const res = await Product.deleteOne({ _id: id, deletedAt: { $ne: null } });
  return res.deletedCount === 1;
}

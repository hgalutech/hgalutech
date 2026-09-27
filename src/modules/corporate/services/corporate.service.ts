import { assertVersionMatch, isConflictError } from "@/lib/http/conflict";
import { dbConnect } from "@/lib/db/connect";
import type {
  CapacityMetricDTO,
  CaseStudyDTO,
  CertificationDTO,
  CompanyProfileDTO,
  CustomerLogoDTO,
  ExpansionProjectDTO,
  ExpansionProjectPublicDTO,
  PersonDTO,
  SustainabilityMetricDTO,
  TestimonialDTO,
} from "../types";
import {
  companyProfileSchema,
  createCapacityMetricSchema,
  createCaseStudySchema,
  createCertificationSchema,
  createCustomerLogoSchema,
  createExpansionProjectSchema,
  createPersonSchema,
  createSustainabilityMetricSchema,
  createTestimonialSchema,
  updateCapacityMetricSchema,
  updateCaseStudySchema,
  updateCertificationSchema,
  updateCustomerLogoSchema,
  updateExpansionProjectSchema,
  updatePersonSchema,
  updateSustainabilityMetricSchema,
  updateTestimonialSchema,
} from "../validators/corporate.validators";
import { CompanyProfile } from "../repositories/mongo/company-profile.model";
import { Person } from "../repositories/mongo/person.model";
import { CapacityMetric } from "../repositories/mongo/capacity-metric.model";
import { Certification } from "../repositories/mongo/certification.model";
import { SustainabilityMetric } from "../repositories/mongo/sustainability-metric.model";
import { CustomerLogo } from "../repositories/mongo/customer-logo.model";
import { CaseStudy } from "../repositories/mongo/case-study.model";
import { Testimonial } from "../repositories/mongo/testimonial.model";
import { ExpansionProject } from "../repositories/mongo/expansion-project.model";
import type { z } from "zod";

async function requireDb() {
  const conn = await dbConnect();
  if (!conn) throw new Error("MONGODB_URI is not configured");
}

function mapToObj(map: unknown): { en: string } {
  if (!map) return { en: "" };
  if (map instanceof Map) return { en: String(map.get("en") ?? "") };
  const obj = map as Record<string, string>;
  return { en: String(obj.en ?? "") };
}

function emptyAddress() {
  return {
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  };
}

function toCompanyDTO(doc: Record<string, unknown>): CompanyProfileDTO {
  const office = (doc.registeredOffice as Record<string, string>) ?? {};
  const factory = (doc.factoryAddress as Record<string, string>) ?? {};
  const emails = (doc.emails as Record<string, string>) ?? {};
  const logo = (doc.logo as Record<string, string | null>) ?? {};
  const colors = (doc.brandColors as Record<string, string>) ?? {};
  const display =
    (doc.displayNames as { primary?: string; alsoMention?: string[] }) ?? {};
  return {
    id: String(doc._id),
    legalName: String(doc.legalName ?? ""),
    displayNames: {
      primary: String(display.primary ?? ""),
      alsoMention: display.alsoMention ?? [],
    },
    cin: String(doc.cin ?? ""),
    gst: String(doc.gst ?? ""),
    registeredOffice: {
      line1: office.line1 ?? "",
      line2: office.line2,
      city: office.city ?? "",
      state: office.state ?? "",
      postalCode: office.postalCode ?? "",
      country: office.country ?? "India",
    },
    factoryAddress: {
      line1: factory.line1 ?? "",
      line2: factory.line2,
      city: factory.city ?? "",
      state: factory.state ?? "",
      postalCode: factory.postalCode ?? "",
      country: factory.country ?? "India",
    },
    phones: ((doc.phones as { label: string; number: string }[]) ?? []).map((p) => ({
      label: p.label,
      number: p.number,
    })),
    emails: {
      sales: emails.sales ?? "",
      export: emails.export ?? "",
      purchase: emails.purchase ?? "",
      investor: emails.investor ?? "",
      hr: emails.hr ?? "",
      quality: emails.quality ?? "",
    },
    logo: {
      png: logo.png ?? null,
      svg: logo.svg ?? null,
      pdf: logo.pdf ?? null,
    },
    logoDisplayHeightPx: (() => {
      const n = Number(doc.logoDisplayHeightPx ?? 40);
      if (!Number.isFinite(n)) return 40;
      return Math.min(72, Math.max(28, Math.round(n)));
    })(),
    brandColors: {
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.accent,
    },
    locations: (
      (doc.locations as {
        id: string;
        label: string;
        address: string;
        mapsUrl: string;
        embedUrl: string;
        order?: number;
      }[]) ?? []
    )
      .map((l) => ({
        id: l.id,
        label: l.label ?? "",
        address: l.address ?? "",
        mapsUrl: l.mapsUrl ?? "",
        embedUrl: l.embedUrl ?? "",
        order: l.order ?? 0,
      }))
      .sort((a, b) => a.order - b.order),
    socialLinks: (
      (doc.socialLinks as {
        id: string;
        platform: string;
        url: string;
        label?: string;
        order?: number;
      }[]) ?? []
    )
      .map((l) => ({
        id: l.id,
        platform: l.platform as CompanyProfileDTO["socialLinks"][number]["platform"],
        url: String(l.url ?? "").trim(),
        label: l.label,
        order: l.order ?? 0,
      }))
      .filter(
        (l) =>
          l.id &&
          l.url &&
          [
            "linkedin",
            "facebook",
            "instagram",
            "youtube",
            "x",
            "whatsapp",
            "other",
          ].includes(l.platform),
      )
      .sort((a, b) => a.order - b.order),
    locale: String(doc.locale ?? "en"),
    version: Number(doc.version ?? 1),
    updatedAt: new Date(doc.updatedAt as Date).toISOString(),
  };
}

export async function getCompanyProfile(): Promise<CompanyProfileDTO | null> {
  await requireDb();
  const doc = await CompanyProfile.findOne().lean();
  if (!doc) return null;
  return toCompanyDTO(doc as Record<string, unknown>);
}

export async function upsertCompanyProfile(input: z.input<typeof companyProfileSchema>) {
  try {
    const data = companyProfileSchema.parse(input);
    await requireDb();
    const existing = await CompanyProfile.findOne();
    if (!existing) {
      const created = await CompanyProfile.create({
        ...data,
        version: 1,
      });
      return {
        profile: toCompanyDTO(created.toObject() as Record<string, unknown>),
      };
    }
    assertVersionMatch(existing.version, data.version);
    const { version: _v, ...fields } = data;
    Object.assign(existing, fields);
    existing.version = (existing.version ?? 1) + 1;
    await existing.save();
    return {
      profile: toCompanyDTO(existing.toObject() as Record<string, unknown>),
    };
  } catch (err) {
    if (isConflictError(err)) return { error: "CONFLICT" as const, message: err.message };
    throw err;
  }
}

function toPersonDTO(doc: Record<string, unknown>): PersonDTO {
  return {
    id: String(doc._id),
    name: mapToObj(doc.name),
    slug: String(doc.slug),
    role: doc.role as PersonDTO["role"],
    boardDesignation: String(doc.boardDesignation ?? ""),
    yearsExperience: Number(doc.yearsExperience ?? 0),
    bio: mapToObj(doc.bio),
    photoId: (doc.photoId as string | null) ?? null,
    photoUrl: (doc.photoUrl as string | null) ?? null,
    sortOrder: Number(doc.sortOrder ?? 0),
    leadershipSection: ((doc.leadershipSection as string) === "operational"
      ? "operational"
      : "board") as "board" | "operational",
    status: (doc.status as PersonDTO["status"]) ?? "draft",
    showOnInvestorPage: Boolean(doc.showOnInvestorPage),
    showOnChairmansPage: Boolean(doc.showOnChairmansPage),
    version: Number(doc.version ?? 1),
    deletedAt: doc.deletedAt ? new Date(doc.deletedAt as Date).toISOString() : null,
    createdAt: new Date(doc.createdAt as Date).toISOString(),
    updatedAt: new Date(doc.updatedAt as Date).toISOString(),
  };
}

async function listSoftDeleted<T>(
  Model: {
    find: (...args: never[]) => {
      sort: (...args: never[]) => {
        limit: (...args: never[]) => { lean: () => Promise<unknown[]> };
      };
    };
  },
  toDto: (doc: Record<string, unknown>) => T,
  opts: { includeDeleted?: boolean; q?: string; qFields?: string[] } = {},
) {
  await requireDb();
  const filter: Record<string, unknown> = opts.includeDeleted
    ? { deletedAt: { $ne: null } }
    : { deletedAt: null };
  if (opts.q && opts.qFields?.length) {
    filter.$or = opts.qFields.map((f) => ({
      [f]: { $regex: opts.q, $options: "i" },
    }));
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = await (Model as any).find(filter).sort({ _id: -1 }).limit(100).lean();
  return {
    items: (rows as Record<string, unknown>[]).map((r) => toDto(r)),
  };
}

export async function listPeople(opts: { includeDeleted?: boolean; q?: string } = {}) {
  return listSoftDeleted(Person, toPersonDTO, {
    ...opts,
    qFields: ["slug", "name.en", "boardDesignation"],
  });
}

export async function listPublishedPeople() {
  await requireDb();
  const rows = await Person.find({
    deletedAt: null,
    status: "published",
  })
    .sort({ sortOrder: 1, _id: 1 })
    .lean();
  return rows.map((r) => toPersonDTO(r as Record<string, unknown>));
}

/** Chairmen (and anyone flagged) for the Chairman’s Message page. */
export async function listPublishedChairmen() {
  await requireDb();
  const rows = await Person.find({
    deletedAt: null,
    status: "published",
    $or: [{ showOnChairmansPage: true }, { role: "chairman" }],
  })
    .sort({ sortOrder: 1, _id: 1 })
    .lean();
  return rows.map((r) => toPersonDTO(r as Record<string, unknown>));
}

export async function getPersonById(id: string) {
  await requireDb();
  const doc = await Person.findOne({ _id: id, deletedAt: null }).lean();
  if (!doc) return null;
  return toPersonDTO(doc as Record<string, unknown>);
}

export async function createPerson(input: z.input<typeof createPersonSchema>) {
  const data = createPersonSchema.parse(input);
  await requireDb();
  const doc = await Person.create({
    ...data,
    status: data.status ?? "draft",
    version: 1,
  });
  return toPersonDTO(doc.toObject() as Record<string, unknown>);
}

export async function updatePerson(
  id: string,
  input: z.infer<typeof updatePersonSchema>,
) {
  try {
    const providedKeys = new Set(Object.keys(input));
    const data = updatePersonSchema.parse(input);
    await requireDb();
    const existing = await Person.findOne({ _id: id, deletedAt: null });
    if (!existing) return { error: "NOT_FOUND" as const };
    assertVersionMatch(existing.version, data.version);
    const { version: _v, ...fields } = data;
    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined) continue;
      if (!providedKeys.has(key)) continue;
      if (key === "name" || key === "bio") {
        (existing as unknown as Record<string, unknown>)[key] = value;
        continue;
      }
      (existing as unknown as Record<string, unknown>)[key] = value;
    }
    existing.version = (existing.version ?? 1) + 1;
    await existing.save();
    return { person: toPersonDTO(existing.toObject() as Record<string, unknown>) };
  } catch (err) {
    if (isConflictError(err)) return { error: "CONFLICT" as const, message: err.message };
    throw err;
  }
}

export async function softDeletePerson(id: string) {
  await requireDb();
  const doc = await Person.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? toPersonDTO(doc as Record<string, unknown>) : null;
}

/** Bulk reorder: update sortOrder + leadershipSection for a batch of people at once. */
export async function reorderPeople(
  items: { id: string; section: "board" | "operational"; sectionOrder: number }[],
) {
  await requireDb();
  if (!items.length) return { updated: 0 };
  // Use Promise.all with strict: false to bypass Next.js HMR model caching issues
  // where the old model schema (without leadershipSection) is still in memory,
  // causing Mongoose to silently strip the field during a standard update/bulkWrite.
  await Promise.all(
    items.map(({ id, section, sectionOrder }) =>
      Person.updateOne(
        { _id: id, deletedAt: null },
        { $set: { leadershipSection: section, sortOrder: sectionOrder } },
        { strict: false },
      ),
    ),
  );
  return { updated: items.length };
}

function toCapacityDTO(doc: Record<string, unknown>): CapacityMetricDTO {
  return {
    id: String(doc._id),
    key: String(doc.key),
    label: mapToObj(doc.label),
    value: String(doc.value ?? ""),
    unit: String(doc.unit ?? ""),
    category: doc.category as CapacityMetricDTO["category"],
    sourceNote: String(doc.sourceNote ?? ""),
    verificationStatus:
      (doc.verificationStatus as CapacityMetricDTO["verificationStatus"]) ?? "draft",
    verifiedBy: (doc.verifiedBy as string | null) ?? null,
    verifiedAt: doc.verifiedAt ? new Date(doc.verifiedAt as Date).toISOString() : null,
    publishStatus: (doc.publishStatus as CapacityMetricDTO["publishStatus"]) ?? "hidden",
    displayOrder: Number(doc.displayOrder ?? 0),
    version: Number(doc.version ?? 1),
    deletedAt: doc.deletedAt ? new Date(doc.deletedAt as Date).toISOString() : null,
    createdAt: new Date(doc.createdAt as Date).toISOString(),
    updatedAt: new Date(doc.updatedAt as Date).toISOString(),
  };
}

export async function listCapacityMetrics(
  opts: { includeDeleted?: boolean; q?: string } = {},
) {
  return listSoftDeleted(CapacityMetric, toCapacityDTO, {
    ...opts,
    qFields: ["key", "label.en"],
  });
}

export async function listPublishedCapacityMetrics() {
  await requireDb();
  const rows = await CapacityMetric.find({
    deletedAt: null,
    publishStatus: "published",
    verificationStatus: "verified",
  })
    .sort({ displayOrder: 1, _id: 1 })
    .lean();
  return rows.map((r) => toCapacityDTO(r as Record<string, unknown>));
}

export async function getCapacityMetricById(id: string) {
  await requireDb();
  const doc = await CapacityMetric.findOne({ _id: id, deletedAt: null }).lean();
  if (!doc) return null;
  return toCapacityDTO(doc as Record<string, unknown>);
}

export async function createCapacityMetric(
  input: z.infer<typeof createCapacityMetricSchema>,
) {
  const data = createCapacityMetricSchema.parse(input);
  await requireDb();
  const doc = await CapacityMetric.create({ ...data, version: 1 });
  return toCapacityDTO(doc.toObject() as Record<string, unknown>);
}

export async function updateCapacityMetric(
  id: string,
  input: z.infer<typeof updateCapacityMetricSchema>,
) {
  try {
    const data = updateCapacityMetricSchema.parse(input);
    await requireDb();
    const existing = await CapacityMetric.findOne({ _id: id, deletedAt: null });
    if (!existing) return { error: "NOT_FOUND" as const };
    assertVersionMatch(existing.version, data.version);

    const nextVerification = data.verificationStatus ?? existing.verificationStatus;
    const nextPublish = data.publishStatus ?? existing.publishStatus;
    if (nextPublish === "published" && nextVerification !== "verified") {
      return {
        error: "VALIDATION_ERROR" as const,
        message: "Capacity metrics must be verified before publish",
      };
    }
    if (data.verificationStatus === "verified" && !existing.verifiedAt) {
      existing.verifiedAt = new Date();
    }

    const { version: _v, ...fields } = data;
    Object.assign(existing, fields);
    existing.version = (existing.version ?? 1) + 1;
    await existing.save();
    return {
      metric: toCapacityDTO(existing.toObject() as Record<string, unknown>),
    };
  } catch (err) {
    if (isConflictError(err)) return { error: "CONFLICT" as const, message: err.message };
    throw err;
  }
}

export async function softDeleteCapacityMetric(id: string) {
  await requireDb();
  const doc = await CapacityMetric.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? toCapacityDTO(doc as Record<string, unknown>) : null;
}

function toCertDTO(doc: Record<string, unknown>): CertificationDTO {
  return {
    id: String(doc._id),
    name: String(doc.name),
    type: doc.type as CertificationDTO["type"],
    issuer: String(doc.issuer ?? ""),
    validFrom: doc.validFrom ? new Date(doc.validFrom as Date).toISOString() : null,
    validTo: doc.validTo ? new Date(doc.validTo as Date).toISOString() : null,
    documentId: (doc.documentId as string | null) ?? null,
    publishStatus: (doc.publishStatus as CertificationDTO["publishStatus"]) ?? "draft",
    version: Number(doc.version ?? 1),
    deletedAt: doc.deletedAt ? new Date(doc.deletedAt as Date).toISOString() : null,
    createdAt: new Date(doc.createdAt as Date).toISOString(),
    updatedAt: new Date(doc.updatedAt as Date).toISOString(),
  };
}

export async function listCertifications(
  opts: { includeDeleted?: boolean; q?: string } = {},
) {
  return listSoftDeleted(Certification, toCertDTO, {
    ...opts,
    qFields: ["name", "issuer"],
  });
}

export async function listPublishedCertifications() {
  await requireDb();
  const rows = await Certification.find({
    deletedAt: null,
    publishStatus: "published",
  })
    .sort({ _id: -1 })
    .lean();
  return rows.map((r) => toCertDTO(r as Record<string, unknown>));
}

export async function getCertificationById(id: string) {
  await requireDb();
  const doc = await Certification.findOne({ _id: id, deletedAt: null }).lean();
  if (!doc) return null;
  return toCertDTO(doc as Record<string, unknown>);
}

export async function createCertification(
  input: z.infer<typeof createCertificationSchema>,
) {
  const data = createCertificationSchema.parse(input);
  await requireDb();
  const doc = await Certification.create({
    ...data,
    validFrom: data.validFrom ? new Date(data.validFrom) : null,
    validTo: data.validTo ? new Date(data.validTo) : null,
    version: 1,
  });
  return toCertDTO(doc.toObject() as Record<string, unknown>);
}

export async function updateCertification(
  id: string,
  input: z.infer<typeof updateCertificationSchema>,
) {
  try {
    const data = updateCertificationSchema.parse(input);
    await requireDb();
    const existing = await Certification.findOne({ _id: id, deletedAt: null });
    if (!existing) return { error: "NOT_FOUND" as const };
    assertVersionMatch(existing.version, data.version);
    const { version: _v, validFrom, validTo, ...fields } = data;
    Object.assign(existing, fields);
    if (validFrom !== undefined)
      existing.validFrom = validFrom ? new Date(validFrom) : null;
    if (validTo !== undefined) existing.validTo = validTo ? new Date(validTo) : null;
    existing.version = (existing.version ?? 1) + 1;
    await existing.save();
    return {
      certification: toCertDTO(existing.toObject() as Record<string, unknown>),
    };
  } catch (err) {
    if (isConflictError(err)) return { error: "CONFLICT" as const, message: err.message };
    throw err;
  }
}

export async function softDeleteCertification(id: string) {
  await requireDb();
  const doc = await Certification.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? toCertDTO(doc as Record<string, unknown>) : null;
}

function toSustainDTO(doc: Record<string, unknown>): SustainabilityMetricDTO {
  return {
    id: String(doc._id),
    key: String(doc.key),
    label: mapToObj(doc.label),
    value: (doc.value as string | null) ?? null,
    unit: String(doc.unit ?? ""),
    disclosureTier: doc.disclosureTier as SustainabilityMetricDTO["disclosureTier"],
    evidenceMediaIds: ((doc.evidenceMediaIds as string[]) ?? []).map(String),
    methodologyNote: String(doc.methodologyNote ?? ""),
    verificationStatus:
      (doc.verificationStatus as SustainabilityMetricDTO["verificationStatus"]) ??
      "draft",
    publishStatus:
      (doc.publishStatus as SustainabilityMetricDTO["publishStatus"]) ?? "hidden",
    version: Number(doc.version ?? 1),
    deletedAt: doc.deletedAt ? new Date(doc.deletedAt as Date).toISOString() : null,
    createdAt: new Date(doc.createdAt as Date).toISOString(),
    updatedAt: new Date(doc.updatedAt as Date).toISOString(),
  };
}

export async function listSustainabilityMetrics(
  opts: { includeDeleted?: boolean; q?: string } = {},
) {
  return listSoftDeleted(SustainabilityMetric, toSustainDTO, {
    ...opts,
    qFields: ["key", "label.en"],
  });
}

export async function listPublishedSustainabilityMetrics() {
  await requireDb();
  const rows = await SustainabilityMetric.find({
    deletedAt: null,
    publishStatus: "published",
  })
    .sort({ _id: 1 })
    .lean();
  return rows
    .map((r) => toSustainDTO(r as Record<string, unknown>))
    .filter(
      (m) =>
        m.disclosureTier !== "verified_metric" || m.verificationStatus === "verified",
    );
}

export async function getSustainabilityMetricById(id: string) {
  await requireDb();
  const doc = await SustainabilityMetric.findOne({
    _id: id,
    deletedAt: null,
  }).lean();
  if (!doc) return null;
  return toSustainDTO(doc as Record<string, unknown>);
}

export async function createSustainabilityMetric(
  input: z.infer<typeof createSustainabilityMetricSchema>,
) {
  const data = createSustainabilityMetricSchema.parse(input);
  await requireDb();
  const doc = await SustainabilityMetric.create({ ...data, version: 1 });
  return toSustainDTO(doc.toObject() as Record<string, unknown>);
}

export async function updateSustainabilityMetric(
  id: string,
  input: z.infer<typeof updateSustainabilityMetricSchema>,
) {
  try {
    const data = updateSustainabilityMetricSchema.parse(input);
    await requireDb();
    const existing = await SustainabilityMetric.findOne({
      _id: id,
      deletedAt: null,
    });
    if (!existing) return { error: "NOT_FOUND" as const };
    assertVersionMatch(existing.version, data.version);
    const nextTier = data.disclosureTier ?? existing.disclosureTier;
    const nextVer = data.verificationStatus ?? existing.verificationStatus;
    const nextPub = data.publishStatus ?? existing.publishStatus;
    if (
      nextPub === "published" &&
      nextTier === "verified_metric" &&
      nextVer !== "verified"
    ) {
      return {
        error: "VALIDATION_ERROR" as const,
        message: "Verified metrics must be verified before publish",
      };
    }
    const { version: _v, ...fields } = data;
    Object.assign(existing, fields);
    existing.version = (existing.version ?? 1) + 1;
    await existing.save();
    return {
      metric: toSustainDTO(existing.toObject() as Record<string, unknown>),
    };
  } catch (err) {
    if (isConflictError(err)) return { error: "CONFLICT" as const, message: err.message };
    throw err;
  }
}

export async function softDeleteSustainabilityMetric(id: string) {
  await requireDb();
  const doc = await SustainabilityMetric.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? toSustainDTO(doc as Record<string, unknown>) : null;
}

function toLogoDTO(doc: Record<string, unknown>): CustomerLogoDTO {
  const kind = doc.listingKind === "potential" ? "potential" : "confirmed";
  return {
    id: String(doc._id),
    name: String(doc.name),
    logoId: (doc.logoId as string | null) ?? null,
    imageUrl: (doc.imageUrl as string | null) ?? null,
    listingKind: kind,
    approvedForWebsite: Boolean(doc.approvedForWebsite),
    permissionNote: String(doc.permissionNote ?? ""),
    publishStatus: (doc.publishStatus as CustomerLogoDTO["publishStatus"]) ?? "draft",
    sortOrder: Number(doc.sortOrder ?? 0),
    version: Number(doc.version ?? 1),
    deletedAt: doc.deletedAt ? new Date(doc.deletedAt as Date).toISOString() : null,
    createdAt: new Date(doc.createdAt as Date).toISOString(),
    updatedAt: new Date(doc.updatedAt as Date).toISOString(),
  };
}

export async function listCustomerLogos(
  opts: { includeDeleted?: boolean; q?: string } = {},
) {
  return listSoftDeleted(CustomerLogo, toLogoDTO, {
    ...opts,
    qFields: ["name"],
  });
}

export async function listPublishedCustomerLogos(
  opts: { listingKind?: "confirmed" | "potential" } = {},
) {
  await requireDb();
  const filter: Record<string, unknown> = {
    deletedAt: null,
    publishStatus: "published",
    approvedForWebsite: true,
  };
  if (opts.listingKind) {
    filter.listingKind =
      opts.listingKind === "potential" ? "potential" : { $ne: "potential" };
  }
  const rows = await CustomerLogo.find(filter).sort({ sortOrder: 1 }).lean();
  return rows.map((r) => toLogoDTO(r as Record<string, unknown>));
}

export async function getCustomerLogoById(id: string) {
  await requireDb();
  const doc = await CustomerLogo.findOne({ _id: id, deletedAt: null }).lean();
  if (!doc) return null;
  return toLogoDTO(doc as Record<string, unknown>);
}

export async function createCustomerLogo(
  input: z.infer<typeof createCustomerLogoSchema>,
) {
  const data = createCustomerLogoSchema.parse(input);
  await requireDb();
  const doc = await CustomerLogo.create({ ...data, version: 1 });
  return toLogoDTO(doc.toObject() as Record<string, unknown>);
}

export async function updateCustomerLogo(
  id: string,
  input: z.infer<typeof updateCustomerLogoSchema>,
) {
  try {
    const providedKeys = new Set(Object.keys(input));
    const data = updateCustomerLogoSchema.parse(input);
    await requireDb();
    const existing = await CustomerLogo.findOne({ _id: id, deletedAt: null });
    if (!existing) return { error: "NOT_FOUND" as const };
    assertVersionMatch(existing.version, data.version);
    const nextApproved = providedKeys.has("approvedForWebsite")
      ? Boolean(data.approvedForWebsite)
      : existing.approvedForWebsite;
    const nextPub = providedKeys.has("publishStatus")
      ? (data.publishStatus ?? existing.publishStatus)
      : existing.publishStatus;
    if (nextPub === "published" && !nextApproved) {
      return {
        error: "VALIDATION_ERROR" as const,
        message: "Mark “Approved for website” before publish.",
      };
    }
    const { version: _v, ...fields } = data;
    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined) continue;
      if (!providedKeys.has(key)) continue;
      (existing as unknown as Record<string, unknown>)[key] = value;
    }
    existing.version = (existing.version ?? 1) + 1;
    await existing.save();
    return { logo: toLogoDTO(existing.toObject() as Record<string, unknown>) };
  } catch (err) {
    if (isConflictError(err)) return { error: "CONFLICT" as const, message: err.message };
    throw err;
  }
}

export async function softDeleteCustomerLogo(id: string) {
  await requireDb();
  const doc = await CustomerLogo.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? toLogoDTO(doc as Record<string, unknown>) : null;
}

function toCaseDTO(doc: Record<string, unknown>): CaseStudyDTO {
  return {
    id: String(doc._id),
    title: mapToObj(doc.title),
    slug: String(doc.slug),
    industry: String(doc.industry ?? ""),
    region: String(doc.region ?? ""),
    summary: mapToObj(doc.summary),
    imageIds: ((doc.imageIds as string[]) ?? []).map(String),
    productIds: ((doc.productIds as string[]) ?? []).map(String),
    approvedForWebsite: Boolean(doc.approvedForWebsite),
    publishStatus: (doc.publishStatus as CaseStudyDTO["publishStatus"]) ?? "draft",
    version: Number(doc.version ?? 1),
    deletedAt: doc.deletedAt ? new Date(doc.deletedAt as Date).toISOString() : null,
    createdAt: new Date(doc.createdAt as Date).toISOString(),
    updatedAt: new Date(doc.updatedAt as Date).toISOString(),
  };
}

export async function listCaseStudies(
  opts: { includeDeleted?: boolean; q?: string } = {},
) {
  return listSoftDeleted(CaseStudy, toCaseDTO, {
    ...opts,
    qFields: ["slug", "title.en", "industry"],
  });
}

export async function listPublishedCaseStudies() {
  await requireDb();
  const rows = await CaseStudy.find({
    deletedAt: null,
    publishStatus: "published",
    approvedForWebsite: true,
  })
    .sort({ _id: -1 })
    .lean();
  return rows.map((r) => toCaseDTO(r as Record<string, unknown>));
}

export async function getCaseStudyById(id: string) {
  await requireDb();
  const doc = await CaseStudy.findOne({ _id: id, deletedAt: null }).lean();
  if (!doc) return null;
  return toCaseDTO(doc as Record<string, unknown>);
}

export async function createCaseStudy(input: z.infer<typeof createCaseStudySchema>) {
  const data = createCaseStudySchema.parse(input);
  await requireDb();
  const doc = await CaseStudy.create({ ...data, version: 1 });
  return toCaseDTO(doc.toObject() as Record<string, unknown>);
}

export async function updateCaseStudy(
  id: string,
  input: z.infer<typeof updateCaseStudySchema>,
) {
  try {
    const data = updateCaseStudySchema.parse(input);
    await requireDb();
    const existing = await CaseStudy.findOne({ _id: id, deletedAt: null });
    if (!existing) return { error: "NOT_FOUND" as const };
    assertVersionMatch(existing.version, data.version);
    const nextApproved = data.approvedForWebsite ?? existing.approvedForWebsite;
    const nextPub = data.publishStatus ?? existing.publishStatus;
    if (nextPub === "published" && !nextApproved) {
      return {
        error: "VALIDATION_ERROR" as const,
        message: "approvedForWebsite required to publish",
      };
    }
    const { version: _v, ...fields } = data;
    Object.assign(existing, fields);
    existing.version = (existing.version ?? 1) + 1;
    await existing.save();
    return {
      caseStudy: toCaseDTO(existing.toObject() as Record<string, unknown>),
    };
  } catch (err) {
    if (isConflictError(err)) return { error: "CONFLICT" as const, message: err.message };
    throw err;
  }
}

export async function softDeleteCaseStudy(id: string) {
  await requireDb();
  const doc = await CaseStudy.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? toCaseDTO(doc as Record<string, unknown>) : null;
}

function toTestimonialDTO(doc: Record<string, unknown>): TestimonialDTO {
  return {
    id: String(doc._id),
    quote: mapToObj(doc.quote),
    authorName: String(doc.authorName),
    authorTitle: String(doc.authorTitle ?? ""),
    company: String(doc.company ?? ""),
    approvedForWebsite: Boolean(doc.approvedForWebsite),
    publishStatus: (doc.publishStatus as TestimonialDTO["publishStatus"]) ?? "draft",
    sortOrder: Number(doc.sortOrder ?? 0),
    version: Number(doc.version ?? 1),
    deletedAt: doc.deletedAt ? new Date(doc.deletedAt as Date).toISOString() : null,
    createdAt: new Date(doc.createdAt as Date).toISOString(),
    updatedAt: new Date(doc.updatedAt as Date).toISOString(),
  };
}

export async function listTestimonials(
  opts: { includeDeleted?: boolean; q?: string } = {},
) {
  return listSoftDeleted(Testimonial, toTestimonialDTO, {
    ...opts,
    qFields: ["authorName", "company", "quote.en"],
  });
}

export async function listPublishedTestimonials() {
  await requireDb();
  const rows = await Testimonial.find({
    deletedAt: null,
    publishStatus: "published",
    approvedForWebsite: true,
  })
    .sort({ sortOrder: 1 })
    .lean();
  return rows.map((r) => toTestimonialDTO(r as Record<string, unknown>));
}

export async function getTestimonialById(id: string) {
  await requireDb();
  const doc = await Testimonial.findOne({ _id: id, deletedAt: null }).lean();
  if (!doc) return null;
  return toTestimonialDTO(doc as Record<string, unknown>);
}

export async function createTestimonial(input: z.infer<typeof createTestimonialSchema>) {
  const data = createTestimonialSchema.parse(input);
  await requireDb();
  const doc = await Testimonial.create({ ...data, version: 1 });
  return toTestimonialDTO(doc.toObject() as Record<string, unknown>);
}

export async function updateTestimonial(
  id: string,
  input: z.infer<typeof updateTestimonialSchema>,
) {
  try {
    const data = updateTestimonialSchema.parse(input);
    await requireDb();
    const existing = await Testimonial.findOne({ _id: id, deletedAt: null });
    if (!existing) return { error: "NOT_FOUND" as const };
    assertVersionMatch(existing.version, data.version);
    const nextApproved = data.approvedForWebsite ?? existing.approvedForWebsite;
    const nextPub = data.publishStatus ?? existing.publishStatus;
    if (nextPub === "published" && !nextApproved) {
      return {
        error: "VALIDATION_ERROR" as const,
        message: "approvedForWebsite required to publish",
      };
    }
    const { version: _v, ...fields } = data;
    Object.assign(existing, fields);
    existing.version = (existing.version ?? 1) + 1;
    await existing.save();
    return {
      testimonial: toTestimonialDTO(existing.toObject() as Record<string, unknown>),
    };
  } catch (err) {
    if (isConflictError(err)) return { error: "CONFLICT" as const, message: err.message };
    throw err;
  }
}

export async function softDeleteTestimonial(id: string) {
  await requireDb();
  const doc = await Testimonial.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? toTestimonialDTO(doc as Record<string, unknown>) : null;
}

function toExpansionDTO(doc: Record<string, unknown>): ExpansionProjectDTO {
  return {
    id: String(doc._id),
    title: mapToObj(doc.title),
    slug: String(doc.slug),
    status: (doc.status as ExpansionProjectDTO["status"]) ?? "planned",
    description: mapToObj(doc.description),
    locationNote: String(doc.locationNote ?? ""),
    expectedStart: String(doc.expectedStart ?? ""),
    expectedCommissioning: String(doc.expectedCommissioning ?? ""),
    projectCostInr: doc.projectCostInr == null ? null : Number(doc.projectCostInr),
    estimatedRevenueInr:
      doc.estimatedRevenueInr == null ? null : Number(doc.estimatedRevenueInr),
    publicDisclosureApproved: Boolean(doc.publicDisclosureApproved),
    publishStatus: (doc.publishStatus as ExpansionProjectDTO["publishStatus"]) ?? "draft",
    sortOrder: Number(doc.sortOrder ?? 0),
    version: Number(doc.version ?? 1),
    deletedAt: doc.deletedAt ? new Date(doc.deletedAt as Date).toISOString() : null,
    createdAt: new Date(doc.createdAt as Date).toISOString(),
    updatedAt: new Date(doc.updatedAt as Date).toISOString(),
  };
}

export function toExpansionPublicDTO(
  dto: ExpansionProjectDTO,
): ExpansionProjectPublicDTO {
  const {
    projectCostInr,
    estimatedRevenueInr,
    version: _v,
    deletedAt: _d,
    ...rest
  } = dto;
  if (!dto.publicDisclosureApproved) {
    return rest;
  }
  return { ...rest, projectCostInr, estimatedRevenueInr };
}

export async function listExpansionProjects(
  opts: { includeDeleted?: boolean; q?: string } = {},
) {
  return listSoftDeleted(ExpansionProject, toExpansionDTO, {
    ...opts,
    qFields: ["slug", "title.en", "locationNote"],
  });
}

export async function listPublishedExpansionProjects() {
  await requireDb();
  const rows = await ExpansionProject.find({
    deletedAt: null,
    publishStatus: "published",
  })
    .sort({ sortOrder: 1, _id: 1 })
    .lean();
  return rows
    .map((r) => toExpansionDTO(r as Record<string, unknown>))
    .map(toExpansionPublicDTO);
}

export async function getExpansionProjectById(id: string) {
  await requireDb();
  const doc = await ExpansionProject.findOne({
    _id: id,
    deletedAt: null,
  }).lean();
  if (!doc) return null;
  return toExpansionDTO(doc as Record<string, unknown>);
}

export async function createExpansionProject(
  input: z.input<typeof createExpansionProjectSchema>,
) {
  const data = createExpansionProjectSchema.parse(input);
  await requireDb();
  const doc = await ExpansionProject.create({ ...data, version: 1 });
  return toExpansionDTO(doc.toObject() as Record<string, unknown>);
}

export async function updateExpansionProject(
  id: string,
  input: z.infer<typeof updateExpansionProjectSchema>,
) {
  try {
    const data = updateExpansionProjectSchema.parse(input);
    await requireDb();
    const existing = await ExpansionProject.findOne({
      _id: id,
      deletedAt: null,
    });
    if (!existing) return { error: "NOT_FOUND" as const };
    assertVersionMatch(existing.version, data.version);
    const { version: _v, ...fields } = data;
    Object.assign(existing, fields);
    existing.version = (existing.version ?? 1) + 1;
    await existing.save();
    return {
      project: toExpansionDTO(existing.toObject() as Record<string, unknown>),
    };
  } catch (err) {
    if (isConflictError(err)) return { error: "CONFLICT" as const, message: err.message };
    throw err;
  }
}

export async function softDeleteExpansionProject(id: string) {
  await requireDb();
  const doc = await ExpansionProject.findOneAndUpdate(
    { _id: id, deletedAt: null },
    { deletedAt: new Date() },
    { new: true },
  ).lean();
  return doc ? toExpansionDTO(doc as Record<string, unknown>) : null;
}

/** Ensure empty address helpers available for seeds */
export { emptyAddress };

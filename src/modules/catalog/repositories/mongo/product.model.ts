import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const productSchema = new Schema(
  {
    sku: { type: String, required: true, trim: true },
    name: { type: Map, of: String, required: true },
    slug: { type: String, required: true, trim: true },
    categoryIds: [{ type: Schema.Types.ObjectId, ref: "Category", index: true }],
    formType: {
      type: String,
      enum: ["extrusion", "billet", "ingot", "remelt", "deoxidizer", "other"],
      default: "other",
      index: true,
    },
    alloyGrades: [{ type: String }],
    tempers: [{ type: String }],
    surfaceFinishes: [{ type: String }],
    anodizingColors: [{ type: String }],
    ralColors: [{ type: String }],
    toleranceStandards: [{ type: String }],
    packaging: [{ type: String }],
    applications: [{ type: String }],
    otherApplications: [{ type: String }],
    directCustomers: [{ type: String }],
    endUseIndustries: [{ type: String }],
    capabilityApplications: [{ type: String }],
    highlights: [{ type: String }],
    chemicalComposition: [
      {
        element: { type: String, required: true },
        range: { type: String, default: "" },
        _id: false,
      },
    ],
    maxLengthMm: { type: Number, default: null },
    minLengthMm: { type: Number, default: null },
    maxWidthMm: { type: Number, default: null },
    weightPerMeterKg: { type: Number, default: null },
    typicalDiameterMm: { type: Number, default: null },
    typicalPieceWeightKg: { type: Number, default: null },
    standardsNote: { type: String, default: null },
    moqNote: { type: String, default: null },
    description: { type: String, default: null },
    imageUrl: { type: String, default: null },
    imageMediaId: { type: String, default: null },
    drawingMediaIds: [{ type: String }],
    blocks: { type: [Schema.Types.Mixed], default: [] },
    seo: {
      title: { type: String },
      description: { type: String },
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "published"],
      default: "draft",
    },
    scheduledPublishAt: { type: Date, default: null },
    publishedAt: { type: Date, default: null },
    publishedVersion: { type: Schema.Types.Mixed, default: null },
    isUpcoming: { type: Boolean, default: false, index: true },
    /** Public catalogue order. Lower comes first. Ingots are 0. */
    sortOrder: { type: Number, default: 0, index: true },
    version: { type: Number, default: 1 },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);

productSchema.index(
  { sku: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } },
);
productSchema.index(
  { slug: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } },
);

export type ProductDocument = InferSchemaType<typeof productSchema> & {
  _id: { toString(): string };
};

export const Product: Model<ProductDocument> =
  (models.Product as Model<ProductDocument> | undefined) ??
  model<ProductDocument>("Product", productSchema);

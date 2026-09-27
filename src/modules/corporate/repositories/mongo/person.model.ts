import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const personSchema = new Schema(
  {
    name: { type: Map, of: String, required: true },
    slug: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["director", "chairman", "md", "company_secretary", "executive"],
      required: true,
    },
    boardDesignation: { type: String, default: "" },
    yearsExperience: { type: Number, default: 0 },
    bio: { type: Map, of: String, default: () => new Map([["en", ""]]) },
    photoId: { type: String, default: null },
    photoUrl: { type: String, default: null },
    sortOrder: { type: Number, default: 0 },
    leadershipSection: {
      type: String,
      enum: ["board", "operational"],
      default: "board",
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    showOnInvestorPage: { type: Boolean, default: false },
    showOnChairmansPage: { type: Boolean, default: false },
    version: { type: Number, default: 1 },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);

personSchema.index(
  { slug: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } },
);

export type PersonDocument = InferSchemaType<typeof personSchema> & {
  _id: { toString(): string };
};

export const Person: Model<PersonDocument> =
  (models.Person as Model<PersonDocument> | undefined) ??
  model<PersonDocument>("Person", personSchema);

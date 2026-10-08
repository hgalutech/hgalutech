/**
 * Seed Phase 5 corporate sample for proofs.
 * Creates verified+published capacity metric and a draft (hidden) one.
 */
import { loadEnvLocal } from "./load-env-local";
loadEnvLocal();

import {
  createCapacityMetric,
  createPerson,
  listPublishedCapacityMetrics,
  updateCapacityMetric,
  upsertCompanyProfile,
} from "@/modules/corporate";

async function main() {
  const stamp = Date.now();

  await upsertCompanyProfile({
    legalName: "HG Alutek",
    displayNames: { primary: "HG Alutek", alsoMention: [] },
    cin: "U00000XX0000XXX000000",
    gst: "00AAAAA0000A0Z0",
    registeredOffice: {
      line1: "Registered office",
      city: "City",
      state: "State",
      postalCode: "000000",
      country: "India",
    },
    factoryAddress: {
      line1: "Factory",
      city: "City",
      state: "State",
      postalCode: "000000",
      country: "India",
    },
    phones: [],
    emails: {
      sales: "sales@example.com",
      export: "",
      purchase: "",
      investor: "",
      hr: "",
      quality: "",
    },
    locale: "en",
    version: 1,
  });

  const person = await createPerson({
    name: { en: `Leader ${stamp}` },
    slug: `leader-${stamp}`,
    role: "md",
    boardDesignation: "Managing Director",
    yearsExperience: 20,
    bio: { en: "Phase 5 proof leader." },
    sortOrder: 0,
    status: "published",
    showOnInvestorPage: false,
  });

  const draft = await createCapacityMetric({
    key: `draft_cap_${stamp}`,
    label: { en: `Draft Cap ${stamp}` },
    value: "100",
    unit: "MT",
    category: "extrusion",
    sourceNote: "proof",
    verificationStatus: "draft",
    publishStatus: "hidden",
    displayOrder: 99,
  });

  let live = await createCapacityMetric({
    key: `live_cap_${stamp}`,
    label: { en: `Live Cap ${stamp}` },
    value: "11000",
    unit: "MT",
    category: "extrusion",
    sourceNote: "proof",
    verificationStatus: "draft",
    publishStatus: "hidden",
    displayOrder: 1,
  });

  const verified = await updateCapacityMetric(live.id, {
    verificationStatus: "verified",
    publishStatus: "published",
    version: live.version,
  });
  if ("error" in verified) {
    console.error(verified);
    process.exit(1);
  }
  live = verified.metric;

  const published = await listPublishedCapacityMetrics();
  const hasLive = published.some((m) => m.key === live.key);
  const hasDraft = published.some((m) => m.key === draft.key);

  console.log(
    JSON.stringify(
      {
        personSlug: person.slug,
        liveKey: live.key,
        liveLabel: live.label.en,
        draftLabel: draft.label.en,
        hasLive,
        hasDraft,
      },
      null,
      2,
    ),
  );

  if (!hasLive || hasDraft) process.exit(1);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .then(async () => {
    const mongoose = await import("mongoose");
    await mongoose.default.disconnect().catch(() => undefined);
    process.exit(0);
  });

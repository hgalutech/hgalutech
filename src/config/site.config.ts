/**
 * Site-wide flags and metadata.
 * Free-tier account values live in env; this file is code/config only.
 */
export const siteConfig = {
  name: "HG Alutek",
  shortName: "HG Alutek",
  flags: {
    analytics: false,
    leadsCrmWebhook: false,
    investorsSection: false,
  },
} as const;

/**
 * Site-wide flags and metadata.
 * Free-tier account values live in env; this file is code/config only.
 */
export const siteConfig = {
  name: "HG Alutech",
  shortName: "HG Alutech",
  flags: {
    analytics: false,
    leadsCrmWebhook: false,
    investorsSection: false,
  },
} as const;

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ProductCard } from "@/features/public-catalog/components/product-card";
import type { ProductDTO } from "@/modules/catalog";

const sample: ProductDTO = {
  id: "story-1",
  sku: "HG-BIL-6063",
  name: { en: "Aluminium Billets" },
  slug: "billets",
  categoryIds: [],
  formType: "billet",
  alloyGrades: ["6063", "6061", "6082"],
  tempers: [],
  surfaceFinishes: [],
  anodizingColors: [],
  ralColors: [],
  toleranceStandards: [],
  packaging: [],
  applications: [],
  otherApplications: [],
  directCustomers: [],
  endUseIndustries: [],
  capabilityApplications: [],
  highlights: [],
  chemicalComposition: [],
  description:
    "Homogenised billets for architectural and industrial extrusion programmes.",
  imageUrl: "https://picsum.photos/seed/hg-billets/700/525",
  imageMediaId: null,
  drawingMediaIds: [],
  blocks: [],
  seo: {},
  status: "published",
  scheduledPublishAt: null,
  publishedAt: null,
  publishedVersion: null,
  isUpcoming: false,
  sortOrder: 0,
  version: 1,
  deletedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const meta = {
  title: "Molecules/ProductCard",
  component: ProductCard,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: {
    locale: "en",
    product: sample,
  },
} satisfies Meta<typeof ProductCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Upcoming: Story = {
  args: {
    product: { ...sample, isUpcoming: true, name: { en: "Solar frame profile" } },
    tone: "pipeline",
  },
};

import type { Metadata } from "next";

import { CareersPage } from "@/features/public-site/components/careers-page";

type PageProps = { params: Promise<{ locale: string }> };

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Open roles at HG Alutek — operations, quality, maintenance and commercial careers in Kadi, Gujarat.",
};

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  return <CareersPage locale={locale} />;
}

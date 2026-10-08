import type { Metadata } from "next";

import { LeadershipPage } from "@/features/public-corporate";

type PageProps = { params: Promise<{ locale: string }> };

export const metadata: Metadata = {
  title: "Leadership",
  description: "Board and leadership at HG Alutek.",
};

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  return <LeadershipPage locale={locale} />;
}

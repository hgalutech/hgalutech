import type { Metadata } from "next";

import { ExpansionPage } from "@/features/public-corporate";

type PageProps = { params: Promise<{ locale: string }> };

export const metadata: Metadata = {
  title: "Expansion",
  description: "Growth and expansion projects at HG Alutech.",
};

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  return <ExpansionPage locale={locale} />;
}

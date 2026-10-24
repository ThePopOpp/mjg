import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocumentPage } from "@/components/marketing/pages/legal";
import { loadLegalDocument } from "@/lib/public-site/legal";

// Public AI & Trust Notice. The package marks this one "PUBLIC PAGE DRAFT";
// no file fallback, so it 404s until it is published.
export const dynamic = "force-dynamic";

const PAGE = {
  slug: "ai-trust",
  title: "AI & Trust Notice",
  eyebrow: "Trust",
};

export async function generateMetadata(): Promise<Metadata> {
  const doc = await loadLegalDocument(PAGE);
  const title = doc?.title ?? PAGE.title;
  return {
    title,
    description: `${title} for Michael J. Gauthier — Created for More and The Stewardship Blueprint.`,
    alternates: { canonical: "/ai-trust" },
  };
}

export default async function Page() {
  const doc = await loadLegalDocument(PAGE);
  if (!doc) notFound();
  return <LegalDocumentPage doc={doc} />;
}

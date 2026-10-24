import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocumentPage } from "@/components/marketing/pages/legal";
import { loadLegalDocument } from "@/lib/public-site/legal";

// Public SMS Messaging Terms. The 2026-10-09 package proposes this exact path
// and the SMS consent checkboxes link to it. Deliberately NO file fallback: the
// page 404s until the draft is published from CMS -> Legal, and publishing is
// blocked while it still carries placeholders (a fake frequency is worse than
// no page for carrier review).
export const dynamic = "force-dynamic";

const PAGE = {
  slug: "sms-terms",
  title: "SMS Messaging Terms",
  eyebrow: "Legal",
};

export async function generateMetadata(): Promise<Metadata> {
  const doc = await loadLegalDocument(PAGE);
  const title = doc?.title ?? PAGE.title;
  return {
    title,
    description: `${title} for Michael J. Gauthier — Created for More and The Stewardship Blueprint.`,
    alternates: { canonical: "/sms-terms" },
  };
}

export default async function Page() {
  const doc = await loadLegalDocument(PAGE);
  if (!doc) notFound();
  return <LegalDocumentPage doc={doc} />;
}

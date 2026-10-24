import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalDocumentPage } from "@/components/marketing/pages/legal";
import { loadLegalDocument } from "@/lib/public-site/legal";

// Public Privacy Policy — required by Twilio A2P 10DLC and linked from the footer,
// the opt-in forms and the Terms. Served from legal_documents when published,
// falling back to the A2P markdown so this URL can never 404.
export const dynamic = "force-dynamic";

const PAGE = {
  slug: "privacy",
  title: "Privacy Policy",
  eyebrow: "Legal",
  fallbackFile: "MJG-Privacy-Policy-A2P-10DLC.md",
};

export async function generateMetadata(): Promise<Metadata> {
  const doc = await loadLegalDocument(PAGE);
  const title = doc?.title ?? PAGE.title;
  return {
    title,
    description: `${title} for Michael J. Gauthier — Created for More and The Stewardship Blueprint.`,
    alternates: { canonical: "/privacy" },
  };
}

export default async function Page() {
  const doc = await loadLegalDocument(PAGE);
  if (!doc) notFound();
  return <LegalDocumentPage doc={doc} />;
}

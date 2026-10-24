import type { Metadata } from "next";
import { LegalIndexPage } from "@/components/marketing/pages/legal";
import { LEGAL_ENTITY } from "@/lib/legal/addresses";
import { loadLegalIndex } from "@/lib/public-site/legal";

// /legal — index of the published legal documents, plus the contact addresses
// the policies commit us to answering. Linked from the site footer.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Legal & Trust",
  description: `Policies and trust documents for services operated by ${LEGAL_ENTITY.name}.`,
  alternates: { canonical: "/legal" },
};

export default async function Page() {
  return <LegalIndexPage docs={await loadLegalIndex()} />;
}

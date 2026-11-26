import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnnualRetreatLanding } from "@/components/annual-retreat/landing";
import { getScopeContent } from "@/lib/marketing/content/read";
import { pageAnnualRetreat } from "@/lib/marketing/content/scopes/page-annual-retreat";
import { marketingMetadata } from "@/lib/marketing/seo";
import { retreatAccess } from "@/lib/annual-retreat/server";

// The Annual Retreat Guide landing page. Released by the annual_retreat.public
// switch (migration 202611260152); while it is off only super admins (and named
// testers) can open it, and it is never indexed. Dynamic: depends on who is signed in.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [{ _seo }, access] = await Promise.all([getScopeContent(pageAnnualRetreat), retreatAccess()]);
  const meta = marketingMetadata(_seo, "/annual-retreat", { preview: !access.isPublic });
  // Mike's exact title, not the site-wide "| Michael J. Gauthier" template (it already ends with it).
  return { ...meta, title: { absolute: _seo.title } };
}

export default async function Page() {
  const access = await retreatAccess();
  if (!access.canView) notFound();
  const content = await getScopeContent(pageAnnualRetreat);
  return <AnnualRetreatLanding content={content} preview={access.preview} />;
}

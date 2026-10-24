import type { Metadata } from "next";
import { LeadAGroupPage } from "@/components/marketing/pages/lead-a-group";
import { getScopeContent } from "@/lib/marketing/content/read";
import { pageLeadAGroup } from "@/lib/marketing/content/scopes/page-lead-a-group";
import { marketingMetadata } from "@/lib/marketing/seo";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { _seo } = await getScopeContent(pageLeadAGroup);
  return marketingMetadata(_seo, "/lead-a-group");
}

export default function Page() {
  return <LeadAGroupPage />;
}

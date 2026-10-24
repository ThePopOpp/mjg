import type { Metadata } from "next";
import { StewardshipBlueprintPage } from "@/components/marketing/pages/stewardship-blueprint";
import { getScopeContent } from "@/lib/marketing/content/read";
import { pageStewardshipBlueprint } from "@/lib/marketing/content/scopes/page-blueprint";
import { marketingMetadata } from "@/lib/marketing/seo";

// A new page: live as soon as it ships. /stewardship-blueprint/energy-audit is a separate route and is unaffected.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { _seo } = await getScopeContent(pageStewardshipBlueprint);
  return marketingMetadata(_seo, "/stewardship-blueprint");
}

export default function Page() {
  return <StewardshipBlueprintPage />;
}

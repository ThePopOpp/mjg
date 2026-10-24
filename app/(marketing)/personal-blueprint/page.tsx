import type { Metadata } from "next";
import { PersonalBlueprintPage } from "@/components/marketing/pages/personal-blueprint";
import { getScopeContent } from "@/lib/marketing/content/read";
import { pagePersonalBlueprint } from "@/lib/marketing/content/scopes/page-blueprint";
import { marketingMetadata } from "@/lib/marketing/seo";

// A new page: live as soon as it ships. Prices are read from the live catalogue.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { _seo } = await getScopeContent(pagePersonalBlueprint);
  return marketingMetadata(_seo, "/personal-blueprint");
}

export default function Page() {
  return <PersonalBlueprintPage />;
}

import type { Metadata } from "next";
import { ChurchesPage } from "@/components/marketing/pages/churches";
import { getScopeContent } from "@/lib/marketing/content/read";
import { pageChurches } from "@/lib/marketing/content/scopes/page-churches";
import { marketingMetadata } from "@/lib/marketing/seo";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { _seo } = await getScopeContent(pageChurches);
  return marketingMetadata(_seo, "/churches");
}

export default function Page() {
  return <ChurchesPage />;
}

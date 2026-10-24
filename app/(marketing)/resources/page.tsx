import type { Metadata } from "next";
import { ResourcesPage } from "@/components/marketing/pages/resources";
import { getScopeContent } from "@/lib/marketing/content/read";
import { pageResources } from "@/lib/marketing/content/scopes/page-resources";
import { marketingMetadata } from "@/lib/marketing/seo";

// Reading searchParams makes this render per request (the ?topic= filter), so
// there is no ISR here; new posts and edits show up immediately.

export async function generateMetadata(): Promise<Metadata> {
  const { _seo } = await getScopeContent(pageResources);
  return marketingMetadata(_seo, "/resources");
}

export default async function Page({ searchParams }: { searchParams: Promise<{ topic?: string | string[] }> }) {
  const { topic } = await searchParams;
  return <ResourcesPage topic={Array.isArray(topic) ? topic[0] : topic} />;
}

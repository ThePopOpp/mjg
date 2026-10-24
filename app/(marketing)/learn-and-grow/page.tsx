import type { Metadata } from "next";
import { LearnAndGrowPage } from "@/components/marketing/pages/learn-and-grow";
import { getScopeContent } from "@/lib/marketing/content/read";
import { pageLearn } from "@/lib/marketing/content/scopes/page-learn";
import { marketingMetadata } from "@/lib/marketing/seo";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { _seo } = await getScopeContent(pageLearn);
  return marketingMetadata(_seo, "/learn-and-grow");
}

export default function Page() {
  return <LearnAndGrowPage />;
}

import type { Metadata } from "next";
import { SpeakingPage } from "@/components/marketing/pages/speaking";
import { getScopeContent } from "@/lib/marketing/content/read";
import { pageSpeaking } from "@/lib/marketing/content/scopes/page-speaking";
import { marketingMetadata } from "@/lib/marketing/seo";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { _seo } = await getScopeContent(pageSpeaking);
  return marketingMetadata(_seo, "/speaking");
}

export default function Page() {
  return <SpeakingPage />;
}

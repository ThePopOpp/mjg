import type { Metadata } from "next";
import { MissionPage } from "@/components/marketing/pages/mission";
import { getScopeContent } from "@/lib/marketing/content/read";
import { pageMission } from "@/lib/marketing/content/scopes/page-mission";
import { marketingMetadata } from "@/lib/marketing/seo";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { _seo } = await getScopeContent(pageMission);
  return marketingMetadata(_seo, "/mission");
}

export default function Page() {
  return <MissionPage />;
}

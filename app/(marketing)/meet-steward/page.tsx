import type { Metadata } from "next";
import { MeetStewardPage } from "@/components/marketing/pages/meet-steward";
import { getScopeContent } from "@/lib/marketing/content/read";
import { pageMeetSteward } from "@/lib/marketing/content/scopes/page-meet-steward";
import { marketingMetadata } from "@/lib/marketing/seo";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { _seo } = await getScopeContent(pageMeetSteward);
  return marketingMetadata(_seo, "/meet-steward");
}

export default function Page() {
  return <MeetStewardPage />;
}

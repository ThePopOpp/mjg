import type { Metadata } from "next";
import { StartPage } from "@/components/marketing/pages/start";
import { getScopeContent } from "@/lib/marketing/content/read";
import { pageStart } from "@/lib/marketing/content/scopes/page-start";
import { marketingMetadata } from "@/lib/marketing/seo";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { _seo } = await getScopeContent(pageStart);
  return marketingMetadata(_seo, "/start");
}

export default function Page() {
  return <StartPage />;
}

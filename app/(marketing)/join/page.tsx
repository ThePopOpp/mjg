import type { Metadata } from "next";
import { JoinPage } from "@/components/marketing/pages/join";
import { getScopeContent } from "@/lib/marketing/content/read";
import { pageJoin } from "@/lib/marketing/content/scopes/page-join";
import { marketingMetadata } from "@/lib/marketing/seo";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { _seo } = await getScopeContent(pageJoin);
  return marketingMetadata(_seo, "/join");
}

export default function Page() {
  return <JoinPage />;
}

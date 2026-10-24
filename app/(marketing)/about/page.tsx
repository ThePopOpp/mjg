import type { Metadata } from "next";
import { AboutPage } from "@/components/marketing/pages/about";
import { getScopeContent } from "@/lib/marketing/content/read";
import { pageAbout } from "@/lib/marketing/content/scopes/page-about";
import { marketingMetadata } from "@/lib/marketing/seo";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { _seo } = await getScopeContent(pageAbout);
  return marketingMetadata(_seo, "/about");
}

export default function Page() {
  return <AboutPage />;
}

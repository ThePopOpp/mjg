import type { Metadata } from "next";
import { HomePage } from "@/components/marketing/pages/home";
import { getScopeContent } from "@/lib/marketing/content/read";
import { pageHome } from "@/lib/marketing/content/scopes/page-home";
import { marketingMetadata } from "@/lib/marketing/seo";

// The homepage (home.dc.html). Replaces main/index.html, which stays in the repo
// so the switch-over can be reverted in one commit.

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { _seo } = await getScopeContent(pageHome);
  return marketingMetadata(_seo, "/", { home: true });
}

export default function Home() {
  return <HomePage />;
}

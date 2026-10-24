import type { Metadata } from "next";
import { StudiesPage } from "@/components/marketing/pages/studies";
import { getScopeContent } from "@/lib/marketing/content/read";
import { pageStudies } from "@/lib/marketing/content/scopes/page-studies";
import { marketingMetadata } from "@/lib/marketing/seo";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { _seo } = await getScopeContent(pageStudies);
  return marketingMetadata(_seo, "/studies");
}

export default function Page() {
  return <StudiesPage />;
}

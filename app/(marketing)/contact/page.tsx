import type { Metadata } from "next";
import { ContactPage } from "@/components/marketing/pages/contact";
import { getScopeContent } from "@/lib/marketing/content/read";
import { pageContact } from "@/lib/marketing/content/scopes/page-contact";
import { marketingMetadata } from "@/lib/marketing/seo";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { _seo } = await getScopeContent(pageContact);
  return marketingMetadata(_seo, "/contact");
}

export default function Page() {
  return <ContactPage />;
}

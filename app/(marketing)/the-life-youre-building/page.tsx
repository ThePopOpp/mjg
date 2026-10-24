import type { Metadata } from "next";
import { BookPage } from "@/components/marketing/pages/book";
import { getScopeContent } from "@/lib/marketing/content/read";
import { pageBook } from "@/lib/marketing/content/scopes/page-book";
import { marketingMetadata } from "@/lib/marketing/seo";

// A new page (nothing lived here before), so it goes live as soon as it ships.
// Static, refreshed hourly; publishing its content revalidates it at once.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { _seo } = await getScopeContent(pageBook);
  return marketingMetadata(_seo, "/the-life-youre-building");
}

export default function TheLifeYoureBuildingPage() {
  return <BookPage />;
}

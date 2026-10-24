import type { Metadata } from "next";
import { AssessmentsPage } from "@/components/marketing/pages/assessments";
import { getScopeContent } from "@/lib/marketing/content/read";
import { pageAssessments } from "@/lib/marketing/content/scopes/page-assessments";
import { marketingMetadata } from "@/lib/marketing/seo";

// A new page: live as soon as it ships.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { _seo } = await getScopeContent(pageAssessments);
  return marketingMetadata(_seo, "/assessments");
}

export default function Page() {
  return <AssessmentsPage />;
}

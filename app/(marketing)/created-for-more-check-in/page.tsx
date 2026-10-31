import type { Metadata } from "next";
import { CheckInPage } from "@/components/marketing/pages/check-in";
import { getCurrentProfile } from "@/lib/auth/server";
import { getScopeContent } from "@/lib/marketing/content/read";
import { pageCheckIn } from "@/lib/marketing/content/scopes/page-assessments";
import { marketingMetadata } from "@/lib/marketing/seo";

// The Created for More Check-In, on the marketing chrome (new navigation and
// footer). Dynamic: the dashboard button depends on who is signed in, and the
// invite flow passes ?next=.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { _seo } = await getScopeContent(pageCheckIn);
  return marketingMetadata(_seo, "/created-for-more-check-in");
}

export default async function CreatedForMoreCheckInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  // Only honor internal redirect targets (the invite flow passes ?next=/dashboard).
  const redirectTo = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
  // A "Go to your dashboard" button for invited users (redirectTo) and anyone
  // already signed in. Anonymous visitors don't have a dashboard, so no button.
  const profile = await getCurrentProfile();
  const dashboardHref = redirectTo ?? (profile ? "/dashboard" : null);
  // Signed in → results save to the account as soon as they're shown.
  const signedIn = Boolean(profile && profile.id !== "local-preview" && profile.email);
  return <CheckInPage redirectTo={redirectTo} dashboardHref={dashboardHref} signedIn={signedIn} />;
}

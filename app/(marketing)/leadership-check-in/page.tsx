import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LeadershipCheckInPage } from "@/components/marketing/pages/leadership-check-in";
import { getScopeContent } from "@/lib/marketing/content/read";
import { pageLeadershipCheckIn } from "@/lib/marketing/content/scopes/page-leadership-check-in";
import { marketingMetadata } from "@/lib/marketing/seo";
import { leadershipAccess } from "@/lib/leadership-check-in/switches";
import { ROLES } from "@/lib/rbac/roles";

// The Leadership Check-In. Released by the leadership_check_in.public switch
// (migration 202611250149); while it is off only super admins can open it, and it is
// never indexed. Dynamic: depends on who is signed in.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [{ _seo }, access] = await Promise.all([getScopeContent(pageLeadershipCheckIn), leadershipAccess()]);
  const meta = marketingMetadata(_seo, "/leadership-check-in", { preview: !access.isPublic });
  // The kit's exact title, not the site-wide "| Michael J. Gauthier" template.
  return { ...meta, title: { absolute: _seo.title } };
}

export default async function Page({ searchParams }: { searchParams: Promise<{ cohort?: string; test?: string }> }) {
  const access = await leadershipAccess();
  if (!access.canView) notFound();
  const { cohort, test } = await searchParams;
  const signedIn = Boolean(access.profile?.email);
  const isSuperAdmin = access.profile?.primaryRole === ROLES.SUPER_ADMIN;
  return (
    <LeadershipCheckInPage
      signedIn={signedIn}
      steward={access.steward}
      preview={access.preview}
      cohort={cohort ? cohort.slice(0, 60) : null}
      test={isSuperAdmin && test === "1"}
    />
  );
}

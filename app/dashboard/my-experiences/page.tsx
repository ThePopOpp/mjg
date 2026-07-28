import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/dashboard/section-header";
import { TeamResultsTabs } from "@/components/facilitator/team-results-tabs";
import { getCurrentProfile } from "@/lib/auth/server";
import { canAccessDashboard } from "@/lib/rbac/roles";
import { getTeamResults } from "@/lib/facilitator/team";

export const dynamic = "force-dynamic";

export default async function MyExperiencesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/my-experiences");
  if (!canAccessDashboard(profile.role)) redirect("/access-restricted");

  const { checkIns, surveys, submissions } = await getTeamResults(profile.id);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Experiences"
        description="Surveys, form history, and check-in results from the participants on your team."
      />
      <TeamResultsTabs checkIns={checkIns} surveys={surveys} submissions={submissions as any} />
    </div>
  );
}

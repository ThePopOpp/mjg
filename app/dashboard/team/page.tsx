import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/dashboard/section-header";
import { MyTeam } from "@/components/facilitator/my-team";
import { getCurrentProfile } from "@/lib/auth/server";
import { ROLES } from "@/lib/rbac/roles";
import { getFacilitatorTeam } from "@/lib/facilitator/team";

export const dynamic = "force-dynamic";

const ALLOWED = new Set<string>([ROLES.FACILITATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN]);

export default async function TeamPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/team");
  if (!ALLOWED.has(profile.role)) redirect("/access-restricted");

  const { participants, touchpoints, stats } = await getFacilitatorTeam(profile.id);

  return (
    <div className="space-y-6">
      <SectionHeader title="My Team" description="The participants you lead. Add people, notify them, and track their journey." />
      <MyTeam participants={participants} touchpoints={touchpoints} stats={stats} />
    </div>
  );
}

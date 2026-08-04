import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/dashboard/section-header";
import { MyTeam } from "@/components/facilitator/my-team";
import { ParticipantTeamView } from "@/components/participant/my-team";
import { getCurrentProfile } from "@/lib/auth/server";
import { ROLES } from "@/lib/rbac/roles";
import { getFacilitatorTeam } from "@/lib/facilitator/team";
import { getParticipantTeam } from "@/lib/participant/team";

export const dynamic = "force-dynamic";

const FACILITATOR_ALLOWED = new Set<string>([ROLES.FACILITATOR, ROLES.ADMIN, ROLES.SUPER_ADMIN]);

export default async function TeamPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/team");

  // Participants see their group (names + completion status), without admin actions.
  if (profile.role === ROLES.PARTICIPANT) {
    const { self, teammates } = await getParticipantTeam(profile.email);
    return (
      <div className="space-y-6">
        <SectionHeader title="My Team" description="Your group and where everyone is on the journey." />
        <ParticipantTeamView self={self} teammates={teammates} />
      </div>
    );
  }

  if (!FACILITATOR_ALLOWED.has(profile.role)) redirect("/access-restricted");

  const { participants, touchpoints, stats } = await getFacilitatorTeam(profile.id);

  return (
    <div className="space-y-6">
      <SectionHeader title="My Team" description="The participants you lead. Add people, notify them, and track their journey." />
      <MyTeam participants={participants} touchpoints={touchpoints} stats={stats} />
    </div>
  );
}

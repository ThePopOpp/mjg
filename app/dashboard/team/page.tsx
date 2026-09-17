import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/dashboard/section-header";
import { MyTeam } from "@/components/facilitator/my-team";
import { ParticipantTeamView } from "@/components/participant/my-team";
import { getCurrentProfile } from "@/lib/auth/server";
import { ROLES } from "@/lib/rbac/roles";
import { getFacilitatorTeam } from "@/lib/facilitator/team";
import { getParticipantTeam } from "@/lib/participant/team";
import { getEnergyAuditsForEmails } from "@/lib/energy-audit/submissions";
import { TeamEnergyAudits } from "@/components/energy-audit/team-energy-audits";

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

  // Energy Audits completed by anyone on this facilitator's team, matched by email.
  const teamEmails = participants.map((p: any) => p.email).filter(Boolean) as string[];
  const audits = await getEnergyAuditsForEmails(teamEmails);

  return (
    <div className="space-y-6">
      <SectionHeader title="My Team" description="The participants you lead. Add people, notify them, and track their journey." />
      <MyTeam participants={participants} touchpoints={touchpoints} stats={stats} />
      <TeamEnergyAudits audits={audits} teamSize={participants.length} />
    </div>
  );
}

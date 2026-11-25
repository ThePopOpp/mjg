import { getCurrentProfile } from "@/lib/auth/server";
import { FacilitatorDashboard } from "@/components/facilitator/facilitator-dashboard";
import { ParticipantDashboard } from "@/components/participant/participant-dashboard";
import { OverviewBoard } from "@/components/dashboard/overview/overview-board";
import { getOverviewLayout } from "@/lib/dashboard/overview/store";
import { fireDueReminders } from "@/lib/dashboard/overview/items";
import { ROLES, isFacilitatorRole } from "@/lib/rbac/roles";

// The dashboard home. Staff get the customizable Overview (components/dashboard/overview):
// every card can be dragged, hidden or added from Add Card, starting from the Standard
// layout (the original sections plus the new rows) or Blank with the setup wizard.
// Each card loads its own data from /api/dashboard/widgets/[source], so hidden cards
// cost nothing.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  // Facilitators (and church admins, who get everything a facilitator has) and participants
  // get scoped dashboards rather than the admin overview.
  if (profile && isFacilitatorRole(profile.role)) {
    return <FacilitatorDashboard profile={profile} />;
  }
  if (profile?.role === ROLES.PARTICIPANT) {
    return <ParticipantDashboard profile={profile} />;
  }
  if (!profile) return null;

  // The saved layout is cleaned against the REAL role, so previewing another role with
  // "View as" never deletes cards; the board hides cards the viewed role can't use.
  const [{ layout }] = await Promise.all([getOverviewLayout(profile.id, profile.primaryRole), fireDueReminders(profile.id).catch(() => undefined)]);

  return (
    <OverviewBoard
      initialLayout={layout}
      role={profile.role}
      profile={{ id: profile.id, firstName: profile.firstName, lastName: profile.lastName, email: profile.email, avatarUrl: profile.avatarUrl }}
    />
  );
}

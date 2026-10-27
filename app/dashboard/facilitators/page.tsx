import { SectionHeader } from "@/components/dashboard/section-header";
import { FacilitatorsAdmin } from "@/components/facilitator-groups/facilitators-admin";
import { requirePagePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { ROLES } from "@/lib/rbac/roles";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getFinderSettings, listAllGroups } from "@/lib/facilitator-groups/repository";

export const dynamic = "force-dynamic";

// Admin overview for Find a Group: every facilitator and their listings, the launch switch,
// and (Super Admin) the CSV import.
export default async function FacilitatorsPage() {
  const profile = await requirePagePermission(PERMISSIONS.MANAGE_USERS, "/dashboard/facilitators");
  const supabase = createSupabaseAdminClient();

  const [groups, finder, { data: facilitators }, { data: invites }, { data: prefills }] = await Promise.all([
    listAllGroups(),
    getFinderSettings(),
    supabase.from("profiles").select("id,first_name,last_name,email,status,created_at").eq("role", ROLES.FACILITATOR).order("first_name"),
    supabase.from("user_invitations").select("email,invite_status,scheduled_send_at,sent_at,created_at").eq("role", ROLES.FACILITATOR).in("invite_status", ["pending", "sent", "failed"]),
    supabase.from("facilitator_prefills").select("email,applied_at"),
  ]);

  const accountEmails = new Set((facilitators ?? []).map((f: any) => String(f.email).toLowerCase()));
  const pendingInvites = (invites ?? [])
    .filter((i: any) => !accountEmails.has(String(i.email).toLowerCase()))
    .map((i: any) => ({ email: i.email as string, status: i.invite_status as string, scheduledFor: i.scheduled_send_at as string | null, sentAt: i.sent_at as string | null }));

  return (
    <div className="space-y-6">
      <SectionHeader title="Facilitators & Groups" description="Every facilitator, their Find a Group listings, the launch switch, and the facilitator import." />
      <FacilitatorsAdmin
        isSuperAdmin={profile.role === ROLES.SUPER_ADMIN}
        finder={finder}
        groups={groups}
        facilitators={(facilitators ?? []).map((f: any) => ({
          id: f.id,
          name: [f.first_name, f.last_name].filter(Boolean).join(" ") || f.email,
          email: f.email,
          status: f.status,
          groupCount: groups.filter((g) => g.facilitatorId === f.id).length,
          published: groups.filter((g) => g.facilitatorId === f.id && g.status === "published").length,
        }))}
        pendingInvites={pendingInvites}
        prefillCount={(prefills ?? []).filter((p: any) => !p.applied_at).length}
      />
    </div>
  );
}

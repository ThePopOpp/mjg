import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FacilitatorApplicationList } from "@/components/churches/churches-admin";
import { StatusPill } from "@/components/churches/church-ui";
import { getCurrentProfile } from "@/lib/auth/server";
import { ROLES } from "@/lib/rbac/roles";
import { adminChurchIdsFor, listChurches, listFacilitatorApplications } from "@/lib/churches/repository";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// A church admin's page: facilitator applications and official groups for the church(es) they
// administer. Super Admins see every church here too.
export default async function ChurchAdminPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/church");
  const isSuper = profile.role === ROLES.SUPER_ADMIN;
  const churchIds = isSuper ? (await listChurches()).map((c) => c.id) : await adminChurchIdsFor(profile.id);
  if (!isSuper && !churchIds.length) {
    if (profile.role !== ROLES.CHURCH_ADMIN) redirect("/dashboard/my-church");
    return (
      <div className="space-y-6">
        <SectionHeader title="My Church" description="You aren't an admin of any church right now. Contact MJG if that's a mistake." />
      </div>
    );
  }

  const supabase = createSupabaseAdminClient();
  const [churches, applications, groupsRes] = await Promise.all([
    listChurches({ includeArchived: true }).then((all) => all.filter((c) => churchIds.includes(c.id))),
    listFacilitatorApplications({ churchIds }),
    churchIds.length
      ? supabase
          .from("facilitator_groups")
          .select("id,slug,title,status,church_id, profiles:facilitator_id(first_name,last_name,email)")
          .in("church_id", churchIds)
          .is("deleted_at", null)
          .neq("status", "archived")
      : Promise.resolve({ data: [] as any[] }),
  ]);
  const groups = (groupsRes.data ?? []) as any[];
  const pending = applications.filter((a) => a.status === "pending");
  const decided = applications.filter((a) => a.status !== "pending");

  return (
    <div className="space-y-6">
      <SectionHeader
        title={churches.length === 1 ? churches[0].name : "My Church"}
        description="Approve the facilitators who lead groups for your church. Only approved facilitators can list a group as an official church group."
      />
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Waiting for you{pending.length ? ` (${pending.length})` : ""}</h2>
        <FacilitatorApplicationList applications={pending} />
      </section>
      <Card>
        <CardHeader><CardTitle className="text-base">Official church groups</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {groups.length === 0 ? <p className="text-muted-foreground">No official groups yet.</p> : null}
          {groups.map((g) => (
            <div key={g.id} className="flex flex-wrap items-center gap-2">
              <a href={`/groups/${g.slug}`} className="font-medium hover:text-[#b88a4a]">{g.title}</a>
              <StatusPill status={g.status} />
              <span className="text-muted-foreground">{[g.profiles?.first_name, g.profiles?.last_name].filter(Boolean).join(" ") || g.profiles?.email}</span>
              {churches.length > 1 ? <span className="text-muted-foreground">· {churches.find((c) => c.id === g.church_id)?.name}</span> : null}
            </div>
          ))}
        </CardContent>
      </Card>
      {decided.length ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Decided</h2>
          <FacilitatorApplicationList applications={decided} />
        </section>
      ) : null}
    </div>
  );
}

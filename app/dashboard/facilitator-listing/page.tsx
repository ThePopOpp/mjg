import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/dashboard/section-header";
import { FacilitatorListing } from "@/components/facilitator-groups/facilitator-listing";
import { getCurrentProfile } from "@/lib/auth/server";
import { ROLES } from "@/lib/rbac/roles";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { tileConfig } from "@/lib/maps/config";
import { getFacilitatorProfile, getFinderSettings, isGroupAdmin, listGroupsForFacilitator } from "@/lib/facilitator-groups/repository";
import { applyPendingPrefill } from "@/lib/facilitator-groups/import";
import { approvedChurchIdsFor, listChurches } from "@/lib/churches/repository";

export const dynamic = "force-dynamic";

// Facilitator Listing — where a facilitator sets up the group(s) shown on Find a Group:
// schedule, location, spots, booking mode, roster and their public profile. Admins can open
// any facilitator's listing with ?as=<profile id> (linked from Facilitators & Groups).
export default async function FacilitatorListingPage({ searchParams }: { searchParams: Promise<{ as?: string }> }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/facilitator-listing");
  if (!(profile.role === ROLES.FACILITATOR || isGroupAdmin(profile.role))) redirect("/access-restricted");

  const { as } = await searchParams;
  const supabase = createSupabaseAdminClient();
  let owner = { id: profile.id, email: profile.email as string | null, name: [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.email };
  let managingOther = false;
  if (as && as !== profile.id && isGroupAdmin(profile.role)) {
    const { data } = await supabase.from("profiles").select("id,email,first_name,last_name").eq("id", as).maybeSingle();
    if (data) {
      owner = { id: data.id, email: data.email, name: [data.first_name, data.last_name].filter(Boolean).join(" ") || data.email };
      managingOther = true;
    }
  }

  // Imported facilitators: turn their imported details into a profile + draft group once.
  if (!managingOther) await applyPendingPrefill({ id: owner.id, email: owner.email });

  const [groups, fp, finder, { data: experiences }, approvedChurchIds, churches] = await Promise.all([
    listGroupsForFacilitator(owner.id),
    getFacilitatorProfile(owner.id),
    getFinderSettings(),
    supabase.from("experiences").select("id,name").eq("facilitator_id", owner.id).not("status", "in", "(completed,cancelled)").order("start_date", { ascending: false }),
    approvedChurchIdsFor(owner.id),
    listChurches(),
  ]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Facilitator Listing"
        description="Set up your group for Find a Group — when and where you meet, how many spots you have, and how people join."
      />
      <FacilitatorListing
        initialGroups={groups}
        profile={fp}
        fallbackName={owner.name}
        tiles={tileConfig()}
        experiences={(experiences ?? []).map((e: any) => ({ id: e.id, name: e.name }))}
        churches={churches.filter((c) => approvedChurchIds.includes(c.id)).map((c) => ({ id: c.id, name: c.name }))}
        finder={finder}
        ownerName={managingOther ? owner.name : null}
        ownerId={managingOther ? owner.id : null}
      />
    </div>
  );
}

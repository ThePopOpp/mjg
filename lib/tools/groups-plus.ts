import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getFacilitatorProfile, listReservations, saveFacilitatorProfile } from "@/lib/facilitator-groups/repository";
import { decideReservation } from "@/lib/facilitator-groups/reservations";
import type { FacilitatorProfileInput } from "@/lib/facilitator-groups/shared";
import type { ToolContext, ToolDef } from "./types";

// Find a Group gaps from the expansion plan §2.1: taking someone out of a group,
// and the facilitator's public profile. Creating a group (with its church link)
// is in lib/tools/churches.ts; deleting one is in lib/tools/trash.ts.

const actor = (ctx: ToolContext) => ({ id: ctx.actorId, role: ctx.role });
const FACILITATOR_ID = { type: "string", description: "The facilitator's user (profile) id — from search_users or groups_list." };

const groupRemoveMember: ToolDef = {
  name: "group_remove_member",
  title: "Take someone out of a group",
  description: "Removes a person (by email) from a group: cancels their confirmed spot, request or waitlist place and takes them off the facilitator's team. Same as Remove on the roster.",
  domain: "people",
  inputSchema: {
    type: "object",
    properties: { id: { type: "string", description: "Group id (from groups_list)." }, email: { type: "string" } },
    required: ["id", "email"],
  },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { id: string; email: string }, ctx) => {
    const email = a.email.trim().toLowerCase();
    const roster = await listReservations(actor(ctx), a.id);
    const match = roster.find((r) => r.email?.toLowerCase() === email && !["canceled", "declined"].includes(r.status));
    if (!match) throw new Error(`${a.email} isn't in this group (no active spot, request or waitlist place).`);
    return decideReservation(actor(ctx), match.id, "cancel");
  },
};

const facilitatorGet: ToolDef = {
  name: "facilitator_get",
  title: "A facilitator's public profile",
  description: "The facilitator's Find a Group profile: display name, bio, photo, church, city/state, and whether it's public.",
  domain: "people",
  inputSchema: { type: "object", properties: { id: FACILITATOR_ID }, required: ["id"] },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { id: string }) => {
    const profile = await getFacilitatorProfile(a.id);
    if (!profile) return { id: a.id, profile: null, note: "This facilitator hasn't set up a public profile yet." };
    return { id: a.id, ...profile };
  },
};

const facilitatorUpdate: ToolDef = {
  name: "facilitator_update",
  title: "Edit a facilitator's profile",
  description: "Changes a facilitator's public profile. Fields: displayName, bio, photoUrl, churchOrg, city, state, isPublic. Fields you leave out keep their current value.",
  domain: "people",
  inputSchema: { type: "object", properties: { id: FACILITATOR_ID, changes: { type: "object" } }, required: ["id", "changes"] },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { id: string; changes: Partial<FacilitatorProfileInput> }) => {
    const current = await getFacilitatorProfile(a.id);
    const merged: FacilitatorProfileInput = { ...(current ?? { displayName: "" }), ...a.changes };
    await saveFacilitatorProfile(a.id, merged);
    return getFacilitatorProfile(a.id);
  },
};

const facilitatorDeactivate: ToolDef = {
  name: "facilitator_deactivate",
  title: "Take a facilitator off Find a Group",
  description: "Hides a facilitator's public profile and closes their published groups (members keep their spots; nothing is deleted). Their sign-in is unchanged — use users_deactivate for that. Undo with facilitator_update (isPublic) and group_set_status.",
  domain: "people",
  inputSchema: { type: "object", properties: { id: FACILITATOR_ID }, required: ["id"] },
  risk: "high",
  minRole: "super_admin",
  summarize: () => "Hide this facilitator's profile and close their published groups",
  preview: async (a: { id: string }) => {
    const supabase = createSupabaseAdminClient();
    const [profile, groups] = await Promise.all([
      getFacilitatorProfile(a.id),
      supabase.from("facilitator_groups").select("title").eq("facilitator_id", a.id).eq("status", "published").is("deleted_at", null),
    ]);
    return { facilitator: profile?.displayName ?? a.id, profilePublic: profile?.isPublic ?? false, groupsToClose: (groups.data ?? []).map((g) => g.title) };
  },
  run: async (a: { id: string }) => {
    const supabase = createSupabaseAdminClient();
    const now = new Date().toISOString();
    const { error: pErr } = await supabase.from("facilitator_profiles").update({ is_public: false, updated_at: now }).eq("profile_id", a.id);
    if (pErr) throw pErr;
    const { data: closed, error: gErr } = await supabase
      .from("facilitator_groups")
      .update({ status: "closed", updated_at: now })
      .eq("facilitator_id", a.id)
      .eq("status", "published")
      .select("id, title");
    if (gErr) throw gErr;
    return { ok: true, profileHidden: true, groupsClosed: closed ?? [] };
  },
};

export const GROUP_PLUS_TOOLS: ToolDef[] = [groupRemoveMember, facilitatorGet, facilitatorUpdate, facilitatorDeactivate];

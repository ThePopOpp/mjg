import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ROLES, ROLE_LABELS, type AppRole } from "@/lib/rbac/roles";
import { changeUserAccess, getUserSummary } from "@/lib/user-management/access";
import type { ToolDef } from "./types";

// Users (dashboard accounts) and participant tags: the create/update gaps from
// the expansion plan §2.1. Deleting a tag lives in lib/tools/trash.ts.

const USER_ID = { type: "string", description: "User (profile) id from search_users / list_users." };
const ROLE_VALUES = Object.values(ROLES);

const usersSetRole: ToolDef = {
  name: "users_set_role",
  title: "Change a user's role",
  description: `Changes a dashboard user's role (${ROLE_VALUES.join(", ")}). Admin and Super Admin are high trust. You can't change your own role, and the owner account can't be demoted.`,
  domain: "people",
  inputSchema: {
    type: "object",
    properties: { id: USER_ID, role: { type: "string", enum: ROLE_VALUES } },
    required: ["id", "role"],
  },
  risk: "high",
  minRole: "super_admin",
  record: { entity: "profile", id: (a: { id: string }) => a.id },
  summarize: (a: { role: AppRole }) => `Change this user's role to ${ROLE_LABELS[a.role] ?? a.role}`,
  preview: async (a: { id: string; role: AppRole }) => {
    const u = await getUserSummary(a.id);
    return { user: u.full_name || u.email, email: u.email, from: u.role, to: a.role };
  },
  run: (a: { id: string; role: AppRole }, ctx) => changeUserAccess({ id: a.id, role: a.role, actorUserId: ctx.actorId }),
};

const usersDeactivate: ToolDef = {
  name: "users_deactivate",
  title: "Deactivate a user",
  description: "Stops a dashboard user signing in or using the dashboard (status inactive). Nothing is deleted; users_reactivate undoes it.",
  domain: "people",
  inputSchema: {
    type: "object",
    properties: { id: USER_ID, reason: { type: "string", description: "Why — kept on their record." } },
    required: ["id"],
  },
  risk: "high",
  minRole: "super_admin",
  record: { entity: "profile", id: (a: { id: string }) => a.id },
  summarize: () => "Deactivate this user (they can't sign in until reactivated)",
  preview: async (a: { id: string }) => {
    const u = await getUserSummary(a.id);
    return { user: u.full_name || u.email, email: u.email, role: u.role, status: u.status };
  },
  run: (a: { id: string; reason?: string }, ctx) => changeUserAccess({ id: a.id, status: "inactive", reason: a.reason, actorUserId: ctx.actorId }),
};

const usersReactivate: ToolDef = {
  name: "users_reactivate",
  title: "Reactivate a user",
  description: "Lets a deactivated, suspended or archived dashboard user sign in again (status active), with the role they already have.",
  domain: "people",
  inputSchema: { type: "object", properties: { id: USER_ID, reason: { type: "string" } }, required: ["id"] },
  risk: "write",
  minRole: "super_admin",
  record: { entity: "profile", id: (a: { id: string }) => a.id },
  run: (a: { id: string; reason?: string }, ctx) => changeUserAccess({ id: a.id, status: "active", reason: a.reason, actorUserId: ctx.actorId }),
};

const TAG_FIELDS = {
  name: { type: "string", minLength: 1, maxLength: 80 },
  category: { type: "string", description: "Group it belongs to, e.g. interest, wave, follow_up, general (default general)." },
};

const tagsCreate: ToolDef = {
  name: "tags_create",
  title: "Create a tag",
  description: "Adds a participant tag (names are unique). Apply it with set_participant_tags.",
  domain: "people",
  inputSchema: { type: "object", properties: TAG_FIELDS, required: ["name"] },
  risk: "write",
  minRole: "super_admin",
  record: { entity: "tag", id: (_a, r) => r?.id },
  run: async (a: { name: string; category?: string }) => {
    const supabase = createSupabaseAdminClient();
    const name = a.name.trim();
    const { data: existing } = await supabase.from("tags").select("id, deleted_at").ilike("name", name).maybeSingle();
    if (existing) {
      throw new Error(existing.deleted_at ? `A tag named "${name}" is in the trash — restore it with mjg_restore (entity tag, id ${existing.id}).` : `A tag named "${name}" already exists (id ${existing.id}).`);
    }
    const { data, error } = await supabase.from("tags").insert({ name, category: a.category?.trim() || "general" }).select("id, name, category").single();
    if (error) throw error;
    return data;
  },
};

const tagsUpdate: ToolDef = {
  name: "tags_update",
  title: "Rename or recategorise a tag",
  description: "Changes a tag's name and/or category (id from list_tags). Everyone tagged keeps the tag.",
  domain: "people",
  inputSchema: { type: "object", properties: { id: { type: "string" }, ...TAG_FIELDS }, required: ["id"] },
  risk: "write",
  minRole: "super_admin",
  record: { entity: "tag", id: (a: { id: string }) => a.id },
  run: async (a: { id: string; name?: string; category?: string }) => {
    const patch: Record<string, string> = {};
    if (a.name?.trim()) patch.name = a.name.trim();
    if (a.category?.trim()) patch.category = a.category.trim();
    if (!Object.keys(patch).length) throw new Error("Nothing to change — pass name and/or category.");
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("tags").update(patch).eq("id", a.id).is("deleted_at", null).select("id, name, category").maybeSingle();
    if (error) throw error.code === "23505" ? new Error(`A tag named "${patch.name}" already exists.`) : error;
    if (!data) throw new Error("No such tag (or it's in the trash).");
    return data;
  },
};

export const PEOPLE_PLUS_TOOLS: ToolDef[] = [usersSetRole, usersDeactivate, usersReactivate, tagsCreate, tagsUpdate];

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ROLES } from "@/lib/rbac/roles";
import { changeUserAccess } from "@/lib/user-management/access";
import { canDecideFacilitatorApplication, churchGroupProblem, slugifyChurch, type ApplicationStatus, type ChurchStatus } from "./rules";
import { notifyChurchAdminsOfFacilitatorApplication, notifyFacilitatorDecision } from "./notify";

// Churches, church admins and facilitator applications — the app logic behind the dashboard
// (Churches, Church, My Church) and the connector tools (lib/tools/churches.ts). Service-role
// client: callers pass an already-authenticated actor and the checks happen here.

type Admin = ReturnType<typeof createSupabaseAdminClient>;
export type ChurchActor = { id: string; role: string };

export type Church = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  state: string | null;
  website: string | null;
  status: ChurchStatus;
  createdAt: string;
};

export type ChurchInput = { name?: string; city?: string | null; state?: string | null; website?: string | null };

export type ChurchAdmin = {
  id: string;
  churchId: string;
  churchName: string;
  profileId: string;
  name: string;
  email: string | null;
  assignedAt: string;
};

export type FacilitatorApplication = {
  id: string;
  profileId: string;
  name: string;
  email: string | null;
  churchId: string;
  churchName: string;
  message: string | null;
  status: ApplicationStatus;
  decidedBy: string | null;
  decidedAt: string | null;
  note: string | null;
  createdAt: string;
};

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
export const personName = (p: any) => [p?.first_name, p?.last_name].filter(Boolean).join(" ").trim() || p?.email || "Unknown";

function rowToChurch(r: any): Church {
  return { id: r.id, name: r.name, slug: r.slug, city: r.city ?? null, state: r.state ?? null, website: r.website ?? null, status: r.status, createdAt: r.created_at };
}

export function requireSuperAdminActor(actor: ChurchActor) {
  if (actor.role !== ROLES.SUPER_ADMIN) throw new Error("Super Admin permission required.");
}

async function uniqueChurchSlug(supabase: Admin, name: string, excludeId?: string) {
  const root = slugifyChurch(name);
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    let q = supabase.from("churches").select("id").eq("slug", candidate);
    if (excludeId) q = q.neq("id", excludeId);
    const { data } = await q.maybeSingle();
    if (!data) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}

// ── Churches ────────────────────────────────────────────────────────────────────

export async function listChurches(opts: { includeArchived?: boolean; search?: string } = {}): Promise<Church[]> {
  const supabase = createSupabaseAdminClient();
  let q = supabase.from("churches").select("*").is("deleted_at", null).order("name");
  if (!opts.includeArchived) q = q.eq("status", "active");
  if (opts.search?.trim()) q = q.ilike("name", `%${opts.search.trim().replace(/[%_,()]/g, "")}%`);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(rowToChurch);
}

export async function getChurch(id: string): Promise<Church | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("churches").select("*").eq("id", id).is("deleted_at", null).maybeSingle();
  if (error) throw error;
  return data ? rowToChurch(data) : null;
}

/** A church with its admins, groups and application counts (dashboard detail + church_get). */
export async function getChurchDetail(id: string) {
  const church = await getChurch(id);
  if (!church) throw new Error("Church not found.");
  const supabase = createSupabaseAdminClient();
  const [admins, { data: groups }, applications] = await Promise.all([
    listChurchAdmins(id),
    supabase.from("facilitator_groups").select("id,slug,title,status,facilitator_id").eq("church_id", id).is("deleted_at", null),
    listFacilitatorApplications({ churchIds: [id] }),
  ]);
  return {
    ...church,
    admins,
    groups: (groups ?? []).map((g: any) => ({ id: g.id, slug: g.slug, title: g.title, status: g.status, facilitatorId: g.facilitator_id })),
    applications: { pending: applications.filter((a) => a.status === "pending").length, approved: applications.filter((a) => a.status === "approved").length },
  };
}

export async function createChurch(actor: ChurchActor, input: ChurchInput): Promise<Church> {
  requireSuperAdminActor(actor);
  return insertChurch(actor.id, input);
}

/** Insert without the role check — used when approving a church admin application for a new church. */
async function insertChurch(actorId: string, input: ChurchInput): Promise<Church> {
  const name = str(input.name);
  if (!name) throw new Error("Give the church a name.");
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("churches")
    .insert({
      name: name.slice(0, 160),
      slug: await uniqueChurchSlug(supabase, name),
      city: str(input.city),
      state: str(input.state)?.toUpperCase().slice(0, 2) ?? null,
      website: str(input.website),
      created_by: actorId,
    })
    .select("*")
    .single();
  if (error) throw error;
  return rowToChurch(data);
}

export async function updateChurch(actor: ChurchActor, id: string, input: ChurchInput & { status?: ChurchStatus }): Promise<Church> {
  requireSuperAdminActor(actor);
  const current = await getChurch(id);
  if (!current) throw new Error("Church not found.");
  const supabase = createSupabaseAdminClient();
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const has = (k: string) => Object.prototype.hasOwnProperty.call(input, k);
  if (has("name")) {
    const name = str(input.name);
    if (!name) throw new Error("Give the church a name.");
    row.name = name.slice(0, 160);
    if (name !== current.name) row.slug = await uniqueChurchSlug(supabase, name, id);
  }
  if (has("city")) row.city = str(input.city);
  if (has("state")) row.state = str(input.state)?.toUpperCase().slice(0, 2) ?? null;
  if (has("website")) row.website = str(input.website);
  if (has("status")) {
    if (input.status !== "active" && input.status !== "archived") throw new Error("Status must be active or archived.");
    row.status = input.status;
  }
  const { data, error } = await supabase.from("churches").update(row).eq("id", id).select("*").single();
  if (error) throw error;
  return rowToChurch(data);
}

export async function archiveChurch(actor: ChurchActor, id: string) {
  return updateChurch(actor, id, { status: "archived" });
}

/** Soft delete (restorable). Hard deletes are never offered. */
export async function softDeleteChurch(actor: ChurchActor, id: string) {
  requireSuperAdminActor(actor);
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("churches")
    .update({ deleted_at: new Date().toISOString(), deleted_by: actor.id, updated_at: new Date().toISOString() })
    .eq("id", id)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Church not found.");
  return { id, deleted: true };
}

// ── Church admins ───────────────────────────────────────────────────────────────

export async function listChurchAdmins(churchId?: string): Promise<ChurchAdmin[]> {
  const supabase = createSupabaseAdminClient();
  let q = supabase
    .from("church_admins")
    .select("id,church_id,profile_id,assigned_at, churches:church_id(name,deleted_at), profiles:profile_id(first_name,last_name,email)")
    .eq("status", "active")
    .order("assigned_at", { ascending: false });
  if (churchId) q = q.eq("church_id", churchId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? [])
    .filter((r: any) => !r.churches?.deleted_at)
    .map((r: any) => ({
      id: r.id,
      churchId: r.church_id,
      churchName: r.churches?.name ?? "Church",
      profileId: r.profile_id,
      name: personName(r.profiles),
      email: r.profiles?.email ?? null,
      assignedAt: r.assigned_at,
    }));
}

/** Churches this person actively administers. */
export async function adminChurchIdsFor(profileId: string): Promise<string[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("church_admins").select("church_id").eq("profile_id", profileId).eq("status", "active");
  if (error) throw error;
  return (data ?? []).map((r: any) => r.church_id as string);
}

async function findProfile(input: { profileId?: string; email?: string }) {
  const supabase = createSupabaseAdminClient();
  let q = supabase.from("profiles").select("id,email,first_name,last_name,role,status");
  if (input.profileId) q = q.eq("id", input.profileId);
  else if (input.email?.trim()) q = q.ilike("email", input.email.trim().replace(/[%_]/g, ""));
  else throw new Error("Give a person (profile id or email).");
  const { data, error } = await q.maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Person not found. They need an MJG account first.");
  return data as { id: string; email: string; first_name: string | null; last_name: string | null; role: string; status: string };
}

/**
 * Make someone an admin of a church. Participants become role church_admin; anyone else keeps
 * their role (a facilitator stays a facilitator) — access to the Church page comes from the
 * assignment itself.
 */
export async function assignChurchAdmin(actor: ChurchActor, input: { churchId: string; profileId?: string; email?: string; applicationId?: string | null }) {
  requireSuperAdminActor(actor);
  return assignChurchAdminUnchecked(actor.id, input);
}

async function assignChurchAdminUnchecked(actorId: string, input: { churchId: string; profileId?: string; email?: string; applicationId?: string | null }) {
  const church = await getChurch(input.churchId);
  if (!church) throw new Error("Church not found.");
  const person = await findProfile(input);
  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase
    .from("church_admins")
    .select("id")
    .eq("church_id", church.id)
    .eq("profile_id", person.id)
    .eq("status", "active")
    .maybeSingle();
  if (!existing) {
    const { error } = await supabase.from("church_admins").insert({
      church_id: church.id,
      profile_id: person.id,
      application_id: input.applicationId ?? null,
      assigned_by: actorId,
    });
    if (error) throw error;
  }
  if (person.role === ROLES.PARTICIPANT) {
    await changeUserAccess({ id: person.id, role: ROLES.CHURCH_ADMIN, reason: `Church admin for ${church.name}`, actorUserId: actorId });
  }
  return { churchId: church.id, churchName: church.name, profileId: person.id, name: personName(person), alreadyAdmin: Boolean(existing) };
}

/** End an assignment. A church_admin with no churches left goes back to participant. */
export async function removeChurchAdmin(actor: ChurchActor, input: { churchId: string; profileId: string }) {
  requireSuperAdminActor(actor);
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("church_admins")
    .update({ status: "removed", removed_by: actor.id, removed_at: now, updated_at: now })
    .eq("church_id", input.churchId)
    .eq("profile_id", input.profileId)
    .eq("status", "active")
    .select("id");
  if (error) throw error;
  if (!data?.length) throw new Error("That person isn't an admin of this church.");
  const remaining = await adminChurchIdsFor(input.profileId);
  const person = await findProfile({ profileId: input.profileId });
  let roleChangedTo: string | null = null;
  if (!remaining.length && person.role === ROLES.CHURCH_ADMIN && person.id !== actor.id) {
    await changeUserAccess({ id: person.id, role: ROLES.PARTICIPANT, reason: "No longer a church admin", actorUserId: actor.id });
    roleChangedTo = ROLES.PARTICIPANT;
  }
  return { churchId: input.churchId, profileId: input.profileId, removed: true, roleChangedTo };
}

// ── Facilitator applications ────────────────────────────────────────────────────

const FA_SELECT = "*, churches:church_id(name), profiles:profile_id(first_name,last_name,email)";

function rowToFacilitatorApplication(r: any): FacilitatorApplication {
  return {
    id: r.id,
    profileId: r.profile_id,
    name: personName(r.profiles),
    email: r.profiles?.email ?? null,
    churchId: r.church_id,
    churchName: r.churches?.name ?? "Church",
    message: r.message ?? null,
    status: r.status,
    decidedBy: r.decided_by ?? null,
    decidedAt: r.decided_at ?? null,
    note: r.note ?? null,
    createdAt: r.created_at,
  };
}

export async function listFacilitatorApplications(opts: { churchIds?: string[]; status?: ApplicationStatus; profileId?: string } = {}) {
  if (opts.churchIds && !opts.churchIds.length) return [];
  const supabase = createSupabaseAdminClient();
  let q = supabase.from("facilitator_applications").select(FA_SELECT).order("created_at", { ascending: false });
  if (opts.churchIds) q = q.in("church_id", opts.churchIds);
  if (opts.status) q = q.eq("status", opts.status);
  if (opts.profileId) q = q.eq("profile_id", opts.profileId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(rowToFacilitatorApplication);
}

export async function getFacilitatorApplication(id: string): Promise<FacilitatorApplication | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("facilitator_applications").select(FA_SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToFacilitatorApplication(data) : null;
}

/** A facilitator names their church and asks its admin to approve them. */
export async function submitFacilitatorApplication(actor: ChurchActor, input: { churchId: string; message?: string | null }) {
  if (!(actor.role === ROLES.FACILITATOR || actor.role === ROLES.SUPER_ADMIN || actor.role === ROLES.ADMIN)) {
    throw new Error("Only facilitators can apply to lead a church group.");
  }
  const church = await getChurch(input.churchId);
  if (!church || church.status !== "active") throw new Error("Church not found.");
  const supabase = createSupabaseAdminClient();
  const { data: live } = await supabase
    .from("facilitator_applications")
    .select("id,status")
    .eq("profile_id", actor.id)
    .eq("church_id", church.id)
    .in("status", ["pending", "approved"])
    .maybeSingle();
  if (live) throw new Error(live.status === "approved" ? `You're already approved by ${church.name}.` : `Your application to ${church.name} is waiting for review.`);
  const { data, error } = await supabase
    .from("facilitator_applications")
    .insert({ profile_id: actor.id, church_id: church.id, message: str(input.message)?.slice(0, 2000) ?? null })
    .select(FA_SELECT)
    .single();
  if (error) throw error;
  const app = rowToFacilitatorApplication(data);
  await notifyChurchAdminsOfFacilitatorApplication(church.id, { name: app.name, churchName: church.name }).catch((e) =>
    console.error("[churches] church admin alert failed", e instanceof Error ? e.message : e),
  );
  return app;
}

export async function decideFacilitatorApplication(actor: ChurchActor, id: string, decision: "approve" | "reject", note?: string | null) {
  const app = await getFacilitatorApplication(id);
  if (!app) throw new Error("Application not found.");
  const adminChurchIds = actor.role === ROLES.SUPER_ADMIN ? [] : await adminChurchIdsFor(actor.id);
  if (!canDecideFacilitatorApplication({ role: actor.role, adminChurchIds }, app.churchId)) {
    throw new Error("You don't have permission to decide applications for this church.");
  }
  if (decision !== "approve" && decision !== "reject") throw new Error("Decision must be approve or reject.");
  if (app.status !== "pending") throw new Error(`This application was already ${app.status}.`);
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("facilitator_applications")
    .update({ status: decision === "approve" ? "approved" : "rejected", decided_by: actor.id, decided_at: now, note: str(note)?.slice(0, 2000) ?? null, updated_at: now })
    .eq("id", id)
    .eq("status", "pending")
    .select(FA_SELECT)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("This application was already decided.");
  const decided = rowToFacilitatorApplication(data);
  await notifyFacilitatorDecision(decided).catch((e) => console.error("[churches] facilitator decision email failed", e instanceof Error ? e.message : e));
  return decided;
}

/** Churches that have approved this facilitator. */
export async function approvedChurchIdsFor(profileId: string): Promise<string[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("facilitator_applications").select("church_id").eq("profile_id", profileId).eq("status", "approved");
  if (error) throw error;
  return (data ?? []).map((r: any) => r.church_id as string);
}

/** Throws with a clear message unless the facilitator may run an official group for this church. */
export async function assertChurchGroupAllowed(facilitatorId: string, churchId: string | null | undefined) {
  if (!churchId) return;
  const church = await getChurch(churchId);
  if (!church || church.status !== "active") throw new Error("That church isn't available.");
  const problem = churchGroupProblem(churchId, await approvedChurchIdsFor(facilitatorId));
  if (problem) throw new Error(problem);
}

export { assignChurchAdminUnchecked as assignChurchAdminFromApplication, insertChurch as createChurchFromApplication };

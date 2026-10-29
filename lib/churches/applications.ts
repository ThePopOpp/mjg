import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { approvalTokenState, hashApprovalToken, newApprovalToken, TOKEN_STATE_MESSAGES, type ApplicationStatus, type TokenState } from "./rules";
import {
  assignChurchAdminFromApplication,
  createChurchFromApplication,
  getChurch,
  personName,
  requireSuperAdminActor,
  type ChurchActor,
} from "./repository";
import { notifyChurchAdminDecision, notifySuperAdminsOfChurchAdminApplication } from "./notify";
import { resolvePersonalNotifications } from "@/lib/notifications/personal";

// Church admin applications. Anyone signed in may apply; only a Super Admin approves — from the
// dashboard, or through the single-use, expiring link texted/emailed to Mike (we keep only the
// token's SHA-256). Approving creates the church if it was new, assigns the admin, and (for a
// participant) sets role church_admin.

export type ChurchAdminApplication = {
  id: string;
  profileId: string;
  name: string;
  email: string | null;
  churchId: string | null;
  churchName: string;
  churchCity: string | null;
  churchState: string | null;
  churchWebsite: string | null;
  isNewChurch: boolean;
  roleTitle: string | null;
  message: string | null;
  status: ApplicationStatus;
  tokenExpiresAt: string | null;
  decidedBy: string | null;
  decidedAt: string | null;
  decisionNote: string | null;
  notified: Record<string, unknown>;
  createdAt: string;
};

const SELECT = "*, churches:church_id(name,city,state,website), profiles:profile_id(first_name,last_name,email)";
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

function rowToApplication(r: any): ChurchAdminApplication {
  return {
    id: r.id,
    profileId: r.profile_id,
    name: personName(r.profiles),
    email: r.profiles?.email ?? null,
    churchId: r.church_id ?? null,
    churchName: r.churches?.name ?? r.church_name ?? "Church",
    churchCity: r.churches?.city ?? r.church_city ?? null,
    churchState: r.churches?.state ?? r.church_state ?? null,
    churchWebsite: r.churches?.website ?? r.church_website ?? null,
    isNewChurch: !r.church_id,
    roleTitle: r.role_title ?? null,
    message: r.message ?? null,
    status: r.status,
    tokenExpiresAt: r.token_expires_at ?? null,
    decidedBy: r.decided_by ?? null,
    decidedAt: r.decided_at ?? null,
    decisionNote: r.decision_note ?? null,
    notified: r.notified ?? {},
    createdAt: r.created_at,
  };
}

export type ChurchAdminApplyInput = {
  churchId?: string | null;
  churchName?: string | null;
  churchCity?: string | null;
  churchState?: string | null;
  churchWebsite?: string | null;
  roleTitle?: string | null;
  message?: string | null;
};

export async function applyForChurchAdmin(actor: ChurchActor, input: ChurchAdminApplyInput) {
  const supabase = createSupabaseAdminClient();
  const churchId = str(input.churchId);
  let churchName = str(input.churchName);
  if (churchId) {
    const church = await getChurch(churchId);
    if (!church || church.status !== "active") throw new Error("Church not found.");
    churchName = church.name;
    const { data: already } = await supabase.from("church_admins").select("id").eq("church_id", churchId).eq("profile_id", actor.id).eq("status", "active").maybeSingle();
    if (already) throw new Error(`You're already an admin of ${church.name}.`);
  } else if (!churchName) {
    throw new Error("Pick your church, or give its name.");
  }
  const { data: pending } = await supabase.from("church_admin_applications").select("id").eq("profile_id", actor.id).eq("status", "pending").maybeSingle();
  if (pending) throw new Error("You already have an application waiting for review.");

  const { token, hash, expiresAt } = newApprovalToken();
  const { data, error } = await supabase
    .from("church_admin_applications")
    .insert({
      profile_id: actor.id,
      church_id: churchId,
      church_name: churchId ? null : churchName!.slice(0, 160),
      church_city: churchId ? null : str(input.churchCity),
      church_state: churchId ? null : str(input.churchState)?.toUpperCase().slice(0, 2) ?? null,
      church_website: churchId ? null : str(input.churchWebsite),
      role_title: str(input.roleTitle)?.slice(0, 120) ?? null,
      message: str(input.message)?.slice(0, 2000) ?? null,
      token_hash: hash,
      token_expires_at: expiresAt,
    })
    .select(SELECT)
    .single();
  if (error) throw error;
  const app = rowToApplication(data);

  const notified = await notifySuperAdminsOfChurchAdminApplication(
    {
      applicantName: app.name,
      applicantEmail: app.email,
      churchName: app.churchName,
      churchPlace: [app.churchCity, app.churchState].filter(Boolean).join(", ") || null,
      isNewChurch: app.isNewChurch,
      roleTitle: app.roleTitle,
      message: app.message,
      expiresAt,
    },
    token,
    app.id,
  ).catch((e) => ({ emailed: [], texted: null, smsSkipped: null, errors: [e instanceof Error ? e.message : String(e)] }));
  await supabase.from("church_admin_applications").update({ notified: { ...notified, at: new Date().toISOString() } }).eq("id", app.id);
  return { ...app, notified };
}

export async function listChurchAdminApplications(opts: { status?: ApplicationStatus; profileId?: string } = {}) {
  const supabase = createSupabaseAdminClient();
  let q = supabase.from("church_admin_applications").select(SELECT).order("created_at", { ascending: false });
  if (opts.status) q = q.eq("status", opts.status);
  if (opts.profileId) q = q.eq("profile_id", opts.profileId);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(rowToApplication);
}

export async function getChurchAdminApplication(id: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("church_admin_applications").select(SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToApplication(data) : null;
}

/** Look up an approval link. Returns the application and whether the link can still be used. */
export async function getChurchAdminApplicationByToken(token: string): Promise<{ application: ChurchAdminApplication | null; state: TokenState }> {
  if (!token?.trim()) return { application: null, state: "missing" };
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("church_admin_applications").select(SELECT).eq("token_hash", hashApprovalToken(token)).maybeSingle();
  if (error) throw error;
  return { application: data ? rowToApplication(data) : null, state: approvalTokenState(data) };
}

/**
 * Approve or reject. Super Admin only. With `token` (the emailed/texted link) the link must be
 * valid and is consumed; without it (dashboard, connector) the application must be pending.
 * The pending → decided update is conditional, so a link can't be used twice.
 */
export async function decideChurchAdminApplication(
  actor: ChurchActor,
  input: { id?: string; token?: string; decision: "approve" | "reject"; note?: string | null },
) {
  requireSuperAdminActor(actor);
  if (input.decision !== "approve" && input.decision !== "reject") throw new Error("Decision must be approve or reject.");
  const supabase = createSupabaseAdminClient();

  let app: ChurchAdminApplication | null;
  if (input.token) {
    const found = await getChurchAdminApplicationByToken(input.token);
    if (found.state !== "valid") throw new Error(TOKEN_STATE_MESSAGES[found.state as Exclude<TokenState, "valid">]);
    app = found.application;
  } else if (input.id) {
    app = await getChurchAdminApplication(input.id);
  } else {
    throw new Error("Give the application id.");
  }
  if (!app) throw new Error("Application not found.");
  if (input.id && app.id !== input.id) throw new Error("That link belongs to a different application.");
  if (app.status !== "pending") throw new Error(`This application was already ${app.status}.`);

  const now = new Date().toISOString();
  const note = str(input.note)?.slice(0, 2000) ?? null;
  let claim = supabase
    .from("church_admin_applications")
    .update({ status: input.decision === "approve" ? "approved" : "rejected", decided_by: actor.id, decided_at: now, decision_note: note, token_used_at: now, updated_at: now })
    .eq("id", app.id)
    .eq("status", "pending");
  if (input.token) claim = claim.is("token_used_at", null).eq("token_hash", hashApprovalToken(input.token));
  const { data: claimed, error } = await claim.select("id,church_id,church_name,church_city,church_state,church_website").maybeSingle();
  if (error) throw error;
  if (!claimed) throw new Error(TOKEN_STATE_MESSAGES.used);

  let churchId: string | null = claimed.church_id ?? null;
  let churchName = app.churchName;
  if (input.decision === "approve") {
    try {
      if (!churchId) {
        const church = await createChurchFromApplication(actor.id, {
          name: claimed.church_name, city: claimed.church_city, state: claimed.church_state, website: claimed.church_website,
        });
        churchId = church.id;
        churchName = church.name;
        await supabase.from("church_admin_applications").update({ church_id: church.id }).eq("id", app.id);
      }
      await assignChurchAdminFromApplication(actor.id, { churchId, profileId: app.profileId, applicationId: app.id });
    } catch (e) {
      // Put it back so it can be decided again (from the dashboard; the link stays used).
      await supabase.from("church_admin_applications").update({ status: "pending", decided_by: null, decided_at: null, updated_at: new Date().toISOString() }).eq("id", app.id);
      throw e;
    }
  }

  await resolvePersonalNotifications("church_admin_application", "applicationId", app.id);
  await notifyChurchAdminDecision(app.email, { name: app.name, churchName, approved: input.decision === "approve", note }).catch((e) =>
    console.error("[churches] decision email failed", e instanceof Error ? e.message : e),
  );
  return { id: app.id, status: input.decision === "approve" ? "approved" : "rejected", churchId, churchName, applicant: { id: app.profileId, name: app.name, email: app.email } };
}


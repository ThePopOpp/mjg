import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAppRole, type AppRole } from "@/lib/rbac/roles";
import { isOwnerEmail, type UserStatus } from "./constants";
import { upsertProfile } from "./repository";

// Changing one dashboard user's role or status without resending their whole
// profile (the MCP user tools). Same write path and history as the Users screen
// (upsertProfile), with the guard rails that screen enforces: nobody changes
// their own access, and the owner account is never demoted or deactivated.

export async function changeUserAccess(input: { id: string; role?: AppRole; status?: UserStatus; reason?: string; actorUserId: string }) {
  if (input.id === input.actorUserId) throw new Error("You can't change your own role or status.");
  if (input.role && !isAppRole(input.role)) throw new Error("Invalid role.");

  const supabase = createSupabaseAdminClient();
  const { data: p, error } = await supabase.from("profiles").select("*").eq("id", input.id).maybeSingle();
  if (error) throw error;
  if (!p) throw new Error("User not found.");
  if (isOwnerEmail(p.email) && ((input.role && input.role !== p.role) || (input.status && input.status !== "active"))) {
    throw new Error("The owner account can't be demoted or deactivated.");
  }

  const profile = await upsertProfile({
    id: p.id,
    authUserId: p.auth_user_id ?? undefined,
    firstName: p.first_name ?? "",
    lastName: p.last_name ?? "",
    email: p.email,
    phone: p.phone ?? undefined,
    role: input.role ?? p.role,
    status: input.status ?? p.status,
    avatarUrl: p.avatar_url ?? undefined,
    invitedBy: p.invited_by ?? undefined,
    relatedParticipantId: p.related_participant_id ?? undefined,
    notes: p.notes ?? undefined,
    actorUserId: input.actorUserId,
    statusChangeReason: input.reason,
  });
  return { id: profile.id, email: profile.email, role: profile.role, status: profile.status };
}

export async function getUserSummary(id: string) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("profiles").select("id, email, full_name, role, status").eq("id", id).maybeSingle();
  if (!data) throw new Error("User not found.");
  return data;
}

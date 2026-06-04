import { ROLES, normalizeAppRole } from "@/lib/rbac/roles";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const OWNER_EMAILS = new Set(["jw@michaeljgauthier.com"]);

export async function requireUserManager() {
  const supabase = await createClient();

  if (!supabase) {
    throw new Error("Supabase Auth is not configured.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required.");
  }

  const { profile, error } = await getProfileForAuthUser(user);

  if (error) throw error;
  const role = normalizeResolvedRole(profile, user.email);
  if (!profile || profile.status !== "active") {
    throw new Error("Active admin profile required.");
  }
  if (role !== ROLES.SUPER_ADMIN && role !== ROLES.ADMIN) {
    throw new Error("User management permission required.");
  }

  return { ...profile, role };
}

export async function requireParticipantManager() {
  const supabase = await createClient();

  if (!supabase) {
    throw new Error("Supabase Auth is not configured.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required.");
  }

  const { profile, error } = await getProfileForAuthUser(user);

  if (error) throw error;
  const role = normalizeResolvedRole(profile, user.email);
  if (!profile || profile.status !== "active") {
    throw new Error("Active dashboard profile required.");
  }
  if (!(role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN || role === ROLES.TEAM_MEMBER)) {
    throw new Error("Participant management permission required.");
  }

  return { ...profile, role };
}

export async function requireContentManager() {
  const supabase = await createClient();

  if (!supabase) {
    throw new Error("Supabase Auth is not configured.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required.");
  }

  const { profile, error } = await getProfileForAuthUser(user);

  if (error) throw error;
  const role = normalizeResolvedRole(profile, user.email);
  if (!profile || profile.status !== "active") {
    throw new Error("Active dashboard profile required.");
  }
  if (!(role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN || role === ROLES.CONTENT_REVIEWER)) {
    throw new Error("Content management permission required.");
  }

  return { ...profile, role };
}

export async function requireAdminManager() {
  const supabase = await createClient();

  if (!supabase) {
    throw new Error("Supabase Auth is not configured.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required.");
  }

  const { profile, error } = await getProfileForAuthUser(user);

  if (error) throw error;
  const role = normalizeResolvedRole(profile, user.email);
  if (!profile || profile.status !== "active") {
    throw new Error("Active admin profile required.");
  }
  if (!(role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN)) {
    throw new Error("Admin permission required.");
  }

  return { ...profile, role };
}

function normalizeResolvedRole(profile: { email?: string | null; role?: string | null } | null, authEmail?: string | null) {
  const userEmail = (authEmail ?? "").trim().toLowerCase();
  const profileEmail = (profile?.email ?? "").trim().toLowerCase();
  if (OWNER_EMAILS.has(userEmail) || OWNER_EMAILS.has(profileEmail)) return ROLES.SUPER_ADMIN;
  return normalizeAppRole(profile?.role) ?? ROLES.PARTICIPANT;
}

async function getProfileForAuthUser(user: { id: string; email?: string | null }) {
  const admin = createSupabaseAdminClient();
  let { data: profile, error } = await admin
    .from("profiles")
    .select("id,auth_user_id,role,status,email")
    .or(`auth_user_id.eq.${user.id},id.eq.${user.id}`)
    .maybeSingle();

  if (!profile && !error && user.email) {
    const byEmail = await admin
      .from("profiles")
      .select("id,auth_user_id,role,status,email")
      .eq("email", user.email.trim().toLowerCase())
      .maybeSingle();
    profile = byEmail.data;
    error = byEmail.error;
  }

  if (profile && profile.auth_user_id !== user.id) {
    await admin.from("profiles").update({ auth_user_id: user.id, updated_at: new Date().toISOString() }).eq("id", profile.id);
  }

  return { profile, error };
}

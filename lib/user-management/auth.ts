import { ROLES } from "@/lib/rbac/roles";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

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
  if (!profile || profile.status !== "active") {
    throw new Error("Active admin profile required.");
  }
  if (profile.role !== ROLES.SUPER_ADMIN && profile.role !== ROLES.ADMIN) {
    throw new Error("User management permission required.");
  }

  return profile;
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
  if (!profile || profile.status !== "active") {
    throw new Error("Active dashboard profile required.");
  }
  if (![ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEAM_MEMBER].includes(profile.role)) {
    throw new Error("Participant management permission required.");
  }

  return profile;
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
  if (!profile || profile.status !== "active") {
    throw new Error("Active dashboard profile required.");
  }
  if (![ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CONTENT_REVIEWER].includes(profile.role)) {
    throw new Error("Content management permission required.");
  }

  return profile;
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
  if (!profile || profile.status !== "active") {
    throw new Error("Active admin profile required.");
  }
  if (![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(profile.role)) {
    throw new Error("Admin permission required.");
  }

  return profile;
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

import { createClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ROLES, canAccessDashboard, normalizeAppRole, type AppRole } from "@/lib/rbac/roles";

const OWNER_EMAILS = new Set(["jw@michaeljgauthier.com"]);

export type DashboardProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AppRole;
  status: "active" | "invited" | "pending" | "suspended" | "archived" | "inactive";
};

export async function getCurrentProfile(): Promise<DashboardProfile | null> {
  const supabase = await createClient();

  if (!supabase) {
    return {
      id: "local-preview",
      email: "admin@michaeljgauthier.com",
      firstName: "MJG",
      lastName: "Admin",
      role: ROLES.SUPER_ADMIN,
      status: "active",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = createSupabaseAdminClient();
  let { data: profile } = await admin
    .from("profiles")
    .select("id,auth_user_id,email,first_name,last_name,role,status")
    .or(`id.eq.${user.id},auth_user_id.eq.${user.id}`)
    .maybeSingle();

  if (!profile && user.email) {
    const byEmail = await admin
      .from("profiles")
      .select("id,auth_user_id,email,first_name,last_name,role,status")
      .eq("email", user.email.trim().toLowerCase())
      .maybeSingle();
    profile = byEmail.data;
  }

  if (profile && profile.auth_user_id !== user.id) {
    await admin.from("profiles").update({ auth_user_id: user.id, updated_at: new Date().toISOString() }).eq("id", profile.id);
  }

  const userEmail = (user.email ?? "").trim().toLowerCase();
  const profileEmail = (profile?.email ?? userEmail).trim().toLowerCase();
  const isOwner = OWNER_EMAILS.has(userEmail) || OWNER_EMAILS.has(profileEmail);
  const role = isOwner ? ROLES.SUPER_ADMIN : normalizeAppRole(profile?.role) ?? ROLES.PARTICIPANT;
  const status = isOwner ? "active" : profile?.status ?? "active";

  return {
    id: profile?.id ?? user.id,
    email: profile?.email ?? user.email ?? "",
    firstName: profile?.first_name ?? "",
    lastName: profile?.last_name ?? "",
    role,
    status,
  };
}

export function isActiveDashboardProfile(profile: DashboardProfile | null) {
  return Boolean(profile && profile.status === "active" && canAccessDashboard(profile.role));
}

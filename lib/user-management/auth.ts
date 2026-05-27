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

  const admin = createSupabaseAdminClient();
  const { data: profile, error } = await admin
    .from("profiles")
    .select("id,role,status,email")
    .or(`auth_user_id.eq.${user.id},id.eq.${user.id}`)
    .maybeSingle();

  if (error) throw error;
  if (!profile || profile.status !== "active") {
    throw new Error("Active admin profile required.");
  }
  if (profile.role !== ROLES.SUPER_ADMIN && profile.role !== ROLES.ADMIN) {
    throw new Error("User management permission required.");
  }

  return profile;
}

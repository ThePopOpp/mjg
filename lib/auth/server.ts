import { createClient } from "@/lib/supabase/server";
import { ROLES, type AppRole, isAppRole } from "@/lib/rbac/roles";

export type DashboardProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AppRole;
  status: "active" | "invited" | "inactive";
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,email,first_name,last_name,role,status")
    .eq("id", user.id)
    .maybeSingle();

  const role = isAppRole(profile?.role) ? profile.role : ROLES.PARTICIPANT;

  return {
    id: user.id,
    email: profile?.email ?? user.email ?? "",
    firstName: profile?.first_name ?? "",
    lastName: profile?.last_name ?? "",
    role,
    status: profile?.status ?? "active",
  };
}

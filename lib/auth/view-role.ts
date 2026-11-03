import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ROLES, normalizeAppRole, type AppRole } from "@/lib/rbac/roles";

// "View as": a Super Admin with extra roles in profile_view_roles can switch the
// dashboard into one of them to see and test what that role sees. The choice is
// a cookie, but it is only ever honoured when the role is in the profile's own
// list, so the cookie can't grant anything. It changes pages and navigation
// (everything that reads getCurrentProfile().role). Most API routes resolve the
// real role from profiles (lib/user-management/auth.ts) and keep full access;
// the few that use getCurrentProfile act as the viewed role.

export const VIEW_ROLE_COOKIE = "mjg_view_role";

/** The roles this profile may view as, primary first. Only Super Admins can have extras. */
export async function loadViewRoles(profileId: string, primaryRole: AppRole): Promise<AppRole[]> {
  if (primaryRole !== ROLES.SUPER_ADMIN) return [primaryRole];
  const { data } = await createSupabaseAdminClient()
    .from("profile_view_roles")
    .select("roles")
    .eq("profile_id", profileId)
    .maybeSingle();
  const extras = ((data?.roles as string[] | undefined) ?? [])
    .map((r) => normalizeAppRole(r))
    .filter((r): r is AppRole => Boolean(r) && r !== primaryRole);
  return [primaryRole, ...new Set(extras)];
}

/** The role to act as: the cookie's role when allowed, else the primary role. */
export function resolveViewRole(cookieValue: string | undefined, viewRoles: AppRole[]): AppRole {
  const wanted = normalizeAppRole(cookieValue);
  return wanted && viewRoles.includes(wanted) ? wanted : viewRoles[0];
}

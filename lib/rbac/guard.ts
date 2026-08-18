import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/server";
import { can, type Permission } from "@/lib/rbac/permissions";

/**
 * Server-side page/layout guard. Redirects to login if signed out, or to
 * /access-restricted if the current role lacks `permission`. Use at the top of a
 * dashboard page or (preferably) a folder layout so every nested route is covered.
 * Returns the profile for convenience.
 */
export async function requirePagePermission(permission: Permission, path = "/dashboard") {
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(path)}`);
  if (!can(profile.role, permission)) redirect("/access-restricted");
  return profile;
}

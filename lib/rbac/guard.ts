import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/server";
import { can, type Permission } from "@/lib/rbac/permissions";
import { isSelfServeRole } from "@/lib/user-management/self-registration";

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

/**
 * Staff-only guard for internal admin modules that have no finer-grained permission.
 *
 * Participants and facilitators can obtain an account WITHOUT an admin invite (the public
 * /register page lets them pick their own role), so `canAccessDashboard` is no longer proof
 * that someone was vetted. This keeps the existing staff roles exactly as they were and only
 * shuts out the two self-serve roles.
 */
export async function requireStaffPage(path = "/dashboard") {
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(path)}`);
  if (isSelfServeRole(profile.role)) redirect("/access-restricted");
  return profile;
}

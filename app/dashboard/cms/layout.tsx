import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/server";
import { ROLES } from "@/lib/rbac/roles";

// CMS is Super-Admin-only. This is one of four guard layers (nav permission,
// this page guard, requireSuperAdmin on every API route, and is_super_admin RLS).
export default async function CmsLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== ROLES.SUPER_ADMIN) {
    redirect("/access-restricted");
  }
  return <>{children}</>;
}

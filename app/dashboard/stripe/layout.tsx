import type { ReactNode } from "react";
import { requirePagePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

// Access guard for /dashboard/stripe and every tab nested under it. Super-Admin
// only; the /api/admin/stripe routes check requireSuperAdmin independently.
export default async function GuardLayout({ children }: { children: ReactNode }) {
  await requirePagePermission(PERMISSIONS.MANAGE_STRIPE, "/dashboard/stripe");
  return <>{children}</>;
}

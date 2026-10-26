import type { ReactNode } from "react";
import { requirePagePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

// Access guard for /dashboard/claude. Super-Admin only; /api/admin/mcp checks
// requireSuperAdmin independently.
export default async function GuardLayout({ children }: { children: ReactNode }) {
  await requirePagePermission(PERMISSIONS.MANAGE_CONNECTOR, "/dashboard/claude");
  return <>{children}</>;
}

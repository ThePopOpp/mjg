import type { ReactNode } from "react";
import { requirePagePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

// Access guard for /dashboard/analytics (same audience as Reports).
export default async function GuardLayout({ children }: { children: ReactNode }) {
  await requirePagePermission(PERMISSIONS.VIEW_REPORTS, "/dashboard/analytics");
  return <>{children}</>;
}

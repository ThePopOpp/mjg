import type { ReactNode } from "react";
import { requirePagePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

// Access guard for /dashboard/email-journey and all nested routes.
export default async function GuardLayout({ children }: { children: ReactNode }) {
  await requirePagePermission(PERMISSIONS.MANAGE_SETTINGS, "/dashboard/email-journey");
  return <>{children}</>;
}

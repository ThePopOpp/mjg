import type { ReactNode } from "react";
import { requirePagePermission } from "@/lib/rbac/guard";
import { PERMISSIONS } from "@/lib/rbac/permissions";

// Access guard for /dashboard/sms and all nested routes.
export default async function GuardLayout({ children }: { children: ReactNode }) {
  await requirePagePermission(PERMISSIONS.MANAGE_SETTINGS, "/dashboard/sms");
  return <>{children}</>;
}

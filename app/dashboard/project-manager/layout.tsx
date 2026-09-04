import type { ReactNode } from "react";
import { requireStaffPage } from "@/lib/rbac/guard";

// Internal staff module — closed to the self-serve roles (participant / facilitator), who can
// now create their own accounts via the public /register page.
export default async function GuardLayout({ children }: { children: ReactNode }) {
  await requireStaffPage("/dashboard/project-manager");
  return <>{children}</>;
}

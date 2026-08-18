import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ReviewFab } from "@/components/cms/review/review-fab";
import { createAdminActionToken } from "@/lib/auth/action-token";
import { getCurrentProfile } from "@/lib/auth/server";
import { ROLES, canAccessPortal } from "@/lib/rbac/roles";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login?next=/dashboard");
  }

  // Admit active dashboard roles AND active participants (who get a scoped, sidebar
  // dashboard with their own nav — see participantNav + ParticipantDashboard). Per-page
  // guards still restrict admin surfaces by permission.
  if (!(profile.status === "active" && canAccessPortal(profile.role))) {
    redirect("/access-restricted");
  }

  const isSuperAdmin = profile.role === ROLES.SUPER_ADMIN;
  return (
    <DashboardShell actionToken={createAdminActionToken(profile)} profile={profile}>
      {children}
      {isSuperAdmin && (
        <ReviewFab me={{ email: (profile.email ?? "").toLowerCase(), name: [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.email }} />
      )}
    </DashboardShell>
  );
}

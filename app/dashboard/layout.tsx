import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ReviewFab } from "@/components/cms/review/review-fab";
import { createAdminActionToken } from "@/lib/auth/action-token";
import { getCurrentProfile, isActiveDashboardProfile } from "@/lib/auth/server";
import { ROLES } from "@/lib/rbac/roles";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login?next=/dashboard");
  }

  if (!isActiveDashboardProfile(profile)) {
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

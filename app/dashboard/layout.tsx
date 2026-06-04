import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCurrentProfile, isActiveDashboardProfile } from "@/lib/auth/server";

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

  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}

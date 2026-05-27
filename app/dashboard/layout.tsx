import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCurrentProfile } from "@/lib/auth/server";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getCurrentProfile();

  return <DashboardShell profile={profile}>{children}</DashboardShell>;
}

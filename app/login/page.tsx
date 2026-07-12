import { Suspense } from "react";
import { redirect } from "next/navigation";
import blackLogo from "@/docs/mjg-logos/mjg_black_white.png";
import whiteLogo from "@/docs/mjg-logos/mjg_white.png";
import { LoginForm } from "@/components/auth/login-form";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { InstallAppButton } from "@/components/pwa/install-app-button";
import { getCurrentProfile, isActiveDashboardProfile } from "@/lib/auth/server";
import { ROLES } from "@/lib/rbac/roles";

export const metadata = {
  title: "Login | MJG Dashboard",
};

export default async function LoginPage() {
  const profile = await getCurrentProfile();

  if (isActiveDashboardProfile(profile)) {
    redirect("/dashboard");
  }

  // Signed-in participants go to their portal, not the admin dashboard.
  if (profile?.status === "active" && profile.role === ROLES.PARTICIPANT) {
    redirect("/portal");
  }

  return (
    <main className="grid min-h-screen bg-background px-4 py-10 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:p-0">
      <div className="fixed right-5 top-5 z-10">
        <ThemeToggle />
      </div>
      <section className="hidden border-r bg-card lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div>
          <span className="relative block h-16 w-44">
            <img src={blackLogo.src} alt="MJG" className="h-full w-full object-contain object-left dark:hidden" />
            <img src={whiteLogo.src} alt="MJG" className="hidden h-full w-full object-contain object-left dark:block" />
          </span>
          <p className="mt-2 font-serif text-sm font-semibold italic text-foreground">
            Michael <span className="text-[#c9aa70]">J.</span> Gauthier
          </p>
        </div>
        <div className="max-w-md">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">Created for More</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight">A protected workspace for the 7-Day Stewardship Pilot.</h1>
          <p className="mt-4 text-muted-foreground">
            User management, participants, surveys, notifications, and pilot reporting stay behind secure Supabase access.
          </p>
        </div>
      </section>
      <section className="flex flex-col items-center justify-center gap-6">
        <Suspense>
          <LoginForm />
        </Suspense>
        <div className="flex flex-col items-center gap-2">
          <InstallAppButton label="Install the MJG App" responsiveLabel={false} />
          <p className="text-xs text-muted-foreground">Get the app on your desktop or phone — no app store needed.</p>
        </div>
      </section>
    </main>
  );
}

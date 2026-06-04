import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getCurrentProfile, isActiveDashboardProfile } from "@/lib/auth/server";

export const metadata = {
  title: "Login | MJG Dashboard",
};

export default async function LoginPage() {
  const profile = await getCurrentProfile();

  if (isActiveDashboardProfile(profile)) {
    redirect("/dashboard");
  }

  return (
    <main className="grid min-h-screen bg-background px-4 py-10 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:p-0">
      <div className="fixed right-5 top-5 z-10">
        <ThemeToggle />
      </div>
      <section className="hidden border-r bg-card lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div>
          <p className="text-5xl font-black tracking-normal">MJG</p>
          <p className="mt-2 text-sm font-semibold uppercase text-muted-foreground">Stewardship Blueprint</p>
        </div>
        <div className="max-w-md">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">Created for More</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight">A protected workspace for the 7-Day Stewardship Pilot.</h1>
          <p className="mt-4 text-muted-foreground">
            User management, participants, surveys, notifications, and pilot reporting stay behind secure Supabase access.
          </p>
        </div>
      </section>
      <section className="flex items-center justify-center">
        <Suspense>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}

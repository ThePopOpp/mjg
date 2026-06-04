import Link from "next/link";
import { LogOut, Menu, Search } from "lucide-react";
import { dashboardNavItems } from "@/components/layout/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ROLE_LABELS } from "@/lib/rbac/roles";
import { can } from "@/lib/rbac/permissions";
import type { DashboardProfile } from "@/lib/auth/server";

type DashboardShellProps = {
  children: React.ReactNode;
  profile: DashboardProfile;
};

export function DashboardShell({ children, profile }: DashboardShellProps) {
  const displayName = `${profile.firstName} ${profile.lastName}`.trim() || profile.email;
  const visibleNavItems = dashboardNavItems.filter((item) => !("permission" in item) || can(profile.role, item.permission));

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r bg-card lg:block">
        <div className="flex h-20 items-center border-b px-6">
          <Link href="/dashboard" className="flex flex-col items-start" aria-label="Michael J. Gauthier dashboard">
            <span className="relative block h-12 w-28 shrink-0">
              <img
                src="https://michaeljgauthier.com/wp-content/uploads/2025/03/MJG_Logo_Black-1.svg"
                alt="MJG"
                className="h-full w-full object-contain dark:hidden"
              />
              <img
                src="https://michaeljgauthier.com/wp-content/uploads/2025/03/MJG_Logo_White-1.svg"
                alt="MJG"
                className="hidden h-full w-full object-contain dark:block"
              />
            </span>
            <span className="mt-1 font-serif text-sm font-semibold italic leading-none text-foreground">
              Michael <span className="text-[#c9aa70]">J.</span> Gauthier
            </span>
          </Link>
        </div>
        <nav className="space-y-1 p-4">
          {visibleNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
          <div className="mx-auto flex h-16 w-full max-w-[112rem] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="relative hidden w-full max-w-xl sm:block">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search participants, waves, tags..." />
            </div>
            <div className="ml-auto flex items-center gap-3">
              <ThemeToggle />
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">{ROLE_LABELS[profile.role]}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {displayName.slice(0, 2).toUpperCase()}
              </div>
              <Button asChild variant="ghost" size="icon" aria-label="Sign out">
                <Link href="/auth/logout">
                  <LogOut className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[112rem] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

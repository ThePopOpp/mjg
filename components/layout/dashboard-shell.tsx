import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { dashboardNavItems } from "@/components/layout/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROLE_LABELS } from "@/lib/rbac/roles";
import type { DashboardProfile } from "@/lib/auth/server";

type DashboardShellProps = {
  children: React.ReactNode;
  profile: DashboardProfile | null;
};

export function DashboardShell({ children, profile }: DashboardShellProps) {
  const displayName = profile ? `${profile.firstName} ${profile.lastName}`.trim() || profile.email : "Guest";

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r bg-card lg:block">
        <div className="flex h-20 items-center border-b px-6">
          <Link href="/dashboard" className="flex flex-col">
            <span className="text-3xl font-black leading-none tracking-normal">MJG</span>
            <span className="mt-1 text-xs font-medium uppercase text-muted-foreground">Stewardship Blueprint</span>
          </Link>
        </div>
        <nav className="space-y-1 p-4">
          {dashboardNavItems.map((item) => (
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
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="relative hidden max-w-md flex-1 sm:block">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search participants, waves, tags..." />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground">
                {profile ? ROLE_LABELS[profile.role] : "Not signed in"}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

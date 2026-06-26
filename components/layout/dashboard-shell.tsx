"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Menu, Search, PanelLeft, X } from "lucide-react";
import { DashboardActionTokenProvider } from "@/components/layout/dashboard-action-token";
import { dashboardNav, type NavEntry, type NavGroup, type NavLeaf } from "@/components/layout/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ROLE_LABELS } from "@/lib/rbac/roles";
import { can } from "@/lib/rbac/permissions";
import { cn } from "@/lib/utils";
import type { DashboardProfile } from "@/lib/auth/server";

type DashboardShellProps = {
  actionToken: string;
  children: React.ReactNode;
  profile: DashboardProfile;
};

const STORAGE_KEY = "mjg-sidebar-collapsed";

export function DashboardShell({ actionToken, children, profile }: DashboardShellProps) {
  const displayName = `${profile.firstName} ${profile.lastName}`.trim() || profile.email;
  const pathname = usePathname();

  // Permission-filter: drop items the role can't see; drop now-empty groups.
  const visibleEntries: NavEntry[] = dashboardNav
    .map((entry): NavEntry | null => {
      if (entry.kind === "group") {
        const items = entry.items.filter((it) => !it.permission || can(profile.role, it.permission));
        return items.length ? { ...entry, items } : null;
      }
      return !entry.permission || can(profile.role, entry.permission) ? entry : null;
    })
    .filter((e): e is NavEntry => e !== null);

  const isActive = (href: string) => (href === "/dashboard" ? pathname === "/dashboard" : pathname === href || pathname.startsWith(`${href}/`));
  const groupActive = (g: NavGroup) => g.items.some((it) => isActive(it.href));

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const isGroupOpen = (g: NavGroup) => openGroups[g.label] ?? groupActive(g);
  const toggleGroup = (g: NavGroup) => setOpenGroups((o) => ({ ...o, [g.label]: !isGroupOpen(g) }));

  // Restore the persisted desktop collapse state after mount (avoids hydration mismatch).
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "1") setCollapsed(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r bg-card transition-all duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
          collapsed ? "lg:w-16" : "lg:w-72",
        ].join(" ")}
      >
        <div className={`flex h-20 shrink-0 items-center border-b ${collapsed ? "lg:justify-center lg:px-2" : "px-6"}`}>
          <Link
            href="/dashboard"
            className="flex flex-col items-start"
            aria-label="Michael J. Gauthier dashboard"
            onClick={() => setMobileOpen(false)}
          >
            <span className={`relative block h-12 ${collapsed ? "lg:h-9 lg:w-9 w-28" : "w-28"}`}>
              <img
                src="https://michaeljgauthier.com/wp-content/uploads/2025/03/MJG_Logo_Black-1.svg"
                alt="MJG"
                className="h-full w-full object-contain object-left dark:hidden"
              />
              <img
                src="https://michaeljgauthier.com/wp-content/uploads/2025/03/MJG_Logo_White-1.svg"
                alt="MJG"
                className="hidden h-full w-full object-contain object-left dark:block"
              />
            </span>
            <span className={`mt-1 font-serif text-sm font-semibold italic leading-none text-foreground ${collapsed ? "lg:hidden" : ""}`}>
              Michael <span className="text-[#c9aa70]">J.</span> Gauthier
            </span>
          </Link>

          {/* Close button (mobile only) */}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="sidebar-scroll min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
          {visibleEntries.map((entry) =>
            entry.kind === "group" ? (
              <GroupBlock
                key={entry.label}
                group={entry}
                collapsed={collapsed}
                open={isGroupOpen(entry)}
                active={groupActive(entry)}
                onToggle={() => toggleGroup(entry)}
                isItemActive={isActive}
                onNavigate={() => setMobileOpen(false)}
              />
            ) : (
              <LeafLink
                key={entry.href}
                item={entry}
                collapsed={collapsed}
                active={isActive(entry.href)}
                onNavigate={() => setMobileOpen(false)}
              />
            ),
          )}
        </nav>
      </aside>

      <div className={`transition-all duration-200 ${collapsed ? "lg:pl-16" : "lg:pl-72"}`}>
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
          <div className="mx-auto flex h-16 w-full max-w-[112rem] items-center gap-3 px-4 sm:px-6 lg:px-8">
            {/* Mobile: open drawer */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            {/* Desktop: collapse/expand */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:inline-flex"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-pressed={collapsed}
              onClick={toggleCollapsed}
            >
              <PanelLeft className="h-5 w-5" />
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
              <form action="/auth/logout" method="post">
                <Button type="submit" variant="ghost" size="icon" aria-label="Sign out">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </header>

        <DashboardActionTokenProvider token={actionToken}>
          <main className="mx-auto w-full max-w-[112rem] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </DashboardActionTokenProvider>
      </div>
    </div>
  );
}

function LeafLink({
  item, collapsed, active, indent, onNavigate,
}: {
  item: NavLeaf; collapsed: boolean; active: boolean; indent?: boolean; onNavigate: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex h-10 items-center gap-3 rounded-md text-sm font-medium transition-colors",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        collapsed ? "lg:justify-center lg:px-0 px-3" : "px-3",
        indent && !collapsed ? "lg:pl-9" : "",
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      <span className={collapsed ? "lg:hidden" : ""}>{item.label}</span>
      <span className={cn("pointer-events-none absolute left-full z-50 ml-2 hidden whitespace-nowrap rounded-md border bg-popover px-2 py-1 text-xs font-medium text-popover-foreground shadow-md", collapsed ? "lg:group-hover:block" : "")}>
        {item.label}
      </span>
    </Link>
  );
}

function GroupBlock({
  group, collapsed, open, active, onToggle, isItemActive, onNavigate,
}: {
  group: NavGroup; collapsed: boolean; open: boolean; active: boolean;
  onToggle: () => void; isItemActive: (href: string) => boolean; onNavigate: () => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        title={collapsed ? group.label : undefined}
        aria-expanded={open}
        className={cn(
          "group relative flex h-10 w-full items-center gap-3 rounded-md text-sm font-medium transition-colors",
          active ? "text-primary" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          collapsed ? "lg:justify-center lg:px-0 px-3" : "px-3",
        )}
      >
        <group.icon className="h-4 w-4 shrink-0" />
        <span className={collapsed ? "lg:hidden" : ""}>{group.label}</span>
        {!collapsed && <ChevronDown className={cn("ml-auto h-4 w-4 shrink-0 transition-transform", open ? "rotate-180" : "")} />}
        <span className={cn("pointer-events-none absolute left-full z-50 ml-2 hidden whitespace-nowrap rounded-md border bg-popover px-2 py-1 text-xs font-medium text-popover-foreground shadow-md", collapsed ? "lg:group-hover:block" : "")}>
          {group.label}
        </span>
      </button>
      {open && (
        <div className="mt-1 space-y-1">
          {group.items.map((it) => (
            <LeafLink key={it.href} item={it} collapsed={collapsed} active={isItemActive(it.href)} indent onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
}

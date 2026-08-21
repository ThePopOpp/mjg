"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Users, Phone, MailCheck, ClipboardList, NotebookPen, CalendarClock,
  Sparkles, IdCard, Bot, UserCircle, Settings, BarChart3, ChevronUp, X,
  type LucideIcon,
} from "lucide-react";
import type { NavEntry } from "@/components/layout/dashboard-nav";
import { ROLES } from "@/lib/rbac/roles";
import { cn } from "@/lib/utils";

type FlatItem = { href: string; label: string; icon: LucideIcon };

// Curated bottom bar for admins — a short, task-focused shortlist rather than every sidebar link.
const ADMIN_ITEMS: FlatItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/participants", label: "Community", icon: Users },
  { href: "/dashboard/dialer", label: "Dialer", icon: Phone },
  { href: "/dashboard/emails", label: "Emails", icon: MailCheck },
  { href: "/dashboard/plans", label: "Plans", icon: ClipboardList },
  { href: "/dashboard/workspace", label: "Workspace", icon: NotebookPen },
  { href: "/dashboard/bookings", label: "Booking", icon: CalendarClock },
  { href: "/dashboard/experiences", label: "Experiences", icon: Sparkles },
  { href: "/dashboard/business-cards", label: "Business Card", icon: IdCard },
  { href: "/dashboard/ai-agent", label: "AI Agent", icon: Bot },
  { href: "/dashboard/profile", label: "My Profile", icon: UserCircle },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/user-management", label: "User Management", icon: BarChart3 },
];

/**
 * Mobile-only bottom navigation: a fixed, horizontally-scrollable icon bar (lg:hidden). It is
 * visible by default and can be dismissed via a small tab on its top-left; when closed it
 * collapses to a "Menu" handle that reopens it.
 *
 * Admins/super-admins get a curated shortlist (ADMIN_ITEMS). Every other role gets its own
 * items derived from the same role-filtered nav the sidebar uses (`visibleEntries`), flattened
 * since a bottom bar can't nest — so a role only ever sees destinations it can reach.
 */
export function MobileBottomNav({ role, entries }: { role: string; entries: NavEntry[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  const isAdmin = role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN;
  const items: FlatItem[] = [];
  if (isAdmin) {
    items.push(...ADMIN_ITEMS);
  } else {
    const seen = new Set<string>();
    for (const entry of entries) {
      const leaves = entry.kind === "group" ? entry.items : [entry];
      for (const leaf of leaves) {
        if (seen.has(leaf.href)) continue;
        seen.add(leaf.href);
        items.push({ href: leaf.href, label: leaf.label, icon: leaf.icon });
      }
    }
  }

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname === href || pathname.startsWith(`${href}/`);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="fixed bottom-3 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-border bg-card/95 px-4 py-2 text-xs font-medium shadow-lg backdrop-blur lg:hidden"
      >
        <ChevronUp className="h-4 w-4" />
        Menu
      </button>
    );
  }

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Close tab — sits above the bar on the top-left, out of the scrolling row */}
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Close menu"
        className="absolute -top-7 left-2 flex items-center gap-1 rounded-t-lg border border-b-0 border-border bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm transition hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
        Close
      </button>
      <div className="flex items-stretch gap-1 overflow-x-auto px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-[4.25rem] shrink-0 flex-col items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-center text-[11px] font-medium transition",
                active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

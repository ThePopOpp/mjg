"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Phone,
  MailCheck,
  ClipboardList,
  NotebookPen,
  CalendarClock,
  Sparkles,
  IdCard,
  Bot,
  UserCircle,
  Settings,
  BarChart3,
  ChevronUp,
  X,
  type LucideIcon,
} from "lucide-react";
import { can, PERMISSIONS, type Permission } from "@/lib/rbac/permissions";
import { cn } from "@/lib/utils";

type BottomNavItem = { href: string; label: string; icon: LucideIcon; permission?: Permission };

// Fixed, ordered list requested for the mobile bottom bar. Items are permission-filtered so
// non-admins only see what they can reach; Dashboard / Plans / Booking / My Profile are ungated.
const ITEMS: BottomNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/participants", label: "Community", icon: Users, permission: PERMISSIONS.MANAGE_PARTICIPANTS },
  { href: "/dashboard/dialer", label: "Dialer", icon: Phone, permission: PERMISSIONS.MANAGE_SETTINGS },
  { href: "/dashboard/emails", label: "Emails", icon: MailCheck, permission: PERMISSIONS.MANAGE_SETTINGS },
  { href: "/dashboard/plans", label: "Plans", icon: ClipboardList },
  { href: "/dashboard/workspace", label: "Workspace", icon: NotebookPen, permission: PERMISSIONS.MANAGE_WORKSPACE },
  { href: "/dashboard/bookings", label: "Booking", icon: CalendarClock },
  { href: "/dashboard/experiences", label: "Experiences", icon: Sparkles, permission: PERMISSIONS.MANAGE_EXPERIENCES },
  { href: "/dashboard/business-cards", label: "Card", icon: IdCard, permission: PERMISSIONS.MANAGE_SETTINGS },
  { href: "/dashboard/ai-agent", label: "AI Agent", icon: Bot, permission: PERMISSIONS.MANAGE_SETTINGS },
  { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, permission: PERMISSIONS.MANAGE_SETTINGS },
  { href: "/dashboard/user-management", label: "Users", icon: BarChart3, permission: PERMISSIONS.MANAGE_USERS },
];

/**
 * Mobile-only bottom navigation: a fixed, horizontally-scrollable icon bar (lg:hidden). It is
 * visible by default and can be dismissed by the user; when closed it collapses to a small "Menu"
 * handle that reopens it. Items are filtered by the viewer's role.
 */
export function MobileBottomNav({ role }: { role: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const items = ITEMS.filter((item) => !item.permission || can(role, item.permission));

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
      <div className="flex items-stretch gap-1 overflow-x-auto px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-[4rem] shrink-0 flex-col items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium transition",
                active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="ml-1 flex min-w-[3.25rem] shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-l border-border px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition hover:bg-muted"
        >
          <X className="h-5 w-5" aria-hidden />
          <span>Close</span>
        </button>
      </div>
    </nav>
  );
}

"use client";

import { useState } from "react";
import { Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_LABELS, type AppRole } from "@/lib/rbac/roles";

// "View as" for profiles with extra roles (lib/auth/view-role.ts). Switching sets
// the cookie server-side, then reloads /dashboard so the layout, nav and the
// role's own home page all render for the new role.

async function switchRole(role: AppRole) {
  const res = await fetch("/api/auth/view-role", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Couldn't switch roles.");
  }
  window.location.assign("/dashboard");
}

export function ViewAsSwitcher({ role, viewRoles }: { role: AppRole; viewRoles: AppRole[] }) {
  const [pending, setPending] = useState<AppRole | null>(null);

  async function choose(next: string) {
    if (next === role || pending) return;
    setPending(next as AppRole);
    try {
      await switchRole(next as AppRole);
    } catch (e) {
      setPending(null);
      window.alert(e instanceof Error ? e.message : "Couldn't switch roles.");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`View as (currently ${ROLE_LABELS[role]})`} title="View as another role">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>View the dashboard as</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={pending ?? role} onValueChange={choose}>
          {viewRoles.map((r, i) => (
            <DropdownMenuRadioItem key={r} value={r}>
              {ROLE_LABELS[r]}
              {i === 0 && <span className="ml-auto pl-3 text-xs text-muted-foreground">You</span>}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Shown on every dashboard page while viewing as a role other than your own. */
export function ViewAsBanner({ role, primaryRole }: { role: AppRole; primaryRole: AppRole }) {
  const [pending, setPending] = useState(false);
  if (role === primaryRole) return null;

  async function back() {
    setPending(true);
    try {
      await switchRole(primaryRole);
    } catch (e) {
      setPending(false);
      window.alert(e instanceof Error ? e.message : "Couldn't switch roles.");
    }
  }

  return (
    <div className="border-b border-[#b88a4a]/40 bg-[#b88a4a]/15">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 sm:px-6 lg:px-8">
        <p className="min-w-0 flex-1 text-sm text-pretty">
          <Eye className="mr-1.5 inline h-4 w-4 align-[-3px] text-[#b88a4a]" />
          Viewing as <strong>{ROLE_LABELS[role]}</strong>. Pages and menus match that role. Some saves and actions
          still run with your {ROLE_LABELS[primaryRole]} access.
        </p>
        <Button size="sm" variant="outline" onClick={back} disabled={pending} className="shrink-0">
          {pending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
          Back to {ROLE_LABELS[primaryRole]}
        </Button>
      </div>
    </div>
  );
}

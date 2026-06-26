"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";

export function DeleteUserButton({
  userId, userName, redirectTo, label, variant = "link",
}: {
  userId: string;
  userName: string;
  /** Where to go after a successful delete. Omit to refresh the current page. */
  redirectTo?: string;
  label?: string;
  variant?: "link" | "button";
}) {
  const token = useDashboardActionToken();
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onDelete() {
    if (!window.confirm(`Permanently delete ${userName}?\n\nThis removes their login and profile and cannot be undone.`)) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch(`/api/user-management/users/${userId}`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ actionToken: token }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Delete failed.");
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
      setBusy(false);
    }
  }

  const className =
    variant === "button"
      ? "inline-flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-50"
      : "inline-flex items-center gap-1 text-sm font-medium text-destructive hover:underline disabled:opacity-50";

  return (
    <span className="inline-flex flex-col items-end gap-0.5">
      <button onClick={onDelete} disabled={busy} className={className}>
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />} {label ?? "Delete"}
      </button>
      {error && <span className="text-[11px] text-destructive">{error}</span>}
    </span>
  );
}

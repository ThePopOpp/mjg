"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BellRing, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";

// The alert strip at the top of every dashboard page for notifications addressed
// to the signed-in person only (lib/notifications/personal.ts). Polls once a minute.

type Item = { id: string; title: string; message: string; href: string | null; createdAt: string };

export function PersonalNotifications() {
  const actionToken = useDashboardActionToken();
  const [items, setItems] = useState<Item[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/me/notifications", { cache: "no-store" }).catch(() => null);
    if (res?.ok) setItems(((await res.json()) as { notifications: Item[] }).notifications ?? []);
  }, []);

  useEffect(() => {
    void load();
    const timer = setInterval(load, 60_000);
    return () => clearInterval(timer);
  }, [load]);

  async function dismiss(id: string) {
    setItems((list) => list.filter((n) => n.id !== id));
    await fetch("/api/me/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, actionToken }),
    }).catch(() => undefined);
  }

  if (!items.length) return null;
  return (
    <div className="mb-6 space-y-2" role="status" aria-live="polite">
      {items.map((n) => (
        <div key={n.id} className="flex items-start gap-3 rounded-lg border border-[#b88a4a]/60 bg-[#b88a4a]/10 px-4 py-3 text-sm">
          <BellRing className="mt-0.5 h-4 w-4 shrink-0 text-[#8a6532] dark:text-[#d8bd86]" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-medium">{n.title}</p>
            <p className="text-pretty text-muted-foreground">{n.message}</p>
          </div>
          {n.href ? (
            <Button asChild size="sm" className="shrink-0 bg-[#b88a4a] text-white hover:bg-[#a37a40]">
              <Link href={n.href}>
                Review
              </Link>
            </Button>
          ) : null}
          <button
            type="button"
            onClick={() => void dismiss(n.id)}
            className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

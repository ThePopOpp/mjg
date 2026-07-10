"use client";

import { useState } from "react";
import { Check, Loader2, SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";

export type DevRequestPayload = {
  sourceType: "media_resource" | "cms_frontend_edit" | "cms_dashboard_edit" | "manual";
  sourceId?: string | null;
  title: string;
  body?: string | null;
  fileUrl?: string | null;
  pageTarget?: string | null;
  requestKind?: string | null;
  priority?: "low" | "medium" | "high" | "urgent";
  metadata?: Record<string, unknown>;
};

/**
 * "Send to Claude" — flags an item (a Media Studio resource, a CMS edit request)
 * into the Dev Request Queue so it can be picked up and implemented. Super Admin
 * only (the API re-authorizes). Idempotent per source item: re-sending updates
 * the existing queue row.
 */
export function SendToClaudeButton({
  payload,
  label = "Send to Claude",
  size = "sm",
  variant = "outline",
  className,
}: {
  payload: DevRequestPayload;
  label?: string;
  size?: "sm" | "default" | "icon";
  variant?: "outline" | "ghost" | "default" | "secondary";
  className?: string;
}) {
  const actionToken = useDashboardActionToken();
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setState("sending");
    setError(null);
    try {
      const res = await fetch("/api/admin/dev-requests", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", "x-mjg-action-token": actionToken },
        body: JSON.stringify({ ...payload, actionToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send to Claude.");
      setState("done");
    } catch (e) {
      setState("error");
      setError(e instanceof Error ? e.message : "Failed to send to Claude.");
    }
  }

  return (
    <Button
      type="button"
      onClick={send}
      variant={state === "done" ? "secondary" : variant}
      size={size}
      className={className}
      disabled={state === "sending" || state === "done"}
      title={error ?? (state === "done" ? "Queued for Claude" : "Add to the dev request queue for Claude")}
    >
      {state === "sending" ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : state === "done" ? (
        <Check className="h-4 w-4" />
      ) : (
        <SendHorizonal className="h-4 w-4" />
      )}
      {state === "done" ? "Queued for Claude" : state === "error" ? "Retry send" : label}
    </Button>
  );
}

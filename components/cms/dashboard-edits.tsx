"use client";

// Dashboard Edits tab — triage inbox for capture-anywhere review requests created
// via the floating Review FAB (mounted in the dashboard layout, super-admin only).
// See docs/features/dashboard-review-fab-portable.md.

import * as React from "react";
import { LayoutDashboard, ImageIcon, RefreshCw, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldSelect } from "@/components/ui/field-select";
import { Button } from "@/components/ui/button";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { NoteDetailModal } from "@/components/cms/review/note-detail-modal";
import type { DashboardNote } from "@/lib/dashboard-notes/data";

const SCOPES = [{ value: "inbox", label: "My inbox" }, { value: "shared", label: "Shared with me" }, { value: "all", label: "All" }];
const STATUS_PILL: Record<string, string> = {
  open: "bg-amber-500/15 text-amber-700 dark:text-amber-400", in_progress: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  done: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", archived: "bg-muted text-muted-foreground",
};
const PRIORITY_COLOR: Record<string, string> = { low: "text-muted-foreground", medium: "text-foreground", high: "text-amber-600 dark:text-amber-400", urgent: "text-destructive" };

export function DashboardEdits() {
  const token = useDashboardActionToken();
  const [scope, setScope] = React.useState("inbox");
  const [notes, setNotes] = React.useState<DashboardNote[]>([]);
  const [me, setMe] = React.useState("");
  const [detailId, setDetailId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/dashboard-notes?scope=${scope}`, { headers: { "x-mjg-action-token": token } }).then((x) => x.json());
      if (Array.isArray(r.notes)) setNotes(r.notes);
      setMe(r.me || "");
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [scope, token]);
  React.useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <FieldSelect value={scope} onChange={setScope} options={SCOPES} className="h-9 w-44" />
        <Button variant="outline" size="sm" onClick={load}><RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Refresh</Button>
        <p className="ml-auto text-xs text-muted-foreground">
          Use the floating <span className="font-medium text-foreground">Review</span> button (bottom-right of any dashboard page) to capture a new request with a screenshot.
        </p>
      </div>

      {notes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center">
          <LayoutDashboard className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">No requests {scope === "inbox" ? "in your inbox" : scope === "shared" ? "shared with you" : "yet"}.</p>
          <p className="mt-1 text-xs text-muted-foreground">Capture edit requests from any dashboard page with the Review button.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr><th className="px-3 py-2">Request</th><th className="px-3 py-2">Page</th><th className="px-3 py-2">Type</th><th className="px-3 py-2">Priority</th><th className="px-3 py-2">By</th><th className="px-3 py-2">Status</th></tr>
            </thead>
            <tbody>
              {notes.map((n) => {
                const unread = n.recipient_emails.includes(me) && !n.read_by.includes(me);
                return (
                  <tr key={n.id} onClick={() => setDetailId(n.id)} className="cursor-pointer border-t border-border hover:bg-muted/40">
                    <td className="max-w-xs px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        {unread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />}
                        {n.screenshot_url && <ImageIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                        <span className="truncate">{n.note}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><ExternalLink className="h-3 w-3" />{n.page_title || n.route}</span>
                    </td>
                    <td className="px-3 py-2 text-xs uppercase text-muted-foreground">{n.type}</td>
                    <td className={cn("px-3 py-2 text-xs font-semibold uppercase", PRIORITY_COLOR[n.priority])}>{n.priority}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{n.created_by_name || n.created_by_email}</td>
                    <td className="px-3 py-2"><span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", STATUS_PILL[n.status])}>{n.status.replace("_", " ")}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {detailId && <NoteDetailModal id={detailId} onClose={() => setDetailId(null)} onChanged={load} />}
    </div>
  );
}

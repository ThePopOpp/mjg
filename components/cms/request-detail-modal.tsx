"use client";

// Detail / triage modal for a single edit request. Shared by Edit Requests and
// Completed Edits — reopening a completed request is just a status change here,
// which clears completed_at server-side and moves it back to the open queue.

import * as React from "react";
import { X, Loader2, Trash2, Archive, Send, ExternalLink, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldSelect } from "@/components/ui/field-select";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { SendToClaudeButton } from "@/components/dev-requests/send-to-claude-button";
import { AskStewardButton } from "@/components/ai-agent/ask-steward-button";
import { PRIORITY_COLOR, STATUSES, type Person, type Req } from "@/components/cms/request-shared";
import type { DashboardNoteComment } from "@/lib/dashboard-notes/data";

export function RequestDetailModal({
  req,
  people,
  onClose,
  onChanged,
}: {
  req: Req;
  people: Person[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const token = useDashboardActionToken();
  const [status, setStatus] = React.useState(req.status);
  const [author, setAuthor] = React.useState(req.authorEmail);
  const [comments, setComments] = React.useState<DashboardNoteComment[]>([]);
  const [reply, setReply] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [zoom, setZoom] = React.useState(false);

  const dashPost = React.useCallback(
    (payload: object) =>
      fetch("/api/dashboard-notes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...payload, actionToken: token }),
      }).then((r) => r.json()),
    [token],
  );
  const frontPatch = React.useCallback(
    (payload: object) =>
      fetch("/api/admin/cms/page-notes", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...payload, actionToken: token }),
      }).then((r) => r.json()),
    [token],
  );

  React.useEffect(() => {
    if (req.kind === "dashboard") dashPost({ action: "get_note", id: req.id }).then((r) => { if (r.comments) setComments(r.comments); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [req.id]);

  async function changeStatus(s: string) {
    setStatus(s);
    if (req.kind === "dashboard") await dashPost({ action: "update_status", id: req.id, status: s });
    else await frontPatch({ id: req.id, status: s });
    onChanged();
  }
  async function reassign(email: string) {
    setAuthor(email);
    if (req.kind === "dashboard") await dashPost({ action: "reassign", id: req.id, email });
    else await frontPatch({ action: "reassign", id: req.id, email });
    onChanged();
  }
  async function del() {
    if (!window.confirm("Delete this edit request permanently?")) return;
    setBusy(true);
    if (req.kind === "dashboard") await dashPost({ action: "delete", id: req.id });
    else await fetch(`/api/admin/cms/page-notes?id=${req.id}`, { method: "DELETE", headers: { "x-mjg-action-token": token } });
    setBusy(false); onChanged(); onClose();
  }
  async function sendReply() {
    if (!reply.trim() || req.kind !== "dashboard") return;
    setBusy(true);
    const r = await dashPost({ action: "add_comment", id: req.id, comment: reply.trim() });
    if (r.comment) setComments((c) => [...c, r.comment]);
    setReply(""); setBusy(false);
  }

  const authorOptions = React.useMemo(() => {
    const opts = people.map((p) => ({ value: p.email, label: p.name }));
    if (author && !opts.some((o) => o.value === author)) opts.unshift({ value: author, label: author });
    return opts;
  }, [people, author]);

  const isDone = status === "done";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <span className="text-sm font-semibold capitalize">{req.kind} edit request</span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {req.screenshotUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={req.screenshotUrl} alt="screenshot" onClick={() => setZoom(true)} className="mb-3 max-h-64 w-full cursor-zoom-in rounded-lg border border-border object-contain" />
          ) : req.elementLabel ? (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
              <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] uppercase text-primary">{req.elementType}</span>
              <span className="truncate text-xs">{req.elementLabel}</span>
            </div>
          ) : null}
          <p className="mb-2 whitespace-pre-wrap text-sm">{req.note}</p>
          <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span className="rounded bg-muted px-1.5 py-0.5 uppercase">{req.type}</span>
            <span className={cn("font-semibold uppercase", PRIORITY_COLOR[req.priority])}>{req.priority}</span>
            <span>· {new Date(req.createdAt).toLocaleString()}</span>
            {req.route && <a href={req.route} target={req.kind === "frontend" ? "_blank" : undefined} rel="noopener" className="ml-auto flex items-center gap-1 text-primary hover:underline"><ExternalLink className="h-3 w-3" /> {req.route}</a>}
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
            <div><label className="mb-1 block text-[11px] font-medium text-muted-foreground">Requested by</label><FieldSelect value={author} onChange={reassign} options={authorOptions} className="h-8" /></div>
            <div><label className="mb-1 block text-[11px] font-medium text-muted-foreground">Status</label><FieldSelect value={status} onChange={changeStatus} options={STATUSES} className="h-8" /></div>
          </div>

          {req.kind === "dashboard" && (
            <div className="mt-4 space-y-2 border-t border-border pt-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Replies</div>
              {comments.length === 0 && <p className="text-xs text-muted-foreground">No replies yet.</p>}
              {comments.map((c) => (
                <div key={c.id} className="rounded-lg bg-muted/60 px-3 py-2">
                  <div className="mb-0.5 text-[10px] text-muted-foreground">{c.author_name || c.author_email} · {new Date(c.created_at).toLocaleString()}</div>
                  <p className="whitespace-pre-wrap text-xs">{c.body}</p>
                </div>
              ))}
              <div className="flex items-center gap-2 pt-1">
                <Input value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendReply()} placeholder="Note back…" className="h-9" />
                <Button size="sm" onClick={sendReply} disabled={busy || !reply.trim()}><Send className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-2.5">
          {isDone ? (
            // From Completed Edits, the useful action is putting it back in the queue.
            <Button variant="outline" size="sm" onClick={() => changeStatus("open")}><RotateCcw className="h-3.5 w-3.5" /> Reopen</Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => changeStatus("done")}><Archive className="h-3.5 w-3.5" /> Mark complete</Button>
          )}
          <Button variant="outline" size="sm" onClick={() => changeStatus("archived")} disabled={status === "archived"}><Archive className="h-3.5 w-3.5" /> Archive</Button>
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={del} disabled={busy}>{busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />} Delete</Button>
          <SendToClaudeButton
            payload={{
              sourceType: req.kind === "frontend" ? "cms_frontend_edit" : "cms_dashboard_edit",
              sourceId: req.id,
              title: `${req.type} · ${req.page}`,
              body: req.note,
              pageTarget: req.route || null,
              requestKind: req.type,
              priority: (["low", "medium", "high", "urgent"].includes(req.priority) ? req.priority : "medium") as "low" | "medium" | "high" | "urgent",
            }}
          />
          <AskStewardButton
            subtitle={`${req.kind} edit request`}
            extraContext={[
              `A ${req.kind} edit request from the CMS.`,
              `Page: ${req.page}${req.route ? ` (${req.route})` : ""}`,
              `Type: ${req.type} · Priority: ${req.priority}`,
              `Requested by: ${req.authorName || req.authorEmail || "—"}`,
              ``,
              `Request:`,
              req.note,
            ].join("\n")}
            suggestions={[
              "Summarize this edit request and what needs to change.",
              "Outline how you'd implement this change.",
              "Add this to the dev request queue and mark it in progress.",
            ]}
            emptyTitle="Triage this edit request"
            emptyHint="I can read this request's page and details, summarize the change, and manage the dev request queue."
          />
          {/* Closes the modal — status changes are made above, not here. */}
          <Button size="sm" className="ml-auto" onClick={onClose}>Close</Button>
        </div>
      </div>
      {zoom && req.screenshotUrl && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 p-6" onClick={() => setZoom(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={req.screenshotUrl} alt="full" className="max-h-full max-w-full rounded-lg object-contain" />
        </div>
      )}
    </div>
  );
}

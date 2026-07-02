"use client";

// Edit Requests hub — browse & triage requests from both sources.
//   sub-tabs: Frontend Edits (cms_page_notes) · Dashboard Edits (dashboard_notes)
//   each with 3 views: Cards (screenshots) · List · Table
//   every item is clickable → reassign requester, change status, archive, delete.

import * as React from "react";
import {
  LayoutGrid, List as ListIcon, Table as TableIcon, RefreshCw, ImageIcon, X, Loader2, Trash2, Archive, Send, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldSelect } from "@/components/ui/field-select";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import type { PageNote } from "@/lib/cms/page-notes";
import type { DashboardNote, DashboardNoteComment } from "@/lib/dashboard-notes/data";

type Kind = "frontend" | "dashboard";
type Person = { email: string; name: string };
type Req = {
  kind: Kind; id: string; note: string; page: string; route: string; type: string; priority: string; status: string;
  authorEmail: string; authorName: string; screenshotUrl: string | null; elementLabel: string | null; elementType: string | null; createdAt: string;
  raw: PageNote | DashboardNote;
};

const STATUSES = [{ value: "open", label: "Open" }, { value: "in_progress", label: "In progress" }, { value: "done", label: "Done" }, { value: "archived", label: "Archived" }];
const VIEWS: { key: string; icon: React.ElementType; label: string }[] = [
  { key: "cards", icon: LayoutGrid, label: "Cards" }, { key: "list", icon: ListIcon, label: "List" }, { key: "table", icon: TableIcon, label: "Table" },
];
const STATUS_PILL: Record<string, string> = {
  open: "bg-amber-500/15 text-amber-700 dark:text-amber-400", in_progress: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  done: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", archived: "bg-muted text-muted-foreground",
};
const PRIORITY_COLOR: Record<string, string> = { low: "text-muted-foreground", medium: "text-foreground", high: "text-amber-600 dark:text-amber-400", urgent: "text-destructive" };

function normFrontend(n: PageNote): Req {
  return { kind: "frontend", id: n.id, note: n.note, page: n.page_label || n.page_slug, route: n.page_url || "", type: n.change_type, priority: n.priority, status: n.status,
    authorEmail: n.created_by_email || "", authorName: n.created_by_email || "—", screenshotUrl: null, elementLabel: n.element_label, elementType: n.element_type, createdAt: n.created_at, raw: n };
}
function normDashboard(n: DashboardNote): Req {
  return { kind: "dashboard", id: n.id, note: n.note, page: n.page_title || n.route || "—", route: n.route || "", type: n.type, priority: n.priority, status: n.status,
    authorEmail: n.created_by_email || "", authorName: n.created_by_name || n.created_by_email || "—", screenshotUrl: n.screenshot_url, elementLabel: null, elementType: null, createdAt: n.created_at, raw: n };
}

const KINDS: { key: Kind; label: string }[] = [{ key: "frontend", label: "Frontend Edits" }, { key: "dashboard", label: "Dashboard Edits" }];

export function EditRequests() {
  const token = useDashboardActionToken();
  const [kind, setKind] = React.useState<Kind>("frontend");
  const [items, setItems] = React.useState<Req[]>([]);
  const [people, setPeople] = React.useState<Person[]>([]);
  const [view, setView] = React.useState("cards");
  const [statusFilter, setStatusFilter] = React.useState("active");
  const [loading, setLoading] = React.useState(true);
  const [active, setActive] = React.useState<Req | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const url = kind === "frontend" ? "/api/admin/cms/page-notes" : "/api/dashboard-notes?scope=all";
      const r = await fetch(url, { headers: { "x-mjg-action-token": token } }).then((x) => x.json());
      const notes: Req[] = (r.notes ?? []).map((n: PageNote | DashboardNote) => (kind === "frontend" ? normFrontend(n as PageNote) : normDashboard(n as DashboardNote)));
      setItems(notes);
      if (Array.isArray(r.recipients)) setPeople(r.recipients);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [kind, token]);
  React.useEffect(() => { load(); }, [load]);

  const shown = items.filter((i) => (statusFilter === "all" ? true : statusFilter === "active" ? i.status !== "archived" : i.status === statusFilter));

  return (
    <div className="space-y-4">
      {/* Single control row: sub-tabs · status filter · count · view toggles · refresh */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-lg border border-border bg-card p-0.5">
          {KINDS.map((k) => (
            <button key={k.key} onClick={() => setKind(k.key)} className={cn("rounded-md px-3 py-1.5 text-xs font-medium transition-colors", kind === k.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}>{k.label}</button>
          ))}
        </div>
        <FieldSelect value={statusFilter} onChange={setStatusFilter} options={[{ value: "active", label: "Active" }, ...STATUSES, { value: "all", label: "All" }]} className="h-9 w-36" />
        <span className="text-xs text-muted-foreground">{shown.length} request{shown.length === 1 ? "" : "s"}</span>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border bg-card p-0.5">
            {VIEWS.map((v) => (
              <button key={v.key} onClick={() => setView(v.key)} title={v.label} className={cn("rounded-md p-1.5", view === v.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}><v.icon className="h-4 w-4" /></button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /></Button>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center text-sm text-muted-foreground">
          No {kind === "frontend" ? "frontend" : "dashboard"} edit requests {statusFilter === "active" ? "open" : ""} yet.
        </div>
      ) : view === "cards" ? (
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))" }}>
          {shown.map((r) => (
            <button key={r.id} onClick={() => setActive(r)} className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition hover:border-primary/50 hover:shadow-md">
              <div className="flex h-32 items-center justify-center overflow-hidden border-b border-border bg-muted/40">
                {r.screenshotUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.screenshotUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase text-primary">{r.elementType || "page"}</span>
                    <span className="max-w-[200px] truncate px-2 text-[11px]">{r.elementLabel || r.page}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1.5 p-2.5">
                <p className="line-clamp-2 text-xs">{r.note}</p>
                <div className="flex flex-wrap items-center gap-1 text-[10px]">
                  <span className="rounded bg-muted px-1.5 py-0.5 uppercase text-muted-foreground">{r.type}</span>
                  <span className={cn("font-semibold uppercase", PRIORITY_COLOR[r.priority])}>{r.priority}</span>
                  <span className={cn("ml-auto rounded-full px-2 py-0.5 font-medium capitalize", STATUS_PILL[r.status])}>{r.status.replace("_", " ")}</span>
                </div>
                <div className="truncate text-[10px] text-muted-foreground">{r.page} · {r.authorName}</div>
              </div>
            </button>
          ))}
        </div>
      ) : view === "list" ? (
        <div className="space-y-1.5">
          {shown.map((r) => (
            <button key={r.id} onClick={() => setActive(r)} className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-2.5 text-left hover:bg-muted/40">
              {r.screenshotUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.screenshotUrl} alt="" className="h-12 w-16 shrink-0 rounded border border-border object-cover" />
              ) : <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded border border-border bg-muted text-[9px] uppercase text-muted-foreground">{r.elementType || "page"}</span>}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm">{r.note}</span>
                <span className="block truncate text-[11px] text-muted-foreground">{r.page} · {r.type} · {r.authorName}</span>
              </span>
              <span className={cn("shrink-0 text-[10px] font-semibold uppercase", PRIORITY_COLOR[r.priority])}>{r.priority}</span>
              <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", STATUS_PILL[r.status])}>{r.status.replace("_", " ")}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr><th className="px-3 py-2">Request</th><th className="px-3 py-2">Page</th><th className="px-3 py-2">Type</th><th className="px-3 py-2">Priority</th><th className="px-3 py-2">By</th><th className="px-3 py-2">Status</th></tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} onClick={() => setActive(r)} className="cursor-pointer border-t border-border hover:bg-muted/40">
                  <td className="max-w-xs px-3 py-2"><span className="flex items-center gap-1.5">{r.screenshotUrl && <ImageIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}<span className="truncate">{r.note}</span></span></td>
                  <td className="px-3 py-2 text-xs text-muted-foreground"><span className="line-clamp-1">{r.page}</span></td>
                  <td className="px-3 py-2 text-xs uppercase text-muted-foreground">{r.type}</td>
                  <td className={cn("px-3 py-2 text-xs font-semibold uppercase", PRIORITY_COLOR[r.priority])}>{r.priority}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{r.authorName}</td>
                  <td className="px-3 py-2"><span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", STATUS_PILL[r.status])}>{r.status.replace("_", " ")}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {active && <RequestDetailModal req={active} people={people} onClose={() => setActive(null)} onChanged={load} />}
    </div>
  );
}

function RequestDetailModal({ req, people, onClose, onChanged }: { req: Req; people: Person[]; onClose: () => void; onChanged: () => void }) {
  const token = useDashboardActionToken();
  const [status, setStatus] = React.useState(req.status);
  const [author, setAuthor] = React.useState(req.authorEmail);
  const [comments, setComments] = React.useState<DashboardNoteComment[]>([]);
  const [reply, setReply] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [zoom, setZoom] = React.useState(false);

  const dashPost = React.useCallback((payload: object) =>
    fetch("/api/dashboard-notes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...payload, actionToken: token }) }).then((r) => r.json()), [token]);
  const frontPatch = React.useCallback((payload: object) =>
    fetch("/api/admin/cms/page-notes", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...payload, actionToken: token }) }).then((r) => r.json()), [token]);

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
    if (r.comment) setComments((c) => [...c, r.comment]); setReply(""); setBusy(false);
  }

  const authorOptions = React.useMemo(() => {
    const opts = people.map((p) => ({ value: p.email, label: p.name }));
    if (author && !opts.some((o) => o.value === author)) opts.unshift({ value: author, label: author });
    return opts;
  }, [people, author]);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <span className="text-sm font-semibold capitalize">{req.kind} edit request</span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
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
        <div className="flex items-center gap-2 border-t border-border px-4 py-2.5">
          <Button variant="outline" size="sm" onClick={() => changeStatus("archived")} disabled={status === "archived"}><Archive className="h-3.5 w-3.5" /> Archive</Button>
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={del} disabled={busy}>{busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />} Delete</Button>
          <Button size="sm" className="ml-auto" onClick={onClose}>Done</Button>
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

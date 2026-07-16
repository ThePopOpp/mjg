"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { MessageSquarePlus, Camera, X, Bot, Inbox, Loader2, Check, Users, ImageIcon, PenSquare, MessageSquareText, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FieldSelect } from "@/components/ui/field-select";
import { cn } from "@/lib/utils";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { AgentChat } from "@/components/ai-agent/agent-chat";
import { DmInbox } from "@/components/direct-messages/dm-inbox";
import { useDmUnread } from "@/components/direct-messages/dm-unread";
import { capturePage, dataUrlToFile } from "@/lib/dashboard-notes/screenshot";
import { ScreenshotEditor } from "@/components/cms/review/screenshot-editor";
import { NoteDetailModal } from "@/components/cms/review/note-detail-modal";
import type { DashboardNote } from "@/lib/dashboard-notes/data";

const TYPES = ["edit", "bug", "idea", "question", "remove", "other"].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }));
const PRIORITIES = ["low", "medium", "high", "urgent"].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }));
const STATUS_COLOR: Record<string, string> = { open: "bg-amber-500", in_progress: "bg-blue-500", done: "bg-emerald-500", archived: "bg-muted-foreground" };

// Human-readable page name from the dashboard route, e.g.
//   /dashboard            → "MJG Dashboard"
//   /dashboard/assets     → "MJG Dashboard / Assets"
//   /dashboard/emails/logs → "MJG Dashboard / Emails / Logs"
function pageTitle(pathname: string) {
  const segs = (pathname || "").split("/").filter(Boolean);
  const rest = segs[0] === "dashboard" ? segs.slice(1) : segs;
  const titleCase = (s: string) => s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const label = rest.map(titleCase).join(" / ");
  return label ? `MJG Dashboard / ${label}` : "MJG Dashboard";
}

export function ReviewFab({ me }: { me: { email: string; name: string } }) {
  const token = useDashboardActionToken();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState<"note" | "requests" | "dm">("note");
  const [expanded, setExpanded] = React.useState(false);
  const [agentOpen, setAgentOpen] = React.useState(false);
  const [detailId, setDetailId] = React.useState<string | null>(null);
  const { unread: dmUnread } = useDmUnread();

  function openMessages() {
    setTab("dm");
    setExpanded(true);
  }
  function toggleExpanded() {
    setExpanded((e) => {
      const next = !e;
      if (!next && tab === "dm") setTab("requests");
      return next;
    });
  }

  const [note, setNote] = React.useState("");
  const [type, setType] = React.useState("edit");
  const [priority, setPriority] = React.useState("medium");
  const [recipient, setRecipient] = React.useState("");
  const [shot, setShot] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState(false);
  const [capturing, setCapturing] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [people, setPeople] = React.useState<{ email: string; name: string }[]>([]);
  const [notes, setNotes] = React.useState<DashboardNote[]>([]);
  const [unread, setUnread] = React.useState(0);

  const load = React.useCallback(async () => {
    try {
      // active=1 → open queue only. Completed and archived requests drop out of this
      // list the moment they're marked done; their home is CMS → Completed Edits.
      const r = await fetch("/api/dashboard-notes?scope=inbox&active=1", { headers: { "x-mjg-action-token": token } }).then((x) => x.json());
      if (Array.isArray(r.notes)) setNotes(r.notes);
      if (Array.isArray(r.recipients)) setPeople(r.recipients);
      setUnread(r.unread ?? 0);
    } catch { /* ignore */ }
  }, [token]);
  React.useEffect(() => { load(); }, [load]);
  React.useEffect(() => { if (open) load(); }, [open, load]);

  async function takeShot(withTools: boolean) {
    setError(null); setCapturing(true); setOpen(false);
    // let the panel close before capturing so it isn't in the shot
    await new Promise((r) => setTimeout(r, 180));
    try { const d = await capturePage(); setShot(d); if (withTools) setEditing(true); }
    catch (e) { setError(`Couldn’t capture the page: ${e instanceof Error ? e.message : "unknown error"}`); }
    finally { setCapturing(false); setOpen(true); }
  }

  async function submit() {
    if (!note.trim()) return;
    setBusy(true); setError(null);
    try {
      let screenshotUrl: string | null = null;
      if (shot) {
        const fd = new FormData(); fd.append("file", await dataUrlToFile(shot)); fd.append("folder", "dashboard-notes");
        const up = await fetch("/api/admin/uploads", { method: "POST", headers: { "x-mjg-action-token": token }, body: fd }).then((r) => r.json());
        if (!up.url) throw new Error(up.error || "Screenshot upload failed.");
        screenshotUrl = up.url;
      }
      const res = await fetch("/api/dashboard-notes", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "create", actionToken: token, payload: { route: pathname, pageTitle: pageTitle(pathname), note: note.trim(), type, priority, recipientEmails: recipient ? [recipient] : [], screenshotUrl } }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Save failed.");
      setNote(""); setShot(null); setRecipient(""); setSaved(true); setTimeout(() => setSaved(false), 1800);
      await load(); setTab("requests");
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed."); }
    finally { setBusy(false); }
  }

  const pageName = pageTitle(pathname);
  const agentContext = `You are helping review the dashboard page at "${pathname}" ("${pageName}"). Answer with real data via your tools and only DRAFT changes — never publish or make destructive edits.`;

  return (
    <>
      {/* Launcher — the numeric badge reflects unread Direct Messages */}
      <button data-fab-ignore onClick={() => setOpen((o) => !o)} aria-label="Review & messages"
        className="fixed bottom-5 right-5 z-[100] flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition hover:scale-105 print:hidden">
        {open ? <X className="h-5 w-5" /> : <MessageSquarePlus className="h-5 w-5" />}
        {!open && dmUnread > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">{dmUnread > 99 ? "99+" : dmUnread}</span>}
      </button>

      {open && expanded && <div data-fab-ignore className="fixed inset-0 z-[99] bg-background/70 backdrop-blur-sm print:hidden" onClick={() => setExpanded(false)} />}

      {open && (
        <div data-fab-ignore className={cn(
          "fixed z-[100] flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl print:hidden",
          expanded ? "inset-3 sm:inset-6" : "bottom-20 right-5 max-h-[80vh] w-[420px]",
        )}>
          <div className="flex items-center gap-1 border-b border-border p-1">
            <button onClick={() => setTab("note")} className={cn("flex-1 rounded-lg px-3 py-1.5 text-xs font-medium", tab === "note" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted")}>New request</button>
            <button onClick={() => setTab("requests")} className={cn("flex-1 rounded-lg px-3 py-1.5 text-xs font-medium", tab === "requests" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted")}>
              <span className="inline-flex items-center gap-1"><Inbox className="h-3.5 w-3.5" /> Requests{unread > 0 && <span className="rounded-full bg-destructive px-1.5 text-[9px] font-bold text-destructive-foreground">{unread}</span>}</span>
            </button>
            <button onClick={openMessages} className={cn("flex-1 rounded-lg px-3 py-1.5 text-xs font-medium", tab === "dm" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted")}>
              <span className="inline-flex items-center gap-1"><MessageSquareText className="h-3.5 w-3.5" /> Messages{dmUnread > 0 && <span className="rounded-full bg-destructive px-1.5 text-[9px] font-bold text-destructive-foreground">{dmUnread}</span>}</span>
            </button>
            <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => setAgentOpen(true)} title="Ask Steward"><Bot className="h-3.5 w-3.5" /></Button>
            <Button size="sm" variant="outline" className="h-7 px-2" onClick={toggleExpanded} title={expanded ? "Collapse" : "Expand to full page"}>{expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}</Button>
          </div>

          {error && <div className="border-b border-destructive/30 bg-destructive/10 px-3 py-1.5 text-[11px] text-destructive">{error}</div>}

          {tab === "dm" ? (
            <div className="min-h-0 flex-1 p-2">
              <DmInbox canStart className="h-full" />
            </div>
          ) : tab === "note" ? (
            <div className="space-y-2 overflow-y-auto p-3">
              <div className="text-[11px] text-muted-foreground">On <span className="font-medium text-foreground">{pageName}</span> — captured automatically.</div>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Describe the edit / bug / idea…" className="min-h-[84px]" />
              <div className="grid grid-cols-2 gap-2">
                <div><label className="mb-1 block text-[11px] text-muted-foreground">Type</label><FieldSelect value={type} onChange={setType} options={TYPES} className="h-8" /></div>
                <div><label className="mb-1 block text-[11px] text-muted-foreground">Priority</label><FieldSelect value={priority} onChange={setPriority} options={PRIORITIES} className="h-8" /></div>
              </div>
              {/* Share with (single recipient) */}
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-[11px] text-muted-foreground"><Users className="h-3.5 w-3.5" /> Share with (optional)</label>
                <FieldSelect value={recipient} onChange={setRecipient}
                  options={[{ value: "", label: "No one" }, ...people.filter((p) => p.email !== me.email).map((p) => ({ value: p.email, label: p.name }))]} className="h-8" />
              </div>
              {/* Screenshot */}
              {shot ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={shot} alt="screenshot" onClick={() => setEditing(true)} className="max-h-28 w-full cursor-pointer rounded-lg border border-border object-cover" />
                  <div className="absolute right-1 top-1 flex gap-1">
                    <button onClick={() => setEditing(true)} className="rounded-full bg-background/90 p-1 shadow" title="Edit / annotate"><PenSquare className="h-3 w-3" /></button>
                    <button onClick={() => setShot(null)} className="rounded-full bg-background/90 p-1 shadow" title="Remove"><X className="h-3 w-3" /></button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => takeShot(false)} disabled={capturing}>{capturing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />} Screenshot</Button>
                  <Button variant="outline" size="sm" onClick={() => takeShot(true)} disabled={capturing}>{capturing ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenSquare className="h-4 w-4" />} Screenshot &amp; Tools</Button>
                </div>
              )}
              <Button size="sm" className="w-full" onClick={submit} disabled={busy || !note.trim()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null} {saved ? "Sent" : "Send request"}</Button>
            </div>
          ) : (
            <div className="space-y-1.5 overflow-y-auto p-2">
              {notes.length === 0 && <p className="px-2 py-6 text-center text-xs text-muted-foreground">No requests yet. Capture one from any page.</p>}
              {notes.map((n) => {
                const isUnread = n.recipient_emails.includes(me.email) && !n.read_by.includes(me.email);
                return (
                  <button key={n.id} onClick={() => setDetailId(n.id)} className="flex w-full items-start gap-2 rounded-lg border border-border p-2 text-left hover:bg-muted">
                    <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", STATUS_COLOR[n.status] || "bg-muted-foreground")} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="min-w-0 flex-1 truncate text-xs font-medium">{n.note.slice(0, 60)}</span>
                        {n.screenshot_url && <ImageIcon className="h-3 w-3 shrink-0 text-muted-foreground" />}
                        {isUnread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground"><span className="uppercase">{n.type}</span> · {n.page_title || n.route} · {n.created_by_name || n.created_by_email}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {editing && shot && <ScreenshotEditor dataUrl={shot} onSave={(d) => { setShot(d); setEditing(false); }} onCancel={() => setEditing(false)} />}
      {detailId && <NoteDetailModal id={detailId} onClose={() => setDetailId(null)} onChanged={load} />}
      {agentOpen && (
        <div data-fab-ignore className="fixed inset-0 z-[115] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setAgentOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl">
            <button onClick={() => setAgentOpen(false)} className="absolute -right-3 -top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card shadow hover:bg-muted"><X className="h-4 w-4" /></button>
            <AgentChat title="Steward AI" subtitle={`Reviewing ${pageName}`} audio extraContext={agentContext}
              placeholder="Ask Steward about this page…" heightClassName="h-[68vh] min-h-[420px]"
              emptyTitle="Ask about this page" emptyHint="I can look things up and draft changes for review — I won't publish or delete anything." />
          </div>
        </div>
      )}
    </>
  );
}

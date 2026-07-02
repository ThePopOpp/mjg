"use client";

import * as React from "react";
import { X, Send, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldSelect } from "@/components/ui/field-select";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import type { DashboardNote, DashboardNoteComment } from "@/lib/dashboard-notes/data";

const STATUSES = [{ value: "open", label: "Open" }, { value: "in_progress", label: "In progress" }, { value: "done", label: "Done" }, { value: "archived", label: "Archived" }];

export function NoteDetailModal({ id, onClose, onChanged }: { id: string; onClose: () => void; onChanged?: () => void }) {
  const token = useDashboardActionToken();
  const [note, setNote] = React.useState<DashboardNote | null>(null);
  const [comments, setComments] = React.useState<DashboardNoteComment[]>([]);
  const [reply, setReply] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [zoom, setZoom] = React.useState(false);

  const post = React.useCallback((payload: object) =>
    fetch("/api/dashboard-notes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...payload, actionToken: token }) }).then((r) => r.json()), [token]);

  React.useEffect(() => {
    post({ action: "get_note", id }).then((r) => { if (r.note) { setNote(r.note); setComments(r.comments ?? []); } onChanged?.(); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function setStatus(status: string) {
    setNote((n) => (n ? { ...n, status } : n));
    await post({ action: "update_status", id, status }); onChanged?.();
  }
  async function sendReply() {
    if (!reply.trim()) return; setBusy(true);
    const r = await post({ action: "add_comment", id, comment: reply.trim() });
    if (r.comment) setComments((c) => [...c, r.comment]); setReply(""); setBusy(false);
  }

  return (
    <div data-fab-ignore className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <span className="text-sm font-semibold">Edit request</span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        {!note ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            {note.screenshot_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={note.screenshot_url} alt="screenshot" onClick={() => setZoom(true)} className="mb-3 max-h-64 w-full cursor-zoom-in rounded-lg border border-border object-contain" />
            )}
            <p className="mb-2 whitespace-pre-wrap text-sm">{note.note}</p>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <span className="rounded bg-muted px-1.5 py-0.5 uppercase">{note.type}</span>
              <span className="rounded bg-muted px-1.5 py-0.5 uppercase">{note.priority}</span>
              <span>by {note.created_by_name || note.created_by_email}</span>
              <span>· {new Date(note.created_at).toLocaleString()}</span>
              {note.route && <a href={note.route} className="ml-auto flex items-center gap-1 text-primary hover:underline"><ExternalLink className="h-3 w-3" /> {note.route}</a>}
            </div>
            <div className="mb-4 flex items-center gap-2">
              <span className="text-[11px] font-medium text-muted-foreground">Status</span>
              <FieldSelect value={note.status} onChange={setStatus} options={STATUSES} className="h-8 w-36" />
            </div>

            <div className="space-y-2 border-t border-border pt-3">
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
                <Button size="sm" onClick={sendReply} disabled={busy || !reply.trim()}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</Button>
              </div>
            </div>
          </div>
        )}
      </div>
      {zoom && note?.screenshot_url && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 p-6" onClick={() => setZoom(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={note.screenshot_url} alt="screenshot full" className="max-h-full max-w-full rounded-lg object-contain" />
        </div>
      )}
    </div>
  );
}

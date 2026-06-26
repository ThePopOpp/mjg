"use client";

import * as React from "react";
import { Archive, Loader2, Reply, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FieldSelect } from "@/components/ui/field-select";
import { cn } from "@/lib/utils";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { platformLabel } from "@/lib/social-media/constants";
import type { SocialMessage } from "@/lib/social-media/types";

const KIND_OPTS = [{ value: "", label: "All types" }, { value: "message", label: "Messages" }, { value: "comment", label: "Comments" }, { value: "review", label: "Reviews" }, { value: "mention", label: "Mentions" }];
const STATUS_OPTS = [{ value: "", label: "All" }, { value: "new", label: "New" }, { value: "read", label: "Read" }, { value: "replied", label: "Replied" }, { value: "archived", label: "Archived" }];

const statusClass: Record<string, string> = {
  new: "bg-primary/15 text-primary", read: "bg-muted text-muted-foreground",
  replied: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", archived: "bg-muted text-muted-foreground",
};

function fmt(iso: string) { return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); }

export function SocialInbox({ initialMessages }: { initialMessages: SocialMessage[] }) {
  const token = useDashboardActionToken();
  const [messages, setMessages] = React.useState(initialMessages);
  const [kind, setKind] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [replyTo, setReplyTo] = React.useState<string | null>(null);
  const [replyText, setReplyText] = React.useState("");
  const [busy, setBusy] = React.useState<string | null>(null);

  const reload = React.useCallback(async () => {
    const qs = new URLSearchParams();
    if (kind) qs.set("kind", kind);
    if (status) qs.set("status", status);
    const r = await fetch(`/api/admin/social-media/messages?${qs}`, { headers: { "x-mjg-action-token": token } }).then((x) => x.json());
    if (r.messages) setMessages(r.messages);
  }, [kind, status, token]);
  React.useEffect(() => { reload(); }, [reload]);

  async function patch(m: SocialMessage, body: Record<string, unknown>) {
    setBusy(m.id);
    try {
      await fetch(`/api/admin/social-media/messages/${m.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...body, actionToken: token }) });
      await reload();
    } finally { setBusy(null); }
  }
  async function remove(m: SocialMessage) {
    if (!window.confirm("Delete this item?")) return;
    setBusy(m.id);
    try { await fetch(`/api/admin/social-media/messages/${m.id}`, { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ actionToken: token }) }); await reload(); }
    finally { setBusy(null); }
  }
  async function sendReply(m: SocialMessage) {
    if (!replyText.trim()) return;
    await patch(m, { reply_text: replyText.trim() });
    setReplyTo(null); setReplyText("");
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="w-40"><FieldSelect value={kind} onChange={setKind} options={KIND_OPTS} className="h-9" /></div>
        <div className="w-36"><FieldSelect value={status} onChange={setStatus} options={STATUS_OPTS} className="h-9" /></div>
        <span className="ml-auto text-xs text-muted-foreground">{messages.filter((m) => m.status === "new").length} new</span>
      </div>

      {messages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No items yet. Messages, comments, and reviews will appear here once platform syncing is connected.
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((m) => (
            <div key={m.id} className={cn("rounded-xl border bg-card p-3", m.status === "new" ? "border-primary/40" : "border-border")}>
              <div className="flex items-center gap-2">
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium capitalize text-muted-foreground">{m.kind}</span>
                <span className="text-xs font-medium">{m.author_name || "Unknown"}</span>
                {m.author_handle && <span className="text-[11px] text-muted-foreground">{m.author_handle}</span>}
                <span className="text-[11px] text-muted-foreground">· {platformLabel(m.platform)} · {fmt(m.received_at)}</span>
                {m.kind === "review" && m.rating != null && (
                  <span className="flex items-center gap-0.5 text-amber-500">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={cn("h-3 w-3", i < (m.rating ?? 0) ? "fill-current" : "opacity-30")} />)}</span>
                )}
                <span className={cn("ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", statusClass[m.status])}>{m.status}</span>
              </div>
              <p className="mt-1.5 whitespace-pre-wrap text-sm">{m.text || "—"}</p>
              {m.reply_text && <div className="mt-2 rounded-lg bg-muted/50 px-3 py-1.5 text-xs"><span className="font-medium">Your reply:</span> {m.reply_text}</div>}

              {replyTo === m.id ? (
                <div className="mt-2">
                  <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} className="min-h-[60px]" placeholder="Write a reply…" />
                  <div className="mt-1.5 flex gap-2">
                    <Button size="sm" onClick={() => sendReply(m)} disabled={busy === m.id || !replyText.trim()}>{busy === m.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Reply className="h-3.5 w-3.5" />} Save reply</Button>
                    <Button size="sm" variant="outline" onClick={() => { setReplyTo(null); setReplyText(""); }}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setReplyTo(m.id); setReplyText(m.reply_text ?? ""); }}><Reply className="h-3.5 w-3.5" /> Reply</Button>
                  {m.status !== "read" && m.status !== "replied" && <Button size="sm" variant="ghost" onClick={() => patch(m, { status: "read" })}>Mark read</Button>}
                  <button onClick={() => patch(m, { status: "archived" })} className="ml-auto text-muted-foreground hover:text-foreground" title="Archive"><Archive className="h-4 w-4" /></button>
                  <button onClick={() => remove(m)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

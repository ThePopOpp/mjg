"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Search, PenSquare, Camera, Paperclip, Mic, X, CircleDot } from "lucide-react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Person = { id: string; name: string; email: string };
type Conversation = {
  id: string;
  other: Person | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  last_sender_id: string | null;
  unread: number;
};
type Message = { id: string; sender_id: string | null; body: string; importance: "normal" | "important" | "urgent"; attachments: unknown[]; created_at: string; mine: boolean };

const IMPORTANCE_DOT: Record<string, string> = {
  normal: "bg-muted-foreground/40",
  important: "bg-[color:var(--brand-gold,#c9aa70)]",
  urgent: "bg-destructive",
};

const DATE_FILTERS = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];

function initials(name: string) {
  return name.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((x) => x[0]?.toUpperCase()).join("") || "?";
}
function fromForFilter(value: string): string | undefined {
  if (value === "all") return undefined;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (value === "7d") d.setDate(d.getDate() - 7);
  if (value === "30d") d.setDate(d.getDate() - 30);
  return d.toISOString();
}
function formatTime(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diffMin = Math.round((now.getTime() - d.getTime()) / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min`;
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const yest = new Date(now); yest.setDate(now.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function DmInbox({ canStart, className }: { canStart: boolean; className?: string }) {
  const token = useDashboardActionToken();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [reply, setReply] = useState("");
  const [importance, setImportance] = useState<"normal" | "important" | "urgent">("normal");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const from = fromForFilter(dateFilter);
      if (from) params.set("from", from);
      const res = await fetch(`/api/direct-messages/conversations?${params}`, { headers: { "x-mjg-action-token": token ?? "" } });
      const data = await res.json();
      setConversations(data.conversations ?? []);
    } finally {
      setLoading(false);
    }
  }, [search, dateFilter, token]);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 15000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  const loadThread = useCallback(async (id: string) => {
    const res = await fetch(`/api/direct-messages/conversations/${id}`, { headers: { "x-mjg-action-token": token ?? "" } });
    const data = await res.json();
    setMessages(data.messages ?? []);
    setActiveConv((c) => (data.conversation ? { id, other: data.conversation.other, last_message_at: null, last_message_preview: null, last_sender_id: null, unread: 0 } : c));
    loadConversations();
  }, [token, loadConversations]);

  useEffect(() => { if (activeId) loadThread(activeId); }, [activeId, loadThread]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function sendReply() {
    if (!reply.trim() || !activeId) return;
    setSending(true);
    try {
      const res = await fetch(`/api/direct-messages/conversations/${activeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionToken: token, body: reply.trim(), importance }),
      });
      if (res.ok) { setReply(""); setImportance("normal"); await loadThread(activeId); }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={cn("flex overflow-hidden rounded-lg border bg-card", className ?? "h-[calc(100vh-12rem)]")}>
      {/* Conversation list */}
      <div className="flex w-80 shrink-0 flex-col border-r">
        <div className="space-y-2 border-b p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="h-9 pl-9 text-sm" placeholder="Search messages…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="h-8 flex-1 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{DATE_FILTERS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
            </Select>
            {canStart && (
              <Button size="sm" variant="outline" className="h-8 shrink-0 gap-1.5" onClick={() => setComposeOpen(true)}>
                <PenSquare className="h-4 w-4" /> New
              </Button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="p-4 text-sm text-muted-foreground">Loading…</p>
          ) : conversations.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No messages yet.{canStart ? " Start a new message." : ""}</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={cn("flex w-full items-center gap-3 border-b p-3 text-left transition-colors hover:bg-accent/50", activeId === c.id && "bg-accent/60")}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {initials(c.other?.name ?? "?")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className={cn("truncate text-sm", c.unread > 0 ? "font-semibold" : "font-medium")}>{c.other?.name ?? "Unknown"}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{formatTime(c.last_message_at)}</span>
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5">
                    <span className={cn("truncate text-xs", c.unread > 0 ? "text-foreground" : "text-muted-foreground")}>
                      {c.last_sender_id && c.last_sender_id !== (c.other?.id ?? "") ? "You: " : ""}{c.last_message_preview ?? c.other?.email}
                    </span>
                    {c.unread > 0 && <Badge className="ml-auto h-5 shrink-0 px-1.5 text-[10px]">{c.unread}</Badge>}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Thread */}
      <div className="flex flex-1 flex-col">
        {!activeId ? (
          <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted-foreground">
            Select a conversation to view messages.
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{initials(activeConv?.other?.name ?? "?")}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{activeConv?.other?.name ?? "Conversation"}</p>
                <p className="truncate text-xs text-muted-foreground">{activeConv?.other?.email}</p>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m) => (
                <div key={m.id} className={cn("flex", m.mine ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[72%] rounded-2xl px-4 py-2 text-sm", m.mine ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-muted")}>
                    {m.importance !== "normal" && (
                      <span className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide opacity-80">
                        <span className={cn("h-1.5 w-1.5 rounded-full", IMPORTANCE_DOT[m.importance])} /> {m.importance}
                      </span>
                    )}
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <p className={cn("mt-1 text-[11px]", m.mine ? "text-primary-foreground/70" : "text-muted-foreground")}>{formatTime(m.created_at)}</p>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            <div className="border-t p-3">
              <div className="flex items-center gap-2">
                <button type="button" title="Photo (coming soon)" disabled className="text-muted-foreground/50"><Camera className="h-5 w-5" /></button>
                <button type="button" title="Attach file (coming soon)" disabled className="text-muted-foreground/50"><Paperclip className="h-5 w-5" /></button>
                <button type="button" title="Voice note (coming soon)" disabled className="text-muted-foreground/50"><Mic className="h-5 w-5" /></button>
                <Select value={importance} onValueChange={(v) => setImportance(v as typeof importance)}>
                  <SelectTrigger className="h-9 w-[130px] shrink-0 text-xs"><CircleDot className={cn("h-3.5 w-3.5", importance === "urgent" ? "text-destructive" : importance === "important" ? "text-[color:var(--brand-gold,#c9aa70)]" : "text-muted-foreground")} /><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="important">Important</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Message…"
                  className="flex-1"
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                />
                <Button onClick={sendReply} disabled={sending || !reply.trim()} size="icon"><Send className="h-4 w-4" /></Button>
              </div>
            </div>
          </>
        )}
      </div>

      {composeOpen && (
        <NewMessageModal
          token={token ?? ""}
          onClose={() => setComposeOpen(false)}
          onStarted={(id) => { setComposeOpen(false); loadConversations(); setActiveId(id); }}
        />
      )}
    </div>
  );
}

function NewMessageModal({ token, onClose, onStarted }: { token: string; onClose: () => void; onStarted: (conversationId: string) => void }) {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<Person[]>([]);
  const [picked, setPicked] = useState<Person | null>(null);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      const res = await fetch(`/api/direct-messages/users?search=${encodeURIComponent(q)}`, { headers: { "x-mjg-action-token": token } });
      const data = await res.json();
      setUsers(data.users ?? []);
    }, 200);
    return () => clearTimeout(t);
  }, [q, token]);

  async function start() {
    if (!picked) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/direct-messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionToken: token, otherUserId: picked.id, body: body.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not start conversation.");
      onStarted(data.conversationId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start conversation.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">New message</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3 overflow-y-auto p-4">
          {picked ? (
            <div className="flex items-center justify-between rounded-md border bg-accent/40 p-2.5">
              <span className="text-sm"><span className="font-medium">{picked.name}</span> <span className="text-muted-foreground">· {picked.email}</span></span>
              <button onClick={() => setPicked(null)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
          ) : (
            <>
              <Input placeholder="Search people…" value={q} onChange={(e) => setQ(e.target.value)} />
              <div className="max-h-56 space-y-1 overflow-y-auto">
                {users.map((u) => (
                  <button key={u.id} onClick={() => setPicked(u)} className="flex w-full items-center gap-2.5 rounded-md p-2 text-left hover:bg-accent/50">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">{initials(u.name)}</span>
                    <span className="min-w-0"><span className="block truncate text-sm">{u.name}</span><span className="block truncate text-xs text-muted-foreground">{u.email}</span></span>
                  </button>
                ))}
                {!users.length && <p className="p-2 text-sm text-muted-foreground">No people found.</p>}
              </div>
            </>
          )}
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a message…" className="min-h-[90px] w-full rounded-md border bg-background px-3 py-2 text-sm" />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 border-t px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={start} disabled={!picked || busy}>{busy ? "Starting…" : "Send"}</Button>
        </div>
      </div>
    </div>
  );
}

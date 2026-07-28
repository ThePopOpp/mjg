"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutList, Table as TableIcon, Columns3, CalendarDays, MapPin,
  Plus, Send, ChevronLeft, ChevronRight, Mail,
} from "lucide-react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { TeamParticipant, Touchpoint, TeamStats } from "@/lib/facilitator/team";

type View = "list" | "table" | "kanban" | "calendar" | "map";

const VIEWS: { key: View; label: string; icon: typeof LayoutList }[] = [
  { key: "list", label: "List", icon: LayoutList },
  { key: "table", label: "Table", icon: TableIcon },
  { key: "kanban", label: "Kanban", icon: Columns3 },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "map", label: "Map", icon: MapPin },
];

function fullName(p: TeamParticipant) {
  return `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || p.email || "Unknown";
}
function statusLabel(v: string | null) {
  if (!v || v === "not_sent" || v === "not_started" || v === "none") return "Not started";
  return v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function MyTeam({
  participants,
  touchpoints,
  stats,
}: {
  participants: TeamParticipant[];
  touchpoints: Touchpoint[];
  stats: TeamStats;
}) {
  const [view, setView] = useState<View>("list");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [notifyTarget, setNotifyTarget] = useState<TeamParticipant | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return participants;
    return participants.filter((p) => `${fullName(p)} ${p.email ?? ""}`.toLowerCase().includes(q));
  }, [participants, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-md border bg-card p-0.5">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => setView(v.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors",
                view === v.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <v.icon className="h-4 w-4" /> {v.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Search team…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 w-48" />
          <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add Participant</Button>
        </div>
      </div>

      {!participants.length ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No team members yet. Add a participant to get started.</CardContent></Card>
      ) : view === "list" ? (
        <ListView participants={filtered} onNotify={setNotifyTarget} />
      ) : view === "table" ? (
        <TableView participants={filtered} onNotify={setNotifyTarget} />
      ) : view === "kanban" ? (
        <KanbanView participants={filtered} onNotify={setNotifyTarget} />
      ) : view === "calendar" ? (
        <CalendarView touchpoints={touchpoints} />
      ) : (
        <MapPlaceholder />
      )}

      <AddParticipantDialog open={addOpen} onOpenChange={setAddOpen} />
      <NotifyDialog target={notifyTarget} onClose={() => setNotifyTarget(null)} />
    </div>
  );
}

function StatusChip({ value }: { value: string | null }) {
  const started = value && value !== "not_sent" && value !== "not_started" && value !== "none";
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", started ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground")}>
      {statusLabel(value)}
    </span>
  );
}

function NotifyButton({ p, onNotify }: { p: TeamParticipant; onNotify: (p: TeamParticipant) => void }) {
  return (
    <Button variant="ghost" size="sm" onClick={() => onNotify(p)} disabled={!p.email}>
      <Mail className="mr-1.5 h-4 w-4" /> Notify
    </Button>
  );
}

function ListView({ participants, onNotify }: { participants: TeamParticipant[]; onNotify: (p: TeamParticipant) => void }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {participants.map((p) => (
        <Card key={p.id}>
          <CardContent className="space-y-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{fullName(p)}</p>
                <p className="text-sm text-muted-foreground">{p.email ?? "No email"}</p>
              </div>
              <NotifyButton p={p} onNotify={onNotify} />
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <span className="text-muted-foreground">Check-in:</span> <StatusChip value={p.check_in_status} />
              <span className="ml-2 text-muted-foreground">Survey:</span> <StatusChip value={p.survey_status} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TableView({ participants, onNotify }: { participants: TeamParticipant[]; onNotify: (p: TeamParticipant) => void }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Survey</TableHead>
              <TableHead>Journey</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{fullName(p)}</TableCell>
                <TableCell>{p.email ?? "-"}</TableCell>
                <TableCell><StatusChip value={p.check_in_status} /></TableCell>
                <TableCell><StatusChip value={p.survey_status} /></TableCell>
                <TableCell><StatusChip value={p.journey_status} /></TableCell>
                <TableCell className="text-right"><NotifyButton p={p} onNotify={onNotify} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Kanban grouped by check-in status.
function KanbanView({ participants, onNotify }: { participants: TeamParticipant[]; onNotify: (p: TeamParticipant) => void }) {
  const columns = useMemo(() => {
    const map = new Map<string, TeamParticipant[]>();
    for (const p of participants) {
      const key = statusLabel(p.check_in_status);
      map.set(key, [...(map.get(key) ?? []), p]);
    }
    // Not started first, then alphabetical.
    return Array.from(map.entries()).sort((a, b) =>
      a[0] === "Not started" ? -1 : b[0] === "Not started" ? 1 : a[0].localeCompare(b[0]),
    );
  }, [participants]);

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {columns.map(([label, rows]) => (
        <div key={label} className="w-64 shrink-0">
          <div className="mb-2 flex items-center justify-between rounded-md bg-muted px-3 py-1.5 text-sm font-medium">
            <span>{label}</span>
            <span className="text-muted-foreground">{rows.length}</span>
          </div>
          <div className="space-y-2">
            {rows.map((p) => (
              <Card key={p.id}>
                <CardContent className="space-y-1.5 p-3">
                  <p className="text-sm font-medium">{fullName(p)}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.email ?? "No email"}</p>
                  <NotifyButton p={p} onNotify={onNotify} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Month grid of upcoming experience touchpoints for the team.
function CalendarView({ touchpoints }: { touchpoints: Touchpoint[] }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
  });
  const byDay = useMemo(() => {
    const map = new Map<string, Touchpoint[]>();
    for (const t of touchpoints) {
      const key = new Date(t.scheduled_at).toISOString().slice(0, 10);
      map.set(key, [...(map.get(key) ?? []), t]);
    }
    return map;
  }, [touchpoints]);

  const first = new Date(Date.UTC(cursor.year, cursor.month, 1));
  const gridStart = new Date(first);
  gridStart.setUTCDate(1 - first.getUTCDay());
  const cells = Array.from({ length: 42 }, (_, k) => {
    const d = new Date(gridStart);
    d.setUTCDate(gridStart.getUTCDate() + k);
    return d;
  });
  const monthLabel = first.toLocaleDateString([], { month: "long", year: "numeric", timeZone: "UTC" });

  function shift(delta: number) {
    setCursor((c) => {
      const m = c.month + delta;
      return { year: c.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="font-semibold">{monthLabel}</h3>
          <div className="flex gap-1">
            <button type="button" onClick={() => shift(-1)} className="rounded border p-1 hover:bg-accent"><ChevronLeft className="h-4 w-4" /></button>
            <button type="button" onClick={() => shift(1)} className="rounded border p-1 hover:bg-accent"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">Upcoming experience emails scheduled to your team.</p>
        <div className="grid grid-cols-7 text-center text-xs text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d) => {
            const key = d.toISOString().slice(0, 10);
            const inMonth = d.getUTCMonth() === cursor.month;
            const items = byDay.get(key) ?? [];
            return (
              <div key={key} className={cn("min-h-[72px] rounded border p-1", inMonth ? "bg-background" : "bg-muted/30 text-muted-foreground/60")}>
                <div className="text-xs">{d.getUTCDate()}</div>
                <div className="mt-0.5 space-y-0.5">
                  {items.slice(0, 3).map((t) => (
                    <div key={t.id} className="truncate rounded bg-primary/15 px-1 py-0.5 text-[11px] text-primary" title={`${t.experience_name} · Week ${t.step_number} · ${t.attendee_email ?? ""}`}>
                      W{t.step_number} · {t.attendee_name || t.attendee_email || "recipient"}
                    </div>
                  ))}
                  {items.length > 3 ? <div className="px-1 text-[10px] text-muted-foreground">+{items.length - 3} more</div> : null}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function MapPlaceholder() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-2 p-12 text-center">
        <MapPin className="h-8 w-8 text-muted-foreground" />
        <p className="font-medium">Map view is coming soon</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          A map of your team lands in a later phase, once participants have location data.
        </p>
      </CardContent>
    </Card>
  );
}

function AddParticipantDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter();
  const actionToken = useDashboardActionToken();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/facilitator/team/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionToken, name, email, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to add participant.");
      setName(""); setEmail(""); setPhone("");
      onOpenChange(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add participant</DialogTitle>
          <DialogDescription>Add someone to your team. They&apos;ll be created as a participant if new.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" /></div>
          <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" /></div>
          <div className="space-y-1.5"><Label>Phone (optional)</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={submit} disabled={saving || !email.includes("@")}><Plus className="mr-2 h-4 w-4" /> {saving ? "Adding…" : "Add"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NotifyDialog({ target, onClose }: { target: TeamParticipant | null; onClose: () => void }) {
  const actionToken = useDashboardActionToken();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit() {
    if (!target) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/facilitator/team/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionToken, participantId: target.id, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to send.");
      setSent(true);
      setTimeout(() => { setSubject(""); setMessage(""); setSent(false); onClose(); }, 900);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={target !== null} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notify {target ? fullName(target) : ""}</DialogTitle>
          <DialogDescription>Send an email to {target?.email}.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5"><Label>Subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Message</Label><Textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} /></div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {sent && <p className="text-sm text-emerald-600 dark:text-emerald-400">Sent.</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={sending}>Cancel</Button>
          <Button onClick={submit} disabled={sending || !subject.trim() || !message.trim()}><Send className="mr-2 h-4 w-4" /> {sending ? "Sending…" : "Send"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

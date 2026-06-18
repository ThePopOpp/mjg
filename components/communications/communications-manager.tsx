"use client";

import { useState, useCallback } from "react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OptStatusBadge } from "./opt-status-badge";

interface CommunicationsRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  sms_opt_in: boolean;
  email_opt_in: boolean;
  sms_opt_in_at: string | null;
  sms_opt_out_at: string | null;
  email_opt_in_at: string | null;
  email_opt_out_at: string | null;
  entityType: "participant" | "profile";
}

interface CommunicationsStats {
  participants: { total: number; smsOptIn: number; emailOptIn: number; smsOptOut: number; emailOptOut: number };
  profiles: { total: number; smsOptIn: number; emailOptIn: number; smsOptOut: number; emailOptOut: number };
}

interface CommunicationsManagerProps {
  participants: CommunicationsRecord[];
  profiles: CommunicationsRecord[];
  stats: CommunicationsStats;
}

export function CommunicationsManager({ participants: initialParticipants, profiles: initialProfiles, stats: initialStats }: CommunicationsManagerProps) {
  const token = useDashboardActionToken();
  const [participants, setParticipants] = useState(initialParticipants);
  const [profiles, setProfiles] = useState(initialProfiles);
  const [stats, setStats] = useState(initialStats);
  const [activeTab, setActiveTab] = useState<"participants" | "profiles">("participants");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [channelFilter, setChannelFilter] = useState<"all" | "sms_opted_out" | "email_opted_out">("all");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const records = activeTab === "participants" ? participants : profiles;

  const filtered = records.filter((r) => {
    const matchesSearch =
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      (r.phone ?? "").includes(search);
    const matchesFilter =
      channelFilter === "all" ||
      (channelFilter === "sms_opted_out" && !r.sms_opt_in) ||
      (channelFilter === "email_opted_out" && !r.email_opt_in);
    return matchesSearch && matchesFilter;
  });

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(filtered.map((r) => r.id)));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  async function applyOpt(channel: "sms" | "email", eventType: "opt_in" | "opt_out") {
    if (selectedIds.size === 0) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/communications/opt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionToken: token,
          entityType: activeTab === "participants" ? "participant" : "profile",
          entityIds: Array.from(selectedIds),
          channel,
          eventType,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Updated ${data.updated} record${data.updated !== 1 ? "s" : ""}.`);
        // Refresh the local state
        const update = (r: CommunicationsRecord) => {
          if (!selectedIds.has(r.id)) return r;
          const now = new Date().toISOString();
          if (channel === "sms") return { ...r, sms_opt_in: eventType === "opt_in", sms_opt_in_at: eventType === "opt_in" ? now : r.sms_opt_in_at, sms_opt_out_at: eventType === "opt_out" ? now : r.sms_opt_out_at };
          return { ...r, email_opt_in: eventType === "opt_in", email_opt_in_at: eventType === "opt_in" ? now : r.email_opt_in_at, email_opt_out_at: eventType === "opt_out" ? now : r.email_opt_out_at };
        };
        if (activeTab === "participants") setParticipants((p) => p.map(update));
        else setProfiles((p) => p.map(update));
        clearSelection();
      } else {
        setMessage(data.error ?? "Failed to update.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Participants SMS opted in" value={stats.participants.smsOptIn} total={stats.participants.total} />
        <StatCard label="Participants Email opted in" value={stats.participants.emailOptIn} total={stats.participants.total} />
        <StatCard label="Users SMS opted in" value={stats.profiles.smsOptIn} total={stats.profiles.total} />
        <StatCard label="Users Email opted in" value={stats.profiles.emailOptIn} total={stats.profiles.total} />
      </div>

      {/* Entity type tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === "participants" ? "default" : "outline"}
          size="sm"
          onClick={() => { setActiveTab("participants"); clearSelection(); }}
        >
          Participants ({participants.length})
        </Button>
        <Button
          variant={activeTab === "profiles" ? "default" : "outline"}
          size="sm"
          onClick={() => { setActiveTab("profiles"); clearSelection(); }}
        >
          Dashboard users ({profiles.length})
        </Button>
      </div>

      {/* Filters & bulk actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value as any)}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="all">All records</option>
          <option value="sms_opted_out">SMS opted out</option>
          <option value="email_opted_out">Email opted out</option>
        </select>

        {selectedIds.size > 0 ? (
          <>
            <Badge variant="secondary">{selectedIds.size} selected</Badge>
            <Button size="sm" variant="outline" onClick={() => applyOpt("sms", "opt_in")} disabled={saving}>SMS Opt In</Button>
            <Button size="sm" variant="outline" onClick={() => applyOpt("sms", "opt_out")} disabled={saving}>SMS Opt Out</Button>
            <Button size="sm" variant="outline" onClick={() => applyOpt("email", "opt_in")} disabled={saving}>Email Opt In</Button>
            <Button size="sm" variant="outline" onClick={() => applyOpt("email", "opt_out")} disabled={saving}>Email Opt Out</Button>
            <Button size="sm" variant="ghost" onClick={clearSelection}>Clear</Button>
          </>
        ) : (
          <Button size="sm" variant="outline" onClick={selectAll}>Select all {filtered.length}</Button>
        )}
      </div>

      {message && (
        <p className={`text-sm ${message.includes("Updated") ? "text-green-600" : "text-destructive"}`}>{message}</p>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filtered.length && filtered.length > 0}
                    onChange={(e) => e.target.checked ? selectAll() : clearSelection()}
                    className="rounded"
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>SMS</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>SMS changed</TableHead>
                <TableHead>Email changed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground">No records match your filters.</TableCell>
                </TableRow>
              )}
              {filtered.map((r) => (
                <TableRow key={r.id} className={selectedIds.has(r.id) ? "bg-accent/50" : ""}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(r.id)}
                      onChange={() => toggleSelect(r.id)}
                      className="rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{r.name || "—"}</TableCell>
                  <TableCell className="text-sm">{r.email}</TableCell>
                  <TableCell className="text-sm font-mono">{r.phone ?? "—"}</TableCell>
                  <TableCell><OptStatusBadge optedIn={r.sms_opt_in} /></TableCell>
                  <TableCell><OptStatusBadge optedIn={r.email_opt_in} /></TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {r.sms_opt_in ? (r.sms_opt_in_at ? new Date(r.sms_opt_in_at).toLocaleDateString() : "—") : (r.sms_opt_out_at ? new Date(r.sms_opt_out_at).toLocaleDateString() : "—")}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {r.email_opt_in ? (r.email_opt_in_at ? new Date(r.email_opt_in_at).toLocaleDateString() : "—") : (r.email_opt_out_at ? new Date(r.email_opt_out_at).toLocaleDateString() : "—")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value} <span className="text-sm font-normal text-muted-foreground">/ {total}</span></p>
        <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
          <div className="h-1.5 rounded-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{pct}% opted in</p>
      </CardContent>
    </Card>
  );
}

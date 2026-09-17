"use client";

import { useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import {
  WAITLIST_STATUSES, formatLabels, roleLabel,
  type BookWaitlistRequest, type BookWaitlistStats, type WaitlistStatus,
} from "@/lib/book-waitlist/repository";
import { cn } from "@/lib/utils";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function BookWaitlistAdmin({
  requests: initial,
  stats,
}: {
  requests: BookWaitlistRequest[];
  stats: BookWaitlistStats;
}) {
  const actionToken = useDashboardActionToken();
  const [requests, setRequests] = useState(initial);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | WaitlistStatus>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return requests.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return [r.email, r.first_name, r.last_name, r.interest].filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
    });
  }, [requests, query, statusFilter]);

  async function setStatus(id: string, status: WaitlistStatus) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/book-waitlist/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, actionToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Update failed.");
      setRequests((rows) => rows.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setBusyId(null);
    }
  }

  function exportCsv() {
    const header = ["Email", "First name", "Last name", "Phone", "Account", "Role", "Format", "Status", "Requested", "Interest"];
    const rows = filtered.map((r) => [
      r.email, r.first_name ?? "", r.last_name ?? "", r.phone ?? "",
      r.account_type, roleLabel(r.user_role) ?? "", formatLabels(r.format_preferences, r.format_preference),
      r.status, new Date(r.created_at).toISOString().slice(0, 10), (r.interest ?? "").replace(/\s+/g, " "),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `book-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="On the waitlist" value={String(stats.total)} detail="Total requests" />
        <Stat label="With an MJG account" value={String(stats.registered)} detail={`${stats.guests} without`} />
        <Stat label="Last 7 days" value={String(stats.last7)} detail="New requests" />
        <Stat label="Awaiting notice" value={String(stats.byStatus.requested)} detail={`${stats.byStatus.notified} notified`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Preferred format</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {stats.byFormat.map((f) => (
              <Row key={f.label} label={f.label} count={f.count} max={Math.max(1, ...stats.byFormat.map((x) => x.count))} />
            ))}
            {!stats.byFormat.length ? <p className="text-sm text-muted-foreground">No requests yet.</p> : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Who&rsquo;s asking</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {stats.byRole.map((r) => (
              <Row key={r.label} label={r.label} count={r.count} max={Math.max(1, ...stats.byRole.map((x) => x.count))} />
            ))}
            {!stats.byRole.length ? <p className="text-sm text-muted-foreground">No requests yet.</p> : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-col items-stretch gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Requests ({filtered.length})</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or email" className="pl-8" />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {WAITLIST_STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportCsv} disabled={!filtered.length}>Export CSV</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {error ? <p className="px-4 pb-2 text-sm text-destructive">{error}</p> : null}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Person</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <p className="font-medium">{[r.first_name, r.last_name].filter(Boolean).join(" ") || "—"}</p>
                      <p className="text-xs text-muted-foreground">{r.email}</p>
                      {r.interest ? <p className="mt-1 max-w-sm text-xs italic text-muted-foreground">&ldquo;{r.interest}&rdquo;</p> : null}
                    </TableCell>
                    <TableCell>
                      {r.account_type === "registered" ? (
                        <div className="space-y-1">
                          <Badge variant="outline" className="border-[#b88a4a]/50">Registered</Badge>
                          {roleLabel(r.user_role) ? <p className="text-xs text-muted-foreground">{roleLabel(r.user_role)}</p> : null}
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">Guest</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatLabels(r.format_preferences, r.format_preference)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fmtDate(r.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select value={r.status} onValueChange={(v) => setStatus(r.id, v as WaitlistStatus)} disabled={busyId === r.id}>
                          <SelectTrigger className="h-8 w-32 capitalize"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {WAITLIST_STATUSES.map((s) => (
                              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {busyId === r.id ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!filtered.length ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                      {requests.length ? "No requests match those filters." : "No waitlist requests yet."}
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, count, max }: { label: string; count: number; max: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-sm">
        <span className={cn(label === "No account" && "text-muted-foreground")}>{label}</span>
        <span className="tabular-nums text-muted-foreground">{count}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-[#b88a4a]" style={{ width: `${(count / max) * 100}%` }} />
      </div>
    </div>
  );
}

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

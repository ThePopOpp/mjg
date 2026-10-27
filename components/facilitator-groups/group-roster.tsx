"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { OwnerGroup, Reservation } from "@/lib/facilitator-groups/shared";
import { groupApi } from "./api";

const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric" });

function Person({ r, children }: { r: Reservation; children?: React.ReactNode }) {
  return (
    <li className="flex flex-col gap-2 rounded-md border border-border p-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium text-foreground">
          {r.name || r.email}
          {r.partySize > 1 ? <span className="ml-2 text-xs font-normal text-muted-foreground">party of {r.partySize}</span> : null}
        </p>
        {r.name && r.email ? <p className="truncate text-xs text-muted-foreground">{r.email}</p> : null}
        {r.message ? <p className="mt-1.5 border-l-2 border-primary/50 pl-2 text-sm text-muted-foreground">{r.message}</p> : null}
        <p className="mt-1 text-xs text-muted-foreground">
          {r.source === "request" ? "Requested" : "Added"} {fmtDate(r.createdAt)}
        </p>
      </div>
      {children ? <div className="flex shrink-0 gap-2">{children}</div> : null}
    </li>
  );
}

export function GroupRoster({ group, actionToken, onChanged }: { group: OwnerGroup; actionToken: string | null; onChanged: () => void }) {
  const [rows, setRows] = useState<Reservation[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [add, setAdd] = useState({ name: "", email: "", partySize: "1" });

  const load = useCallback(async () => {
    try {
      const data = await groupApi<{ reservations: Reservation[] }>(`/api/facilitator/groups/${group.id}/reservations`, "GET", undefined, actionToken);
      setRows(data.reservations);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load the roster.");
    }
  }, [group.id, actionToken]);
  useEffect(() => { load(); }, [load]);

  async function decide(id: string, decision: "confirm" | "decline" | "cancel") {
    if (decision === "cancel" && !confirm("Remove this person from the group? Their spot opens up.")) return;
    setBusy(id);
    setError(null);
    try {
      await groupApi(`/api/facilitator/groups/${group.id}/reservations`, "PATCH", { reservationId: id, decision }, actionToken);
      await load();
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  }

  async function addPerson(e: React.FormEvent) {
    e.preventDefault();
    setBusy("add");
    setError(null);
    try {
      await groupApi(`/api/facilitator/groups/${group.id}/reservations`, "POST", { name: add.name, email: add.email, partySize: Number(add.partySize) || 1 }, actionToken);
      setAdd({ name: "", email: "", partySize: "1" });
      await load();
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  }

  const by = (s: Reservation["status"]) => (rows ?? []).filter((r) => r.status === s);
  const pending = by("pending");
  const confirmed = by("confirmed");
  const waitlist = by("waitlisted");
  const left = Math.max(0, group.capacity - group.spotsTaken);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          <span className="text-2xl font-semibold text-foreground">{group.spotsTaken}</span> of {group.capacity} spots filled · {left} open
        </p>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted sm:w-48">
          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (group.spotsTaken / group.capacity) * 100)}%` }} />
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {rows === null ? <p className="text-sm text-muted-foreground">Loading…</p> : null}

      {pending.length ? (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Waiting for you ({pending.length})</h3>
          <ul className="space-y-2">
            {pending.map((r) => (
              <Person key={r.id} r={r}>
                <Button size="sm" onClick={() => decide(r.id, "confirm")} disabled={busy === r.id || left < r.partySize}><Check className="mr-1 h-4 w-4" /> Approve</Button>
                <Button size="sm" variant="outline" onClick={() => decide(r.id, "decline")} disabled={busy === r.id}><X className="mr-1 h-4 w-4" /> Decline</Button>
              </Person>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">In the group ({confirmed.length})</h3>
        {confirmed.length ? (
          <ul className="space-y-2">
            {confirmed.map((r) => (
              <Person key={r.id} r={r}>
                <Button size="sm" variant="ghost" onClick={() => decide(r.id, "cancel")} disabled={busy === r.id}>Remove</Button>
              </Person>
            ))}
          </ul>
        ) : rows ? (
          <p className="text-sm text-muted-foreground">No one yet. Add the people you've already invited below.</p>
        ) : null}
      </section>

      {waitlist.length ? (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Waitlist ({waitlist.length})</h3>
          {left > 0 ? <p className="text-xs text-primary">{left} spot{left === 1 ? "" : "s"} open — offer one to someone on the waitlist.</p> : null}
          <ul className="space-y-2">
            {waitlist.map((r) => (
              <Person key={r.id} r={r}>
                <Button size="sm" onClick={() => decide(r.id, "confirm")} disabled={busy === r.id || left < r.partySize}>Offer spot</Button>
                <Button size="sm" variant="ghost" onClick={() => decide(r.id, "decline")} disabled={busy === r.id}>Remove</Button>
              </Person>
            ))}
          </ul>
        </section>
      ) : null}

      <form onSubmit={addPerson} className="space-y-2 rounded-md border border-dashed border-border p-3">
        <h3 className="text-sm font-semibold text-foreground">Add someone you've recruited</h3>
        <p className="text-xs text-muted-foreground">Takes one of your spots and adds them to your team.</p>
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_5rem_auto]">
          <Input value={add.name} onChange={(e) => setAdd({ ...add, name: e.target.value })} placeholder="Name" />
          <Input type="email" required value={add.email} onChange={(e) => setAdd({ ...add, email: e.target.value })} placeholder="Email" />
          <Input type="number" min={1} max={4} value={add.partySize} onChange={(e) => setAdd({ ...add, partySize: e.target.value })} aria-label="Spots" title="Spots" />
          <Button type="submit" disabled={busy === "add" || left < 1}><UserPlus className="mr-1.5 h-4 w-4" /> {busy === "add" ? "Adding…" : "Add"}</Button>
        </div>
        {left < 1 ? <p className="text-xs text-muted-foreground">The group is full — raise the total spots to add more.</p> : null}
      </form>
    </div>
  );
}

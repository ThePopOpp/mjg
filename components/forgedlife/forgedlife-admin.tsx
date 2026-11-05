"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChurchApi } from "@/components/churches/church-ui";
import type { ForgedOverview } from "@/lib/forgedlife/admin";

// Super Admin view of everything ForgedLife has sent. Nothing ForgedLife sends reaches
// MJG members, churches or Find a Group until it's approved here.

const REQUEST_LABELS: Record<string, string> = { steward: "Steward", created_for_more_checkin: "Check-In", energy_audit: "Energy Audit" };
const DAY = ["", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const fmt = (d: string | null) => (d ? new Date(d).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—");

function Status({ value }: { value: string }) {
  const tone = ["pending", "recorded", "failed"].includes(value) ? "default" : ["approved", "linked", "imported", "applied"].includes(value) ? "secondary" : "outline";
  return <Badge variant={tone as "default" | "secondary" | "outline"} className="capitalize">{value}</Badge>;
}

function useAction() {
  const api = useChurchApi();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  async function run(key: string, body: Record<string, unknown>, done?: (res: any) => string | null) {
    setBusy(key);
    setMessage(null);
    try {
      const res = await api("/api/forgedlife", "POST", body);
      const text = done?.(res);
      if (text) setMessage({ ok: true, text });
      router.refresh();
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Something went wrong." });
    } finally {
      setBusy(null);
    }
  }
  return { busy, message, run };
}

function Message({ message }: { message: { ok: boolean; text: string } | null }) {
  if (!message) return null;
  return <p className={message.ok ? "rounded-md bg-primary/10 p-3 text-sm text-primary" : "rounded-md bg-destructive/10 p-3 text-sm text-destructive"}>{message.text}</p>;
}

function Empty({ children }: { children: React.ReactNode }) {
  return <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">{children}</CardContent></Card>;
}

export function ForgedLifeAdmin({ data }: { data: ForgedOverview }) {
  const pending = data.requests.filter((r: any) => r.status === "pending").length;
  const failed = data.events.filter((e: any) => e.status === "failed").length;
  return (
    <Tabs defaultValue="requests">
      <TabsList className="flex-wrap">
        <TabsTrigger value="requests">Requests{pending ? ` (${pending})` : ""}</TabsTrigger>
        <TabsTrigger value="churches">Churches</TabsTrigger>
        <TabsTrigger value="groups">Groups</TabsTrigger>
        <TabsTrigger value="events">Events{failed ? ` (${failed} failed)` : ""}</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="requests" className="mt-4"><Requests rows={data.requests} /></TabsContent>
      <TabsContent value="churches" className="mt-4"><Churches rows={data.churches} mjgChurches={data.mjgChurches} /></TabsContent>
      <TabsContent value="groups" className="mt-4"><Groups rows={data.groups} /></TabsContent>
      <TabsContent value="events" className="mt-4"><Events rows={data.events} syncOn={data.switches.sync} /></TabsContent>
      <TabsContent value="settings" className="mt-4"><Settings data={data} /></TabsContent>
    </Tabs>
  );
}

function Requests({ rows }: { rows: any[] }) {
  const { busy, message, run } = useAction();
  if (!rows.length) return <Empty>No one has shared their details from ForgedLife yet.</Empty>;
  return (
    <div className="space-y-3">
      <Message message={message} />
      {rows.map((r) => (
        <Card key={r.id}>
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{r.name ?? "(no name)"}</p>
                <Status value={r.status} />
                {r.profile_id ? <Badge variant="outline">Existing member</Badge> : null}
                {r.email_is_relay ? <Badge variant="outline">Apple private relay</Badge> : null}
              </div>
              <p className="break-all text-sm text-muted-foreground">{r.email ?? "—"}{r.phone ? ` · ${r.phone} (texts OK)` : ""}</p>
              <p className="text-xs text-muted-foreground">
                Wants: {r.requested?.length ? r.requested.map((x: string) => REQUEST_LABELS[x] ?? x).join(", ") : "nothing specific"}
                {r.role_in_forged ? ` · ForgedLife role: ${r.role_in_forged}` : ""} · {fmt(r.updated_at)}
              </p>
            </div>
            {r.status === "pending" || r.status === "declined" ? (
              <div className="flex shrink-0 gap-2">
                <Button size="sm" disabled={busy !== null} onClick={() => run(r.id + "a", { action: "approve_request", id: r.id }, (res) => (res.existingMember ? `${r.email} already has an account — approved.` : res.invited ? `Invite sent to ${r.email}.` : `Approved; ${r.email} already has an open invite.`))}>
                  {busy === r.id + "a" ? "Approving…" : r.profile_id ? "Approve" : "Approve & invite"}
                </Button>
                {r.status === "pending" ? (
                  <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => run(r.id + "d", { action: "decline_request", id: r.id })}>Decline</Button>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Churches({ rows, mjgChurches }: { rows: any[]; mjgChurches: { id: string; name: string; city: string | null; state: string | null }[] }) {
  const { busy, message, run } = useAction();
  const [pick, setPick] = useState<Record<string, string>>({});
  if (!rows.length) return <Empty>No churches from ForgedLife yet.</Empty>;
  return (
    <div className="space-y-3">
      <Message message={message} />
      {rows.map((c) => {
        const suggestion = mjgChurches.find((m) => m.name.trim().toLowerCase() === String(c.name).trim().toLowerCase());
        const chosen = pick[c.id] ?? suggestion?.id ?? "";
        return (
          <Card key={c.id}>
            <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2"><p className="font-medium">{c.name}</p><Status value={c.status} /></div>
                <p className="text-sm text-muted-foreground">{[c.city, c.state].filter(Boolean).join(", ") || "No location"}{c.timezone ? ` · ${c.timezone}` : ""}</p>
                <p className="text-xs text-muted-foreground">
                  Admins who consented: {c.admins?.length ? c.admins.map((a: any) => a.name ?? a.email).join(", ") : "none"}
                  {c.church_id ? ` · Linked to ${mjgChurches.find((m) => m.id === c.church_id)?.name ?? "an MJG church"}` : ""}
                </p>
              </div>
              {c.status === "pending" || c.status === "ignored" ? (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <select value={chosen} onChange={(e) => setPick((p) => ({ ...p, [c.id]: e.target.value }))} className="h-9 max-w-[16rem] rounded-md border bg-background px-2 text-sm">
                    <option value="">Pick an MJG church…</option>
                    {mjgChurches.map((m) => <option key={m.id} value={m.id}>{m.name}{m.city ? ` (${m.city})` : ""}</option>)}
                  </select>
                  <Button size="sm" disabled={busy !== null || !chosen} onClick={() => run(c.id + "l", { action: "link_church", id: c.id, churchId: chosen }, () => "Linked.")}>Link</Button>
                  <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => run(c.id + "n", { action: "link_church", id: c.id, create: true }, () => `Created ${c.name} in MJG.`)}>Create in MJG</Button>
                  {c.status === "pending" ? <Button size="sm" variant="ghost" disabled={busy !== null} onClick={() => run(c.id + "i", { action: "ignore_church", id: c.id })}>Ignore</Button> : null}
                </div>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function Groups({ rows }: { rows: any[] }) {
  const { busy, message, run } = useAction();
  if (!rows.length) return <Empty>No groups from ForgedLife yet.</Empty>;
  return (
    <div className="space-y-3">
      <Message message={message} />
      {rows.map((g) => (
        <Card key={g.id}>
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{g.name}</p>
                <Status value={g.status} />
                <Badge variant="outline">{g.open_to_public ? "Open to the public" : g.open_to_church ? "Church members only" : "Private"}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {g.church?.name ?? "No church"}{g.church?.city ? ` · ${g.church.city}, ${g.church.state ?? ""}` : ""}
                {g.meeting_weekday ? ` · ${DAY[g.meeting_weekday]} ${g.meeting_hour ?? ""}:00` : ""}{g.location ? ` · ${g.location}` : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                Leader: {g.leader?.email ? `${g.leader.name ?? ""} ${g.leader.email}` : "not shared (hasn't consented)"} · {g.member_count ?? 0}
                {g.capacity ? `/${g.capacity}` : ""} members · starts {g.start_date ?? "—"}
              </p>
            </div>
            {g.status === "pending" || g.status === "ignored" ? (
              <div className="flex shrink-0 gap-2">
                <Button size="sm" disabled={busy !== null || !g.leader?.email} title={g.leader?.email ? undefined : "The leader hasn't shared their details"} onClick={() => run(g.id + "m", { action: "import_group", id: g.id }, () => "Imported as a draft. The leader (or an admin) publishes it from Facilitators & Groups.")}>
                  {busy === g.id + "m" ? "Importing…" : "Import as draft"}
                </Button>
                {g.status === "pending" ? <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => run(g.id + "i", { action: "ignore_group", id: g.id })}>Ignore</Button> : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Events({ rows, syncOn }: { rows: any[]; syncOn: boolean }) {
  const { busy, message, run } = useAction();
  if (!rows.length) return <Empty>No events received yet.</Empty>;
  return (
    <div className="space-y-3">
      <Message message={message} />
      <Card>
        <CardContent className="divide-y p-0">
          {rows.map((e) => (
            <div key={e.id} className="flex flex-col gap-1 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs">{e.event_type ?? "(no type)"}</span>
                  <Status value={e.status} />
                  {e.mode === "test" ? <Badge variant="outline">Test</Badge> : null}
                </div>
                <p className="break-all text-xs text-muted-foreground">{fmt(e.received_at)} · {e.event_id}{e.error ? ` · ${e.error}` : ""}</p>
              </div>
              {e.mode === "live" && (e.status === "failed" || e.status === "recorded") ? (
                <Button size="sm" variant="outline" className="shrink-0" disabled={busy !== null || !syncOn} title={syncOn ? undefined : "Turn on “Apply live events” first"} onClick={() => run(e.id, { action: "replay_event", id: e.id }, (res) => `Replayed: ${res.status}${res.error ? ` — ${res.error}` : ""}`)}>
                  {e.status === "failed" ? "Retry" : "Apply now"}
                </Button>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Settings({ data }: { data: ForgedOverview }) {
  const { busy, message, run } = useAction();
  const site = typeof window === "undefined" ? "https://michaeljgauthier.com" : window.location.origin;
  const toggles = [
    { key: "forgedlife.sync", on: data.switches.sync, title: "Apply live events", body: "Off: live events are stored but change nothing; apply them later from Events. Test events are never applied." },
    { key: "forgedlife.sms_opt_in", on: data.switches.smsOptIn, title: "Accept text-message consent from ForgedLife", body: "Leave off until the Twilio campaign lists the ForgedLife consent sheet as an opt-in method. Turning texts OFF in ForgedLife is always honoured." },
  ];
  return (
    <div className="space-y-4">
      <Message message={message} />
      <Card>
        <CardHeader><CardTitle className="text-base">Switches</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {toggles.map((t) => (
            <div key={t.key} className="flex items-start justify-between gap-4">
              <div><p className="font-medium">{t.title}</p><p className="text-sm text-muted-foreground">{t.body}</p></div>
              <Switch checked={t.on} disabled={busy !== null} onCheckedChange={(v) => run(t.key, { action: "set_switch", key: t.key, enabled: v })} />
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Endpoints</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {[
            ["Test (records only)", `${site}/api/integrations/forgedlife/test-events`, data.configured.test, "FORGEDLIFE_TEST_WEBHOOK_SECRET"],
            ["Live", `${site}/api/integrations/forgedlife/events`, data.configured.live, "FORGEDLIFE_WEBHOOK_SECRET"],
          ].map(([label, url, ok, env]) => (
            <div key={String(label)} className="space-y-0.5">
              <p className="font-medium">{label} {ok ? <Badge variant="secondary">Secret set</Badge> : <Badge variant="outline">{`Set ${env} in Coolify`}</Badge>}</p>
              <p className="break-all font-mono text-xs text-muted-foreground">{String(url)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

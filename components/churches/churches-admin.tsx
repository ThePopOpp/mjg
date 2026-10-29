"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, Plus, Trash2, UserMinus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Church, ChurchAdmin, FacilitatorApplication } from "@/lib/churches/repository";
import type { ChurchAdminApplication } from "@/lib/churches/applications";
import { DecideButtons, StatusPill, fmtDate, useChurchApi } from "./church-ui";

// Super Admin: churches, their admins, and both kinds of application.

export function ChurchesAdmin({
  churches, admins, adminApplications, facilitatorApplications,
}: {
  churches: Church[];
  admins: ChurchAdmin[];
  adminApplications: ChurchAdminApplication[];
  facilitatorApplications: FacilitatorApplication[];
}) {
  const pendingAdmin = adminApplications.filter((a) => a.status === "pending");
  const pendingFac = facilitatorApplications.filter((a) => a.status === "pending");
  return (
    <Tabs defaultValue={pendingAdmin.length || pendingFac.length ? "applications" : "churches"}>
      <TabsList>
        <TabsTrigger value="churches">Churches ({churches.filter((c) => c.status === "active").length})</TabsTrigger>
        <TabsTrigger value="applications">Applications{pendingAdmin.length + pendingFac.length ? ` (${pendingAdmin.length + pendingFac.length})` : ""}</TabsTrigger>
      </TabsList>
      <TabsContent value="churches" className="space-y-4">
        <NewChurch />
        {churches.length === 0 ? <p className="text-sm text-muted-foreground">No churches yet.</p> : null}
        {churches.map((c) => <ChurchCard key={c.id} church={c} admins={admins.filter((a) => a.churchId === c.id)} />)}
      </TabsContent>
      <TabsContent value="applications" className="space-y-6">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Church admin applications</h2>
          {adminApplications.length === 0 ? <p className="text-sm text-muted-foreground">None yet.</p> : null}
          {adminApplications.map((a) => (
            <Card key={a.id}>
              <CardContent className="grid gap-4 pt-5 md:grid-cols-[1fr_280px]">
                <div className="space-y-1 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{a.name}</span>
                    <StatusPill status={a.status} />
                    <span className="text-muted-foreground">{fmtDate(a.createdAt)}</span>
                  </div>
                  <p className="text-muted-foreground">{a.email}</p>
                  <p>
                    {a.churchName}
                    {[a.churchCity, a.churchState].filter(Boolean).length ? ` · ${[a.churchCity, a.churchState].filter(Boolean).join(", ")}` : ""}
                    {a.isNewChurch ? <span className="ml-1 text-xs text-[#8a6532] dark:text-[#e2ca9a]">(new church — created on approval)</span> : null}
                  </p>
                  {a.roleTitle ? <p className="text-muted-foreground">Role: {a.roleTitle}</p> : null}
                  {a.message ? <p className="border-l-2 border-[#b88a4a] pl-3 text-muted-foreground">{a.message}</p> : null}
                  {a.decisionNote ? <p className="text-muted-foreground">Note: {a.decisionNote}</p> : null}
                </div>
                {a.status === "pending" ? <DecideButtons url="/api/churches/admin-applications/decide" body={{ id: a.id }} /> : null}
              </CardContent>
            </Card>
          ))}
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Facilitator applications</h2>
          <FacilitatorApplicationList applications={facilitatorApplications} />
        </section>
      </TabsContent>
    </Tabs>
  );
}

export function FacilitatorApplicationList({ applications }: { applications: FacilitatorApplication[] }) {
  if (!applications.length) return <p className="text-sm text-muted-foreground">None yet.</p>;
  return (
    <div className="space-y-3">
      {applications.map((a) => (
        <Card key={a.id}>
          <CardContent className="grid gap-4 pt-5 md:grid-cols-[1fr_280px]">
            <div className="space-y-1 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{a.name}</span>
                <StatusPill status={a.status} />
                <span className="text-muted-foreground">{fmtDate(a.createdAt)}</span>
              </div>
              <p className="text-muted-foreground">{a.email} · {a.churchName}</p>
              {a.message ? <p className="border-l-2 border-[#b88a4a] pl-3 text-muted-foreground">{a.message}</p> : null}
              {a.note ? <p className="text-muted-foreground">Note: {a.note}</p> : null}
            </div>
            {a.status === "pending" ? <DecideButtons url={`/api/churches/facilitator-applications/${a.id}`} /> : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function NewChurch() {
  const api = useChurchApi();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", city: "", state: "", website: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await api("/api/churches", "POST", { church: form });
      setForm({ name: "", city: "", state: "", website: "" });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Add a church</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-[2fr_1fr_80px_2fr]">
          <Input placeholder="Church name" value={form.name} onChange={(e) => set("name", e.target.value)} />
          <Input placeholder="City" value={form.city} onChange={(e) => set("city", e.target.value)} />
          <Input placeholder="ST" maxLength={2} value={form.state} onChange={(e) => set("state", e.target.value)} />
          <Input placeholder="Website (optional)" value={form.website} onChange={(e) => set("website", e.target.value)} />
        </div>
        <Button size="sm" onClick={save} disabled={busy || !form.name.trim()}><Plus className="mr-1 h-4 w-4" />{busy ? "Adding…" : "Add church"}</Button>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </CardContent>
    </Card>
  );
}

function ChurchCard({ church, admins }: { church: Church; admins: ChurchAdmin[] }) {
  const api = useChurchApi();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<unknown>, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(true);
    setError(null);
    try {
      await fn();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const archived = church.status === "archived";
  return (
    <Card className={archived ? "opacity-70" : undefined}>
      <CardContent className="space-y-3 pt-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{church.name}</span>
          <StatusPill status={church.status} />
          <span className="text-sm text-muted-foreground">{[church.city, church.state].filter(Boolean).join(", ")}</span>
          {church.website ? <a href={church.website} target="_blank" rel="noreferrer" className="text-sm text-[#b88a4a] underline-offset-2 hover:underline">Website</a> : null}
          <div className="ml-auto flex gap-1">
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => run(() => api(`/api/churches/${church.id}`, "PATCH", { church: { status: archived ? "active" : "archived" } }))}>
              {archived ? <ArchiveRestore className="mr-1 h-4 w-4" /> : <Archive className="mr-1 h-4 w-4" />}{archived ? "Restore" : "Archive"}
            </Button>
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => run(() => api(`/api/churches/${church.id}`, "DELETE"), `Delete ${church.name}? It goes to the trash and can be restored.`)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Church admins</p>
          {admins.length === 0 ? <p className="text-sm text-muted-foreground">No admins yet.</p> : null}
          {admins.map((a) => (
            <div key={a.id} className="flex items-center gap-2 text-sm">
              <span>{a.name}</span>
              <span className="text-muted-foreground">{a.email}</span>
              <Button size="sm" variant="ghost" className="ml-auto" disabled={busy}
                onClick={() => run(() => api(`/api/churches/${church.id}/admins`, "DELETE", { profileId: a.profileId }), `Remove ${a.name} as an admin of ${church.name}?`)}>
                <UserMinus className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input className="h-8 max-w-xs text-sm" placeholder="Account email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button size="sm" variant="outline" disabled={busy || !email.trim()} onClick={() => run(async () => { await api(`/api/churches/${church.id}/admins`, "POST", { email }); setEmail(""); })}>
              <UserPlus className="mr-1 h-4 w-4" />Add admin
            </Button>
          </div>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </CardContent>
    </Card>
  );
}

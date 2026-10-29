"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldSelect } from "@/components/ui/field-select";
import { StatusPill, fmtDate, useChurchApi } from "./church-ui";

type ChurchOption = { id: string; name: string; place: string };
type MyApp = { id: string; churchName: string; status: string; createdAt: string; note: string | null };

function useSubmit() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  async function submit(fn: () => Promise<unknown>, success: string) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      setDone(success);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }
  return { busy, error, done, submit };
}

function History({ apps }: { apps: MyApp[] }) {
  if (!apps.length) return null;
  return (
    <div className="space-y-1 border-t pt-3 text-sm">
      {apps.map((a) => (
        <div key={a.id} className="flex flex-wrap items-center gap-2">
          <span>{a.churchName}</span>
          <StatusPill status={a.status} />
          <span className="text-muted-foreground">{fmtDate(a.createdAt)}</span>
          {a.note ? <span className="text-muted-foreground">· {a.note}</span> : null}
        </div>
      ))}
    </div>
  );
}

/** A facilitator asks their church to approve them. */
export function FacilitatorApplicationForm({ churches, applications }: { churches: ChurchOption[]; applications: MyApp[] }) {
  const api = useChurchApi();
  const { busy, error, done, submit } = useSubmit();
  const [churchId, setChurchId] = useState("");
  const [message, setMessage] = useState("");
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Lead a group for your church</CardTitle>
        <p className="text-sm text-muted-foreground">Pick your church. Its church admin approves you, and then your group can be listed as an official church group.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {churches.length ? (
          <>
            <FieldSelect value={churchId} onChange={setChurchId} placeholder="Choose your church" options={churches.map((c) => ({ value: c.id, label: c.place ? `${c.name} · ${c.place}` : c.name }))} />
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="A short note for your church admin (optional)" rows={3} />
            <Button size="sm" disabled={busy || !churchId} onClick={() => submit(() => api("/api/churches/facilitator-applications", "POST", { churchId, message }), "Sent. Your church admin will review it.")}>
              <Send className="mr-1 h-4 w-4" />{busy ? "Sending…" : "Send application"}
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No churches are set up yet. If you lead at a church, its pastor or leader can apply to be its church admin below.</p>
        )}
        {done ? <p className="text-sm text-[#8a6532] dark:text-[#e2ca9a]">{done}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <History apps={applications} />
      </CardContent>
    </Card>
  );
}

/** Ask to become a church admin. A Super Admin approves. */
export function ChurchAdminApplicationForm({ churches, applications }: { churches: ChurchOption[]; applications: MyApp[] }) {
  const api = useChurchApi();
  const { busy, error, done, submit } = useSubmit();
  const NEW = "__new__";
  const [churchId, setChurchId] = useState("");
  const [form, setForm] = useState({ churchName: "", churchCity: "", churchState: "", churchWebsite: "", roleTitle: "", message: "" });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const isNew = churchId === NEW || !churches.length;
  const pending = applications.some((a) => a.status === "pending");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Become a church admin</CardTitle>
        <p className="text-sm text-muted-foreground">For pastors and church leaders. A church admin approves the facilitators who lead groups for their church. MJG reviews every request.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {pending ? (
          <p className="text-sm text-muted-foreground">Your request is waiting for review. We'll email you when it's decided.</p>
        ) : (
          <>
            {churches.length ? (
              <FieldSelect
                value={churchId}
                onChange={setChurchId}
                placeholder="Choose your church"
                options={[...churches.map((c) => ({ value: c.id, label: c.place ? `${c.name} · ${c.place}` : c.name })), { value: NEW, label: "My church isn't listed" }]}
              />
            ) : null}
            {isNew ? (
              <div className="grid gap-2 sm:grid-cols-[2fr_1fr_80px]">
                <Input placeholder="Church name" value={form.churchName} onChange={(e) => set("churchName", e.target.value)} />
                <Input placeholder="City" value={form.churchCity} onChange={(e) => set("churchCity", e.target.value)} />
                <Input placeholder="ST" maxLength={2} value={form.churchState} onChange={(e) => set("churchState", e.target.value)} />
                <Input className="sm:col-span-3" placeholder="Church website (optional)" value={form.churchWebsite} onChange={(e) => set("churchWebsite", e.target.value)} />
              </div>
            ) : null}
            <Input placeholder="Your role at the church (e.g. Senior Pastor)" value={form.roleTitle} onChange={(e) => set("roleTitle", e.target.value)} />
            <Textarea placeholder="Anything we should know (optional)" rows={3} value={form.message} onChange={(e) => set("message", e.target.value)} />
            <Button
              size="sm"
              disabled={busy || (isNew ? !form.churchName.trim() : !churchId)}
              onClick={() =>
                submit(
                  () => api("/api/churches/admin-applications", "POST", { application: { ...form, churchId: isNew ? null : churchId } }),
                  "Sent. We'll email you when it's decided.",
                )
              }
            >
              <Send className="mr-1 h-4 w-4" />{busy ? "Sending…" : "Send request"}
            </Button>
          </>
        )}
        {done ? <p className="text-sm text-[#8a6532] dark:text-[#e2ca9a]">{done}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <History apps={applications} />
      </CardContent>
    </Card>
  );
}

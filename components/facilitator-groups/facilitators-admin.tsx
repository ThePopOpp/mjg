"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, ExternalLink, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { scheduleLabel, type FinderMode, type OwnerGroup } from "@/lib/facilitator-groups/shared";
import { groupApi } from "./api";

type AdminGroup = OwnerGroup & { facilitatorName: string; facilitatorEmail: string | null };
type FacilitatorRow = { id: string; name: string; email: string; status: string; groupCount: number; published: number };
type PreviewRow = {
  line: number; email: string; firstName: string; lastName: string; churchOrg: string | null; city: string | null; state: string | null;
  group: { title?: string } | null; action: "invite" | "update" | "skip"; notes: string[]; error: string | null;
};

const TEMPLATE = [
  "First Name,Last Name,Email,Phone,Church,City,State,Group Title,Day,Time,Capacity,Format,Start Date",
  "John,Smith,john@example.com,480-555-0100,Grace Church,Chandler,AZ,Tuesday Night Men,Tuesday,6:30pm,10,In person,2027-01-12",
].join("\n");

const MODES: Array<{ value: FinderMode; title: string; hint: string }> = [
  { value: "hidden", title: "Hidden", hint: "Find a Group isn't public. Facilitators set up listings." },
  { value: "preview", title: "Preview", hint: "People can browse groups; requests and messages are off." },
  { value: "open", title: "Open", hint: "Live — people can message facilitators and request spots." },
];

export function FacilitatorsAdmin({
  isSuperAdmin, finder, groups, facilitators, pendingInvites, prefillCount,
}: {
  isSuperAdmin: boolean;
  finder: { mode: FinderMode; opensLabel: string | null };
  groups: AdminGroup[];
  facilitators: FacilitatorRow[];
  pendingInvites: Array<{ email: string; status: string; scheduledFor: string | null; sentAt: string | null }>;
  prefillCount: number;
}) {
  const actionToken = useDashboardActionToken();
  const router = useRouter();

  // Launch switch
  const [mode, setMode] = useState(finder.mode);
  const [opensLabel, setOpensLabel] = useState(finder.opensLabel ?? "");
  const [modeMsg, setModeMsg] = useState<string | null>(null);
  async function saveMode(next: FinderMode) {
    setModeMsg(null);
    try {
      const { settings } = await groupApi<{ settings: { mode: FinderMode } }>("/api/admin/group-finder", "POST", { mode: next, opensLabel }, actionToken);
      setMode(settings.mode);
      setModeMsg("Saved.");
    } catch (e) {
      setModeMsg(e instanceof Error ? e.message : "Couldn't save.");
    }
  }

  // Import
  const fileRef = useRef<HTMLInputElement>(null);
  const [csv, setCsv] = useState("");
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState<PreviewRow[] | null>(null);
  const [sendDate, setSendDate] = useState("");
  const [sendTime, setSendTime] = useState("");
  // Interpreted in the admin's own time zone, then sent as an absolute instant.
  const sendAt = sendDate ? new Date(`${sendDate}T${sendTime || "09:00"}`).toISOString() : "";
  const [importBusy, setImportBusy] = useState(false);
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setImportMsg(null);
    setPreview(null);
    const text = await file.text();
    setCsv(text);
    setFileName(file.name);
    setImportBusy(true);
    try {
      const data = await groupApi<{ rows: PreviewRow[] }>("/api/admin/facilitators/import", "POST", { csv: text, mode: "preview" }, actionToken);
      setPreview(data.rows);
    } catch (e) {
      setImportMsg({ ok: false, text: e instanceof Error ? e.message : "Couldn't read that file." });
    } finally {
      setImportBusy(false);
    }
  }

  async function runImport() {
    setImportBusy(true);
    setImportMsg(null);
    try {
      const { result } = await groupApi<{ result: { invited: number; updated: number; skipped: number; failed: Array<{ line: number; email: string; error: string }> } }>(
        "/api/admin/facilitators/import", "POST", { csv, mode: "commit", sendAt: sendAt || null }, actionToken,
      );
      const parts = [`${result.invited} invited`, `${result.updated} updated`, `${result.skipped} skipped`];
      const failed = result.failed.length ? ` ${result.failed.length} had a problem: ${result.failed.map((f) => `line ${f.line} (${f.email}): ${f.error}`).join("; ")}` : "";
      setImportMsg({ ok: !result.failed.length, text: `${parts.join(" · ")}.${failed}` });
      setPreview(null);
      setCsv("");
      setFileName("");
      router.refresh();
    } catch (e) {
      setImportMsg({ ok: false, text: e instanceof Error ? e.message : "Import failed." });
    } finally {
      setImportBusy(false);
    }
  }

  function downloadTemplate() {
    const url = URL.createObjectURL(new Blob([TEMPLATE], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "facilitator-import-template.csv" });
    a.click();
    URL.revokeObjectURL(url);
  }

  // Group quick actions
  const [busyGroup, setBusyGroup] = useState<string | null>(null);
  async function setStatus(id: string, status: "published" | "closed") {
    setBusyGroup(id);
    try {
      await groupApi(`/api/facilitator/groups/${id}`, "PATCH", { status }, actionToken);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Couldn't update the group.");
    } finally {
      setBusyGroup(null);
    }
  }

  const willInvite = preview?.filter((r) => r.action === "invite").length ?? 0;
  const willUpdate = preview?.filter((r) => r.action === "update").length ?? 0;
  const totals = groups.reduce((a, g) => ({ spots: a.spots + g.capacity, taken: a.taken + g.spotsTaken, pending: a.pending + g.pendingCount }), { spots: 0, taken: 0, pending: 0 });

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ["Facilitators", facilitators.length],
          ["Published groups", groups.filter((g) => g.status === "published").length],
          ["Spots filled", `${totals.taken} / ${totals.spots}`],
          ["Requests waiting", totals.pending],
        ].map(([label, value]) => (
          <Card key={String(label)}><CardContent className="pt-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold text-foreground">{value}</p></CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Find a Group launch</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-3">
            {MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                disabled={!isSuperAdmin}
                onClick={() => saveMode(m.value)}
                className={`rounded-md border p-3 text-left text-sm transition-colors disabled:cursor-not-allowed ${mode === m.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                aria-pressed={mode === m.value}
              >
                <span className="block font-medium text-foreground">{m.title}</span>
                <span className="block text-xs text-muted-foreground">{m.hint}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <div className="space-y-1.5">
              <Label>When requests open (shown to visitors)</Label>
              <Input value={opensLabel} onChange={(e) => setOpensLabel(e.target.value)} placeholder="January 5" className="w-56" disabled={!isSuperAdmin} />
            </div>
            {isSuperAdmin ? <Button variant="outline" onClick={() => saveMode(mode)}>Save</Button> : null}
            <a href="/groups" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 pb-2 text-sm text-primary hover:underline">Open Find a Group <ExternalLink className="h-3.5 w-3.5" /></a>
          </div>
          {modeMsg ? <p className="text-sm text-muted-foreground">{modeMsg}</p> : null}
          {!isSuperAdmin ? <p className="text-xs text-muted-foreground">Only Super Admins can change this.</p> : null}
        </CardContent>
      </Card>

      {isSuperAdmin ? (
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
            <CardTitle>Import facilitators</CardTitle>
            <Button variant="ghost" size="sm" onClick={downloadTemplate}><Download className="mr-1.5 h-4 w-4" /> CSV template</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload a CSV with at least an Email column. Each new person gets a facilitator invitation; anything else in the row
              (church, city, group name, day, time, spots) pre-fills their listing as a draft the first time they sign in.
              {prefillCount ? ` ${prefillCount} imported facilitator${prefillCount === 1 ? " hasn't" : "s haven't"} signed in yet.` : ""}
            </p>
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={importBusy}>
              <Upload className="mr-2 h-4 w-4" /> {fileName ? `Choose a different file (${fileName})` : "Choose CSV file"}
            </Button>

            {preview ? (
              <div className="space-y-3">
                <div className="max-h-96 overflow-auto rounded-md border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow><TableHead>Line</TableHead><TableHead>Facilitator</TableHead><TableHead>Group</TableHead><TableHead>What happens</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.map((r) => (
                        <TableRow key={r.line}>
                          <TableCell className="text-muted-foreground">{r.line}</TableCell>
                          <TableCell>
                            <p className="font-medium">{[r.firstName, r.lastName].filter(Boolean).join(" ") || "—"}</p>
                            <p className="text-xs text-muted-foreground">{r.email || "no email"}{r.churchOrg ? ` · ${r.churchOrg}` : ""}</p>
                          </TableCell>
                          <TableCell className="text-sm">{r.group?.title ?? "—"}</TableCell>
                          <TableCell className="text-sm">
                            <span className={r.error || r.action === "skip" ? "text-destructive" : "text-foreground"}>
                              {r.error ?? (r.action === "invite" ? "Invite" : r.action === "update" ? "Update listing" : "Skip")}
                            </span>
                            {r.notes.map((n) => <span key={n} className="block text-xs text-muted-foreground">{n}</span>)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="space-y-1.5">
                    <Label>Send invitations</Label>
                    <DateTimePicker date={sendDate} time={sendTime} onChange={(d, t) => { setSendDate(d); setSendTime(t); }} placeholder="Now" />
                    <p className="text-xs text-muted-foreground">Leave empty to send now, or pick a date to schedule them.</p>
                  </div>
                  <Button onClick={runImport} disabled={importBusy || willInvite + willUpdate === 0}>
                    {importBusy ? "Importing…" : `Import ${willInvite} new${willUpdate ? ` + update ${willUpdate}` : ""}`}
                  </Button>
                </div>
              </div>
            ) : null}
            {importMsg ? <p className={`text-sm ${importMsg.ok ? "text-primary" : "text-destructive"}`}>{importMsg.text}</p> : null}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader><CardTitle>Groups</CardTitle></CardHeader>
        <CardContent>
          {groups.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Group</TableHead><TableHead>Facilitator</TableHead><TableHead>When</TableHead><TableHead>Spots</TableHead><TableHead>Status</TableHead><TableHead /></TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell>
                        <p className="font-medium">{g.title}</p>
                        <p className="text-xs text-muted-foreground">{g.format === "online" ? "Online" : [g.city, g.state].filter(Boolean).join(", ") || "No location"}</p>
                      </TableCell>
                      <TableCell className="text-sm">{g.facilitatorName}</TableCell>
                      <TableCell className="text-sm">{scheduleLabel(g)}</TableCell>
                      <TableCell className="text-sm">{g.spotsTaken}/{g.capacity}{g.pendingCount ? <span className="ml-1 text-primary">· {g.pendingCount} waiting</span> : null}</TableCell>
                      <TableCell className="text-sm capitalize">{g.status}</TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        <Link href={`/dashboard/facilitator-listing?as=${g.facilitatorId}&group=${g.id}`} className="mr-3 text-sm text-primary hover:underline">Manage</Link>
                        {g.status === "published" ? (
                          <Button size="sm" variant="ghost" onClick={() => setStatus(g.id, "closed")} disabled={busyGroup === g.id}>Unpublish</Button>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => setStatus(g.id, "published")} disabled={busyGroup === g.id}>Publish</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No groups yet. Facilitators create them under Facilitator Listing.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Facilitators</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Account</TableHead><TableHead>Groups</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {facilitators.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{f.email}</TableCell>
                    <TableCell className="text-sm capitalize">{f.status}</TableCell>
                    <TableCell className="text-sm">{f.groupCount ? `${f.published} published / ${f.groupCount}` : "None yet"}</TableCell>
                    <TableCell className="text-right"><Link href={`/dashboard/facilitator-listing?as=${f.id}`} className="text-sm text-primary hover:underline">Manage listing</Link></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {pendingInvites.length ? (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Invited, not signed up yet ({pendingInvites.length})</h3>
              <ul className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                {pendingInvites.map((i) => (
                  <li key={i.email}>
                    {i.email} — {i.status === "failed" ? "email failed" : i.sentAt ? "sent" : i.scheduledFor ? `scheduled ${new Date(i.scheduledFor).toLocaleDateString()}` : "not sent"}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

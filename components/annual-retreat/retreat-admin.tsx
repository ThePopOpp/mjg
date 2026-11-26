"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import type { RetreatReport } from "@/lib/annual-retreat/report";

type Preview = { key: string; timing: string; subject: string; preheader: string; html: string };
type Settings = { guide_version: string; guide_path: string; followups_enabled: boolean; mailing_address: string | null; problems: string[] };

function Stat({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard.writeText(text).then(() => {
        setDone(true);
        window.setTimeout(() => setDone(false), 1500);
      })}
      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
      aria-label="Copy link"
    >
      {done ? <Check className="h-4 w-4 text-[#b88a4a]" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

export function RetreatAdmin({
  report,
  settings: initialSettings,
  isPublic,
  previews,
  links,
  landingUrl,
  guideUrl,
}: {
  report: RetreatReport;
  settings: Settings;
  isPublic: boolean;
  previews: Preview[];
  links: { source: string; content: string; url: string }[];
  landingUrl: string;
  guideUrl: string;
}) {
  const token = useDashboardActionToken();
  const [settings, setSettings] = useState(initialSettings);
  const [address, setAddress] = useState(initialSettings.mailing_address ?? "");
  const [preview, setPreview] = useState(previews[0]?.key);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const post = async (body: Record<string, unknown>) => {
    const res = await fetch("/api/admin/annual-retreat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, actionToken: token }) });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j.error || "Request failed.");
    return j;
  };

  const sendTest = async (key: string) => {
    setBusy(key);
    setMsg(null);
    try {
      const j = await post({ action: "test", key });
      const failed = (j.results as { key: string; status: string; error: string | null }[]).filter((r) => r.status !== "sent");
      setMsg(failed.length ? `Some tests didn't send: ${failed.map((f) => `${f.key} (${f.error ?? f.status})`).join(", ")}` : `Sent to ${j.to}.`);
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const saveSettings = async (patch: Record<string, unknown>) => {
    setBusy("settings");
    setMsg(null);
    try {
      const j = await post({ action: "settings", ...patch });
      setSettings((s) => ({ ...s, ...j.settings, problems: j.settings.mailing_address ? [] : s.problems }));
      setMsg("Saved.");
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const current = previews.find((p) => p.key === preview) ?? previews[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isPublic ? "bg-[#b88a4a]/15 text-[#8a6532]" : "bg-muted text-muted-foreground"}`}>
          Page: {isPublic ? "Public" : "Preview (super admins only)"}
        </span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${settings.followups_enabled ? "bg-[#b88a4a]/15 text-[#8a6532]" : "bg-muted text-muted-foreground"}`}>
          Follow-ups: {settings.followups_enabled ? "On" : "Off"}
        </span>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">Guide v{settings.guide_version}</span>
        <a href={landingUrl} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          Open the page <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <a href={guideUrl} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          Download the guide <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      {msg ? (
        <p role="status" className="rounded-lg border bg-card px-3 py-2 text-sm">
          {msg}
        </p>
      ) : null}

      <Tabs defaultValue="report">
        <TabsList>
          <TabsTrigger value="report">Report</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
          <TabsTrigger value="links">Social links</TabsTrigger>
          <TabsTrigger value="settings">Follow-ups</TabsTrigger>
        </TabsList>

        <TabsContent value="report" className="space-y-4">
          <p className="text-sm text-muted-foreground">Last {report.sinceDays} days. A download is a click, not a sign the guide was read.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Landing-page visits" value={report.visits} detail={`${report.visitors} visitors`} />
            <Stat label="Guide requests" value={report.requests} detail="Successful submissions" />
            <Stat label="Unique contacts" value={report.uniqueContacts} detail="By email address" />
            <Stat label="Follow-up opt-ins" value={report.optIns} detail="Ticked the optional box" />
            <Stat label="Email delivery failures" value={report.emailFailures} detail="Download still offered" />
            <Stat label="Page downloads" value={report.pageDownloads} detail="Thank-you page button" />
            <Stat label="Email-link clicks" value={report.emailClicks} detail="Download links in emails" />
            <Stat label="Next steps" value={`${report.nextSteps.createdForMore} · ${report.nextSteps.steward}`} detail="Created for More · Steward, after requesting" />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">By campaign</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-5">Source · campaign · post</TableHead>
                      <TableHead className="text-right">Visits</TableHead>
                      <TableHead className="pr-5 text-right">Requests</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.campaigns.map((c) => (
                      <TableRow key={c.key}>
                        <TableCell className="pl-5">{c.key}</TableCell>
                        <TableCell className="text-right tabular-nums">{c.visits}</TableCell>
                        <TableCell className="pr-5 text-right tabular-nums">{c.requests}</TableCell>
                      </TableRow>
                    ))}
                    {!report.campaigns.length ? (
                      <TableRow>
                        <TableCell colSpan={3} className="pl-5 text-muted-foreground">
                          No visits yet.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Follow-up series</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-3 text-sm">
                {(
                  [
                    ["Enrolled", report.followups.enrolled],
                    ["Unsubscribed", report.followups.unsubscribed],
                    ["Sent", report.followups.sent],
                    ["Pending", report.followups.pending],
                    ["Skipped", report.followups.skipped],
                    ["Failed", report.followups.failed],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-muted/50 p-2.5">
                    <p className="text-xs text-muted-foreground">{k}</p>
                    <p className="text-lg font-semibold tabular-nums">{v}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent requests</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-5">When</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Follow-ups</TableHead>
                    <TableHead>Email status</TableHead>
                    <TableHead className="pr-5">Campaign</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.recent.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-nowrap pl-5 text-muted-foreground">{new Date(r.created_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</TableCell>
                      <TableCell>{r.email}</TableCell>
                      <TableCell>{r.first_name || "—"}</TableCell>
                      <TableCell>{r.marketing_opt_in ? "Opted in" : "No"}</TableCell>
                      <TableCell className={r.email_status === "sent" ? "" : "text-red-600"}>{r.email_status}</TableCell>
                      <TableCell className="pr-5 text-muted-foreground">{r.campaign ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                  {!report.recent.length ? (
                    <TableRow>
                      <TableCell colSpan={6} className="pl-5 text-muted-foreground">
                        No requests yet.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails" className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" size="sm" onClick={() => sendTest("all")} disabled={busy !== null} className="gap-1.5">
              <Send className="h-4 w-4" /> {busy === "all" ? "Sending…" : "Send all 5 tests to me"}
            </Button>
            <span className="text-xs text-muted-foreground">Tests go to your own address with “[Test]” in the subject, and work while everything is off.</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
            <div className="space-y-1.5">
              {previews.map((p, i) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPreview(p.key)}
                  className={`block w-full rounded-lg border p-3 text-left transition ${p.key === current?.key ? "border-[#b88a4a] bg-[#b88a4a]/10" : "hover:bg-muted"}`}
                >
                  <span className="text-xs text-muted-foreground">Email {i + 1}</span>
                  <span className="block text-sm font-medium">{p.subject}</span>
                  <span className="block text-xs text-muted-foreground">{p.timing}</span>
                </button>
              ))}
            </div>
            {current ? (
              <Card className="min-w-0">
                <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 pb-2">
                  <div className="min-w-0">
                    <CardTitle className="text-base">{current.subject}</CardTitle>
                    <p className="text-xs text-muted-foreground">Preheader: {current.preheader}</p>
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={() => sendTest(current.key)} disabled={busy !== null} className="shrink-0 gap-1.5">
                    <Mail className="h-4 w-4" /> {busy === current.key ? "Sending…" : "Send test"}
                  </Button>
                </CardHeader>
                <CardContent>
                  <iframe title={`Preview: ${current.subject}`} srcDoc={current.html} sandbox="" className="h-[720px] w-full rounded-lg border bg-white" />
                </CardContent>
              </Card>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="links" className="space-y-3">
          <p className="text-sm text-muted-foreground">One link per post and network. Visits and requests from each show in the Report tab.</p>
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-5">Post</TableHead>
                    <TableHead>Network</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead className="w-10 pr-5" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links.map((l) => (
                    <TableRow key={l.url}>
                      <TableCell className="pl-5 font-medium">{l.content}</TableCell>
                      <TableCell className="capitalize">{l.source}</TableCell>
                      <TableCell className="max-w-[520px] truncate font-mono text-xs text-muted-foreground">{l.url}</TableCell>
                      <TableCell className="pr-5">
                        <CopyButton text={l.url} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-5">
              <div>
                <label htmlFor="retreat-address" className="text-sm font-medium">
                  Postal address (footer of every follow-up email)
                </label>
                <Textarea id="retreat-address" value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className="mt-1.5" placeholder="Street, City, State ZIP" />
                <Button type="button" size="sm" variant="outline" className="mt-2" disabled={busy !== null} onClick={() => saveSettings({ mailing_address: address })}>
                  Save address
                </Button>
              </div>
              <div className="flex items-start justify-between gap-4 border-t pt-4">
                <div>
                  <p className="text-sm font-medium">Send the optional follow-ups</p>
                  <p className="text-xs text-muted-foreground">
                    Off until Mike approves the copy. Only people who ticked the optional box are enrolled, and only from the moment this is on. Permission is checked again before each send.
                  </p>
                  {settings.problems.length ? <p className="mt-1 text-xs text-red-600">{settings.problems.join(" ")}</p> : null}
                </div>
                <Switch checked={settings.followups_enabled} disabled={busy !== null || (!settings.followups_enabled && settings.problems.length > 0)} onCheckedChange={(v) => saveSettings({ followups_enabled: v })} aria-label="Send the optional follow-ups" />
              </div>
              <p className="border-t pt-4 text-xs text-muted-foreground">
                Releasing a new guide version: upload it with <code>node scripts/annual-retreat-guide.mjs --upload …</code>, then <code>--release</code> it once approved. Serving now: <code>{settings.guide_path}</code>.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

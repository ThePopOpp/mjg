"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, Mail, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AutomationStatus, AutomationStep, GroupOption } from "@/lib/experiences/automation";
import { cn } from "@/lib/utils";

// Experiences are anchored to Arizona time (the 6-Week Challenge copy says so), and Arizona
// has no DST — so render every date in that zone and label it, rather than in the viewer's
// local time where "8:00 AM" could mean something else.
const TZ = "America/Phoenix";

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    timeZone: TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function relative(iso: string | null) {
  if (!iso) return "";
  const diff = new Date(iso).getTime() - Date.now();
  const days = Math.round(Math.abs(diff) / 86_400_000);
  const hours = Math.round(Math.abs(diff) / 3_600_000);
  const amount = days >= 1 ? `${days} day${days === 1 ? "" : "s"}` : `${hours} hour${hours === 1 ? "" : "s"}`;
  return diff >= 0 ? `in ${amount}` : `${amount} ago`;
}

export function AutomationStatusView({
  groups,
  status,
}: {
  groups: GroupOption[];
  status: AutomationStatus | null;
}) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Group</label>
            <Select
              value={status?.group.id ?? ""}
              onValueChange={(id) => router.push(`/dashboard/experiences/automation?group=${id}`)}
            >
              <SelectTrigger className="w-full sm:max-w-md"><SelectValue placeholder="Select a group…" /></SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name} · {g.attendees} {g.attendees === 1 ? "person" : "people"}
                    {g.typeName ? ` · ${g.typeName}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {status ? (
            <Button asChild variant="outline" className="shrink-0">
              <Link href={`/dashboard/experiences/${status.group.id}`}>Open group</Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>

      {!status ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {groups.length ? "Choose a group to see where its email automation stands." : "No groups yet."}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Anything that needs attention goes first. */}
          {status.totals.overdue > 0 || status.totals.failedEvents > 0 ? (
            <Card className="border-destructive/50">
              <CardContent className="flex items-start gap-3 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                <div className="text-sm">
                  {status.totals.overdue > 0 ? (
                    <p>
                      <span className="font-semibold text-destructive">{status.totals.overdue} email(s) are past their send time</span>{" "}
                      and still queued — the scheduler may not be running.
                    </p>
                  ) : null}
                  {status.totals.failedEvents > 0 ? (
                    <p className="mt-1">
                      <span className="font-semibold text-destructive">{status.totals.failedEvents} send(s) failed.</span> See the
                      rows marked failed below.
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat
              icon={CheckCircle2}
              label="Progress"
              value={`${status.totals.sentSteps} of ${status.totals.steps}`}
              detail="Emails sent"
            />
            <Stat icon={Users} label="Recipients" value={String(status.totals.recipients)} detail="On every email" />
            <Stat
              icon={Mail}
              label="Last sent"
              value={status.lastSentAt ? relative(status.lastSentAt) : "—"}
              detail={fmt(status.lastSentAt)}
            />
            <Stat
              icon={Clock}
              label="Next email"
              value={status.nextSendAt ? relative(status.nextSendAt) : "All sent"}
              detail={status.nextStep?.templateName ?? fmt(status.nextSendAt)}
            />
          </div>

          {/* Progress bar across the sequence */}
          <Card>
            <CardContent className="p-4">
              <div className="mb-2 flex items-baseline justify-between text-sm">
                <span className="font-medium">{status.group.name}</span>
                <span className="text-muted-foreground">
                  {Math.round((status.totals.sentSteps / Math.max(status.totals.steps, 1)) * 100)}% complete
                </span>
              </div>
              <div className="flex gap-0.5">
                {status.steps.map((s) => (
                  <div
                    key={s.stepNumber}
                    title={`${s.stepNumber}. ${s.templateName ?? ""} — ${s.status}`}
                    className={cn(
                      "h-2 flex-1 rounded-sm",
                      s.status === "sent" ? "bg-[#b88a4a]"
                        : s.status === "partial" ? "bg-[#b88a4a]/50"
                        : s.status === "failed" ? "bg-destructive"
                        : "bg-muted",
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Email schedule</CardTitle>
              <p className="text-sm text-muted-foreground">All times Arizona ({TZ.split("/")[1].replace("_", " ")}).</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Email template</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Recipients</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {status.steps.map((s) => (
                      <TableRow key={s.stepNumber} className={s.status === "failed" ? "bg-destructive/5" : undefined}>
                        <TableCell className="text-muted-foreground">{s.stepNumber}</TableCell>
                        <TableCell>
                          <p className="font-medium">{s.templateName ?? "(no template)"}</p>
                          {s.subject ? <p className="max-w-md truncate text-xs text-muted-foreground">{s.subject}</p> : null}
                          {s.errors.length ? (
                            <p className="mt-1 text-xs text-destructive">{s.errors.join(" · ")}</p>
                          ) : null}
                        </TableCell>
                        <TableCell><StatusBadge step={s} /></TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {fmt(s.date)}
                          <span className="block text-xs text-muted-foreground">{relative(s.date)}</span>
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums">
                          {s.status === "sent" || s.status === "partial" ? `${s.sent}/${s.total}` : s.total}
                        </TableCell>
                      </TableRow>
                    ))}
                    {!status.steps.length ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                          This group has no email sequence configured.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function StatusBadge({ step }: { step: AutomationStep }) {
  if (step.status === "sent") return <Badge className="bg-[#b88a4a] text-white hover:bg-[#b88a4a]">Sent</Badge>;
  if (step.status === "partial") return <Badge variant="outline" className="border-[#b88a4a]">Partial {step.sent}/{step.total}</Badge>;
  if (step.status === "failed") return <Badge variant="destructive">Failed</Badge>;
  if (step.status === "none") return <Badge variant="outline" className="text-muted-foreground">Not queued</Badge>;
  return <Badge variant="secondary">Scheduled</Badge>;
}

function Stat({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <Icon className="h-3.5 w-3.5" /> {label}
        </p>
        <p className="mt-1 text-xl font-semibold">{value}</p>
        <p className="truncate text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

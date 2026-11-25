"use client";

import { Fragment, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCardRow } from "@/components/dashboard/stat-card-row";
import { LAYERS, LAYER_MAX, MAX_SCORE } from "@/lib/leadership-check-in/leadership-check-in";
import type { LeadershipSubmission } from "@/lib/leadership-check-in/submissions";

const fmt = (iso: string) => new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
const yesNo = (v: boolean | null) => (v === null ? "Unknown" : v ? "Yes" : "No");

function exportCsv(rows: LeadershipSubmission[]) {
  const esc = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const headers = ["Date", "Name", "Email", "Score", "Max", "Result", ...LAYERS.map((l) => l.title), "Family", "Fitness", "Fun", "Finances", "Cohort", "Source", "Marketing opt-in", "Emailed", "Test"];
  const lines = rows.map((s) => {
    const byKey = new Map((s.layer_scores ?? []).map((l) => [l.key, l.score]));
    const p = s.pillar_scores ?? {};
    return [
      new Date(s.created_at).toISOString(), s.name, s.email, s.total_score, MAX_SCORE, s.stage,
      ...LAYERS.map((l) => byKey.get(l.key) ?? ""), p.Family, p.Fitness, p.Fun, p.Finances,
      s.cohort, s.source, yesNo(s.marketing_opt_in), s.emailed ? "Yes" : "No", s.test ? "Yes" : "No",
    ].map(esc).join(",");
  });
  const blob = new Blob(["﻿" + [headers.map(esc).join(","), ...lines].join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leadership-check-ins-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Admin view. Reflections are never loaded here. Test results are excluded from the stats. */
export function LeadershipResults({ submissions, starts }: { submissions: LeadershipSubmission[]; starts: number | null }) {
  const [open, setOpen] = useState<string | null>(null);
  const [showTests, setShowTests] = useState(false);
  const real = useMemo(() => submissions.filter((s) => !s.test), [submissions]);
  const rows = showTests ? submissions : real;

  const stats = useMemo(() => {
    const people = new Set(real.map((s) => s.profile_id ?? s.email?.toLowerCase() ?? s.id));
    const scores = real.map((s) => s.total_score).filter((n): n is number => typeof n === "number");
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
    const optIns = real.filter((s) => s.marketing_opt_in === true).length;
    return { completions: real.length, people: people.size, avg, optIns };
  }, [real]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Leadership Check-Ins</h3>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowTests((v) => !v)}>
            {showTests ? "Hide" : "Show"} test results ({submissions.length - real.length})
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => exportCsv(rows)} disabled={!rows.length}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>
      <StatCardRow className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Starts" value={starts === null ? "Unknown" : String(starts)} detail="Answered a first statement" />
        <Stat label="Completions" value={String(stats.completions)} detail="Excludes tests" />
        <Stat label="Unique participants" value={String(stats.people)} detail="By account or email" />
        <Stat label="Average score" value={stats.avg != null ? `${stats.avg} / ${MAX_SCORE}` : "—"} detail="Not comparable with Created for More" />
        <Stat label="Marketing opt-ins" value={String(stats.optIns)} detail="Separate from results delivery" />
      </StatCardRow>

      <Card><CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Cohort</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s) => {
                const isOpen = open === s.id;
                return (
                  <Fragment key={s.id}>
                    <TableRow className="cursor-pointer" onClick={() => setOpen(isOpen ? null : s.id)}>
                      <TableCell>{isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{fmt(s.created_at)}</TableCell>
                      <TableCell className="font-medium">
                        {s.name || "—"}
                        {s.test ? <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">Test</span> : null}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{s.email || "—"}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{s.total_score ?? "—"}<span className="text-xs font-normal text-muted-foreground">/{MAX_SCORE}</span></TableCell>
                      <TableCell>{s.stage || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{s.source || "Unknown"}</TableCell>
                      <TableCell className="text-muted-foreground">{s.cohort || "—"}</TableCell>
                    </TableRow>
                    {isOpen ? (
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableCell colSpan={8} className="p-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                              {(s.layer_scores ?? []).map((l) => (
                                <div key={l.key} className="flex items-center gap-2 text-sm">
                                  <span className="min-w-0 flex-1 truncate">{l.title} <span className="text-xs text-muted-foreground">· {l.status}</span></span>
                                  <span className="h-1.5 w-24 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-[#b88a4a]" style={{ width: `${(l.score / LAYER_MAX) * 100}%` }} /></span>
                                  <span className="w-12 text-right font-medium tabular-nums">{l.score}/{LAYER_MAX}</span>
                                </div>
                              ))}
                            </div>
                            <div className="space-y-2 text-sm">
                              <p><span className="text-muted-foreground">Four Pillars: </span>{s.pillar_scores ? Object.entries(s.pillar_scores).map(([k, v]) => `${k} ${v}/5`).join(" · ") : "—"}</p>
                              <p><span className="text-muted-foreground">Highest: </span>{s.strongest_layer || "—"}</p>
                              <p><span className="text-muted-foreground">Lowest: </span>{s.lowest_layer || "—"}</p>
                              <p>
                                <span className="text-muted-foreground">Results emailed: </span>{s.emailed ? "Yes" : "No"}
                                {" · "}<span className="text-muted-foreground">Marketing opt-in: </span>{yesNo(s.marketing_opt_in)}
                              </p>
                              <p className="text-xs text-muted-foreground">Optional reflections are private to the participant and are not shown here.</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </Fragment>
                );
              })}
              {!rows.length ? (
                <TableRow><TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">No Leadership Check-Ins yet.</TableCell></TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </CardContent></Card>
    </div>
  );
}

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card><CardContent className="p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </CardContent></Card>
  );
}

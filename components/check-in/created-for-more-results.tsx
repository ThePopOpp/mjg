"use client";

import { Fragment, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { pathwayLabels, type CheckInSubmission } from "@/lib/check-in/submissions";
import { LAYERS, MAX_SCORE } from "@/lib/check-in/created-for-more";

function fmt(iso: string) {
  return new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

// Build + download a CSV of all submissions (one row each; a column per layer).
function exportCsv(submissions: CheckInSubmission[]) {
  const esc = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  const headers = [
    "Date", "Name", "Email", "Score", "Max", "Stage", "Strongest layer", "Lowest layer", "Lowest pillar",
    ...LAYERS.map((l) => l.title), "Next steps",
  ];
  const rows = submissions.map((s) => {
    const byKey = new Map((s.layer_scores ?? []).map((l) => [l.key, l.score]));
    const steps = pathwayLabels(s.chosen_pathways?.length ? s.chosen_pathways : s.chosen_pathway ? [s.chosen_pathway] : []);
    return [
      new Date(s.created_at).toISOString(), s.name ?? "", s.email ?? "", s.total_score ?? "", MAX_SCORE,
      s.stage ?? "", s.strongest_layer ?? "", s.lowest_layer ?? "", s.lowest_pillar ?? "",
      ...LAYERS.map((l) => byKey.get(l.key) ?? ""), steps.join("; "),
    ].map(esc).join(",");
  });
  const csv = [headers.map(esc).join(","), ...rows].join("\r\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `created-for-more-check-ins-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function CreatedForMoreResults({ submissions }: { submissions: CheckInSubmission[] }) {
  const [open, setOpen] = useState<string | null>(null);

  const stats = useMemo(() => {
    const scores = submissions.map((s) => s.total_score).filter((n): n is number => typeof n === "number");
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
    const named = submissions.filter((s) => s.email).length;
    return { count: submissions.length, avg, named };
  }, [submissions]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Created for More Check-Ins</h3>
        <Button type="button" variant="outline" size="sm" onClick={() => exportCsv(submissions)} disabled={!submissions.length}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Check-Ins completed" value={String(stats.count)} detail="Created for More" />
        <Stat label="Average score" value={stats.avg != null ? `${stats.avg} / ${MAX_SCORE}` : "—"} detail="Across all submissions" />
        <Stat label="With contact info" value={String(stats.named)} detail="Provided an email" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Lowest layer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((s) => {
                  const isOpen = open === s.id;
                  return (
                    <Fragment key={s.id}>
                      <TableRow className="cursor-pointer" onClick={() => setOpen(isOpen ? null : s.id)}>
                        <TableCell>{isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">{fmt(s.created_at)}</TableCell>
                        <TableCell className="font-medium">{s.name || "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{s.email || "—"}</TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">{s.total_score ?? "—"}<span className="text-xs font-normal text-muted-foreground">/{MAX_SCORE}</span></TableCell>
                        <TableCell>{s.stage || "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{s.lowest_layer || "—"}{s.lowest_pillar ? ` · ${s.lowest_pillar}` : ""}</TableCell>
                      </TableRow>
                      {isOpen ? (
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                          <TableCell colSpan={7} className="p-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Layer breakdown</p>
                                <div className="space-y-1.5">
                                  {(s.layer_scores ?? []).map((l) => (
                                    <div key={l.key} className="flex items-center gap-2 text-sm">
                                      <span className="min-w-0 flex-1 truncate">{l.title}</span>
                                      <span className="h-1.5 w-24 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-primary" style={{ width: `${(l.score / 20) * 100}%` }} /></span>
                                      <span className="w-12 text-right font-medium tabular-nums">{l.score}/20</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Strongest layer</p>
                                <p className="mb-3 text-sm">{s.strongest_layer || "—"}</p>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Requested next steps</p>
                                {pathwayLabels(s.chosen_pathways?.length ? s.chosen_pathways : s.chosen_pathway ? [s.chosen_pathway] : []).length ? (
                                  <ul className="list-inside list-disc space-y-0.5 text-sm text-muted-foreground">
                                    {pathwayLabels(s.chosen_pathways?.length ? s.chosen_pathways : s.chosen_pathway ? [s.chosen_pathway] : []).map((label, i) => (
                                      <li key={i}>{label}</li>
                                    ))}
                                  </ul>
                                ) : <p className="text-sm text-muted-foreground">None selected.</p>}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </Fragment>
                  );
                })}
                {!submissions.length ? (
                  <TableRow><TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">No Created for More Check-Ins yet. Completed assessments will appear here.</TableCell></TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
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

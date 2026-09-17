"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SECTION_MAX, TOTAL_MAX, sectionByKey } from "@/lib/energy-audit/energy-audit";
import type { EnergyAuditStats, EnergyAuditSubmission } from "@/lib/energy-audit/submissions";
import { cn } from "@/lib/utils";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Deliberately score + interpretation + lowest energy only — enough to see who needs
// attention without exposing what anyone wrote in their reflections.
export function EnergyAuditAdmin({ audits, stats }: { audits: EnergyAuditSubmission[]; stats: EnergyAuditStats }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return audits;
    return audits.filter((a) =>
      [a.name, a.email, a.stage].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [audits, query]);

  const maxLowest = Math.max(1, ...stats.byLowest.map((l) => l.count));
  const maxBand = Math.max(1, ...stats.byInterpretation.map((b) => b.count));

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Audits completed" value={String(stats.count)} detail={`${stats.people} ${stats.people === 1 ? "person" : "people"}`} />
        <Stat label="Average score" value={stats.averageScore != null ? `${stats.averageScore}` : "—"} detail={`out of ${TOTAL_MAX}`} />
        <Stat label="Last 7 days" value={String(stats.last7)} detail="New completions" />
        <Stat
          label="Most depleted energy"
          value={stats.byLowest.reduce((a, b) => (b.count > a.count ? b : a), stats.byLowest[0])?.label.replace(" Energy", "") ?? "—"}
          detail="Lowest most often"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Where people are most depleted</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {stats.byLowest.map((l) => (
              <div key={l.key} className="space-y-1">
                <div className="flex items-baseline justify-between text-sm">
                  <span>{l.label}</span>
                  <span className="tabular-nums text-muted-foreground">{l.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-[#b88a4a]" style={{ width: `${(l.count / maxLowest) * 100}%` }} />
                </div>
              </div>
            ))}
            <p className="pt-1 text-xs text-muted-foreground">
              How often each energy came out lowest — the audience&rsquo;s weakest layer overall.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Score distribution</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {stats.byInterpretation.map((b) => (
              <div key={b.label} className="space-y-1">
                <div className="flex items-baseline justify-between text-sm">
                  <span>{b.label}</span>
                  <span className="tabular-nums text-muted-foreground">{b.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(b.count / maxBand) * 100}%` }} />
                </div>
              </div>
            ))}
            <div className="grid grid-cols-4 gap-2 border-t pt-3">
              {stats.averageBySource.map((s) => (
                <div key={s.key} className="text-center">
                  <p className="text-sm font-semibold tabular-nums">{s.average}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label.replace(" Energy", "")}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Average score per energy, out of {SECTION_MAX}.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle className="text-base">Completions ({filtered.length})</CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email, result" className="pl-8" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Person</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Renewing</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead className="text-right">Report</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => {
                  const focusKey = a.details?.nextStep?.lowestEnergySource ?? a.lowest_layer;
                  const pct = ((a.total_score ?? 0) / TOTAL_MAX) * 100;
                  return (
                    <TableRow key={a.id}>
                      <TableCell>
                        <p className="font-medium">{a.name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{a.email || "No email"}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold tabular-nums">{a.total_score ?? "—"}</span>
                        <span className="text-xs text-muted-foreground"> / {TOTAL_MAX}</span>
                        <div className="mt-1 ml-auto h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-[#b88a4a]" style={{ width: `${pct}%` }} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", bandTone(a.stage))}>{a.stage ?? "—"}</span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {focusKey ? sectionByKey(focusKey).title.replace(" Energy", "") : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{fmtDate(a.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm">
                          <a href={`/api/energy-audit/${a.id}/pdf`} title="Download PDF">
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download PDF</span>
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!filtered.length ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      {audits.length ? "No completions match that search." : "No Energy Audits completed yet."}
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

// Gold for healthy, neutral ink for the lower bands — never green, never alarming red.
function bandTone(stage: string | null) {
  if (stage === "Fully Engaged and Renewing") return "bg-[#b88a4a]/15 text-[#8a6d33] dark:text-[#e2ca9a]";
  if (stage === "Running Warm") return "bg-muted text-foreground";
  if (stage === "Running on Reserves") return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
  if (stage) return "bg-destructive/10 text-destructive";
  return "bg-muted text-muted-foreground";
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

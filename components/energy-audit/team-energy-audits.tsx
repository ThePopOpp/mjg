import Link from "next/link";
import { BatteryCharging, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TOTAL_MAX, sectionByKey } from "@/lib/energy-audit/energy-audit";
import type { EnergyAuditSubmission } from "@/lib/energy-audit/submissions";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/**
 * A facilitator's view of their team's Energy Audits: score, result, which energy each person
 * is renewing, and the PDF. Reflections are intentionally not shown — those stay private to
 * the person who wrote them (see EnergyAuditDetail's showReflections).
 */
export function TeamEnergyAudits({ audits, teamSize }: { audits: EnergyAuditSubmission[]; teamSize: number }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <BatteryCharging className="h-4 w-4 text-[#b88a4a]" />
          Team Energy Audits
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {audits.length} of {teamSize} {teamSize === 1 ? "person" : "people"}
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {audits.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  <th className="px-4 py-2.5 font-medium text-muted-foreground">Person</th>
                  <th className="px-4 py-2.5 font-medium text-muted-foreground">Score</th>
                  <th className="px-4 py-2.5 font-medium text-muted-foreground">Result</th>
                  <th className="px-4 py-2.5 font-medium text-muted-foreground">Renewing</th>
                  <th className="px-4 py-2.5 font-medium text-muted-foreground">Completed</th>
                  <th className="px-4 py-2.5 font-medium text-muted-foreground">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {audits.map((a) => {
                  const focusKey = a.details?.nextStep?.lowestEnergySource ?? a.lowest_layer;
                  return (
                    <tr key={a.id}>
                      <td className="px-4 py-2.5">
                        <p className="font-medium">{a.name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{a.email}</p>
                      </td>
                      <td className="px-4 py-2.5 font-semibold tabular-nums">
                        {a.total_score ?? "—"} <span className="font-normal text-muted-foreground">/ {TOTAL_MAX}</span>
                      </td>
                      <td className="px-4 py-2.5">{a.stage ?? "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {focusKey ? sectionByKey(focusKey).title.replace(" Energy", "") : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(a.created_at)}</td>
                      <td className="px-4 py-2.5">
                        <Link href={`/api/energy-audit/${a.id}/pdf`} className="inline-flex items-center gap-1 text-sm font-medium text-[#b88a4a] hover:underline">
                          <Download className="h-3.5 w-3.5" /> PDF
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-6 text-center text-sm text-muted-foreground">
            Nobody on your team has completed the Energy Audit yet. You&rsquo;ll get a notification when they do.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

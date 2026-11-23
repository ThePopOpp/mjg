import Link from "next/link";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { LEAD_SEGMENTS, LEAD_STAGES } from "@/lib/tools/leads";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Leads — Contacts — MJG" };

// The prospecting pipeline: contacts of type 'lead' with the stage/segment columns
// from migration 202611230147, filled by people and the Paperclip lead agents
// (lib/tools/leads.ts). Read-only here; edit a lead from Contacts.

const SEGMENT_LABELS: Record<string, string> = { church: "Churches & pastors", facilitator: "Facilitators", individual: "Individuals", partner: "Partners & speaking" };
const STAGE_LABELS: Record<string, string> = {
  new: "New", researched: "Researched", contacted: "Contacted", replied: "Replied",
  qualified: "Qualified", converted: "Converted", disqualified: "Disqualified",
};

type Lead = {
  id: string; first_name: string | null; last_name: string | null; email: string | null; company: string | null; church: string | null;
  job_title: string | null; website: string | null; city: string | null; state: string | null; lead_segment: string | null;
  lead_stage: string | null; source: string | null; found_by: string | null; last_contacted_at: string | null; created_at: string;
};

export default async function LeadsPage({ searchParams }: { searchParams?: Promise<{ segment?: string; stage?: string }> }) {
  const params = (await searchParams) ?? {};
  const segment = LEAD_SEGMENTS.includes(params.segment as any) ? params.segment! : null;
  const stage = LEAD_STAGES.includes(params.stage as any) ? params.stage! : null;
  const supabase = createSupabaseAdminClient();

  const [{ data: counts }, leadsRes] = await Promise.all([
    supabase.from("contacts").select("lead_segment, lead_stage").eq("type", "lead").is("deleted_at", null).limit(10000),
    (() => {
      let q = supabase
        .from("contacts")
        .select("id, first_name, last_name, email, company, church, job_title, website, city, state, lead_segment, lead_stage, source, found_by, last_contacted_at, created_at")
        .eq("type", "lead")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(200);
      if (segment) q = q.eq("lead_segment", segment);
      if (stage) q = q.eq("lead_stage", stage);
      return q;
    })(),
  ]);
  const leads = (leadsRes.data ?? []) as Lead[];
  const all = counts ?? [];
  const inSegment = segment ? all.filter((r) => r.lead_segment === segment) : all;
  const stageCount = (s: string) => inSegment.filter((r) => (r.lead_stage ?? "new") === s).length;
  const href = (next: { segment?: string | null; stage?: string | null }) => {
    const p = new URLSearchParams();
    const seg = next.segment === undefined ? segment : next.segment;
    const stg = next.stage === undefined ? stage : next.stage;
    if (seg) p.set("segment", seg);
    if (stg) p.set("stage", stg);
    const qs = p.toString();
    return `/dashboard/contacts/leads${qs ? `?${qs}` : ""}`;
  };
  const chip = (active: boolean) =>
    cn("rounded-md px-3 py-1.5 text-sm font-medium transition-colors", active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground");

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Contacts"
        title="Leads"
        description="Prospects found by your team and the lead agents: churches and pastors, facilitators, individuals, and partners. Every lead records where its contact details were published."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap gap-1 rounded-lg border bg-card p-1" aria-label="Segment">
          <Link href={href({ segment: null })} className={chip(!segment)}>All ({all.length})</Link>
          {LEAD_SEGMENTS.map((s) => (
            <Link key={s} href={href({ segment: s })} className={chip(segment === s)}>
              {SEGMENT_LABELS[s]} ({all.filter((r) => r.lead_segment === s).length})
            </Link>
          ))}
        </nav>
        <Link href="/dashboard/contacts" className="text-sm font-medium text-primary hover:underline">All contacts →</Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
        {LEAD_STAGES.map((s) => (
          <Link
            key={s}
            href={href({ stage: stage === s ? null : s })}
            className={cn("rounded-lg border bg-card p-3 transition-colors hover:border-primary", stage === s && "border-primary ring-1 ring-primary")}
            aria-current={stage === s ? "true" : undefined}
          >
            <p className="text-xs font-medium text-muted-foreground">{STAGE_LABELS[s]}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{stageCount(s)}</p>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {stage ? STAGE_LABELS[stage] : "All stages"}
            {segment ? ` · ${SEGMENT_LABELS[segment]}` : ""} <span className="font-normal text-muted-foreground">({leads.length}{leads.length === 200 ? "+" : ""})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Segment</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Found by</TableHead>
                    <TableHead className="text-right">Added</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>
                        <div className="font-medium">{[l.first_name, l.last_name].filter(Boolean).join(" ") || "—"}</div>
                        <div className="text-xs text-muted-foreground">{[l.job_title, l.email].filter(Boolean).join(" · ")}</div>
                      </TableCell>
                      <TableCell>
                        <div>{l.church ?? l.company ?? "—"}</div>
                        {l.website ? (
                          <a href={/^https?:\/\//.test(l.website) ? l.website : `https://${l.website}`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                            {l.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                          </a>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{l.lead_segment ? SEGMENT_LABELS[l.lead_segment] : "—"}</TableCell>
                      <TableCell>{STAGE_LABELS[l.lead_stage ?? "new"]}</TableCell>
                      <TableCell className="text-muted-foreground">{[l.city, l.state].filter(Boolean).join(", ") || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{l.found_by?.replace(/^agent:/, "Agent · ") ?? l.source ?? "—"}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {new Date(l.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Phoenix" })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No leads here yet. Give the Church Prospector or Partner Scout agent a task, or ask Claude to import a list with leads_import.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

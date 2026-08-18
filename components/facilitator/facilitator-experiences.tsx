"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutList, Table as TableIcon, Columns3, CalendarDays, Sparkles, ClipboardList } from "lucide-react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EmailCalendar } from "@/components/experiences/experiences-list";
import { TeamResultsTabs } from "@/components/facilitator/team-results-tabs";
import { StartChallengeLauncher } from "@/components/facilitator/start-challenge-modal";
import { cn } from "@/lib/utils";
import { FREQUENCY_LABELS, type EmailEvent } from "@/lib/experiences/types";
import type { FacilitatorExperience } from "@/lib/facilitator/experiences";

type TypeOption = { id: string; name: string; category: string | null; defaultFrequency: string; defaultDurationWeeks: number };
type View = "list" | "table" | "kanban" | "calendar";

const STATUS_TONE: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-primary/15 text-primary",
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  completed: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  cancelled: "bg-destructive/15 text-destructive",
};
function StatusChip({ s }: { s: string }) {
  return <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize", STATUS_TONE[s] ?? "bg-muted text-muted-foreground")}>{s}</span>;
}
function freqLabel(f: string) {
  return FREQUENCY_LABELS[f as keyof typeof FREQUENCY_LABELS] ?? f;
}

export function FacilitatorExperiences({
  experiences,
  emailEvents,
  types,
  results,
  teamMembers,
  canStartChallenge,
}: {
  experiences: FacilitatorExperience[];
  emailEvents: EmailEvent[];
  types: TypeOption[];
  results: { checkIns: any[]; surveys: any[]; submissions: any[] };
  teamMembers: { name: string; email: string }[];
  canStartChallenge: boolean;
}) {
  const [active, setActive] = useState<FacilitatorExperience | null>(null);

  return (
    <>
      <Tabs defaultValue="experiences">
        <TabsList>
          <TabsTrigger value="experiences"><Sparkles className="mr-2 h-4 w-4" /> Experiences</TabsTrigger>
          <TabsTrigger value="new"><Sparkles className="mr-2 h-4 w-4" /> New Experiences</TabsTrigger>
          <TabsTrigger value="results"><ClipboardList className="mr-2 h-4 w-4" /> Results</TabsTrigger>
        </TabsList>

        <TabsContent value="experiences" className="mt-4">
          <ExperienceViews experiences={experiences} emailEvents={emailEvents} onOpen={setActive} />
        </TabsContent>
        <TabsContent value="new" className="mt-4 space-y-6">
          {canStartChallenge ? (
            <div className="rounded-xl border border-primary/30 bg-primary/[0.03] p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">Launch the 6-Week Challenge for your group</p>
                  <p className="text-sm text-muted-foreground">Add participants, choose weekly or bi-weekly, invite them, and start the series.</p>
                </div>
                <StartChallengeLauncher teamMembers={teamMembers} />
              </div>
            </div>
          ) : null}
          {types.length ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Other experiences</p>
              <NewExperiencesGrid types={types} />
            </div>
          ) : !canStartChallenge ? (
            <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No challenges have been assigned to you yet. Ask a Super Admin to grant access under User Management.</CardContent></Card>
          ) : null}
        </TabsContent>
        <TabsContent value="results" className="mt-4">
          <TeamResultsTabs checkIns={results.checkIns} surveys={results.surveys} submissions={results.submissions as any} />
        </TabsContent>
      </Tabs>

      <OverviewModal experience={active} onClose={() => setActive(null)} />
    </>
  );
}

function ExperienceViews({ experiences, emailEvents, onOpen }: { experiences: FacilitatorExperience[]; emailEvents: EmailEvent[]; onOpen: (e: FacilitatorExperience) => void }) {
  const [view, setView] = useState<View>("list");
  const views: { key: View; label: string; icon: typeof LayoutList }[] = [
    { key: "list", label: "List", icon: LayoutList },
    { key: "table", label: "Table", icon: TableIcon },
    { key: "kanban", label: "Kanban", icon: Columns3 },
    { key: "calendar", label: "Calendar", icon: CalendarDays },
  ];

  if (!experiences.length && view !== "calendar") {
    return <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No experiences assigned to you yet. Pick one under “New Experiences”.</CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-md border bg-card p-0.5">
        {views.map((v) => (
          <button key={v.key} type="button" onClick={() => setView(v.key)} className={cn("inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors", view === v.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
            <v.icon className="h-4 w-4" /> {v.label}
          </button>
        ))}
      </div>

      {view === "calendar" ? (
        <EmailCalendar events={emailEvents} />
      ) : view === "table" ? (
        <Card><CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Cadence</TableHead><TableHead>Attendees</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {experiences.map((e) => (
                <TableRow key={e.id} className="cursor-pointer" onClick={() => onOpen(e)}>
                  <TableCell className="font-medium">{e.name}</TableCell>
                  <TableCell>{e.type_name ?? "-"}</TableCell>
                  <TableCell>{freqLabel(e.frequency)}</TableCell>
                  <TableCell>{e.attendee_count}</TableCell>
                  <TableCell><StatusChip s={e.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent></Card>
      ) : view === "kanban" ? (
        <KanbanView experiences={experiences} onOpen={onOpen} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {experiences.map((e) => (
            <button key={e.id} type="button" onClick={() => onOpen(e)} className="rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary/50">
              <div className="flex items-start justify-between gap-2">
                <div><p className="text-xs uppercase tracking-wide text-muted-foreground">{e.type_name ?? "Experience"}</p><p className="mt-0.5 font-semibold">{e.name}</p></div>
                <StatusChip s={e.status} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{freqLabel(e.frequency)} · {e.duration_weeks} steps · {e.attendee_count} attendees</p>
              {e.preview ? <p className="mt-1 text-xs text-primary">Overview available →</p> : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function KanbanView({ experiences, onOpen }: { experiences: FacilitatorExperience[]; onOpen: (e: FacilitatorExperience) => void }) {
  const cols = ["draft", "scheduled", "active", "completed"];
  const byStatus = useMemo(() => {
    const m = new Map<string, FacilitatorExperience[]>();
    for (const e of experiences) m.set(e.status, [...(m.get(e.status) ?? []), e]);
    return m;
  }, [experiences]);
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {cols.map((c) => (
        <div key={c} className="w-64 shrink-0">
          <div className="mb-2 flex items-center justify-between rounded-md bg-muted px-3 py-1.5 text-sm font-medium capitalize"><span>{c}</span><span className="text-muted-foreground">{(byStatus.get(c) ?? []).length}</span></div>
          <div className="space-y-2">
            {(byStatus.get(c) ?? []).map((e) => (
              <button key={e.id} type="button" onClick={() => onOpen(e)} className="w-full rounded-lg border bg-card p-3 text-left hover:border-primary/50">
                <p className="text-sm font-medium">{e.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{freqLabel(e.frequency)} · {e.attendee_count} attendees</p>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function NewExperiencesGrid({ types }: { types: TypeOption[] }) {
  const router = useRouter();
  const actionToken = useDashboardActionToken();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const g: Record<string, TypeOption[]> = {};
    for (const t of types) (g[t.category || "Other"] ||= []).push(t);
    return g;
  }, [types]);

  async function assign(t: TypeOption) {
    setBusy(t.id);
    setError(null);
    try {
      const res = await fetch("/api/facilitator/experiences/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionToken, typeId: t.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to assign.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Select an experience to assign it to you and your team. It&apos;s created as a draft for your team.</p>
      {Object.entries(grouped).map(([category, list]) => (
        <div key={category} className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{category}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {list.map((t) => (
              <button key={t.id} type="button" disabled={busy !== null} onClick={() => assign(t)} className="rounded-lg border p-4 text-left transition-colors hover:border-primary/40 disabled:opacity-60">
                <p className="font-medium">{t.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{busy === t.id ? "Assigning…" : `Default: ${freqLabel(t.defaultFrequency)} · ${t.defaultDurationWeeks} steps`}</p>
              </button>
            ))}
          </div>
        </div>
      ))}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function OverviewModal({ experience, onClose }: { experience: FacilitatorExperience | null; onClose: () => void }) {
  const p = experience?.preview ?? null;
  return (
    <Dialog open={experience !== null} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{p?.title || experience?.name}</DialogTitle>
          <DialogDescription>
            {experience ? `${experience.type_name ?? "Experience"} · ${freqLabel(experience.frequency)} · ${experience.duration_weeks} steps` : ""}
          </DialogDescription>
        </DialogHeader>
        {experience && (
          <div className="space-y-4">
            {p?.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image_url} alt="" className="w-full rounded-lg object-cover" />
            ) : null}
            {p?.content ? <p className="whitespace-pre-wrap text-sm leading-6">{p.content}</p> : <p className="text-sm text-muted-foreground">No overview was added for this experience.</p>}
            {p?.video_url ? (
              <div className="aspect-video w-full overflow-hidden rounded-lg border">
                <iframe src={p.video_url} className="h-full w-full" allowFullScreen title="Video" />
              </div>
            ) : null}
            {p?.audio_url ? <audio controls preload="none" src={p.audio_url} className="w-full" /> : null}
            {p?.document_url ? <a href={p.document_url} target="_blank" rel="noopener noreferrer" className="inline-flex text-sm font-medium text-primary hover:underline">Open document →</a> : null}
            {p?.frequency_label ? <p className="text-xs text-muted-foreground">Frequency: {p.frequency_label}</p> : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

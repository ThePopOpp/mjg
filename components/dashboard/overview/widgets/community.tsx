"use client";

import Link from "next/link";
import { useState } from "react";
import { Activity, CheckCircle2, Church, CircleUserRound, EyeOff, MailCheck, Sparkles, UsersRound, X } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { InvitationStats } from "@/components/dashboard/invitation-stats";
import { CollapsibleSection } from "@/components/dashboard/collapsible-section";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DashboardInvitation } from "@/lib/user-management/repository";
import { allowed } from "@/lib/dashboard/overview/catalog";
import { WHATS_NEW } from "@/lib/dashboard/overview/whats-new";
import { useOverview } from "../overview-context";
import { Rail } from "../rail";
import { useWidgetData } from "../use-widget-data";
import { ErrorState, Pill, Skeleton, type WidgetProps } from "./kit";

type Community = {
  participants: number;
  checkIns: { count: number; averageScore: number | null };
  pilot: { journeyStarted: number; pastorElderResponses: number; innerCircle: number; followUpPermission: number; surveyCompleted: number };
  waves: { wave: string; invited: number; optedIn: number; completed: number; survey: number }[];
  recent: { id: string; name: string | null; email: string | null; total_score: number | null; stage: string | null; created_at: string }[];
  seen: Record<string, number>;
  error: string | null;
};

function useCommunity() {
  return useWidgetData<Community>("community", undefined, 300_000);
}

function SectionSkeleton({ h = "h-40" }: { h?: string }) {
  return <Skeleton className={`${h} w-full rounded-2xl`} />;
}

export function InvitationsWidget() {
  const state = useWidgetData<{ counts: { sent: number; pending: number; accepted: number }; invitations: DashboardInvitation[] }>("invitations", undefined, 300_000);
  return (
    <section aria-label="Invitations" className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Invitations</h2>
        <Link href="/dashboard/user-management" className="text-sm font-medium text-primary hover:underline">
          Manage →
        </Link>
      </div>
      {state.error && !state.data ? <ErrorState message={state.error} onRetry={state.reload} /> : state.data ? <InvitationStats counts={state.data.counts} invitations={state.data.invitations} /> : <SectionSkeleton h="h-28" />}
    </section>
  );
}

export function CommunityMetricsWidget() {
  const state = useCommunity();
  const d = state.data;
  const metrics = d
    ? [
        { label: "Total participants", value: String(d.participants), detail: "Created for More records", icon: UsersRound },
        { label: "Check-In completed", value: String(d.checkIns.count), detail: d.checkIns.averageScore != null ? `Average score ${d.checkIns.averageScore}` : "Created for More", icon: CheckCircle2 },
        { label: "7-day journey started", value: String(d.pilot.journeyStarted), detail: "Email journey records", icon: MailCheck },
        { label: "Pastor/Elder responses", value: String(d.pilot.pastorElderResponses), detail: "Reviewer survey responses", icon: Church },
        { label: "Inner Circle accepted", value: String(d.pilot.innerCircle), detail: "Accepted invitations", icon: CircleUserRound },
        { label: "Follow-up permission", value: String(d.pilot.followUpPermission), detail: "Follow-up ready", icon: Activity },
      ]
    : [];
  return (
    <section aria-label="Community" className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">Community</h2>
      {state.error && !d ? (
        <ErrorState message={state.error} onRetry={state.reload} />
      ) : d ? (
        <Rail visible={3.5} label="community metrics">
          {metrics.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </Rail>
      ) : (
        <SectionSkeleton h="h-28" />
      )}
    </section>
  );
}

export function RecentCheckInsWidget() {
  const state = useCommunity();
  const d = state.data;
  if (!d) return state.error ? <ErrorState message={state.error} onRetry={state.reload} /> : <SectionSkeleton />;
  return (
    <CollapsibleSection
      title="Recent Check-Ins"
      count={d.checkIns.count}
      sectionKey="recent_check_ins"
      isNew={d.checkIns.count > (d.seen.recent_check_ins ?? 0)}
      detailHref="/dashboard/check-in-results"
      detailLabel="View all check-ins"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-5">Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>When</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {d.recent.map((ci) => (
            <TableRow key={ci.id}>
              <TableCell className="pl-5 font-medium">{ci.name || "—"}</TableCell>
              <TableCell className="text-muted-foreground">{ci.email || "—"}</TableCell>
              <TableCell className="tabular-nums">{ci.total_score ?? "—"}</TableCell>
              <TableCell>{ci.stage || "—"}</TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">{new Date(ci.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}</TableCell>
            </TableRow>
          ))}
          {!d.recent.length ? (
            <TableRow>
              <TableCell colSpan={5} className="pl-5 text-muted-foreground">
                No check-ins yet.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </CollapsibleSection>
  );
}

export function WavesWidget() {
  const state = useCommunity();
  const d = state.data;
  if (!d) return state.error ? <ErrorState message={state.error} onRetry={state.reload} /> : <SectionSkeleton />;
  return (
    <CollapsibleSection className="h-full min-w-0" title="Wave summary" count={d.participants} sectionKey="wave_summary" isNew={d.participants > (d.seen.wave_summary ?? 0)} detailHref="/dashboard/participants" detailLabel="View participants">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-5">Wave</TableHead>
            <TableHead>Invited</TableHead>
            <TableHead>Opted in</TableHead>
            <TableHead>Check-In</TableHead>
            <TableHead>Survey</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {d.waves.map((row) => (
            <TableRow key={row.wave}>
              <TableCell className="pl-5 font-medium">{row.wave}</TableCell>
              <TableCell>{row.invited}</TableCell>
              <TableCell>{row.optedIn}</TableCell>
              <TableCell>{row.completed}</TableCell>
              <TableCell>{row.survey}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CollapsibleSection>
  );
}

export function PipelineStatusWidget() {
  const state = useCommunity();
  const d = state.data;
  if (!d) return state.error ? <ErrorState message={state.error} onRetry={state.reload} /> : <SectionSkeleton />;
  return (
    <CollapsibleSection className="h-full min-w-0" title="Pipeline status" count={d.checkIns.count} sectionKey="pipeline" isNew={d.checkIns.count > (d.seen.pipeline ?? 0)} detailHref="/dashboard/reports" detailLabel="View reports">
      <div className="space-y-3 px-5 pb-5">
        {(
          [
            ["Check-In completed", d.checkIns.count],
            ["Survey completed", d.pilot.surveyCompleted],
            ["Inner Circle accepted", d.pilot.innerCircle],
            ["Follow-up permission", d.pilot.followUpPermission],
          ] as const
        ).map(([item, value]) => (
          <div key={item} className="flex items-center justify-between rounded-md border p-3">
            <span className="font-medium">{item}</span>
            <StatusBadge status={String(value)} />
          </div>
        ))}
        {d.error ? <p className="text-sm text-destructive">{d.error}</p> : null}
      </div>
    </CollapsibleSection>
  );
}

/** What's New: a sliding row of release notes. Cards can be dismissed; the whole row hidden. */
export function WhatsNewWidget({ card }: WidgetProps) {
  const { role, hideCard, setCardSettings, editing } = useOverview();
  const dismissed = new Set(Array.isArray(card.settings?.dismissed) ? (card.settings!.dismissed as string[]) : []);
  const [, force] = useState(0);
  const items = WHATS_NEW.filter((w) => allowed(role, w.access) && !dismissed.has(w.id));
  const dismiss = (id: string) => {
    setCardSettings(card.uid, { ...card.settings, dismissed: [...dismissed, id].slice(-50) });
    force((n) => n + 1);
  };
  return (
    <section aria-label="What's New" className="space-y-3">
      <div className="flex items-center gap-2 sm:pr-20">
        <Sparkles className="h-4 w-4 text-[#b88a4a]" aria-hidden />
        <h2 className="text-lg font-semibold tracking-tight">What&apos;s New</h2>
        {!editing ? (
          <button type="button" onClick={() => hideCard(card.uid)} className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Hide What's New" title="Hide this section">
            <EyeOff className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      {items.length ? (
        <Rail visible={3.5} label="what's new">
          {items.map((w) => (
            <article key={w.id} className="relative flex min-h-[150px] flex-col overflow-hidden rounded-2xl border bg-gradient-to-br from-[#141211] to-[#2a2420] p-4 text-[#f4f1ea] shadow-sm">
              <span aria-hidden className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#b88a4a]/25 blur-2xl" />
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-[#b88a4a]/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#e9c991]">{w.tag}</span>
                <button type="button" onClick={() => dismiss(w.id)} className="rounded p-1 text-[#f4f1ea]/60 hover:bg-white/10 hover:text-[#f4f1ea]" aria-label={`Dismiss ${w.title}`}>
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <h3 className="mt-2 font-semibold leading-snug">{w.title}</h3>
              <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-[#f4f1ea]/75">{w.body}</p>
              <div className="mt-auto flex items-center justify-between pt-3 text-[11px] text-[#f4f1ea]/55">
                <time dateTime={w.date}>{new Date(`${w.date}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</time>
                {w.href ? (
                  <Link href={w.href} className="font-medium text-[#e9c991] hover:underline">
                    View →
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </Rail>
      ) : (
        <p className="rounded-2xl border border-dashed p-4 text-center text-sm text-muted-foreground">
          You&apos;re up to date. <Pill tone="gold">✓</Pill>
        </p>
      )}
    </section>
  );
}

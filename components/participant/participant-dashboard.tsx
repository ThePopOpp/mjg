import Link from "next/link";
import { UsersRound, ClipboardCheck, HeartHandshake, MessageSquareText, MessagesSquare, CornerUpLeft, ArrowRight, FileText } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { StatCardRow } from "@/components/dashboard/stat-card-row";
import { Button } from "@/components/ui/button";
import { getDmStats } from "@/lib/direct-messages/data";
import { getParticipantTeam } from "@/lib/participant/team";
import { getParticipantSubmissions } from "@/lib/participant/history";
import { getCheckInSubmissionsByEmail } from "@/lib/check-in/submissions";
import { MAX_SCORE } from "@/lib/check-in/created-for-more";
import { getEnergyAuditsByEmail } from "@/lib/energy-audit/submissions";
import { EnergyAuditDetail } from "@/components/energy-audit/energy-audit-detail";
import { TOTAL_MAX } from "@/lib/energy-audit/energy-audit";
import { getBookWaitlistForEmail, formatLabel } from "@/lib/book-waitlist/repository";
import type { DashboardProfile } from "@/lib/auth/server";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export async function ParticipantDashboard({ profile }: { profile: DashboardProfile }) {
  const myName = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
  const [dmStats, team, checkIns, submissions, energyAudits, waitlist] = await Promise.all([
    getDmStats(profile.id),
    getParticipantTeam(profile.email),
    getCheckInSubmissionsByEmail(profile.email),
    getParticipantSubmissions(profile.email),
    getEnergyAuditsByEmail(profile.email, 5),
    getBookWaitlistForEmail(profile.email),
  ]);
  const latestCheckIn = checkIns[0];
  const latestAudit = energyAudits[0];
  const auditFocus = latestAudit?.details?.nextStep?.lowestEnergySource ?? latestAudit?.lowest_layer ?? null;

  const dmCards = [
    { label: "Unread messages", value: dmStats.unread, detail: dmStats.unread ? "New for you" : "All caught up", icon: MessageSquareText },
    { label: "Active conversations", value: dmStats.activeConversations, detail: "Open threads", icon: MessagesSquare },
    { label: "Awaiting your reply", value: dmStats.awaitingReply, detail: dmStats.awaitingReply ? "Needs a response" : "Nothing pending", icon: CornerUpLeft },
  ];

  const teamCards = [
    { label: "My team", value: String(team.stats.total), detail: "People in your group", icon: UsersRound },
    { label: "Surveys completed", value: String(team.stats.surveys), detail: "Across your group", icon: ClipboardCheck },
    { label: "Check-ins completed", value: String(team.stats.checkIns), detail: "Across your group", icon: HeartHandshake },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Participant"
        title={`Welcome${myName ? `, ${myName}` : ""}`}
        description="Your group, your conversations, and your next steps at a glance."
      />

      {/* Your Created for More Check-In — take it, and see your results */}
      <div className="space-y-4 border-t pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Your Check-In</h2>
          <Button asChild size="sm" variant={latestCheckIn ? "outline" : "default"}>
            <Link href="/created-for-more-check-in">{latestCheckIn ? "Take it again" : "Take the Check-In"} <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
          </Button>
        </div>
        {checkIns.length ? (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  <th className="px-4 py-2.5 font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-2.5 font-medium text-muted-foreground">Score</th>
                  <th className="px-4 py-2.5 font-medium text-muted-foreground">Stage</th>
                  <th className="px-4 py-2.5 font-medium text-muted-foreground">Lowest layer</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {checkIns.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(r.created_at)}</td>
                    <td className="px-4 py-2.5 font-semibold tabular-nums">{r.total_score ?? "—"} <span className="font-normal text-muted-foreground">/ {MAX_SCORE}</span></td>
                    <td className="px-4 py-2.5">{r.stage ?? "—"}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{r.lowest_layer ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            No check-ins yet. Take the Created for More Check-In and your results will appear here.
          </p>
        )}
      </div>

      {/* Your Energy Audit — full detail of the most recent, plus earlier ones */}
      <div className="space-y-4 border-t pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Your Energy Audit</h2>
          <Button asChild size="sm" variant={latestAudit ? "outline" : "default"}>
            <Link href="/stewardship-blueprint/energy-audit">{latestAudit ? "Take it again" : "Take the Energy Audit"} <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
          </Button>
        </div>
        {latestAudit ? (
          <>
            <EnergyAuditDetail audit={latestAudit} showReflections heading="Most recent" />
            {energyAudits.length > 1 ? (
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-left">
                      <th className="px-4 py-2.5 font-medium text-muted-foreground">Earlier audits</th>
                      <th className="px-4 py-2.5 font-medium text-muted-foreground">Score</th>
                      <th className="px-4 py-2.5 font-medium text-muted-foreground">Result</th>
                      <th className="px-4 py-2.5 font-medium text-muted-foreground">Report</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {energyAudits.slice(1).map((a) => (
                      <tr key={a.id}>
                        <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(a.created_at)}</td>
                        <td className="px-4 py-2.5 font-semibold tabular-nums">{a.total_score ?? "—"} <span className="font-normal text-muted-foreground">/ {TOTAL_MAX}</span></td>
                        <td className="px-4 py-2.5">{a.stage ?? "—"}</td>
                        <td className="px-4 py-2.5">
                          <Link href={`/api/energy-audit/${a.id}/pdf`} className="text-sm font-medium text-[#b88a4a] hover:underline">PDF</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </>
        ) : (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            See where your tank is full, where it&rsquo;s leaking, and what renewal you need next.
          </p>
        )}
      </div>

      {/* Book waitlist status */}
      <div className="space-y-4 border-t pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">The Life You&rsquo;re Building</h2>
          {!waitlist ? (
            <Button asChild size="sm">
              <Link href="/book-waitlist">Join the waitlist <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          ) : null}
        </div>
        {waitlist ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 text-sm">
            <div>
              <p className="font-medium">You&rsquo;re on the book waitlist</p>
              <p className="text-muted-foreground">
                Requested {fmtDate(waitlist.created_at)} · Preferred format: {formatLabel(waitlist.format_preference)}
              </p>
            </div>
            <span className="rounded-full bg-[#b88a4a]/15 px-2.5 py-1 text-xs font-medium capitalize text-[#8a6d33] dark:text-[#e2ca9a]">
              {waitlist.status}
            </span>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Be the first to know when the book is available, plus early access to launch resources.
          </p>
        )}
      </div>

      {/* Your Surveys & Forms — everything this participant has completed */}
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-lg font-semibold tracking-tight">Your Surveys &amp; Forms</h2>
        {submissions.length ? (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  <th className="px-4 py-2.5 font-medium text-muted-foreground">Completed</th>
                  <th className="px-4 py-2.5 font-medium text-muted-foreground">Form</th>
                  <th className="px-4 py-2.5 font-medium text-muted-foreground">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {submissions.map((s) => (
                  <tr key={`${s.kind}-${s.id}`}>
                    <td className="px-4 py-2.5 text-muted-foreground">{fmtDate(s.created_at)}</td>
                    <td className="px-4 py-2.5 font-medium">{s.label}</td>
                    <td className="px-4 py-2.5 capitalize text-muted-foreground">{s.kind}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="flex items-center gap-2 rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            <FileText className="h-4 w-4" /> No surveys or forms completed yet. Anything you submit will be listed here.
          </p>
        )}
      </div>

      <div className="space-y-4 border-t pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Direct Messages</h2>
          <Link href="/dashboard/direct-messages" className="text-xs font-medium text-primary hover:underline">Open Messages</Link>
        </div>
        <StatCardRow className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {dmCards.map((c) => (
            <Link
              key={c.label}
              href="/dashboard/direct-messages"
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-5 py-4 text-left shadow-sm transition hover:border-primary/40 hover:shadow"
            >
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-muted-foreground">{c.label}</p>
                <p className="text-3xl font-semibold tabular-nums">{c.value}</p>
                <p className="text-xs text-muted-foreground">{c.detail}</p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-primary">
                <c.icon className="h-5 w-5" aria-hidden />
              </span>
            </Link>
          ))}
        </StatCardRow>
      </div>

      <div className="space-y-4 border-t pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">My Team</h2>
          <Link href="/dashboard/team" className="text-xs font-medium text-primary hover:underline">Open My Team</Link>
        </div>
        <StatCardRow className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {teamCards.map((c) => (
            <MetricCard key={c.label} {...c} />
          ))}
        </StatCardRow>
      </div>
    </div>
  );
}

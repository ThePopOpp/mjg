import { MetricCard } from "@/components/dashboard/metric-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, CheckCircle2, CircleUserRound, MailCheck, MessageSquareText, TrendingUp, UsersRound } from "lucide-react";
import { getPilotDashboardData, getPilotMetrics } from "@/lib/dashboard/pilot-data";

export default async function ReportsPage() {
  const data = await getPilotDashboardData();
  const metrics = getPilotMetrics(data);
  const funnel = [
    { label: "Invited", value: metrics.invited },
    { label: "Opted in", value: metrics.optedIn },
    { label: "Check-In completed", value: metrics.checkInCompleted },
    { label: "Survey completed", value: metrics.surveyCompleted },
    { label: "Inner Circle accepted", value: metrics.innerCircle },
  ];
  const waveRows = getWaveRows(data.participants as any[], data.checkIns as any[], data.surveys as any[]);
  const lowestAreaRows = getDistribution((data.checkIns as any[]).map((row) => row.lowest_area_label).filter(Boolean));
  const tagRows = (data.tags as any[])
    .map((tag) => ({ name: tag.name, category: tag.category, count: tag.participant_tags?.length ?? 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
  const permissionRows = [
    { label: "Anonymous feedback permission", value: (data.surveys as any[]).filter((row) => row.anonymous_feedback_permission).length },
    { label: "Quote/story/interview permission", value: (data.surveys as any[]).filter((row) => row.story_interview_permission).length },
    { label: "Follow-up permission", value: metrics.followUpPermission },
    { label: "Pastor/Elder responses", value: metrics.pastorElderResponses },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="Reports" description="Summarize invitations, opt-ins, Check-In scores, survey completions, interests, and referrals." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Number invited" value={String(metrics.invited)} detail="Has wave/source" icon={UsersRound} />
        <MetricCard label="Number opted in" value={String(metrics.optedIn)} detail="7-day journey permission" icon={MailCheck} />
        <MetricCard label="Check-In completed" value={String(metrics.checkInCompleted)} detail={`Average score ${metrics.averageScore || "-"}`} icon={CheckCircle2} />
        <MetricCard label="Survey completed" value={String(metrics.surveyCompleted)} detail="General and Pastor/Elder" icon={MessageSquareText} />
        <MetricCard label="Inner Circle accepted" value={String(metrics.innerCircle)} detail="Accepted invitation" icon={CircleUserRound} />
        <MetricCard label="Follow-up permission" value={String(metrics.followUpPermission)} detail="Ready for personal follow-up" icon={Activity} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Pilot funnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {funnel.map((item, index) => {
              const previous = index ? funnel[index - 1].value : item.value;
              const percent = previous ? Math.round((item.value / previous) * 100) : 0;
              const overallPercent = funnel[0].value ? Math.round((item.value / funnel[0].value) * 100) : 0;

              return (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-muted-foreground">
                      {item.value} {index ? `· ${percent}% from previous` : ""}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${overallPercent}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permission and interest signals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {permissionRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between rounded-md border bg-background px-4 py-3">
                <span className="text-sm font-medium text-muted-foreground">{row.label}</span>
                <span className="text-lg font-semibold">{row.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Wave comparison</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Wave/source</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Opted in</TableHead>
                  <TableHead>Check-In</TableHead>
                  <TableHead>Survey</TableHead>
                  <TableHead>Inner Circle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waveRows.map((row) => (
                  <TableRow key={row.wave}>
                    <TableCell className="font-medium">{row.wave}</TableCell>
                    <TableCell>{row.participants}</TableCell>
                    <TableCell>{row.optedIn}</TableCell>
                    <TableCell>{row.checkIns}</TableCell>
                    <TableCell>{row.surveys}</TableCell>
                    <TableCell>{row.innerCircle}</TableCell>
                  </TableRow>
                ))}
                {!waveRows.length ? <TableRow><TableCell colSpan={6}>No wave data yet.</TableCell></TableRow> : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lowest area distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {lowestAreaRows.map((row) => (
              <BarRow key={row.label} label={row.label} value={row.count} max={lowestAreaRows[0]?.count ?? 0} />
            ))}
            {!lowestAreaRows.length ? <p className="text-sm text-muted-foreground">No Check-In data yet.</p> : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top tags and segments</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {tagRows.map((tag) => (
            <div key={tag.name} className="rounded-md border bg-background p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{tag.name}</p>
                  <p className="text-sm text-muted-foreground">{tag.category}</p>
                </div>
                <span className="text-2xl font-semibold">{tag.count}</span>
              </div>
            </div>
          ))}
          {!tagRows.length ? <p className="text-sm text-muted-foreground">No tags yet.</p> : null}
        </CardContent>
      </Card>

      {data.error ? <p className="text-sm text-destructive">{data.error}</p> : null}
    </div>
  );
}

function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  const width = max ? Math.round((value / max) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function getDistribution(values: string[]) {
  const counts = values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function getWaveRows(participants: any[], checkIns: any[], surveys: any[]) {
  const waveKeys = Array.from(new Set(participants.map((row) => row.wave ?? row.source).filter(Boolean))).sort();

  return waveKeys.map((wave) => {
    const waveParticipants = participants.filter((row) => row.wave === wave || row.source === wave);
    const participantIds = new Set(waveParticipants.map((row) => row.id));

    return {
      wave,
      participants: waveParticipants.length,
      optedIn: waveParticipants.filter((row) => row.email_journey_opt_in).length,
      checkIns: checkIns.filter((row) => participantIds.has(row.participant_id)).length,
      surveys: surveys.filter((row) => row.participant_id && participantIds.has(row.participant_id)).length,
      innerCircle: waveParticipants.filter((row) => row.inner_circle_status === "accepted").length,
    };
  });
}

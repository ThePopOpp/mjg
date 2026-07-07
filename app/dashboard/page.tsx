import { Activity, CheckCircle2, Church, CircleUserRound, MailCheck, UsersRound } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPilotDashboardData, getPilotMetrics } from "@/lib/dashboard/pilot-data";
import { getCurrentProfile } from "@/lib/auth/server";
import { getMyOpenTasks } from "@/lib/project-manager/my-tasks";
import { MyTasksCard } from "@/components/dashboard/my-tasks-card";

export default async function DashboardPage() {
  const [data, profile] = await Promise.all([getPilotDashboardData(), getCurrentProfile()]);
  const pilotMetrics = getPilotMetrics(data);
  const myTasks = profile
    ? await getMyOpenTasks({ id: profile.id, role: profile.role, email: profile.email })
    : [];
  const myName = profile ? [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() : "";
  const metrics = [
    { label: "Total participants", value: String(data.participants.length), detail: "Created for More records", icon: UsersRound },
    { label: "Check-In completed", value: String(pilotMetrics.checkInCompleted), detail: `Average score ${pilotMetrics.averageScore || "-"}`, icon: CheckCircle2 },
    { label: "7-day journey started", value: String(pilotMetrics.journeyStarted), detail: "Email journey records", icon: MailCheck },
    { label: "Pastor/Elder responses", value: String(pilotMetrics.pastorElderResponses), detail: "Reviewer survey responses", icon: Church },
    { label: "Inner Circle accepted", value: String(pilotMetrics.innerCircle), detail: "Accepted invitations", icon: CircleUserRound },
    { label: "Follow-up permission", value: String(pilotMetrics.followUpPermission), detail: "Follow-up ready", icon: Activity },
  ];
  const waveRows = ["wave_0", "wave_1", "wave_2", "wave_3"].map((wave) => ({
    wave,
    invited: data.participants.filter((row: any) => row.wave === wave || row.source === wave).length,
    optedIn: data.participants.filter((row: any) => (row.wave === wave || row.source === wave) && row.email_journey_opt_in).length,
    completed: data.checkIns.filter((row: any) => row.participants?.wave === wave).length,
    survey: data.surveys.filter((row: any) => row.participants?.wave === wave).length,
  }));

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Created for More pilot"
        title="Dashboard overview"
        description="Track participant progress, stewardship check-ins, surveys, and follow-up interest from one admin workspace."
      />

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-2 xl:auto-rows-min">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
        <MyTasksCard tasks={myTasks} name={myName} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Wave summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Wave</TableHead>
                  <TableHead>Invited</TableHead>
                  <TableHead>Opted in</TableHead>
                  <TableHead>Check-In</TableHead>
                  <TableHead>Survey</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waveRows.map((row) => (
                  <TableRow key={row.wave}>
                    <TableCell className="font-medium">{row.wave}</TableCell>
                    <TableCell>{row.invited}</TableCell>
                    <TableCell>{row.optedIn}</TableCell>
                    <TableCell>{row.completed}</TableCell>
                    <TableCell>{row.survey}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Check-In completed", pilotMetrics.checkInCompleted],
              ["Survey completed", pilotMetrics.surveyCompleted],
              ["Inner Circle accepted", pilotMetrics.innerCircle],
              ["Follow-up permission", pilotMetrics.followUpPermission],
            ].map(([item, value]) => (
              <div key={item} className="flex items-center justify-between rounded-md border p-3">
                <span className="font-medium">{item}</span>
                <StatusBadge status={String(value)} />
              </div>
            ))}
            {data.error ? <p className="text-sm text-destructive">{data.error}</p> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

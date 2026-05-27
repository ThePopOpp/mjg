import { MetricCard } from "@/components/dashboard/metric-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Activity, CheckCircle2, CircleUserRound, MailCheck, MessageSquareText, UsersRound } from "lucide-react";
import { getPilotDashboardData, getPilotMetrics } from "@/lib/dashboard/pilot-data";

export default async function ReportsPage() {
  const data = await getPilotDashboardData();
  const metrics = getPilotMetrics(data);

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
    </div>
  );
}

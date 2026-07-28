import Link from "next/link";
import { UsersRound, ClipboardCheck, Route, HeartHandshake, MessageSquareText, MessagesSquare, CornerUpLeft } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { MyTasksCard } from "@/components/dashboard/my-tasks-card";
import { getMyOpenTasks } from "@/lib/project-manager/my-tasks";
import { getDmStats } from "@/lib/direct-messages/data";
import { getFacilitatorTeam } from "@/lib/facilitator/team";
import type { DashboardProfile } from "@/lib/auth/server";

export async function FacilitatorDashboard({ profile }: { profile: DashboardProfile }) {
  const myName = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
  const [myTasks, dmStats, team] = await Promise.all([
    getMyOpenTasks({ id: profile.id, role: profile.role, email: profile.email }),
    getDmStats(profile.id),
    getFacilitatorTeam(profile.id),
  ]);

  const dmCards = [
    { label: "Unread messages", value: dmStats.unread, detail: dmStats.unread ? "New for you" : "All caught up", icon: MessageSquareText },
    { label: "Active conversations", value: dmStats.activeConversations, detail: "Open threads", icon: MessagesSquare },
    { label: "Awaiting your reply", value: dmStats.awaitingReply, detail: dmStats.awaitingReply ? "Needs a response" : "Nothing pending", icon: CornerUpLeft },
  ];

  const teamCards = [
    { label: "Total team", value: String(team.stats.total), detail: "Participants you lead", icon: UsersRound },
    { label: "Surveys", value: String(team.stats.surveys), detail: "Survey responses in", icon: ClipboardCheck },
    { label: "12 Week Journey", value: String(team.stats.journey), detail: "Journey started", icon: Route },
    { label: "Created For More Check-in", value: String(team.stats.checkIns), detail: "Check-ins completed", icon: HeartHandshake },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Facilitator"
        title={`Welcome${myName ? `, ${myName}` : ""}`}
        description="Your team, your conversations, and your tasks at a glance."
      />

      <MyTasksCard tasks={myTasks} name={myName} />

      <div className="space-y-4 border-t pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Direct Messages</h2>
          <Link href="/dashboard/direct-messages" className="text-xs font-medium text-primary hover:underline">Open Messages</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
        </div>
      </div>

      <div className="space-y-4 border-t pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">My Team</h2>
          <Link href="/dashboard/team" className="text-xs font-medium text-primary hover:underline">Open My Team</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {teamCards.map((c) => (
            <MetricCard key={c.label} {...c} />
          ))}
        </div>
      </div>
    </div>
  );
}

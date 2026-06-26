import Link from "next/link";
import { CalendarClock, Inbox, Send, Share2, TrendingUp } from "lucide-react";
import { SectionHeader } from "@/components/dashboard/section-header";
import { SocialTabs } from "@/components/social-media/social-tabs";
import { getSocialDashboardData } from "@/lib/social-media/data";
import { platformLabel } from "@/lib/social-media/constants";

export const dynamic = "force-dynamic";
export const metadata = { title: "Social Media — MJG Dashboard" };

function fmt(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default async function SocialMediaPage() {
  const data = await getSocialDashboardData();
  const recentPosts = data.posts.slice(0, 6);
  const recentInbox = data.messages.slice(0, 6);

  const stats = [
    { icon: Share2, label: "Connected accounts", value: data.stats.connectedAccounts },
    { icon: CalendarClock, label: "Scheduled posts", value: data.stats.scheduledPosts },
    { icon: Send, label: "Published this week", value: data.stats.publishedThisWeek },
    { icon: Inbox, label: "Unread inbox", value: data.stats.unreadInbox },
    { icon: TrendingUp, label: "Total engagement", value: data.stats.totalEngagement },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Workspace"
        title="Social Media"
        description="Plan, build, schedule, and publish social content across your platforms — with templates, a block editor, an inbox, analytics, and Siggey assistance."
      />
      <SocialTabs active="overview" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><s.icon className="h-4 w-4" /></div>
            <div><div className="text-lg font-semibold leading-none">{s.value}</div><div className="mt-1 text-[11px] text-muted-foreground">{s.label}</div></div>
          </div>
        ))}
      </div>

      {data.stats.connectedAccounts === 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
          No platforms are connected yet. Add your Facebook and LinkedIn credentials in{" "}
          <Link href="/dashboard/social-media/settings" className="font-medium text-primary underline">Settings</Link> to start publishing.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <h3 className="text-sm font-semibold">Recent posts</h3>
            <Link href="/dashboard/social-media/history" className="text-xs text-muted-foreground hover:text-primary">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {recentPosts.length === 0 && <div className="px-4 py-8 text-center text-sm text-muted-foreground">No posts yet.</div>}
            {recentPosts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{platformLabel(p.platform)}</span>
                <span className="min-w-0 flex-1 truncate text-sm">{p.body_text || "—"}</span>
                <span className="shrink-0 text-[11px] capitalize text-muted-foreground">{p.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <h3 className="text-sm font-semibold">Inbox</h3>
            <Link href="/dashboard/social-media/inbox" className="text-xs text-muted-foreground hover:text-primary">Open inbox</Link>
          </div>
          <div className="divide-y divide-border">
            {recentInbox.length === 0 && <div className="px-4 py-8 text-center text-sm text-muted-foreground">No messages, comments, or reviews yet.</div>}
            {recentInbox.map((m) => (
              <div key={m.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium capitalize text-muted-foreground">{m.kind}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{m.text || "—"}</div>
                  <div className="text-[11px] text-muted-foreground">{m.author_name || "Unknown"} · {fmt(m.received_at)}</div>
                </div>
                {m.status === "new" && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

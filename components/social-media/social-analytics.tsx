"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { FieldSelect } from "@/components/ui/field-select";
import { cn } from "@/lib/utils";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { platformLabel } from "@/lib/social-media/constants";
import type { SocialReport } from "@/lib/social-media/types";

const RANGE_OPTS = [{ value: "7", label: "Last 7 days" }, { value: "30", label: "Last 30 days" }, { value: "90", label: "Last 90 days" }];

export function SocialAnalytics({ initialReport }: { initialReport: SocialReport }) {
  const token = useDashboardActionToken();
  const [report, setReport] = React.useState(initialReport);
  const [range, setRange] = React.useState(String(initialReport.rangeDays));
  const [loading, setLoading] = React.useState(false);

  async function changeRange(r: string) {
    setRange(r); setLoading(true);
    try {
      const res = await fetch(`/api/admin/social-media/analytics?range=${r}`, { headers: { "x-mjg-action-token": token } }).then((x) => x.json());
      if (res.report) setReport(res.report);
    } finally { setLoading(false); }
  }

  const e = report.totals.engagement;
  const cards = [
    { label: "Posts", value: report.totals.posts },
    { label: "Published", value: report.totals.published },
    { label: "Scheduled", value: report.totals.scheduled },
    { label: "Likes", value: e.likes ?? 0 },
    { label: "Comments", value: e.comments ?? 0 },
    { label: "Shares", value: e.shares ?? 0 },
  ];
  const maxDaily = Math.max(1, ...report.daily.map((d) => Math.max(d.published, d.engagement)));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-40"><FieldSelect value={range} onChange={changeRange} options={RANGE_OPTS} className="h-9" /></div>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card px-4 py-3">
            <div className="text-lg font-semibold leading-none">{c.value}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 text-sm font-semibold">Published per day</div>
          {report.daily.every((d) => d.published === 0 && d.engagement === 0) ? (
            <div className="py-10 text-center text-sm text-muted-foreground">No activity in this range yet.</div>
          ) : (
            <div className="flex h-40 items-end gap-1">
              {report.daily.map((d) => (
                <div key={d.date} className="flex flex-1 flex-col items-center gap-1" title={`${d.date}: ${d.published} posts, ${d.engagement} engagements`}>
                  <div className="flex w-full flex-1 items-end gap-0.5">
                    <div className="flex-1 rounded-t bg-primary" style={{ height: `${(d.published / maxDaily) * 100}%`, minHeight: d.published ? 3 : 0 }} />
                    <div className="flex-1 rounded-t bg-primary/30" style={{ height: `${(d.engagement / maxDaily) * 100}%`, minHeight: d.engagement ? 3 : 0 }} />
                  </div>
                  <div className="text-[9px] text-muted-foreground">{d.date}</div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-2 flex gap-3 text-[11px] text-muted-foreground"><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-primary" /> Posts</span><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-primary/30" /> Engagements</span></div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 text-sm font-semibold">By platform</div>
          {report.byPlatform.length === 0 ? <div className="py-10 text-center text-sm text-muted-foreground">No published posts yet.</div> : (
            <div className="space-y-2">
              {report.byPlatform.map((p) => {
                const max = Math.max(1, ...report.byPlatform.map((x) => x.published));
                return (
                  <div key={p.platform}>
                    <div className="mb-0.5 flex items-center justify-between text-xs"><span>{platformLabel(p.platform)}</span><span className="text-muted-foreground">{p.published} posts · {p.engagement} eng.</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(p.published / max) * 100}%` }} /></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 text-sm font-semibold">Top posts</div>
        {report.topPosts.length === 0 ? <div className="py-8 text-center text-sm text-muted-foreground">No published posts to rank yet.</div> : (
          <div className="divide-y divide-border">
            {report.topPosts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-2">
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{platformLabel(p.platform)}</span>
                <span className="min-w-0 flex-1 truncate text-sm">{p.body || "—"}</span>
                <span className={cn("shrink-0 text-xs font-medium")}>{p.engagement} eng.</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground">Engagement figures populate as posts publish and platform metrics sync. Steward can summarize these numbers for you in the AI Agent.</p>
    </div>
  );
}

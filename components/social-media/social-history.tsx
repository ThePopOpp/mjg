"use client";

import * as React from "react";
import { ExternalLink, Loader2, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldSelect } from "@/components/ui/field-select";
import { cn } from "@/lib/utils";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { platformLabel } from "@/lib/social-media/constants";
import type { SocialPost } from "@/lib/social-media/types";

const statusClass: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  publishing: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  published: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  failed: "bg-red-500/15 text-red-600 dark:text-red-400",
  skipped: "bg-muted text-muted-foreground line-through",
};
const FILTERS = [{ value: "", label: "All posts" }, { value: "draft", label: "Drafts" }, { value: "scheduled", label: "Scheduled" }, { value: "published", label: "Published" }, { value: "failed", label: "Failed" }];

function fmt(iso: string | null | undefined) { return iso ? new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—"; }
function eng(p: SocialPost) { const e = p.engagement ?? {}; return (e.likes ?? 0) + (e.comments ?? 0) + (e.shares ?? 0); }

export function SocialHistory({ initialPosts }: { initialPosts: SocialPost[] }) {
  const token = useDashboardActionToken();
  const [posts, setPosts] = React.useState(initialPosts);
  const [filter, setFilter] = React.useState("");
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const reload = React.useCallback(async () => {
    const qs = filter ? `?status=${filter}` : "";
    const r = await fetch(`/api/admin/social-media/posts${qs}`, { headers: { "x-mjg-action-token": token } }).then((x) => x.json());
    if (r.posts) setPosts(r.posts);
  }, [filter, token]);
  React.useEffect(() => { reload(); }, [reload]);

  async function publish(p: SocialPost) {
    setBusy(p.id); setError(null);
    try {
      const res = await fetch("/api/admin/social-media/publish", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: p.id, actionToken: token }) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Publish failed.");
      await reload();
    } catch (e) { setError(e instanceof Error ? e.message : "Publish failed."); }
    finally { setBusy(null); }
  }
  async function remove(p: SocialPost) {
    if (!window.confirm("Delete this post?")) return;
    setBusy(p.id);
    try { await fetch(`/api/admin/social-media/posts/${p.id}`, { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ actionToken: token }) }); await reload(); }
    finally { setBusy(null); }
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <div className="w-44"><FieldSelect value={filter} onChange={setFilter} options={FILTERS} className="h-9" /></div>
      </div>
      {error && <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">No posts match this filter.</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="divide-y divide-border">
            {posts.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{platformLabel(p.platform)}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{p.body_text || "—"}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {p.status === "scheduled" ? `Scheduled ${fmt(p.scheduled_at)}` : p.status === "published" ? `Published ${fmt(p.published_at)}` : `Created ${fmt(p.created_at)}`}
                    {p.status === "published" ? ` · ${eng(p)} engagements` : ""}
                    {p.error_message ? ` · ${p.error_message}` : ""}
                  </div>
                </div>
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium capitalize", statusClass[p.status])}>{p.status}</span>
                {p.external_url && <a href={p.external_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary"><ExternalLink className="h-4 w-4" /></a>}
                {(p.status === "draft" || p.status === "scheduled" || p.status === "failed") && (
                  <Button size="sm" variant="outline" onClick={() => publish(p)} disabled={busy === p.id}>{busy === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Publish</Button>
                )}
                <button onClick={() => remove(p)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

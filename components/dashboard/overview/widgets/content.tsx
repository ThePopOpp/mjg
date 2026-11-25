"use client";

import { Bot, FileText, FolderOpen, Globe, Image as ImageIcon, Newspaper, Send, Sparkles, Wrench } from "lucide-react";
import { AgentChat } from "@/components/ai-agent/agent-chat";
import { useWidgetData } from "../use-widget-data";
import { Empty, ListRow, Load, Pill, WidgetCard, fmtBytes, relTime } from "./kit";

type Content = {
  blog?: { id: string; title: string; status: string; publish_at: string | null; updated_at: string }[];
  website?: { id: string; summary: string | null; status: string; risk: string | null; created_at: string }[];
  social?: { id: string; platform: string; status: string; body_text: string | null; scheduled_at: string | null }[];
};

export function BlogWidget() {
  const state = useWidgetData<Content>("content", undefined, 300_000);
  return (
    <WidgetCard icon={Newspaper} title="Blog Posts" href="/dashboard/blog-posts">
      <Load state={state}>
        {(d) =>
          d.blog?.length ? (
            <ul className="space-y-0.5">
              {d.blog.map((p) => (
                <ListRow key={p.id} href={`/dashboard/blog-posts/${p.id}`} title={p.title || "Untitled"} subtitle={`Updated ${relTime(p.updated_at)}`} meta={<Pill tone={p.status === "published" ? "gold" : "neutral"}>{p.status}</Pill>} />
              ))}
            </ul>
          ) : (
            <Empty>No posts yet.</Empty>
          )
        }
      </Load>
    </WidgetCard>
  );
}

export function WebsiteChangesWidget() {
  const state = useWidgetData<Content>("content", undefined, 300_000);
  return (
    <WidgetCard icon={Globe} title="Website Changes" href="/dashboard/cms">
      <Load state={state}>
        {(d) =>
          d.website?.length ? (
            <ul className="space-y-0.5">
              {d.website.map((c) => (
                <ListRow key={c.id} href="/dashboard/cms" title={c.summary || "Change set"} subtitle={relTime(c.created_at)} meta={<Pill tone={c.risk === "high" ? "bad" : c.status === "pending" ? "warn" : "gold"}>{c.status}</Pill>} />
              ))}
            </ul>
          ) : (
            <Empty>Nothing waiting for review.</Empty>
          )
        }
      </Load>
    </WidgetCard>
  );
}

export function ScheduledSocialWidget() {
  const state = useWidgetData<Content>("content", undefined, 300_000);
  return (
    <WidgetCard icon={Send} title="Scheduled Social" href="/dashboard/social-media">
      <Load state={state}>
        {(d) =>
          d.social?.length ? (
            <ul className="space-y-0.5">
              {d.social.map((p) => (
                <ListRow
                  key={p.id}
                  href="/dashboard/social-media"
                  title={p.body_text?.slice(0, 90) || "(no text)"}
                  subtitle={`${p.platform} · ${p.scheduled_at ? new Date(p.scheduled_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "Not scheduled"}`}
                  meta={<Pill tone="gold">{p.status.replace(/_/g, " ")}</Pill>}
                />
              ))}
            </ul>
          ) : (
            <Empty>No posts scheduled.</Empty>
          )
        }
      </Load>
    </WidgetCard>
  );
}

export function WorkspaceDocsWidget() {
  const state = useWidgetData<{ docs: { id: string; title: string | null; updated_at: string; status: string | null }[] }>("workspace", undefined, 300_000);
  return (
    <WidgetCard icon={FolderOpen} title="Workspace Docs" href="/dashboard/workspace">
      <Load state={state}>
        {(d) =>
          d.docs.length ? (
            <ul className="space-y-0.5">
              {d.docs.map((doc) => (
                <ListRow key={doc.id} href={`/dashboard/workspace/${doc.id}`} icon={<FileText className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />} title={doc.title || "Untitled"} meta={relTime(doc.updated_at)} />
              ))}
            </ul>
          ) : (
            <Empty>No documents yet.</Empty>
          )
        }
      </Load>
    </WidgetCard>
  );
}

type Agents = {
  tasks: { id: string; title: string; status: string; priority: string | null; created_at: string; agent: { name?: string } | null }[];
  devRequests: { id: string; title: string; status: string; priority: string | null; created_at: string }[];
};

export function AgentTasksWidget() {
  const state = useWidgetData<Agents>("agents", undefined, 120_000);
  return (
    <WidgetCard icon={Bot} title="Agent Tasks" href="/dashboard/claude">
      <Load state={state}>
        {(d) =>
          d.tasks.length ? (
            <ul className="space-y-0.5">
              {d.tasks.map((t) => (
                <ListRow key={t.id} href="/dashboard/claude" title={t.title} subtitle={`${t.agent?.name ?? "Unassigned"} · ${relTime(t.created_at)}`} meta={<Pill tone={t.status === "needs_review" ? "warn" : "gold"}>{t.status.replace(/_/g, " ")}</Pill>} />
              ))}
            </ul>
          ) : (
            <Empty>No open agent tasks.</Empty>
          )
        }
      </Load>
    </WidgetCard>
  );
}

export function DevRequestsWidget() {
  const state = useWidgetData<Agents>("agents", undefined, 120_000);
  return (
    <WidgetCard icon={Wrench} title="Dev Requests" href="/dashboard/cms">
      <Load state={state}>
        {(d) =>
          d.devRequests.length ? (
            <ul className="space-y-0.5">
              {d.devRequests.map((t) => (
                <ListRow key={t.id} title={t.title} subtitle={relTime(t.created_at)} meta={<Pill tone={t.status === "done" ? "neutral" : "gold"}>{t.status}</Pill>} />
              ))}
            </ul>
          ) : (
            <Empty>The queue is empty.</Empty>
          )
        }
      </Load>
    </WidgetCard>
  );
}

type StewardUsage = {
  members: { everUsed: number; activeInRange: number };
  conversations: { total: number; startedInRange: number };
  replies: { total: number; inputTokens: number; outputTokens: number };
  ordersInRange: { paid: number; paidAmountMinor: number };
};

export function StewardUsageWidget() {
  const state = useWidgetData<StewardUsage>("steward", undefined, 600_000);
  return (
    <WidgetCard icon={Sparkles} title="Steward · 30 days" href="/dashboard/steward">
      <Load state={state}>
        {(d) => (
          <dl className="grid grid-cols-2 gap-2">
            {[
              ["Active members", d.members.activeInRange],
              ["Members ever", d.members.everUsed],
              ["New conversations", d.conversations.startedInRange],
              ["Replies", d.replies.total],
              ["Tokens used", d.replies.inputTokens + d.replies.outputTokens],
              ["Paid orders", d.ordersInRange.paid],
            ].map(([k, v]) => (
              <div key={k as string} className="rounded-xl bg-muted/50 p-2.5">
                <dt className="truncate text-[11px] text-muted-foreground">{k}</dt>
                <dd className="text-lg font-semibold tabular-nums">{Number(v).toLocaleString()}</dd>
              </div>
            ))}
          </dl>
        )}
      </Load>
    </WidgetCard>
  );
}

export function ShepherdWidget() {
  return (
    <WidgetCard icon={Bot} title="Ask Shepherd" href="/dashboard/ai-agent" hrefLabel="Full screen" bodyClassName="px-2 pb-2">
      <AgentChat
        title="Shepherd"
        subtitle="Ask about anything in the business"
        heightClassName="h-[420px]"
        audio
        emptyTitle="What can I help with?"
        emptyHint="Ask about participants, emails, bookings, content or your projects. Anything that changes data asks for your approval first."
      />
    </WidgetCard>
  );
}

type Files = { files: { id: string; title: string; asset_type: string | null; mime_type: string | null; file_size: number | null; file_url: string | null; created_at: string }[] };

export function RecentFilesWidget() {
  const state = useWidgetData<Files>("files", undefined, 300_000);
  return (
    <WidgetCard icon={ImageIcon} title="Recent Uploads" href="/dashboard/media-studio">
      <Load state={state}>
        {(d) =>
          d.files.length ? (
            <ul className="space-y-0.5">
              {d.files.map((f) => (
                <ListRow
                  key={f.id}
                  href="/dashboard/media-studio"
                  icon={
                    f.mime_type?.startsWith("image/") && f.file_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.file_url} alt="" className="h-8 w-8 shrink-0 rounded-md object-cover" loading="lazy" />
                    ) : (
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-semibold uppercase text-muted-foreground">{(f.asset_type ?? "file").slice(0, 3)}</span>
                    )
                  }
                  title={f.title}
                  subtitle={`${fmtBytes(f.file_size)} · ${relTime(f.created_at)}`}
                />
              ))}
            </ul>
          ) : (
            <Empty>No files yet.</Empty>
          )
        }
      </Load>
    </WidgetCard>
  );
}

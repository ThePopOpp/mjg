"use client";

import Link from "next/link";
import { CornerUpLeft, Inbox, Mail, MessageSquareText, MessagesSquare, Phone, PhoneIncoming, PhoneMissed, PhoneOutgoing, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWidgetData } from "../use-widget-data";
import { Empty, ListRow, Load, Pill, Skeleton, WidgetCard, relTime, type WidgetProps } from "./kit";

export function DmsWidget({ def }: WidgetProps) {
  const state = useWidgetData<{ unread: number; activeConversations: number; awaitingReply: number }>("dms", undefined, def.refreshMs);
  const d = state.data;
  const cards = [
    { label: "Unread messages", value: d?.unread, detail: d?.unread ? "New for you" : "All caught up", icon: MessageSquareText },
    { label: "Active conversations", value: d?.activeConversations, detail: "Open threads", icon: MessagesSquare },
    { label: "Awaiting your reply", value: d?.awaitingReply, detail: d?.awaitingReply ? "Needs a response" : "Nothing pending", icon: CornerUpLeft },
  ];
  return (
    <section aria-label="Direct Messages" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Direct Messages</h2>
        <Link href="/dashboard/direct-messages" className="text-xs font-medium text-primary hover:underline">
          Open Messages
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href="/dashboard/direct-messages" className="flex items-center justify-between gap-3 rounded-2xl border bg-card px-5 py-4 shadow-sm transition hover:border-[#b88a4a]/50 hover:shadow">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-muted-foreground">{c.label}</p>
              {d ? <p className="text-3xl font-semibold tabular-nums">{c.value}</p> : <Skeleton className="h-9 w-10" />}
              <p className="text-xs text-muted-foreground">{d ? c.detail : " "}</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#b88a4a]/15 text-[#9a7038] dark:text-[#d9b27a]">
              <c.icon className="h-5 w-5" aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

type Call = {
  id: string;
  direction: "inbound" | "outbound";
  from_number: string;
  to_number: string;
  status: string;
  duration_seconds: number | null;
  recording_url: string | null;
  voicemail_url: string | null;
  created_at: string;
  participant: { first_name: string | null; last_name: string | null } | null;
};
const MISSED = new Set(["no-answer", "busy", "failed", "canceled", "missed"]);
const dur = (s: number | null) => (s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` : "");

export function CallsWidget() {
  const state = useWidgetData<{ calls: Call[] }>("calls", undefined, 60_000);
  return (
    <WidgetCard icon={Phone} title="Recent Calls" href="/dashboard/dialer">
      <Load state={state}>
        {(d) =>
          d.calls.length ? (
            <ul className="space-y-1">
              {d.calls.map((c) => {
                const missed = c.direction === "inbound" && MISSED.has(c.status);
                const Icon = missed ? PhoneMissed : c.direction === "inbound" ? PhoneIncoming : PhoneOutgoing;
                const who = [c.participant?.first_name, c.participant?.last_name].filter(Boolean).join(" ") || (c.direction === "inbound" ? c.from_number : c.to_number);
                const audio = c.recording_url || c.voicemail_url;
                return (
                  <li key={c.id} className="rounded-lg px-1.5 py-1.5 hover:bg-muted/50">
                    <div className="flex items-center gap-2.5">
                      <Icon className={cn("h-4 w-4 shrink-0", missed ? "text-red-600" : "text-[#b88a4a]")} aria-label={missed ? "Missed" : c.direction} />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{who}</span>
                      <span className="text-xs tabular-nums text-muted-foreground">{dur(c.duration_seconds)}</span>
                      <span className="w-16 text-right text-xs text-muted-foreground">{relTime(c.created_at)}</span>
                    </div>
                    {audio ? (
                      // Same source the Dialer page plays.
                      <audio controls preload="none" src={audio} className="mt-1 h-8 w-full" aria-label={`Recording of call with ${who}`} />
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty>No calls yet.</Empty>
          )
        }
      </Load>
    </WidgetCard>
  );
}

type Convo = { id: string; contact_name: string | null; contact_number: string; last_message_at: string | null; last_message_preview: string | null; unread_count: number };

export function SmsWidget() {
  const state = useWidgetData<{ conversations: Convo[] }>("sms", undefined, 60_000);
  return (
    <WidgetCard icon={Smartphone} title="SMS Conversations" href="/dashboard/sms">
      <Load state={state}>
        {(d) =>
          d.conversations.length ? (
            <ul className="space-y-0.5">
              {d.conversations.map((c) => (
                <ListRow
                  key={c.id}
                  href="/dashboard/sms"
                  title={
                    <>
                      {c.contact_name || c.contact_number} {c.unread_count ? <Pill tone="gold">{c.unread_count}</Pill> : null}
                    </>
                  }
                  subtitle={c.last_message_preview}
                  meta={relTime(c.last_message_at)}
                />
              ))}
            </ul>
          ) : (
            <Empty>No text conversations yet.</Empty>
          )
        }
      </Load>
    </WidgetCard>
  );
}

type Email = { id: string; subject: string | null; from_name: string | null; from_email: string | null; snippet: string | null; received_at: string | null; flags: string[] | null };

export function EmailWidget() {
  const state = useWidgetData<{ messages: Email[] }>("email", undefined, 120_000);
  return (
    <WidgetCard icon={Mail} title="Email Inbox" href="/dashboard/email-inbox">
      <Load state={state}>
        {(d) =>
          d.messages.length ? (
            <ul className="space-y-0.5">
              {d.messages.map((m) => {
                const unread = !(m.flags ?? []).some((f) => /seen/i.test(f));
                return (
                  <ListRow
                    key={m.id}
                    href="/dashboard/email-inbox"
                    icon={<Inbox className={cn("h-4 w-4 shrink-0", unread ? "text-[#b88a4a]" : "text-muted-foreground/50")} aria-label={unread ? "Unread" : "Read"} />}
                    title={<span className={cn(unread && "font-semibold")}>{m.subject || "(no subject)"}</span>}
                    subtitle={`${m.from_name || m.from_email || ""}${m.snippet ? ` — ${m.snippet}` : ""}`}
                    meta={relTime(m.received_at)}
                  />
                );
              })}
            </ul>
          ) : (
            <Empty>The inbox is empty.</Empty>
          )
        }
      </Load>
    </WidgetCard>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Check, Menu, MessageCircle, MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";


// The Steward rail.
//
// Layout follows the owner's mock: new conversation, a recent list, and an
// identity card pinned to the bottom. Two additions the mock did not need and
// the product does:
//
//   1. The three destinations — Steward, My Blueprint, More — live above the
//      recent list. The mock had no route to the Blueprint, and the docset
//      requires one that is not only conversational.
//   2. The committed next step sits above the identity card, so opening Steward
//      shows what you already decided rather than only an invitation to talk.
//
// The recent list is real: the member's own conversations, newest first, titled
// with their own first words. It holds no transcript — only a session id, a
// title and when it was last active.
//
// Until a retention duration is set, these accumulate. That is visible here on
// purpose: a growing list is a better prompt to decide than a setting nobody
// looks at.

/** Fired at the open conversation, which owns the eve session. */
export const NEW_CONVERSATION_EVENT = "steward:new-conversation";

type Conversation = { sessionId: string; title: string; lastActiveAt: string };

/** "Now", "2d", "3w" — enough to place a conversation without a full date. */
function relativeDay(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return "Now";
  if (days < 7) return `${days}d`;
  if (days < 56) return `${Math.floor(days / 7)}w`;
  return `${Math.floor(days / 30)}mo`;
}

const DESTINATIONS = [
  { href: "/steward", label: "Steward", icon: MessageCircle },
  { href: "/steward/blueprint", label: "My Blueprint", icon: BookOpen },
  { href: "/steward/more", label: "More", icon: MoreHorizontal },
];

function SidebarBody({
  displayName,
  initials,
  planLabel,
  nextStep,
  onNavigate,
  className,
}: {
  displayName: string;
  initials: string;
  planLabel: string;
  nextStep?: string;
  onNavigate?: () => void;
  /** Padding differs between the docked rail and the phone sheet. */
  className?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (href: string) =>
    href === "/steward" ? pathname === "/steward" : pathname.startsWith(href);

  const [conversations, setConversations] = React.useState<Conversation[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    void fetch("/api/steward/conversations", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { conversations: [] }))
      .then((json: { conversations?: Conversation[] }) => {
        if (!cancelled) setConversations(json.conversations ?? []);
      })
      .catch(() => {
        // An empty rail is better than a broken one; the conversation itself
        // does not depend on this list.
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <div className={cn("flex h-full min-h-0 flex-col gap-4", className)}>
      {/* Not a link: on /steward a link to /steward does nothing, which is
          exactly what this button appeared to do. It now resets the live
          session, and only navigates when you are somewhere else. */}
      <Button
        variant="outline"
        className="w-full justify-center gap-2 font-semibold"
        onClick={() => {
          onNavigate?.();
          if (pathname === "/steward") {
            window.dispatchEvent(new Event(NEW_CONVERSATION_EVENT));
          } else {
            router.push("/steward");
          }
        }}
      >
        <Plus className="h-4 w-4" /> New conversation
      </Button>

      <nav className="flex flex-col gap-0.5">
        {DESTINATIONS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] no-underline transition-colors",
                active
                  ? "bg-[#b88a4a]/15 font-semibold text-[#b88a4a]"
                  : "text-foreground hover:bg-muted",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="scroll-slim flex min-h-0 flex-1 flex-col gap-0.5 overflow-auto">
        <p className="px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Recent
        </p>
        {conversations.length === 0 ? (
          <p className="px-2.5 py-1 text-[12.5px] leading-relaxed text-muted-foreground">
            Nothing here yet. Conversations you have with Steward appear in this list.
          </p>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.sessionId}
              type="button"
              title={conversation.title}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13.5px] transition-colors hover:bg-muted"
            >
              <span className="min-w-0 flex-1 truncate">{conversation.title}</span>
              <span className="shrink-0 text-[11px] text-muted-foreground">
                {relativeDay(conversation.lastActiveAt)}
              </span>
            </button>
          ))
        )}
      </div>

      {nextStep ? (
        <div className="rounded-xl border border-[#b88a4a]/50 bg-[#b88a4a]/[0.07] p-3">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#b88a4a]">
            My next faithful step
          </p>
          <p className="mt-1 font-serif text-[14px] leading-snug">{nextStep}</p>
          <Button size="sm" className="mt-2.5 h-7 w-full gap-1.5 bg-[#b88a4a] text-[12px] text-white hover:bg-[#a67c42]">
            <Check className="h-3.5 w-3.5" /> I did this
          </Button>
        </div>
      ) : null}

      <div className="flex items-center gap-2.5 rounded-xl border bg-card p-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-[11px] font-bold text-background">
          {initials}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-semibold">{displayName}</span>
          <span className="block truncate text-[12px] text-muted-foreground">{planLabel}</span>
        </span>
      </div>
    </div>
  );
}

type SidebarProps = { displayName: string; initials: string; planLabel: string; nextStep?: string };

export function MemberSidebar(props: SidebarProps) {
  return (
    <aside className="hidden min-h-0 border-r md:block">
      <SidebarBody {...props} className="py-3.5 pr-3.5" />
    </aside>
  );
}

/** The same rail on a phone, behind a trigger in a slim bar above the content. */
export function MemberSidebarMobile(props: SidebarProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex items-center gap-2.5 border-b px-3 py-2 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 shrink-0 gap-1.5 px-2.5 text-[12.5px]">
            <Menu className="h-4 w-4" /> Conversations
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[85%] max-w-[300px] p-0 sm:max-w-[300px]">
          <SheetTitle className="sr-only">Steward menu</SheetTitle>
          <SidebarBody {...props} className="p-3.5" onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* On a phone the rail is closed, so the committed step rides here instead
          — the point of putting it on the first screen is that you see it
          without going looking for it. */}
      {props.nextStep ? (
        <p className="min-w-0 truncate text-[12px] text-muted-foreground">
          <span className="font-semibold text-[#b88a4a]">Next:</span>{" "}
          <span className="text-foreground">{props.nextStep}</span>
        </p>
      ) : null}
    </div>
  );
}

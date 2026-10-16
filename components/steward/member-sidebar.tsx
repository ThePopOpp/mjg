"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Check, Menu, MessageCircle, MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { EXAMPLE_THREADS } from "@/lib/steward/blueprint";

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
// The recent list is example content. It is also a real product decision in
// disguise: named threads going back weeks imply retained transcripts, where the
// docset asks for "selected purpose-bound continuity, not blanket transcripts".
// Retention duration is one of the values the owner has not set, so nothing here
// reads or writes a stored conversation yet.

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
  const isActive = (href: string) =>
    href === "/steward" ? pathname === "/steward" : pathname.startsWith(href);

  return (
    <div className={cn("flex h-full min-h-0 flex-col gap-4", className)}>
      <Button asChild variant="outline" className="w-full justify-center gap-2 font-semibold">
        <Link href="/steward" onClick={onNavigate}>
          <Plus className="h-4 w-4" /> New conversation
        </Link>
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
        {EXAMPLE_THREADS.map((thread, i) => (
          <button
            key={thread.title}
            type="button"
            title={thread.title}
            aria-current={i === 0 ? "true" : undefined}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13.5px] transition-colors",
              i === 0 ? "bg-muted" : "hover:bg-muted",
            )}
          >
            <span className="min-w-0 flex-1 truncate">{thread.title}</span>
            <span className="shrink-0 text-[11px] text-muted-foreground">{thread.when}</span>
          </button>
        ))}
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

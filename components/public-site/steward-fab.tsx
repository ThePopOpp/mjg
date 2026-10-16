"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, Mail, MessageCircle, Sparkles, Tag, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  STEWARD_FAB_PILL_ACTION,
  STEWARD_FAB_PILL_PREFIX,
  STEWARD_FAB_SUBTITLE,
  STEWARD_FAB_TITLE,
  stewardFabLinks,
  type StewardFabLink,
} from "@/lib/public-site/steward-fab";

// The React half of the public Steward button.
//
// Same links, same words, same shape as the string version that goes onto the
// main/*.html pages — both read lib/public-site/steward-fab.ts, so only the
// glyphs are written twice.

const ICON: Record<StewardFabLink["icon"], React.ComponentType<{ className?: string }>> = {
  steward: Sparkles,
  pricing: Tag,
  contact: Mail,
  account: UserPlus,
};

export function StewardFab({ siteUrl, appUrl }: { siteUrl: string; appUrl: string }) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const links = React.useMemo(() => stewardFabLinks({ siteUrl, appUrl }), [siteUrl, appUrl]);

  React.useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="fixed bottom-5 right-5 z-[9990] flex flex-col items-end gap-3"
    >
      {open ? (
        <div
          role="dialog"
          aria-label={STEWARD_FAB_TITLE}
          className="w-80 max-w-[calc(100vw-2.5rem)] origin-bottom-right overflow-hidden rounded-2xl border bg-background shadow-2xl motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:slide-in-from-bottom-2"
        >
          <div className="px-[1.1rem] pb-3.5 pt-4">
            <p className="text-base font-bold">{STEWARD_FAB_TITLE}</p>
            <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">{STEWARD_FAB_SUBTITLE}</p>
          </div>

          {links.map((link) => {
            const Icon = ICON[link.icon];
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 border-t px-[1.1rem] py-3 no-underline transition-colors hover:bg-muted/60"
              >
                <Icon className="h-[18px] w-[18px] shrink-0 text-[#b88a4a]" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{link.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{link.note}</span>
                </span>
                <ChevronRight className="h-[15px] w-[15px] shrink-0 text-muted-foreground/60" />
              </Link>
            );
          })}
        </div>
      ) : null}

      <div className="flex items-center gap-2.5">
        {/* The pill costs more width than it earns on a phone. */}
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="hidden items-center gap-1.5 whitespace-nowrap rounded-full border bg-background px-[1.15rem] py-2.5 text-sm font-medium shadow-2xl transition-transform hover:-translate-y-px sm:inline-flex"
        >
          {STEWARD_FAB_PILL_PREFIX} <b className="font-semibold text-[#b88a4a]">{STEWARD_FAB_PILL_ACTION}</b>
        </button>

        <button
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-label={open ? "Close the Steward menu" : "Open the Steward menu"}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full bg-foreground text-background shadow-2xl transition-transform hover:scale-105",
          )}
        >
          {open ? <X className="h-[22px] w-[22px]" /> : <MessageCircle className="h-[22px] w-[22px]" />}
        </button>
      </div>
    </div>
  );
}

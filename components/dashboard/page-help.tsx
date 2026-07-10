"use client";

import { useState } from "react";
import { Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type HelpSection = { heading: string; body?: string; bullets?: string[] };

/**
 * PageHelp — an "i" info button that opens a scrollable modal explaining how a
 * page works. Content is passed as plain data (`sections`), so a server page can
 * render it directly. Used on Media Studio and CMS to onboard Super Admins/team.
 */
export function PageHelp({
  title,
  intro,
  sections,
  label = "How it works",
  className,
}: {
  title: string;
  intro?: string;
  sections: HelpSection[];
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={label}
        aria-label={label}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary shadow-sm transition-colors hover:bg-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          className,
        )}
      >
        <Info className="h-3.5 w-3.5" />
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="relative z-10 flex max-h-[86vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Info className="h-4 w-4 text-primary" /> {title}
              </h2>
              <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 overflow-y-auto px-5 py-4">
              {intro ? <p className="text-sm leading-6 text-muted-foreground">{intro}</p> : null}
              {sections.map((s) => (
                <div key={s.heading}>
                  <h3 className="text-sm font-semibold">{s.heading}</h3>
                  {s.body ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{s.body}</p> : null}
                  {s.bullets?.length ? (
                    <ul className="mt-1.5 space-y-1">
                      {s.bullets.map((b, i) => (
                        <li key={i} className="flex gap-2 text-sm leading-6 text-muted-foreground">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

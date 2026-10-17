"use client";

import * as React from "react";
import { Check, Info, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BLUEPRINT_PAGES, FREE_PAGES } from "@/lib/steward/blueprint";
import { PLAN_DETAILS } from "@/lib/steward/plan-details";

// "What's included", on request.
//
// The page list is rendered from the Blueprint constants rather than retyped
// into the marketing copy, so the pages advertised here are the pages the
// product actually has — titles, taglines and purposes included.

export function PlanDetailsDialog({ offerKey, planLabel }: { offerKey: string; planLabel: string }) {
  const detail = PLAN_DETAILS[offerKey];
  if (!detail) return null;

  const pages = detail.pages === "free" ? FREE_PAGES : detail.pages === "full" ? BLUEPRINT_PAGES : null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-full gap-1.5 text-[12.5px] text-muted-foreground hover:text-[#b88a4a]"
        >
          <Info className="h-3.5 w-3.5" />
          What&rsquo;s included
          <span className="sr-only"> in {planLabel}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="scroll-slim max-h-[85vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl leading-tight">{detail.heading}</DialogTitle>
          <DialogDescription className="text-[14px] leading-relaxed">{detail.lede}</DialogDescription>
        </DialogHeader>

        {pages ? (
          <section className="mt-1">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#b88a4a]">
              {detail.pagesIntro ?? "Pages"}
            </h3>
            <ol className="mt-3 overflow-hidden rounded-lg border">
              {pages.map((page, i) => (
                <li key={page.slug} className={i > 0 ? "border-t" : undefined}>
                  <div className="flex gap-3 px-3.5 py-3">
                    <span className="w-5 shrink-0 pt-0.5 text-right font-serif text-[13px] tabular-nums text-muted-foreground">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium leading-snug">{page.title}</p>
                      {page.tagline ? (
                        <p className="mt-0.5 font-serif text-[12.5px] italic text-muted-foreground">{page.tagline}</p>
                      ) : null}
                      <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{page.purpose}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {detail.sections.map((section) => (
          <section key={section.title} className="mt-1">
            <h3 className="text-[14px] font-semibold">{section.title}</h3>
            {section.body ? (
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">{section.body}</p>
            ) : null}
            {section.bullets?.length ? (
              <ul className="mt-2 space-y-1.5">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2.5 text-[13.5px] leading-snug">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#b88a4a]" />
                    <span className="text-muted-foreground">{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        {/* Said plainly rather than left to be discovered after paying. */}
        {detail.notIncluded?.length ? (
          <section className="mt-1 rounded-lg border bg-muted/40 p-4">
            <h3 className="text-[14px] font-semibold">Not included</h3>
            <ul className="mt-2 space-y-1.5">
              {detail.notIncluded.map((item) => (
                <li key={item} className="flex gap-2.5 text-[13.5px] leading-snug text-muted-foreground">
                  <Minus className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {detail.fineprint?.length ? (
          <div className="mt-1 space-y-1.5 border-t pt-4">
            {detail.fineprint.map((line) => (
              <p key={line} className="text-[11.5px] leading-relaxed text-muted-foreground">
                {line}
              </p>
            ))}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

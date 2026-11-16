"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { BLUEPRINT_SAMPLES, SAMPLE_NOTE, sampleImage, samplePdf } from "@/lib/marketing/blueprint-samples";
import { cn } from "@/lib/utils";
import { HorizontalScroller } from "./horizontal-scroller";

// /personal-blueprint "A look inside": real sample pages (fictional people),
// switchable by person and edition, each page opening full size.

export function BlueprintSamples({ label }: { label: string }) {
  const [activeId, setActiveId] = useState(BLUEPRINT_SAMPLES[0].id);
  const [open, setOpen] = useState<number | null>(null);
  const sample = BLUEPRINT_SAMPLES.find((s) => s.id === activeId) ?? BLUEPRINT_SAMPLES[0];
  const last = sample.pages.length - 1;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-deep dark:text-gold-light">{label}</p>
          <div role="tablist" aria-label="Sample Blueprints" className="mt-3 flex flex-wrap gap-2">
            {BLUEPRINT_SAMPLES.map((s) => {
              const on = s.id === sample.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActiveId(s.id)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-[13px] transition-colors",
                    on ? "border-gold bg-gold/10 font-semibold text-gold-deep dark:text-gold-light" : "bg-card hover:border-gold/60",
                  )}
                >
                  {s.person}, {s.age} · {s.edition} <span className="text-muted-foreground">({s.pages.length} pages)</span>
                </button>
              );
            })}
          </div>
        </div>
        <a
          href={samplePdf(sample.id)}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gold-deep no-underline hover:underline dark:text-gold-light"
        >
          <Download className="h-3.5 w-3.5" aria-hidden /> View {sample.person}&rsquo;s {sample.edition} Blueprint (PDF)
        </a>
      </div>
      <p className="mt-3 max-w-3xl text-pretty text-[14px] leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">{sample.person}, {sample.age}.</span> {sample.about}
      </p>

      <HorizontalScroller label={`${sample.person}'s ${sample.edition} Blueprint, ${sample.pages.length} pages`} className="mt-5">
        <ol className="flex gap-4">
          {sample.pages.map((title, i) => (
            <li key={`${sample.id}-${i}`} className="w-[184px] shrink-0 sm:w-[212px]">
              <button
                type="button"
                onClick={() => setOpen(i)}
                className="group block w-full text-left"
                aria-label={`Open page ${i + 1}: ${title}`}
              >
                <span className="relative block aspect-[612/792] overflow-hidden rounded-md border bg-card shadow-sm transition-shadow group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-gold/50">
                  <Image
                    src={sampleImage(sample.id, i)}
                    alt={`${sample.person}'s ${sample.edition} Blueprint, page ${i + 1}: ${title}`}
                    fill
                    sizes="212px"
                    className="object-cover"
                  />
                </span>
                <span className="mt-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-gold-deep dark:text-gold-light">Page {i + 1}</span>
                <span className="block text-pretty text-[13.5px] leading-snug">{title}</span>
              </button>
            </li>
          ))}
        </ol>
      </HorizontalScroller>

      <p className="mt-4 text-[12.5px] text-muted-foreground">{SAMPLE_NOTE}</p>

      <Dialog open={open !== null} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-h-[94vh] max-w-[min(760px,94vw)] gap-3 overflow-y-auto p-4 sm:p-5">
          {open !== null ? (
            <>
              <DialogTitle className="pr-8 font-display text-lg font-medium">
                Page {open + 1} · {sample.pages[open]}
              </DialogTitle>
              <DialogDescription className="text-[13px]">
                {sample.person}, {sample.age} · {sample.edition} Blueprint · Fictional illustration
              </DialogDescription>
              <div className="relative aspect-[612/792] w-full overflow-hidden rounded-md border bg-card">
                <Image src={sampleImage(sample.id, open)} alt={`Page ${open + 1}: ${sample.pages[open]}`} fill sizes="(min-width: 800px) 740px, 94vw" className="object-contain" />
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setOpen((o) => (o === null ? o : Math.max(0, o - 1)))}
                  disabled={open === 0}
                  className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                <span className="text-[12.5px] tabular-nums text-muted-foreground">
                  {open + 1} / {sample.pages.length}
                </span>
                <button
                  type="button"
                  onClick={() => setOpen((o) => (o === null ? o : Math.min(last, o + 1)))}
                  disabled={open === last}
                  className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm disabled:opacity-40"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

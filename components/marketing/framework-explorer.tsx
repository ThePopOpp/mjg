"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import type { Cta } from "@/lib/marketing/content/kit";
import { LAYER_KEYS, type FrameworkContent, type LayerKey } from "@/lib/marketing/content/scopes/global";
import { cn } from "@/lib/utils";
import { FrameworkTemple, type TempleSelect } from "./framework-temple";
import { keepTogether } from "./primitives";

// Home §02 (framework-temple.dc.html): seven tabs, a card describing the active
// layer, and the temple. The temple drives the card (autoplay, hover); a tab
// pins the temple to that layer.

export function FrameworkExplorer({
  framework,
  eyebrow,
  title,
  layerCta,
  frameworkCta,
  layerHrefBase = "/stewardship-blueprint",
  headingLevel = 2,
}: {
  framework: FrameworkContent;
  eyebrow: string;
  title: string;
  layerCta: string;
  frameworkCta: Cta;
  layerHrefBase?: string;
  headingLevel?: 1 | 2;
}) {
  const [active, setActive] = useState<LayerKey>("bedrock");
  const [select, setSelect] = useState<TempleSelect | null>(null);
  const onChange = useCallback((key: LayerKey) => setActive(key), []);
  const layer = framework.layers[active];
  const index = LAYER_KEYS.indexOf(active) + 1;
  const H = headingLevel === 1 ? "h1" : "h2";

  return (
    <div>
      <div role="tablist" aria-label="Framework layers" className="-mx-5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        <div className="grid min-w-[720px] grid-cols-7 gap-2">
          {LAYER_KEYS.map((key) => {
            const on = key === active;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setSelect({ key, nonce: Date.now() })}
                className={cn(
                  "flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-colors",
                  on ? "border-gold bg-gold/10 text-gold-deep dark:text-gold-light" : "bg-card hover:border-gold/60",
                )}
              >
                <span className={cn("font-display text-[15px] tabular-nums", on ? "text-gold" : "text-muted-foreground")}>
                  {framework.layers[key].number}
                </span>
                <span className="text-[13px] font-semibold leading-tight">{framework.layers[key].name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-2 md:items-center md:gap-12">
        <div className="min-w-0">
          <p className="text-[11.5px] font-bold uppercase tracking-[0.16em] text-gold-deep dark:text-gold-light">{eyebrow}</p>
          <H className="mt-3 text-balance font-display text-[clamp(1.75rem,3.4vw,2.4rem)] font-medium leading-[1.12] tracking-tight">{title}</H>

          <div className="mt-7 overflow-hidden rounded-xl border bg-card shadow-sm" aria-live="polite">
            <div className="flex items-center justify-between gap-3 border-b bg-muted/60 px-5 py-3">
              <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-gold-deep dark:text-gold-light">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
                {layer.eyebrow}
              </span>
              <span className="rounded-full border px-2.5 py-0.5 text-[11px] text-muted-foreground">{layer.part}</span>
            </div>
            <div className="p-5 sm:p-6">
              <h3 className="font-display text-xl font-medium leading-snug">{keepTogether(layer.title)}</h3>
              <p className="mt-3 text-[15px] leading-7 text-muted-foreground">{keepTogether(layer.body)}</p>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
                <Link
                  href={`${layerHrefBase}#layer-${index}`}
                  className="inline-flex h-10 items-center rounded-md bg-foreground px-4 text-[14px] font-semibold text-background no-underline hover:bg-foreground/85"
                >
                  {layerCta}
                </Link>
                {frameworkCta.label ? (
                  <Link href={frameworkCta.href} className="text-[14px] font-semibold text-gold-deep no-underline hover:underline dark:text-gold-light">
                    {frameworkCta.label}
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <FrameworkTemple framework={framework} select={select} onChange={onChange} />
          <p className="mt-3 text-center text-[12px] text-muted-foreground">{framework.hint}</p>
        </div>
      </div>
    </div>
  );
}

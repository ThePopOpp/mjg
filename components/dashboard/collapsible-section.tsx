"use client";

import { useEffect } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { cn } from "@/lib/utils";

/**
 * A dashboard section that collapses/expands, with a numeric count badge in the header.
 * The badge is MJG gold by default; it turns red when the count has grown since the user
 * last viewed this section (new items). Viewing it (this render) marks it seen so it reverts
 * to gold on the next load. `right` renders a trailing action that stays clickable.
 */
export function CollapsibleSection({
  title,
  count,
  sectionKey,
  isNew = false,
  right,
  defaultOpen = true,
  children,
}: {
  title: string;
  count: number;
  sectionKey?: string;
  isNew?: boolean;
  right?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const actionToken = useDashboardActionToken();

  // The section is on screen (default-open) — record that the user has now seen this count,
  // so the red "new" badge reverts to gold on the next load. Only writes when something's new.
  useEffect(() => {
    if (!isNew || !sectionKey) return;
    fetch("/api/me/dashboard-seen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionToken, section: sectionKey, count }),
    }).catch(() => {});
  }, [isNew, sectionKey, count, actionToken]);

  return (
    <Card className="overflow-hidden">
      <Accordion type="single" collapsible defaultValue={defaultOpen ? "section" : undefined}>
        <AccordionItem value="section" className="border-b-0">
          <div className="flex items-center gap-2 pr-5">
            <AccordionTrigger className="flex-1 px-5 hover:no-underline">
              <span className="flex items-center gap-2 text-base font-semibold">
                {title}
                <span
                  className={cn(
                    "inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-2 text-xs font-bold tabular-nums",
                    isNew ? "bg-red-600 text-white" : count > 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  {count}
                </span>
              </span>
            </AccordionTrigger>
            {right}
          </div>
          <AccordionContent className="px-0 pb-0">{children}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

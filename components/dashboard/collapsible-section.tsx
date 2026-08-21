"use client";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * A dashboard section that collapses/expands, with a live numeric count badge in the header.
 * `right` renders a trailing action (e.g. a "View all" link) that stays clickable.
 */
export function CollapsibleSection({
  title,
  count,
  right,
  defaultOpen = true,
  children,
}: {
  title: string;
  count: number;
  right?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
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
                  count > 0 ? "bg-red-600 text-white" : "bg-muted text-muted-foreground",
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

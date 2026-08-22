"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { cn } from "@/lib/utils";

/**
 * A dashboard section that collapses/expands, with a numeric count badge in the top-right of
 * the header. The badge is MJG gold by default and turns red when the count grew since the
 * user last viewed the section. Clicking the badge opens a modal with the details and a link
 * into the full page. Viewing marks the section seen (badge reverts to gold next load).
 */
export function CollapsibleSection({
  title,
  count,
  sectionKey,
  isNew = false,
  detailHref,
  detailLabel = "View full details",
  defaultOpen = true,
  className,
  children,
}: {
  title: string;
  count: number;
  sectionKey?: string;
  isNew?: boolean;
  detailHref?: string;
  detailLabel?: string;
  defaultOpen?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const actionToken = useDashboardActionToken();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!isNew || !sectionKey) return;
    fetch("/api/me/dashboard-seen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionToken, section: sectionKey, count }),
    }).catch(() => {});
  }, [isNew, sectionKey, count, actionToken]);

  const badgeClass = cn(
    "inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-2 text-xs font-bold tabular-nums",
    isNew ? "bg-red-600 text-white" : count > 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
  );

  return (
    <Card className={cn("overflow-hidden", className)}>
      <Accordion type="single" collapsible defaultValue={defaultOpen ? "section" : undefined}>
        <AccordionItem value="section" className="border-b-0">
          <div className="flex items-center gap-2 pr-4">
            <AccordionTrigger className="flex-1 px-5 hover:no-underline">
              <span className="text-base font-semibold">{title}</span>
            </AccordionTrigger>
            {detailHref ? (
              <button type="button" onClick={() => setModalOpen(true)} aria-label={`${title} details`} className={cn(badgeClass, "cursor-pointer transition hover:ring-2 hover:ring-primary/40")}>
                {count}
              </button>
            ) : (
              <span className={badgeClass}>{count}</span>
            )}
          </div>
          <AccordionContent className="px-0 pb-0">{children}</AccordionContent>
        </AccordionItem>
      </Accordion>

      {detailHref ? (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{count} {count === 1 ? "item" : "items"}</DialogDescription>
            </DialogHeader>
            <div className="overflow-x-auto">{children}</div>
            <DialogFooter>
              <Link href={detailHref} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                {detailLabel} <ArrowRight className="h-4 w-4" />
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </Card>
  );
}

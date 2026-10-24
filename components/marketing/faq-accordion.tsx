"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { keepTogether } from "./primitives";

/** One answer open at a time; the first starts open. */
export function FaqAccordion({ items }: { items: { id: string; question: string; answer: string }[] }) {
  if (!items.length) return null;
  return (
    <Accordion type="single" collapsible defaultValue={items[0].id} className="rounded-2xl border bg-card px-5 shadow-sm sm:px-6">
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id} className="last:border-b-0">
          <AccordionTrigger className="gap-4 py-5 text-[15.5px] font-semibold hover:no-underline">{keepTogether(item.question)}</AccordionTrigger>
          <AccordionContent className="pb-5 text-pretty text-[14.5px] leading-relaxed text-muted-foreground">{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

"use client";

import { Plus } from "lucide-react";
import type { Cta } from "@/lib/marketing/content/kit";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MARKETING_FONT_VARS } from "@/lib/marketing/fonts";
import { cn } from "@/lib/utils";
import { Actions, ButtonLink, Eyebrow, Heading, Prose, buttonClass } from "./primitives";

/**
 * "Read more" / "Learn more" → the full text in a dialog (home §01, the Check-In
 * intro). `trigger="button"` renders an outline button instead of the gold text
 * link; the action buttons are optional.
 */
export function ReadMoreDialog({
  label,
  eyebrow,
  title,
  body,
  primaryCta,
  secondaryCta,
  trigger = "link",
  className,
  children,
}: {
  label: string;
  eyebrow: string;
  title: string;
  body: string;
  primaryCta?: Cta | null;
  secondaryCta?: Cta | null;
  trigger?: "link" | "button";
  className?: string;
  /** Extra content after the text (e.g. the Check-In rating scale). */
  children?: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger === "button" ? (
          <button type="button" className={cn(buttonClass("outline"), "sm:min-w-[15rem]", className)}>
            <Plus className="h-4 w-4" aria-hidden />
            {label}
          </button>
        ) : (
          <button
            type="button"
            className={cn("mt-5 inline-flex items-center gap-2 text-[15px] font-semibold text-gold-deep hover:underline dark:text-gold-light", className)}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current">
              <Plus className="h-3.5 w-3.5" aria-hidden />
            </span>
            {label}
          </button>
        )}
      </DialogTrigger>
      {/* The dialog renders in a portal, outside the marketing layout, so it carries the font variables itself. */}
      <DialogContent className={cn(MARKETING_FONT_VARS, "max-h-[90vh] max-w-[680px] overflow-y-auto rounded-2xl p-7 font-marketing sm:p-9")}>
        <div>
          <Eyebrow pill>{eyebrow}</Eyebrow>
        </div>
        <DialogTitle asChild>
          <div>
            <Heading title={title} level={2} accent className="mt-4" />
          </div>
        </DialogTitle>
        <DialogDescription asChild>
          <div>
            <Prose text={body} className="mt-2 text-base leading-7 text-muted-foreground" />
          </div>
        </DialogDescription>
        {children}
        {primaryCta?.label || secondaryCta?.label ? (
          <Actions className="mt-6">
            <ButtonLink cta={primaryCta} />
            <ButtonLink cta={secondaryCta} variant="outline" />
          </Actions>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

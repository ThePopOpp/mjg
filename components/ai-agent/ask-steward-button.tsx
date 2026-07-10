"use client";

import { useState } from "react";
import { Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentChat } from "@/components/ai-agent/agent-chat";

/**
 * Reusable "Ask Steward" launcher — a button that opens the AI agent in a modal,
 * pre-seeded with entity context (via `extraContext`) and tap-to-run
 * `suggestions`. Use anywhere an individual item (a resource, an edit request)
 * should be triageable by Steward in-app.
 */
export function AskStewardButton({
  label = "Ask Steward",
  size = "sm",
  variant = "outline",
  className,
  title = "Steward",
  subtitle,
  suggestions,
  extraContext,
  emptyTitle,
  emptyHint,
}: {
  label?: string;
  size?: "sm" | "default" | "icon";
  variant?: "outline" | "ghost" | "default" | "secondary";
  className?: string;
  title?: string;
  subtitle?: string;
  suggestions?: string[];
  extraContext?: string;
  emptyTitle?: string;
  emptyHint?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" onClick={() => setOpen(true)} variant={variant} size={size} className={className}>
        <Bot className="h-4 w-4" /> {label}
      </Button>

      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="relative z-10 w-full max-w-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute -right-3 -top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card shadow hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
            <AgentChat
              title={title}
              subtitle={subtitle}
              suggestions={suggestions}
              extraContext={extraContext}
              audio
              heightClassName="h-[72vh] min-h-[440px]"
              emptyTitle={emptyTitle}
              emptyHint={emptyHint}
            />
          </div>
        </div>
      )}
    </>
  );
}

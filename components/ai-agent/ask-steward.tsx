"use client";

import { useState } from "react";
import { Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentChat } from "@/components/ai-agent/agent-chat";

const PM_SUGGESTIONS = [
  "What projects and tasks do we have right now?",
  "Create a task “Draft launch email” under the CMS and Experience project, due next Friday.",
  "Which tasks are blocked, overdue, or unassigned?",
  "Connect the CMS task so it waits on the CMS and Experience project.",
];

// "Ask Steward" — opens the AI agent in a modal, scoped/branded for the Project
// Manager and with PM tools available. Text or voice (mic + read-aloud).
export function AskSteward() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" className="shrink-0 gap-1.5">
        <Bot className="h-4 w-4" /> Ask Steward
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="relative z-10 w-full max-w-2xl">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute -right-3 -top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card shadow hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
            <AgentChat
              title="Steward"
              subtitle="Project Manager assistant"
              suggestions={PM_SUGGESTIONS}
              placeholder="Ask Steward about your projects… (Enter to send, mic to speak)"
              audio
              heightClassName="h-[72vh] min-h-[440px]"
              emptyTitle="How can I help with your projects?"
              emptyHint="I know everything the Project Manager can do — projects, tasks, phases, milestones, dependencies, templates, attachments, and visibility. Ask in text or tap the mic to speak."
            />
          </div>
        </div>
      )}
    </>
  );
}

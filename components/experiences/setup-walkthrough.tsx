"use client";

import { useState } from "react";
import {
  HelpCircle, Sparkles, CalendarDays, Users, Send, Clock, Eye, Rocket,
  ChevronLeft, ChevronRight, Check, Mail, PauseCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

type Step = { icon: typeof Sparkles; title: string; body: string; tip?: string };

const STEPS: Step[] = [
  {
    icon: Sparkles,
    title: "Click “Start New Challenge”",
    body: "On the Experiences page, click the Start New Challenge button. A short form opens — you'll fill it out top to bottom.",
  },
  {
    icon: CalendarDays,
    title: "Pick the challenge",
    body: "Choose “6 Week Challenge” (one email step per week) or “6 Week Challenge - Bi-Weekly” (the same emails, spaced every two weeks over 12 weeks). Same content either way — just the pace differs.",
    tip: "Not sure? Start with the weekly 6 Week Challenge.",
  },
  {
    icon: Users,
    title: "Add the men joining",
    body: "Type each person's name and email. Click “Add recipient” for as many as you need — participants, facilitators, or anyone you want in the group.",
  },
  {
    icon: Send,
    title: "Send the invitations",
    body: "Keep “Send account invitations” on so each person gets an invite to create their account. Choose Send now, or Schedule it for a specific date and time.",
  },
  {
    icon: Clock,
    title: "Set the challenge start date",
    body: "Pick the actual Week 1 date and time — the day the challenge begins. This is the anchor for everything.",
    tip: "The 48-hour and 24-hour reminder emails go out automatically before this date. You don't set those yourself.",
  },
  {
    icon: Eye,
    title: "Set visibility (optional)",
    body: "Decide who can see and run this challenge: All facilitators, only Selected facilitators, or Admins only. You can also assign one facilitator as the owner.",
  },
  {
    icon: Rocket,
    title: "Launch it",
    body: "Leave “Start the challenge” on and click Start Challenge — the whole email series is scheduled from your start date. Turn it off first if you'd rather save it as a draft to finish later.",
  },
];

export function SetupWalkthrough() {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const total = STEPS.length;
  const onLast = i === total; // the final "what happens next" recap screen

  function start() { setI(0); setOpen(true); }

  const step = STEPS[i];
  const Icon = onLast ? Check : step.icon;

  return (
    <>
      <Button type="button" variant="outline" onClick={start}>
        <HelpCircle className="mr-2 h-4 w-4" /> How to Start a New Challenge
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary"><Icon className="h-4 w-4" /></span>
              {onLast ? "That's it — here's what happens next" : step.title}
            </DialogTitle>
            <DialogDescription>{onLast ? "Once you click Start Challenge, the app runs the rest for you." : `Step ${i + 1} of ${total}`}</DialogDescription>
          </DialogHeader>

          {onLast ? (
            <div className="space-y-3 py-1 text-sm">
              <Recap icon={Mail} title="When someone accepts their invite" body="They instantly get the “Challenge Accepted” welcome email." />
              <Recap icon={Clock} title="Before the start date" body="The 48-hour “Start Strong” reminder and the 24-hour “Welcome & What to Expect” email go out on their own." />
              <Recap icon={Send} title="Through the challenge" body="Each weekly (or bi-weekly) email sends itself on schedule — no action needed from you." />
              <Recap icon={PauseCircle} title="Anytime" body="Edit, Pause/Resume, or Delete a challenge from the Experiences list. Results show in Reports and each participant's dashboard." />
            </div>
          ) : (
            <div className="space-y-3 py-1">
              <p className="text-sm leading-6 text-foreground">{step.body}</p>
              {step.tip ? (
                <p className="rounded-lg border border-primary/30 bg-primary/[0.04] p-3 text-sm text-muted-foreground"><span className="font-medium text-primary">Tip: </span>{step.tip}</p>
              ) : null}
            </div>
          )}

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {Array.from({ length: total + 1 }, (_, d) => (
              <button
                key={d}
                type="button"
                aria-label={`Go to step ${d + 1}`}
                onClick={() => setI(d)}
                className={`h-1.5 rounded-full transition-all ${d === i ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"}`}
              />
            ))}
          </div>

          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="ghost" onClick={() => setI((n) => Math.max(0, n - 1))} disabled={i === 0}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            {onLast ? (
              <Button type="button" onClick={() => setOpen(false)}>Got it</Button>
            ) : (
              <Button type="button" onClick={() => setI((n) => Math.min(total, n + 1))}>
                {i === total - 1 ? "What happens next" : "Next"} <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Recap({ icon: Icon, title, body }: { icon: typeof Mail; title: string; body: string }) {
  return (
    <div className="flex gap-3 rounded-lg border p-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary"><Icon className="h-4 w-4" /></span>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

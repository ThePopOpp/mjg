"use client";

import { useEffect, useRef, useState } from "react";
import {
  Rocket, Sparkles, CalendarClock, Tag, Users, Gauge, Send, ClipboardList,
  ChevronLeft, ChevronRight, Check, type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Step = { icon: LucideIcon; title: string; body: string; tip?: string };

const STEPS: Step[] = [
  { icon: Sparkles, title: "Open the launcher", body: "On the Experiences page, click Start New Challenge. A short form opens — you fill it top to bottom." },
  { icon: CalendarClock, title: "Pick the challenge", body: "Choose “6 Week Challenge – Bi-Weekly.” It carries the full, ready-to-send email sequence." },
  { icon: Tag, title: "Name the group", body: "Give it a clear name like “Core 5 Group” so it’s easy to find later.", tip: "Optional, but recommended for multiple groups." },
  { icon: Users, title: "Add the men joining", body: "Type each person’s name and email, and add a row for everyone in the group — participants or facilitators." },
  { icon: Gauge, title: "Choose the pace", body: "Weekly sends one module per week — the standard schedule. Bi-Weekly spaces the modules every two weeks.", tip: "Weekly matches the standard 6-week plan." },
  { icon: CalendarClock, title: "Set the start date & time", body: "Pick the Week 1 date and time (Arizona). Everything anchors to this — the week-before Welcome and the 48-hour reminder go out before it automatically.", tip: "You don’t set the reminder dates yourself — they’re calculated for you." },
  { icon: Send, title: "Send the invitations", body: "Keep invitations on so each person gets an invite to join. Send now, or schedule them for a specific date and time." },
  { icon: ClipboardList, title: "Launch & review", body: "Click Start Challenge. Then open the group’s Schedule to see every dated email — you can reschedule or Send-now any of them." },
];

export function LaunchStepsModal({
  triggerLabel = "Launch Steps",
  triggerVariant = "outline",
  triggerClassName,
}: {
  triggerLabel?: string;
  triggerVariant?: "outline" | "ghost" | "default" | "secondary";
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(true); // false during the transition
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const last = STEPS.length - 1;
  const step = STEPS[i];
  const Icon = step.icon;

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function nav(d: 1 | -1) {
    const next = i + d;
    if (next < 0 || next > last) return;
    setShown(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { setI(next); setShown(true); }, 160);
  }

  function openAt0() { setI(0); setShown(true); setOpen(true); }

  return (
    <>
      <Button variant={triggerVariant} size="sm" onClick={openAt0} className={triggerClassName}>
        <Rocket className="mr-2 h-4 w-4" /> {triggerLabel}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-primary" /> How to launch a challenge
            </DialogTitle>
          </DialogHeader>

          {/* Progress bar */}
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all duration-500 ease-out" style={{ width: `${((i + 1) / STEPS.length) * 100}%` }} />
          </div>
          <p className="text-xs font-medium text-muted-foreground">Step {i + 1} of {STEPS.length}</p>

          {/* Animated step */}
          <div className={cn("min-h-[190px] transition-all duration-200 ease-out", shown ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0")}>
            <div className="flex flex-col items-center gap-4 py-3 text-center">
              <span className={cn("flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300", shown ? "scale-100" : "scale-90")}>
                <Icon className="h-8 w-8" />
              </span>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mx-auto max-w-sm text-sm text-muted-foreground">{step.body}</p>
                {step.tip ? (
                  <p className="mx-auto max-w-sm rounded-md bg-primary/5 px-3 py-2 text-xs text-primary">💡 {step.tip}</p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-1.5">
            {STEPS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Go to step ${idx + 1}`}
                onClick={() => { if (idx !== i) { setShown(false); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => { setI(idx); setShown(true); }, 160); } }}
                className={cn("h-1.5 rounded-full transition-all duration-300", idx === i ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50")}
              />
            ))}
          </div>

          {/* Footer nav */}
          <div className="mt-1 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => nav(-1)} disabled={i === 0} className="gap-1">
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            {i < last ? (
              <Button size="sm" onClick={() => nav(1)} className="gap-1">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button size="sm" onClick={() => setOpen(false)} className="gap-1.5">
                <Check className="h-4 w-4" /> Got it
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { LAYERS, NEXT_STEP_OPTIONS, SCALE } from "@/lib/check-in/created-for-more";
import type { CheckInDemoContent } from "@/lib/marketing/content/scopes/page-home";
import { cn } from "@/lib/utils";

// Home §03: the Created for More Check-In, playing itself.
//
// Everything on the card is the real Check-In — its statements, its 1–5 scale,
// its results step and next-step options (lib/check-in/created-for-more) — typed
// in on a loop so a visitor sees what taking it is like. The whole card is a
// link to the real thing.
//
// The animation is a pure function of a clock: `at(t)` decides what is on
// screen at second t, so pausing (off-screen, tab hidden) and looping are free.
// Reduced motion shows a finished results step and never moves.

const TOTAL = LAYERS.reduce((n, l) => n + l.statements.length, 0);

// Three statements from different layers, and the answer "chosen" for each.
const STEPS = [
  { layer: 1, statement: 1, answer: 4 }, // Foundation · "My calendar reflects my stated priorities."
  { layer: 2, statement: 0, answer: 3 }, // Four Pillars · Family
  { layer: 3, statement: 0, answer: 5 }, // Guardrails
].map((s) => {
  const layer = LAYERS[s.layer];
  const number = LAYERS.slice(0, s.layer).reduce((n, l) => n + l.statements.length, 0) + s.statement + 1;
  return { ...s, layer, text: layer.statements[s.statement].text, number };
});

const CPS = 32; // typing speed, characters per second
const QUESTION = 3.4; // seconds per question
const CAPTURE_AT = STEPS.length * QUESTION;
const LOOP = CAPTURE_AT + 7.5;

function typed(text: string, start: number, t: number) {
  if (t <= start) return "";
  return text.slice(0, Math.floor((t - start) * CPS));
}

export function CheckInDemo({ demo, href }: { demo: CheckInDemoContent; href: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [t, setT] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    if (mq.matches) return;

    let visible = false;
    let raf = 0;
    let last = performance.now();
    let clock = 0;
    const frame = (now: number) => {
      // rAF timestamps can trail performance.now(), so a reset of `last` can make dt negative.
      const dt = Math.max(0, Math.min(0.5, (now - last) / 1000));
      last = now;
      if (visible && !document.hidden) {
        clock = (clock + dt) % LOOP;
        setT(clock);
      }
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      last = performance.now();
    }, { threshold: 0.25 });
    if (ref.current) io.observe(ref.current);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  const time = reduced ? LOOP - 1 : t;
  const capture = time >= CAPTURE_AT;
  const stepIndex = Math.max(0, Math.min(STEPS.length - 1, Math.floor(time / QUESTION)));
  const step = STEPS[stepIndex];
  const local = time - stepIndex * QUESTION;
  const statement = typed(step.text, 0.15, local);
  const chosen = local > 0.25 + step.text.length / CPS + 0.45 ? step.answer : null;
  const answered = stepIndex + (chosen ? 1 : 0);
  const progress = capture ? 100 : ((step.number - 1 + (chosen ? 1 : 0)) / TOTAL) * 100;

  const c = time - CAPTURE_AT;
  const name = typed(demo.sampleName, 0.5, c);
  const email = typed(demo.sampleEmail, 1.2 + demo.sampleName.length / CPS, c);
  const emailDone = 1.2 + demo.sampleName.length / CPS + demo.sampleEmail.length / CPS;
  const ticked = c > emailDone + 0.4;
  const pressed = c > emailDone + 1.3 && c < emailDone + 1.7;
  const sent = c > emailDone + 1.7;

  const caret = <span aria-hidden className="ml-px inline-block h-[1.05em] w-px translate-y-[2px] animate-pulse bg-gold" />;

  return (
    <Link
      ref={ref}
      href={href}
      aria-label={`${demo.heading}: start the free Check-In`}
      className="group relative block rounded-2xl border bg-card p-6 text-foreground no-underline shadow-sm transition-[border-color,box-shadow] hover:border-gold hover:shadow-[0_18px_48px_rgba(184,138,74,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:p-7"
    >
      <div aria-hidden className="pointer-events-none select-none">
        <div className="flex items-center justify-between gap-3 text-[13px]">
          <span className="font-semibold">{demo.heading}</span>
          <span className="tabular-nums text-muted-foreground">
            {capture ? "Results" : `Question ${step.number} of ${TOTAL}`}
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-gold transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>

        <div className="relative mt-6 min-h-[17.5rem]">
          {/* Rating a statement */}
          <div className={cn("absolute inset-0 transition-opacity duration-300", capture ? "opacity-0" : "opacity-100")}>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-deep dark:text-gold-light">
              Layer {step.layer.index} of {LAYERS.length} · {step.layer.subtitle}
            </p>
            <p className="mt-2 min-h-[3.4em] font-display text-xl leading-snug">
              {statement}
              {!chosen ? caret : null}
            </p>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {SCALE.map((s) => (
                <span
                  key={s.value}
                  className={cn(
                    "flex h-11 items-center justify-center rounded-md border text-[15px] transition-colors duration-200",
                    chosen === s.value ? "border-gold bg-gold font-semibold text-white" : "text-muted-foreground",
                  )}
                >
                  {s.value}
                </span>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[12px] text-muted-foreground">
              <span>{SCALE[0].description.replace(" in my life right now.", "")}</span>
              <span>{SCALE[SCALE.length - 1].description.split(" and ")[0]}</span>
            </div>
            <p className="mt-5 text-[12.5px] text-muted-foreground">
              {chosen ? <>Answered: <span className="font-medium text-foreground">{SCALE[step.answer - 1].label}</span></> : " "}
            </p>
            <div className="mt-4 flex gap-1.5">
              {LAYERS.map((l, i) => (
                <span
                  key={l.key}
                  className={cn("h-1.5 flex-1 rounded-full", i < step.layer.index - 1 || (i === step.layer.index - 1 && answered) ? "bg-gold/70" : "bg-muted")}
                />
              ))}
            </div>
          </div>

          {/* The results step */}
          <div className={cn("absolute inset-0 transition-opacity duration-300", capture ? "opacity-100" : "opacity-0")}>
            <p className="text-sm font-semibold">{demo.captureHeading}</p>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              <span className="flex h-10 items-center rounded-md border bg-background px-3 text-[14px]">
                {name || <span className="text-muted-foreground">Your name</span>}
                {c > 0.4 && name.length < demo.sampleName.length ? caret : null}
              </span>
              <span className="flex h-10 items-center overflow-hidden whitespace-nowrap rounded-md border bg-background px-3 text-[14px]">
                {email || <span className="text-muted-foreground">Email address</span>}
                {email && email.length < demo.sampleEmail.length ? caret : null}
              </span>
            </div>
            <div className="mt-3 grid gap-1.5">
              {NEXT_STEP_OPTIONS.slice(0, 3).map((o, i) => {
                const on = i === 0 && ticked;
                return (
                  <span key={o.key} className={cn("flex min-w-0 items-center gap-2.5 rounded-md border px-3 py-2 text-[13px] transition-colors", on && "border-gold bg-gold/10")}>
                    <span className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded border", on ? "border-gold bg-gold text-white" : "border-input")}>
                      {on ? <Check className="h-3 w-3" /> : null}
                    </span>
                    <span className="truncate">{o.label}</span>
                  </span>
                );
              })}
            </div>
            <div className="mt-4 flex justify-end">
              <span
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-md bg-foreground px-4 text-[14px] font-semibold text-background transition-transform",
                  pressed && "scale-95",
                )}
              >
                {sent ? <Check className="h-4 w-4" /> : null}
                {demo.submitLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      <span className="pointer-events-none absolute inset-x-6 bottom-4 flex justify-center opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 sm:inset-x-7">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-1.5 text-[13px] font-semibold text-white shadow-md">
          {demo.clickHint.replace(/\s*→\s*$/, "")}
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </span>
    </Link>
  );
}

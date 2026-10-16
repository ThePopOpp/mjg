"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ArrowUp, BookOpen, Check, Copy, Mic, RefreshCw, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  CONVERSATION_CHOICES,
  STEWARD_OPENING_LINE,
  type ConversationChoice,
} from "@/lib/steward/blueprint";

// Steward, in the owner's chat layout.
//
// The shell is the mock: status row with a live orb, a scrolling transcript with
// assistant replies as plain text and member replies as bubbles, and a composer
// that lifts on focus and turns into a waveform while recording.
//
// The content is the docset, and three pieces of it are not negotiable:
//
//   1. The opening line is mandated verbatim.
//   2. Listen First / Help Me Think / Help Me Take a Step is a mode switch that
//      stays reachable in every mode — hence the pills in the status row, not
//      only the chips on the empty state.
//   3. Steward PROPOSES wording. Nothing reaches a Blueprint until the member
//      approves the exact words, and the card changing state is the receipt —
//      Steward never says "I've saved that for you".
//
// PROTOTYPE: replies are scripted and typed out on a timer. Nothing is sent
// anywhere and the microphone is not opened; the waveform is animated so the
// recording state can be reviewed.

type Message =
  | { id: number; role: "steward"; text: string; streaming?: boolean }
  | { id: number; role: "member"; text: string; voice?: boolean }
  | { id: number; role: "proposal"; label: string; href: string; text: string; approved: boolean };

const OPENERS: Record<ConversationChoice, string> = {
  listen: "I'm listening. Take as long as you want, and I won't offer anything back unless you ask me to.",
  think: "Let's think it through. What's the decision in front of you — and what makes it hard?",
  step: "Let's find one thing small enough that you'll actually do it this week. What's been sitting undone?",
};

/** The scripted exchange, so propose-and-approve can be clicked through. */
const SCRIPT: {
  member: string;
  steward: string;
  proposal?: { label: string; href: string; text: string };
}[] = [
  {
    member: "I keep saying yes to things and then resenting it.",
    steward:
      "That sounds less like a scheduling problem and more like a guardrail that isn't written down yet. When you say yes in the moment — what are you protecting by saying it?",
  },
  {
    member: "Not looking difficult, I think. Or not letting people down.",
    steward:
      "Then the cost lands on the people closest to you instead. Here is wording for your Guardrails page — change anything that isn't right, and nothing goes on your Blueprint until you say so.",
    proposal: {
      label: "Guardrails — Protect What Matters",
      href: "/steward/blueprint/guardrails",
      text: "I don't answer yes on the spot. I say \"let me check and come back to you\" — and I do come back.",
    },
  },
];

const VOICE_LINE = "Honestly it's the same thing at church as it is at work.";

export function Conversation({
  pageContext,
  nextStep,
}: {
  pageContext?: { title: string; href: string };
  nextStep?: string;
}) {
  const [choice, setChoice] = React.useState<ConversationChoice | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [draft, setDraft] = React.useState("");
  const [step, setStep] = React.useState(0);
  const [thinking, setThinking] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [listening, setListening] = React.useState(false);
  const [bars, setBars] = React.useState<number[]>(() => Array(28).fill(0.15));
  const [seconds, setSeconds] = React.useState(0);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  // Every timer this component starts, so unmounting (or cancelling a recording)
  // cannot leave one running against a component that is gone.
  type Timer = ReturnType<typeof setTimeout>;
  const timers = React.useRef<Timer[]>([]);

  const track = React.useCallback((t: Timer) => {
    timers.current.push(t);
    return t;
  }, []);

  const clearTimers = React.useCallback(() => {
    for (const t of timers.current) {
      clearTimeout(t);
      clearInterval(t);
    }
    timers.current = [];
  }, []);

  React.useEffect(() => clearTimers, [clearTimers]);

  React.useEffect(() => {
    // Only once there is a transcript — on the empty state this would scroll the
    // opening line off the top of a phone screen.
    if (messages.length === 0 && !thinking) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, thinking]);

  const streaming = messages.some((m) => m.role === "steward" && m.streaming);
  const busy = thinking || streaming || listening;
  const statusText = listening
    ? "Listening…"
    : thinking
      ? "Thinking…"
      : streaming
        ? "Responding…"
        : "Grounded in your Blueprint";

  /** Types a reply out, then adds its proposal card if it has one. */
  function reply(text: string, proposal?: { label: string; href: string; text: string }) {
    setThinking(true);
    track(
      setTimeout(() => {
        const id = Date.now();
        setThinking(false);
        setMessages((m) => [...m, { id, role: "steward", text: "", streaming: true }]);

        let i = 0;
        const tick: Timer = track(
          setInterval(() => {
            i += 3;
            const done = i >= text.length;
            setMessages((m) =>
              m.map((msg) =>
                msg.id === id && msg.role === "steward"
                  ? { ...msg, text: text.slice(0, i), streaming: !done }
                  : msg,
              ),
            );
            if (done) {
              clearInterval(tick);
              if (proposal) {
                setMessages((m) => [...m, { id: id + 1, role: "proposal", ...proposal, approved: false }]);
              }
            }
          }, 22),
        );
      }, 700),
    );
  }

  function pick(next: ConversationChoice) {
    setChoice(next);
    setMessages([{ id: Date.now(), role: "steward", text: OPENERS[next] }]);
    setStep(0);
  }

  function advance(voice?: boolean) {
    if (busy) return;
    const entry = SCRIPT[step];
    const text = voice ? VOICE_LINE : entry?.member;
    if (!text) return;

    setMessages((m) => [...m, { id: Date.now(), role: "member", text, voice }]);
    setDraft("");
    if (inputRef.current) inputRef.current.style.height = "auto";

    if (voice) {
      reply("Same pattern, different room. That is usually a sign it belongs on a page rather than in a calendar.");
      return;
    }
    setStep(step + 1);
    reply(entry.steward, entry.proposal);
  }

  /** "Show me my Blueprint" — the conversational route to it. */
  function askForBlueprint() {
    if (busy) return;
    setMessages((m) => [...m, { id: Date.now(), role: "member", text: "Show me my Blueprint." }]);
    reply(
      "Here it is. Five of the thirteen pages are untouched — that is not a backlog, just where you have got to.",
    );
    track(
      setTimeout(() => {
        setMessages((m) => [
          ...m,
          {
            id: Date.now() + 2,
            role: "proposal",
            label: "Open My Blueprint",
            href: "/steward/blueprint",
            text: "Your Blueprint, as it actually stands today.",
            approved: true,
          },
        ]);
      }, 3200),
    );
  }

  function approve(id: number) {
    setMessages((m) =>
      m.map((msg) => (msg.id === id && msg.role === "proposal" ? { ...msg, approved: true } : msg)),
    );
  }

  function startVoice() {
    setListening(true);
    setSeconds(0);
    let t = 0;
    track(
      setInterval(() => {
        t += 1;
        setSeconds(Math.floor(t / 12));
        setBars((prev) =>
          prev.map((_, k) => {
            const wave = Math.sin(t * 0.5 + k * 0.6) * 0.5 + 0.5;
            return 0.12 + Math.random() * 0.25 + wave * 0.6 * (Math.random() > 0.3 ? 1 : 0.3);
          }),
        );
      }, 85),
    );
  }

  function endVoice(send: boolean) {
    clearTimers();
    setListening(false);
    setBars(Array(28).fill(0.15));
    if (send) advance(true);
  }

  const hasDraft = draft.trim().length > 0;
  const scriptSpent = step >= SCRIPT.length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Status row */}
      <div className="flex flex-none flex-wrap items-center justify-between gap-x-4 gap-y-2.5 border-b px-5 py-3 md:px-7">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden
            className={cn(
              "h-2.5 w-2.5 shrink-0 rounded-full transition-colors",
              busy ? "animate-pulse bg-[#b88a4a]" : "bg-[#b88a4a]/50",
            )}
          />
          <span className="min-w-0">
            <span className="block text-[14px] font-semibold leading-tight">Steward</span>
            <span className="block truncate text-[12px] text-muted-foreground">{statusText}</span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* The mode switch, reachable at any point — not only at the start. */}
          {choice
            ? CONVERSATION_CHOICES.map((c) => (
                <Button
                  key={c.key}
                  type="button"
                  size="sm"
                  variant={choice === c.key ? "default" : "outline"}
                  aria-pressed={choice === c.key}
                  onClick={() => pick(c.key)}
                  className={cn(
                    "h-7 rounded-full px-3 text-[12px]",
                    choice === c.key && "bg-[#b88a4a] text-white hover:bg-[#a67c42]",
                  )}
                >
                  {c.label}
                </Button>
              ))
            : null}
          <Badge variant="outline" className="rounded-full text-[11px] font-semibold text-muted-foreground">
            Blueprint context on
          </Badge>
        </div>
      </div>

      {/* Transcript */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto px-5 pb-2 pt-6 md:px-7 md:pt-7">
        <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6">
          {messages.length === 0 && !thinking ? (
            <div className="flex flex-col items-start gap-4 py-6">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Steward
              </p>
              {/* Mandated verbatim. Do not reword. */}
              <h1 className="max-w-[20ch] text-[30px] font-semibold leading-[1.12] tracking-[-0.02em] sm:max-w-none sm:text-[34px]">
                {STEWARD_OPENING_LINE}
              </h1>
              <p className="font-serif text-[22px] italic text-muted-foreground sm:text-[26px]">
                How would you like me to help right now?
              </p>

              <div className="mt-1 grid w-full gap-2.5 sm:grid-cols-3">
                {CONVERSATION_CHOICES.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => pick(c.key)}
                    className="rounded-xl border bg-card p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-[#b88a4a] hover:bg-[#b88a4a]/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="block text-[13.5px] font-semibold">{c.label}</span>
                    <span className="mt-1 block text-[12px] leading-snug text-muted-foreground">{c.blurb}</span>
                  </button>
                ))}
              </div>

              <p className="text-[11.5px] text-muted-foreground">You can change this at any point.</p>

              {pageContext ? (
                <p className="text-[13px] text-muted-foreground">
                  Working on{" "}
                  <Link href={pageContext.href} className="font-medium text-foreground underline underline-offset-2">
                    {pageContext.title}
                  </Link>
                </p>
              ) : null}
            </div>
          ) : null}

          {messages.map((m) =>
            m.role === "proposal" ? (
              <div key={m.id} className="rounded-2xl border border-[#b88a4a]/50 bg-[#b88a4a]/[0.07] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#b88a4a]">
                  {m.href === "/steward/blueprint" ? "Your Blueprint" : `Proposed for ${m.label}`}
                </p>
                <p className="mt-2 font-serif text-[17px] leading-relaxed">&ldquo;{m.text}&rdquo;</p>

                {m.href === "/steward/blueprint" ? (
                  <Button asChild size="sm" className="mt-3.5 gap-1.5 bg-[#b88a4a] text-white hover:bg-[#a67c42]">
                    <Link href={m.href}>
                      <BookOpen className="h-3.5 w-3.5" /> Open My Blueprint
                    </Link>
                  </Button>
                ) : m.approved ? (
                  <div className="mt-3.5 flex flex-wrap items-center gap-2">
                    <Badge className="gap-1 bg-[#b88a4a] text-white hover:bg-[#b88a4a]">
                      <Check className="h-3 w-3" /> Added to your Blueprint
                    </Badge>
                    <Button asChild size="sm" variant="ghost" className="h-7 gap-1 px-2 text-[12px]">
                      <Link href={m.href}>
                        See the page <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="mt-3.5 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => approve(m.id)} className="bg-[#b88a4a] text-white hover:bg-[#a67c42]">
                      Add this to my Blueprint
                    </Button>
                    <Button size="sm" variant="outline">
                      Change the wording
                    </Button>
                    <Button size="sm" variant="ghost" className="text-muted-foreground">
                      Not now
                    </Button>
                  </div>
                )}
              </div>
            ) : m.role === "member" ? (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[78%] rounded-[16px_16px_4px_16px] bg-foreground px-4 py-2.5 text-[15px] leading-relaxed text-background">
                  {m.voice ? (
                    <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] opacity-70">
                      <Mic className="h-3 w-3" /> Voice
                    </span>
                  ) : null}
                  {m.text}
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-foreground"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-background" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="whitespace-pre-wrap text-[15px] leading-[1.6]">
                    {m.text}
                    {m.streaming ? (
                      <span className="ml-0.5 inline-block h-[14px] w-[2px] animate-pulse align-[-2px] bg-foreground" />
                    ) : null}
                  </p>
                  {!m.streaming ? (
                    <div className="mt-2 flex gap-1 text-muted-foreground">
                      <Button size="icon" variant="ghost" aria-label="Copy" className="h-7 w-7">
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" aria-label="Try another reply" className="h-7 w-7">
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            ),
          )}

          {thinking ? (
            <div className="flex items-start gap-3">
              <span
                aria-hidden
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-foreground"
              >
                <span className="h-2.5 w-2.5 animate-ping rounded-full bg-background" />
              </span>
              <span className="flex h-[42px] items-center gap-1.5 rounded-xl border bg-card px-3.5">
                <span className="sr-only">Steward is thinking</span>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/50"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Composer */}
      <div className="flex-none px-5 pb-5 pt-2 md:px-7">
        <div className="mx-auto w-full max-w-[760px]">
          <div
            className={cn(
              "rounded-2xl border-[1.5px] bg-card transition-all",
              listening || focused ? "-translate-y-0.5 border-foreground shadow-lg" : "border-input shadow-sm",
            )}
          >
            {listening ? (
              <div className="flex min-h-[52px] items-center gap-3.5 py-1.5 pl-3 pr-1.5">
                <div aria-hidden className="flex h-9 flex-1 items-center gap-[3px]">
                  {bars.map((h, i) => (
                    <span
                      key={i}
                      className="min-w-[2px] max-w-[4px] flex-1 rounded-sm bg-foreground transition-[height] duration-75"
                      style={{ height: `${Math.round(h * 100)}%`, opacity: 0.45 + h * 0.55 }}
                    />
                  ))}
                </div>
                <span className="whitespace-nowrap text-[13px] tabular-nums text-muted-foreground">
                  0:{String(seconds).padStart(2, "0")}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Cancel recording"
                  onClick={() => endVoice(false)}
                  className="h-9 w-9 shrink-0 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  aria-label="Send recording"
                  onClick={() => endVoice(true)}
                  className="h-9 w-9 shrink-0 rounded-full"
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-end gap-2 py-1.5 pl-3.5 pr-1.5">
                <Textarea
                  ref={inputRef}
                  rows={1}
                  value={draft}
                  aria-label="Message Steward"
                  placeholder={
                    choice
                      ? scriptSpent
                        ? "Scripted exchange ended"
                        : "Ask Steward anything…"
                      : "Choose an option above"
                  }
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  onChange={(e) => {
                    const el = e.currentTarget;
                    el.style.height = "auto";
                    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
                    setDraft(el.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      advance();
                    }
                  }}
                  className="max-h-40 min-h-0 flex-1 resize-none overflow-hidden border-0 bg-transparent px-0 py-2 text-[15px] leading-relaxed shadow-none focus-visible:ring-0"
                />
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Record a voice message"
                  onClick={startVoice}
                  disabled={!choice || busy}
                  className="h-9 w-9 shrink-0 rounded-full"
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  aria-label="Send"
                  onClick={() => advance()}
                  disabled={!choice || busy || scriptSpent}
                  className={cn(
                    "h-9 w-9 shrink-0 rounded-full transition-transform",
                    !hasDraft && "scale-90 bg-muted text-muted-foreground hover:bg-muted",
                  )}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Present on every screen, never behind a menu: the docset requires the
              safety route to work even when generation fails or access has ended,
              and the resources come from a reviewed static list, not the model. */}
          <p className="mt-2.5 px-1 text-[11.5px] leading-relaxed text-muted-foreground">
            Steward is not a counsellor, doctor or crisis service. In the US you can call or text{" "}
            <strong className="text-foreground">988</strong> for mental-health crisis support.{" "}
            <Link href="/legal" className="underline underline-offset-2">
              How Steward handles what you share
            </Link>
          </p>

          <div className="mt-1.5 flex flex-wrap justify-between gap-x-4 gap-y-1 px-1 text-[11.5px] text-muted-foreground">
            <span>Steward can make mistakes. Confirm anything that touches money or commitments.</span>
            <span className="hidden sm:inline">
              <kbd className="rounded border px-1">⏎</kbd> send ·{" "}
              <kbd className="rounded border px-1">⇧⏎</kbd> newline
            </span>
          </div>

          <p className="mt-1 px-1 text-[11.5px] text-muted-foreground">
            Prototype: send plays the next scripted exchange ·{" "}
            <button
              type="button"
              onClick={askForBlueprint}
              disabled={busy}
              className="underline underline-offset-2 hover:text-foreground disabled:opacity-50"
            >
              Show me my Blueprint
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}

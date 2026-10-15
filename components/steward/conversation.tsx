"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Send, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { CONVERSATION_CHOICES, STEWARD_OPENING_LINE, type ConversationChoice } from "@/lib/steward/blueprint";

// The Steward conversation.
//
// PROTOTYPE: replies are written in advance. The point of this screen is to
// review three product decisions that are not about chat at all:
//
//   1. You choose HOW Steward engages before it says anything useful — Listen
//      First, Help Me Think, Help Me Take a Step. The docset keeps these
//      available in every mode, so they are a mode switch, not a greeting.
//   2. Steward PROPOSES wording; nothing reaches the Blueprint until the
//      participant approves the exact words. That is why a proposal renders as
//      a card with an explicit approve action rather than as prose.
//   3. Steward never claims something was saved. It reports what the
//      application confirmed, which is why the approved card changes state
//      rather than Steward saying "I've added that for you".

type Message =
  | { role: "steward"; text: string }
  | { role: "member"; text: string }
  | { role: "proposal"; label: string; text: string; approved: boolean };

const CANNED: Record<ConversationChoice, Message[]> = {
  listen: [
    {
      role: "steward",
      text: "I'm listening. Take as long as you want, and I won't offer anything back unless you ask me to.",
    },
  ],
  think: [
    {
      role: "steward",
      text: "Let's think it through. What's the decision in front of you — and what makes it hard?",
    },
  ],
  step: [
    {
      role: "steward",
      text: "Let's find one thing small enough that you'll actually do it this week. What's been sitting undone?",
    },
  ],
};

/** A scripted exchange, so the proposal-and-approval flow is reviewable. */
const SCRIPT: Message[] = [
  { role: "member", text: "I keep saying yes to things and then resenting it." },
  {
    role: "steward",
    text: "That sounds less like a scheduling problem and more like a guardrail that isn't written down yet. When you say yes in the moment — what are you protecting by saying it?",
  },
  { role: "member", text: "Not looking difficult, I think. Or not letting people down." },
  {
    role: "steward",
    text: "Then the cost is landing on the people closest to you instead. Here is wording for your Guardrails page — change anything that isn't right, and nothing goes on your Blueprint until you say so.",
  },
  {
    role: "proposal",
    label: "Guardrails — Protect What Matters",
    text: "I don't answer yes on the spot. I say \"let me check and come back to you\" — and I do come back.",
    approved: false,
  },
];

export function Conversation({ pageContext }: { pageContext?: string }) {
  const [choice, setChoice] = React.useState<ConversationChoice | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [draft, setDraft] = React.useState("");
  const [step, setStep] = React.useState(0);

  function pick(next: ConversationChoice) {
    setChoice(next);
    setMessages(CANNED[next]);
    setStep(0);
  }

  // Walks the script one exchange at a time, so the flow can be clicked through.
  function advance() {
    if (step >= SCRIPT.length) return;
    const nextPair = SCRIPT.slice(step, step + 2);
    setMessages((m) => [...m, ...nextPair]);
    setStep(step + 2);
    setDraft("");
  }

  function approve(index: number) {
    setMessages((m) =>
      m.map((msg, i) => (i === index && msg.role === "proposal" ? { ...msg, approved: true } : msg)),
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-6 py-8">
      <header>
        <h1 className="font-serif text-2xl">Steward</h1>
        {pageContext ? (
          <p className="mt-1 text-[13px] text-muted-foreground">
            Working on <span className="font-medium text-foreground">{pageContext}</span>
          </p>
        ) : null}
      </header>

      {/* The opening line, verbatim as the docset mandates. */}
      <div className="mt-6 rounded-2xl border bg-card p-5">
        <p className="font-serif text-[17px] leading-relaxed">{STEWARD_OPENING_LINE}</p>
        {!choice ? (
          <>
            <p className="mt-4 text-[13px] text-muted-foreground">How would you like me to help right now?</p>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
              {CONVERSATION_CHOICES.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => pick(c.key)}
                  className="rounded-xl border p-3.5 text-left transition-colors hover:border-[#b88a4a] hover:bg-[#b88a4a]/[0.05]"
                >
                  <span className="block text-sm font-semibold">{c.label}</span>
                  <span className="mt-1 block text-[12px] leading-snug text-muted-foreground">{c.blurb}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-[11.5px] text-muted-foreground">You can change this at any point.</p>
          </>
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {CONVERSATION_CHOICES.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => pick(c.key)}
                className={cn(
                  "rounded-full border px-3 py-1 text-[12px] font-medium transition-colors",
                  choice === c.key
                    ? "border-[#b88a4a] bg-[#b88a4a] text-white"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Transcript */}
      {messages.length ? (
        <div className="mt-6 space-y-4">
          {messages.map((m, i) =>
            m.role === "proposal" ? (
              <div key={i} className="rounded-xl border border-[#b88a4a]/50 bg-[#b88a4a]/[0.05] p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#b88a4a]">
                  Proposed for {m.label}
                </p>
                <p className="mt-2 font-serif text-[16px] leading-relaxed">&ldquo;{m.text}&rdquo;</p>
                {m.approved ? (
                  <p className="mt-3.5 inline-flex items-center gap-1.5 rounded-md bg-[#b88a4a] px-3 py-1.5 text-[12px] font-semibold text-white">
                    <Check className="h-3.5 w-3.5" /> Added to your Blueprint
                  </p>
                ) : (
                  <div className="mt-3.5 flex flex-wrap gap-2">
                    <button
                      onClick={() => approve(i)}
                      className="rounded-md bg-[#b88a4a] px-3.5 py-1.5 text-[13px] font-semibold text-white"
                    >
                      Add this to my Blueprint
                    </button>
                    <button className="rounded-md border px-3.5 py-1.5 text-[13px] font-medium hover:bg-background">
                      Change the wording
                    </button>
                    <button className="rounded-md px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground">
                      Not now
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div key={i} className={cn("flex", m.role === "member" ? "justify-end" : "justify-start")}>
                <p
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed",
                    m.role === "member" ? "bg-[#2b2724] text-white" : "border bg-card",
                  )}
                >
                  {m.text}
                </p>
              </div>
            ),
          )}
        </div>
      ) : null}

      {/* Composer */}
      {choice ? (
        <div className="mt-6">
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              placeholder={step >= SCRIPT.length ? "The scripted exchange has ended." : "Say what's on your mind…"}
              className="min-h-[3rem] flex-1 resize-none rounded-xl border bg-background px-3.5 py-2.5 text-[15px]"
            />
            <button
              onClick={advance}
              disabled={step >= SCRIPT.length}
              className="rounded-xl bg-[#b88a4a] p-3 text-white disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-[11.5px] text-muted-foreground">
            Prototype: anything you type is ignored — the send button plays the next scripted exchange.
          </p>
        </div>
      ) : null}

      {/* Always present, never behind a menu. The docset requires the safety
          route to work even when generation fails or paid access has ended, and
          the resources come from a reviewed static list rather than the model. */}
      <aside className="mt-10 flex items-start gap-2.5 rounded-xl border p-4">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="text-[12.5px] leading-relaxed text-muted-foreground">
          Steward is not a counsellor, doctor or crisis service. If you are in immediate danger, contact your local
          emergency services. In the US you can call or text <strong className="text-foreground">988</strong> for
          mental-health crisis support.{" "}
          <Link href="/legal" className="underline underline-offset-2">
            How Steward handles what you share
          </Link>
        </p>
      </aside>
    </div>
  );
}

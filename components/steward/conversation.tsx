"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Check, Send, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CONVERSATION_CHOICES, STEWARD_OPENING_LINE, type ConversationChoice } from "@/lib/steward/blueprint";

// Steward — the screen a member lands on.
//
// PROTOTYPE: replies are scripted. The point is to review three product
// decisions that are not really about chat:
//
//   1. You choose HOW Steward engages before it says anything useful — Listen
//      First, Help Me Think, Help Me Take a Step. The docset keeps these
//      available in every mode, so they are a mode switch rather than a greeting.
//   2. Steward PROPOSES wording; nothing reaches the Blueprint until the
//      participant approves the exact words. A proposal is therefore a card with
//      an explicit action, not prose that quietly becomes a record.
//   3. Steward never claims something was saved. The card changes state instead,
//      which is the receipt — not Steward saying "I've added that for you".
//
// Colour comes from theme tokens so both themes work; the only literal is the
// brand gold, which carries on light and dark alike. `bg-primary` flips between
// ink and cream by theme, which is why the member's own messages use it.

export type ConversationMessage =
  | { role: "steward"; text: string }
  | { role: "member"; text: string }
  | { role: "proposal"; label: string; href: string; text: string; approved: boolean };

const OPENERS: Record<ConversationChoice, string> = {
  listen: "I'm listening. Take as long as you want, and I won't offer anything back unless you ask me to.",
  think: "Let's think it through. What's the decision in front of you — and what makes it hard?",
  step: "Let's find one thing small enough that you'll actually do it this week. What's been sitting undone?",
};

/** A scripted exchange, so the propose-and-approve flow can be clicked through. */
const SCRIPT: ConversationMessage[] = [
  { role: "member", text: "I keep saying yes to things and then resenting it." },
  {
    role: "steward",
    text: "That sounds less like a scheduling problem and more like a guardrail that isn't written down yet. When you say yes in the moment — what are you protecting by saying it?",
  },
  { role: "member", text: "Not looking difficult, I think. Or not letting people down." },
  {
    role: "steward",
    text: "Then the cost lands on the people closest to you instead. Here is wording for your Guardrails page — change anything that isn't right, and nothing goes on your Blueprint until you say so.",
  },
  {
    role: "proposal",
    label: "Guardrails — Protect What Matters",
    href: "/steward/blueprint/guardrails",
    text: "I don't answer yes on the spot. I say \"let me check and come back to you\" — and I do come back.",
    approved: false,
  },
];

export function Conversation({
  pageContext,
  nextStep,
}: {
  pageContext?: { title: string; href: string };
  nextStep?: string;
}) {
  const [choice, setChoice] = React.useState<ConversationChoice | null>(null);
  const [messages, setMessages] = React.useState<ConversationMessage[]>([]);
  const [draft, setDraft] = React.useState("");
  const [step, setStep] = React.useState(0);

  function pick(next: ConversationChoice) {
    setChoice(next);
    setMessages([{ role: "steward", text: OPENERS[next] }]);
    setStep(0);
  }

  function advance() {
    if (step >= SCRIPT.length) return;
    setMessages((m) => [...m, ...SCRIPT.slice(step, step + 2)]);
    setStep(step + 2);
    setDraft("");
  }

  /** "Ask Steward for the Blueprint" — the conversational route to it. */
  function askForBlueprint() {
    setMessages((m) => [
      ...m,
      { role: "member", text: "Show me my Blueprint." },
      {
        role: "steward",
        text: "Here it is. Five of the thirteen pages are untouched — that is not a backlog, just where you have got to.",
      },
      {
        role: "proposal",
        label: "Open My Blueprint",
        href: "/steward/blueprint",
        text: "Your Blueprint, as it actually stands today.",
        approved: true,
      },
    ]);
  }

  function approve(index: number) {
    setMessages((m) =>
      m.map((msg, i) => (i === index && msg.role === "proposal" ? { ...msg, approved: true } : msg)),
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 py-8">
      {/* Where you are. Compact, above the conversation, so the step you already
          committed to is the first thing you see — not a prompt to chat more. */}
      {nextStep ? (
        <Card className="border-[#b88a4a]/60 bg-[#b88a4a]/[0.06]">
          <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#b88a4a]">
                My next faithful step
              </p>
              <p className="mt-1 font-serif text-base leading-snug">{nextStep}</p>
            </div>
            <Button size="sm" className="gap-1.5 bg-[#b88a4a] text-white hover:bg-[#a67c42]">
              <Check className="h-3.5 w-3.5" /> I did this
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <header>
        <h1 className="font-serif text-2xl">Steward</h1>
        {pageContext ? (
          <p className="mt-1 text-[13px] text-muted-foreground">
            Working on{" "}
            <Link href={pageContext.href} className="font-medium text-foreground underline underline-offset-2">
              {pageContext.title}
            </Link>
          </p>
        ) : null}
      </header>

      {/* The opening line, verbatim as the docset mandates. */}
      <Card>
        <CardContent className="p-5">
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
                    className="rounded-lg border bg-background p-3.5 text-left transition-colors hover:border-[#b88a4a] hover:bg-[#b88a4a]/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="block text-sm font-semibold">{c.label}</span>
                    <span className="mt-1 block text-[12px] leading-snug text-muted-foreground">{c.blurb}</span>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[11.5px] text-muted-foreground">You can change this at any point.</p>
            </>
          ) : (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {CONVERSATION_CHOICES.map((c) => (
                <Button
                  key={c.key}
                  type="button"
                  size="sm"
                  variant={choice === c.key ? "default" : "outline"}
                  aria-pressed={choice === c.key}
                  onClick={() => pick(c.key)}
                  className={cn("h-7 rounded-full px-3 text-[12px]", choice === c.key && "bg-[#b88a4a] text-white hover:bg-[#a67c42]")}
                >
                  {c.label}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transcript */}
      {messages.length ? (
        <div className="space-y-4">
          {messages.map((m, i) =>
            m.role === "proposal" ? (
              <Card key={i} className="border-[#b88a4a]/60 bg-[#b88a4a]/[0.06]">
                <CardContent className="p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#b88a4a]">
                    {m.approved && m.href === "/steward/blueprint" ? "Your Blueprint" : `Proposed for ${m.label}`}
                  </p>
                  <p className="mt-2 font-serif text-[16px] leading-relaxed">&ldquo;{m.text}&rdquo;</p>

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
                      <Button
                        size="sm"
                        onClick={() => approve(i)}
                        className="bg-[#b88a4a] text-white hover:bg-[#a67c42]"
                      >
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
                </CardContent>
              </Card>
            ) : (
              <div key={i} className={cn("flex", m.role === "member" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed",
                    m.role === "member"
                      ? // Theme-aware: ink on light, cream on dark.
                        "bg-primary text-primary-foreground"
                      : "border bg-card text-card-foreground",
                  )}
                >
                  {m.text}
                </div>
              </div>
            ),
          )}
        </div>
      ) : null}

      {/* Composer */}
      {choice ? (
        <div>
          <div className="flex items-end gap-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              aria-label="Message Steward"
              placeholder={step >= SCRIPT.length ? "The scripted exchange has ended." : "Say what's on your mind…"}
              className="min-h-[3rem] flex-1 resize-none text-[15px]"
            />
            <Button
              onClick={advance}
              disabled={step >= SCRIPT.length}
              size="icon"
              aria-label="Send"
              className="h-11 w-11 shrink-0 bg-[#b88a4a] text-white hover:bg-[#a67c42]"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* The conversational route into the Blueprint, alongside the nav link. */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" className="h-7 gap-1.5 text-[12px]" onClick={askForBlueprint}>
              <BookOpen className="h-3.5 w-3.5" /> Show me my Blueprint
            </Button>
            <span className="text-[11.5px] text-muted-foreground">
              Prototype: typing is ignored — send plays the next scripted exchange.
            </span>
          </div>
        </div>
      ) : null}

      {/* Always present, never behind a menu. The docset requires the safety route
          to work even when generation fails or paid access has ended, and the
          resources come from a reviewed static list rather than the model. */}
      <Card className="bg-muted/40">
        <CardContent className="flex items-start gap-2.5 p-4">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-[12.5px] leading-relaxed text-muted-foreground">
            Steward is not a counsellor, doctor or crisis service. If you are in immediate danger, contact your local
            emergency services. In the US you can call or text <strong className="text-foreground">988</strong> for
            mental-health crisis support.{" "}
            <Link href="/legal" className="underline underline-offset-2">
              How Steward handles what you share
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUp, BookOpen, Check, Loader2, Mic, Square } from "lucide-react";
import { useEveAgent } from "eve/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CONVERSATION_CHOICES, STEWARD_OPENING_LINE, type ConversationChoice } from "@/lib/steward/blueprint";

// Steward, talking for real.
//
// The transcript comes from eve. The APPROVAL CARDS DO NOT — they are fetched
// from /api/steward/blueprint, which reads the canonical record. That split is
// deliberate: if this screen drew approval buttons by parsing the model's
// output, a hallucinated proposal would render a button that approves something
// no service ever recorded. The model proposes into the database; the screen
// draws what the database says is waiting.
//
// Which also means a proposal survives a refresh, a new tab, and closing the
// laptop. It is a record, not a message.

type Pending = {
  proposalId: string;
  wording: string;
  page: string;
  pageTitle: string;
  fieldLabel: string;
  currentWording: string | null;
};

const MODE_PREAMBLE: Record<ConversationChoice, string> = {
  listen:
    "I want you to listen first. Don't offer advice back unless I ask for it.",
  think: "Help me think this through.",
  step: "Help me take one step.",
};

/**
 * Minimal formatting for Steward's replies.
 *
 * Steward is told to write prose, not markdown — a four-point list with bold
 * headings is the generic-assistant voice the docset is trying to avoid. But a
 * model will occasionally emit `**bold**` anyway, and raw asterisks on screen
 * look broken, so this renders the two things that actually slip through:
 * paragraph breaks and bold spans.
 *
 * Deliberately NOT a markdown renderer. Model output is rendered as text, never
 * as HTML, so there is no path from a reply to markup in the page.
 */
function Formatted({ text }: { text: string }) {
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim().length > 0);

  return (
    <>
      {paragraphs.map((paragraph, i) => (
        <p key={i} className={i > 0 ? "mt-3" : undefined}>
          {paragraph.split(/(\*\*[^*]+\*\*)/g).map((piece, j) =>
            piece.startsWith("**") && piece.endsWith("**") && piece.length > 4 ? (
              <strong key={j} className="font-semibold">
                {piece.slice(2, -2)}
              </strong>
            ) : (
              <React.Fragment key={j}>{piece}</React.Fragment>
            ),
          )}
        </p>
      ))}
    </>
  );
}

/**
 * Speech-to-text, on the member's own device.
 *
 * Uses the browser's SpeechRecognition where it exists. Audio never leaves the
 * machine and nothing is sent to a provider — which matters more here than
 * usual, because the things people say to Steward out loud are the things they
 * find hardest to type.
 *
 * Returns `supported: false` where the API is missing (Firefox, and some
 * locked-down builds), and the button is hidden rather than shown broken. A
 * dictation button that silently does nothing is worse than no button, which is
 * why the prototype's microphone was never wired to anything real.
 */
type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function useDictation(onText: (text: string) => void) {
  const [supported, setSupported] = React.useState(false);
  const [listening, setListening] = React.useState(false);
  const recognitionRef = React.useRef<Recognition | null>(null);
  const onTextRef = React.useRef(onText);
  onTextRef.current = onText;

  React.useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: new () => Recognition;
      webkitSpeechRecognition?: new () => Recognition;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;

    setSupported(true);
    const recognition = new Ctor();
    recognition.continuous = true;
    // Interim results make it feel live; only final ones are appended, so a
    // half-heard word never lands in the box.
    recognition.interimResults = true;
    recognition.lang = navigator.language || "en-US";

    recognition.onresult = (event) => {
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) finalText += result[0].transcript;
      }
      if (finalText.trim()) onTextRef.current(finalText);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.stop();
      } catch {
        // Already stopped; nothing to do.
      }
    };
  }, []);

  const toggle = React.useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (listening) {
      recognition.stop();
      setListening(false);
      return;
    }
    try {
      recognition.start();
      setListening(true);
    } catch {
      // start() throws if it is already running; treat it as running.
      setListening(true);
    }
  }, [listening]);

  return { supported, listening, toggle };
}

export function LiveConversation() {
  const agent = useEveAgent();
  const [draft, setDraft] = React.useState("");
  const [mode, setMode] = React.useState<ConversationChoice | null>(null);
  const [pending, setPending] = React.useState<Pending[]>([]);
  const [deciding, setDeciding] = React.useState<string | null>(null);
  const [decided, setDecided] = React.useState<Record<string, "approved" | "declined" | "failed">>({});

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  // Dictation appends to the draft rather than sending: the member still reads
  // what was heard and presses send themselves.
  const dictation = useDictation((text) => {
    setDraft((current) => (current ? `${current.trimEnd()} ${text.trim()}` : text.trim()));
  });

  const busy = agent.status === "submitted" || agent.status === "streaming";
  // Flat, UIMessage-shaped projection. `conversation.turns` is a record of
  // runtime turns, not the renderable transcript — the messages live here.
  const messages = agent.conversation?.messages ?? [];

  /** What is waiting on the member, from the record rather than the transcript. */
  const refreshPending = React.useCallback(async () => {
    try {
      const res = await fetch("/api/steward/blueprint", { cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as { pending: Pending[] };
      setPending(json.pending ?? []);
    } catch {
      // A failed refresh leaves the last known list rather than clearing it —
      // showing nothing would imply there is nothing waiting, which we do not
      // know.
    }
  }, []);

  React.useEffect(() => {
    void refreshPending();
  }, [refreshPending]);

  // Steward only proposes during a turn, so this is when the record changes.
  React.useEffect(() => {
    if (agent.status === "ready") void refreshPending();
  }, [agent.status, refreshPending]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, agent.status, pending.length]);

  // Registered from here rather than by the agent: this is the only place that
  // knows both the session id and what the member actually typed, and their own
  // session authenticates it. The title is their first words, never a summary.
  const registered = React.useRef(false);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const firstMessage = messages.length === 0;
    setDraft("");
    if (inputRef.current) inputRef.current.style.height = "auto";

    void agent.send(trimmed).then(() => {
      const sessionId = agent.session?.sessionId;
      if (!sessionId || (registered.current && !firstMessage)) return;
      registered.current = true;
      void fetch("/api/steward/conversations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId, title: firstMessage ? trimmed : undefined }),
      }).catch(() => {
        // A conversation missing from the list is a cosmetic loss; it must not
        // interrupt the conversation itself.
      });
    });
  }

  function pickMode(next: ConversationChoice) {
    setMode(next);
    // The mode is sent as the member's own words rather than hidden system
    // text: the docset keeps these three available as a posture the member
    // chooses, and Steward should be answering a person, not a flag.
    if (messages.length === 0) send(MODE_PREAMBLE[next]);
  }

  async function decide(proposalId: string, decision: "approve" | "decline") {
    setDeciding(proposalId);
    try {
      const res = await fetch("/api/steward/blueprint/decision", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ proposalId, decision }),
      });
      const json = await res.json().catch(() => ({}));

      // `saved` comes from the write receipt. Anything else is reported as not
      // saved — never as success we did not confirm.
      if (decision === "approve") {
        setDecided((d) => ({ ...d, [proposalId]: json.saved ? "approved" : "failed" }));
      } else {
        setDecided((d) => ({ ...d, [proposalId]: json.declined ? "declined" : "failed" }));
      }
      await refreshPending();
    } catch {
      setDecided((d) => ({ ...d, [proposalId]: "failed" }));
    } finally {
      setDeciding(null);
    }
  }

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
            <span className="block truncate text-[12px] text-muted-foreground">
              {agent.status === "streaming"
                ? "Responding…"
                : agent.status === "submitted"
                  ? "Thinking…"
                  : agent.status === "error"
                    ? "Something went wrong"
                    : "Grounded in your Blueprint"}
            </span>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {mode
            ? CONVERSATION_CHOICES.map((c) => (
                <Button
                  key={c.key}
                  type="button"
                  size="sm"
                  variant={mode === c.key ? "default" : "outline"}
                  aria-pressed={mode === c.key}
                  disabled={busy}
                  onClick={() => {
                    setMode(c.key);
                    send(MODE_PREAMBLE[c.key]);
                  }}
                  className={cn(
                    "h-7 rounded-full px-3 text-[12px]",
                    mode === c.key && "bg-[#b88a4a] text-white hover:bg-[#a67c42]",
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
      <div ref={scrollRef} className="scroll-slim min-h-0 flex-1 overflow-auto px-5 pb-2 pt-6 md:px-7 md:pt-7">
        <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-start gap-4 py-6">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Steward</p>
              {/* Shown here as well as said by the agent, so the first screen is
                  never blank while the first turn is still travelling. */}
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
                    disabled={busy}
                    onClick={() => pickMode(c.key)}
                    className="rounded-xl border bg-card p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-[#b88a4a] hover:bg-[#b88a4a]/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                  >
                    <span className="block text-[13.5px] font-semibold">{c.label}</span>
                    <span className="mt-1 block text-[12px] leading-snug text-muted-foreground">{c.blurb}</span>
                  </button>
                ))}
              </div>
              <p className="text-[11.5px] text-muted-foreground">You can change this at any point.</p>
            </div>
          ) : null}

          {messages.map((message) => {
            // Only the text parts are rendered. Tool calls are deliberately not
            // shown: a member does not need to watch Steward read their
            // Blueprint, and a proposal appears as a card from the record below
            // rather than as a tool result here.
            const text = message.parts
              .filter((part) => part.type === "text")
              .map((part) => ("text" in part ? part.text : ""))
              .join("");
            if (!text.trim()) return null;

            const isMember = message.role === "user";
            return (
              <div
                key={message.id}
                className={cn("flex", isMember ? "justify-end" : "items-start gap-3")}
              >
                {!isMember ? (
                  <span
                    aria-hidden
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-foreground"
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-background" />
                  </span>
                ) : null}
                <div
                  className={cn(
                    isMember
                      ? "max-w-[78%] rounded-[16px_16px_4px_16px] bg-foreground px-4 py-2.5 text-[15px] leading-relaxed text-background"
                      : "min-w-0 flex-1 text-[15px] leading-[1.6]",
                  )}
                >
                  {isMember ? text : <Formatted text={text} />}
                </div>
              </div>
            );
          })}

          {agent.status === "submitted" ? (
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

          {/* Proposals, from the record. */}
          {pending.map((proposal) => {
            const outcome = decided[proposal.proposalId];
            return (
              <div
                key={proposal.proposalId}
                className="rounded-2xl border border-[#b88a4a]/50 bg-[#b88a4a]/[0.07] p-4"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#b88a4a]">
                  Proposed for {proposal.pageTitle} · {proposal.fieldLabel}
                </p>

                {proposal.currentWording ? (
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    <span className="font-semibold">Replacing:</span> &ldquo;{proposal.currentWording}&rdquo;
                  </p>
                ) : null}

                <p className="mt-2 font-serif text-[17px] leading-relaxed">&ldquo;{proposal.wording}&rdquo;</p>

                {outcome === "failed" ? (
                  <p className="mt-3 text-[13px] text-destructive">
                    That did not save. Nothing has changed on your Blueprint — try again.
                  </p>
                ) : null}

                <div className="mt-3.5 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={deciding !== null}
                    onClick={() => void decide(proposal.proposalId, "approve")}
                    className="bg-[#b88a4a] text-white hover:bg-[#a67c42]"
                  >
                    {deciding === proposal.proposalId ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : null}
                    Add this to my Blueprint
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={deciding !== null || busy}
                    onClick={() => send("Change the wording — here's what I'd say instead: ")}
                  >
                    Change the wording
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground"
                    disabled={deciding !== null}
                    onClick={() => void decide(proposal.proposalId, "decline")}
                  >
                    Not now
                  </Button>
                </div>
              </div>
            );
          })}

          {/* Confirmations stay after the card they belong to disappears. */}
          {Object.entries(decided)
            .filter(([id, outcome]) => outcome === "approved" && !pending.some((p) => p.proposalId === id))
            .map(([id]) => (
              <div key={`done-${id}`} className="flex flex-wrap items-center gap-2">
                <Badge className="gap-1 bg-[#b88a4a] text-white hover:bg-[#b88a4a]">
                  <Check className="h-3 w-3" /> Added to your Blueprint
                </Badge>
                <Button asChild size="sm" variant="ghost" className="h-7 gap-1 px-2 text-[12px]">
                  <Link href="/steward/blueprint">
                    <BookOpen className="h-3 w-3" /> See the page
                  </Link>
                </Button>
              </div>
            ))}

          {agent.status === "error" ? (
            <p className="text-[13px] text-destructive" role="alert">
              Steward could not answer that. Nothing has been lost — try again, or come back in a moment.
            </p>
          ) : null}
        </div>
      </div>

      {/* Composer */}
      <div className="flex-none px-5 pb-5 pt-2 md:px-7">
        <div className="mx-auto w-full max-w-[760px]">
          <div className="rounded-2xl border-[1.5px] border-input bg-card shadow-sm transition-all focus-within:-translate-y-0.5 focus-within:border-foreground focus-within:shadow-lg">
            <div className="flex items-end gap-2 py-1.5 pl-3.5 pr-1.5">
              <Textarea
                ref={inputRef}
                rows={1}
                value={draft}
                aria-label="Message Steward"
                placeholder="Say what's on your mind…"
                onChange={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
                  setDraft(el.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(draft);
                  }
                }}
                className="max-h-40 min-h-0 flex-1 resize-none overflow-hidden border-0 bg-transparent px-0 py-2 text-[15px] leading-relaxed shadow-none focus-visible:ring-0"
              />
              {dictation.supported ? (
                <Button
                  size="icon"
                  variant="outline"
                  aria-label={dictation.listening ? "Stop dictation" : "Dictate a message"}
                  aria-pressed={dictation.listening}
                  onClick={dictation.toggle}
                  className={cn(
                    "h-9 w-9 shrink-0 rounded-full",
                    dictation.listening && "animate-pulse border-[#b88a4a] bg-[#b88a4a]/15 text-[#b88a4a]",
                  )}
                >
                  {dictation.listening ? <Square className="h-3.5 w-3.5" /> : <Mic className="h-4 w-4" />}
                </Button>
              ) : null}

              <Button
                size="icon"
                aria-label="Send"
                onClick={() => send(draft)}
                disabled={busy || draft.trim().length === 0}
                className={cn(
                  "h-9 w-9 shrink-0 rounded-full transition-transform",
                  draft.trim().length === 0 && "scale-90 bg-muted text-muted-foreground hover:bg-muted",
                )}
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {dictation.listening ? (
            <p className="mt-2 px-1 text-[12px] text-[#b88a4a]" role="status">
              Listening — speak, then press stop. Nothing is sent until you do.
            </p>
          ) : null}

          <p className="mt-2.5 px-1 text-[11.5px] leading-relaxed text-muted-foreground">
            Steward is not a counsellor, doctor or crisis service. In the US you can call or text{" "}
            <strong className="text-foreground">988</strong> for mental-health crisis support.{" "}
            <Link href="/legal" className="underline underline-offset-2">
              How Steward handles what you share
            </Link>
          </p>

          <p className="mt-1.5 px-1 text-[11.5px] text-muted-foreground">
            Steward can make mistakes. Nothing reaches your Blueprint until you approve the exact words.
          </p>
        </div>
      </div>
    </div>
  );
}

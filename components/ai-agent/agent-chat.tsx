"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, Send, Loader2, Check, X, ShieldAlert, Wrench, Sparkles, RefreshCw, Mic, Volume2, VolumeX } from "lucide-react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ToolCall = { id: string; type: "function"; function: { name: string; arguments: string } };
type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
};
type PendingAction = { toolCallId: string; name: string; args: Record<string, unknown>; summary: string };

const DEFAULT_SUGGESTIONS = [
  "Give me a pilot overview.",
  "Show me the last 10 calls.",
  "Find participant John and summarize their check-ins.",
  "Draft a warm SMS to a participant who missed a check-in.",
];

export type AgentChatProps = {
  title?: string;
  subtitle?: string;
  suggestions?: string[];
  placeholder?: string;
  audio?: boolean;
  heightClassName?: string;
  emptyTitle?: string;
  emptyHint?: string;
};

function friendlyToolName(name: string) {
  return name.replace(/_/g, " ");
}

export function AgentChat({
  title = "Steward",
  subtitle = "AI Operations Agent",
  suggestions = DEFAULT_SUGGESTIONS,
  placeholder = "Ask Steward… (Enter to send, Shift+Enter for a new line)",
  audio = false,
  heightClassName = "h-[calc(100vh-220px)] min-h-[480px]",
  emptyTitle = "How can I help?",
  emptyHint = "I can read pilot data and, with your approval, send SMS and email.",
}: AgentChatProps = {}) {
  const actionToken = useDashboardActionToken();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [decisions, setDecisions] = useState<Record<string, "approve" | "decline">>({});
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Audio (optional) ─────────────────────────────────────────────────────────
  const [listening, setListening] = useState(false);
  const [speakOn, setSpeakOn] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const spokenRef = useRef(0);
  const speechSupported =
    audio && typeof window !== "undefined" &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  useEffect(scrollToBottom, [messages, pendingActions, loading, scrollToBottom]);

  const post = useCallback(
    async (payloadMessages: ChatMessage[], payloadDecisions?: Record<string, "approve" | "decline">) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/ai-agent/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ actionToken, messages: payloadMessages, decisions: payloadDecisions }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Request failed.");
          return;
        }
        setMessages(data.messages ?? []);
        setPendingActions(data.pendingActions ?? []);
        setDecisions({});
      } catch {
        setError("Could not reach the AI agent.");
      } finally {
        setLoading(false);
      }
    },
    [actionToken],
  );

  const send = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    void post(next);
  }, [loading, messages, post]);

  // Read new assistant replies aloud when the speaker is on.
  useEffect(() => {
    if (!audio || !speakOn || typeof window === "undefined" || !window.speechSynthesis) return;
    const spoken = messages.filter((m) => m.role === "assistant" && m.content);
    if (spoken.length > spokenRef.current) {
      const latest = spoken[spoken.length - 1];
      if (latest?.content) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(latest.content));
      }
      spokenRef.current = spoken.length;
    }
  }, [messages, speakOn, audio]);

  // Stop any speech on unmount (e.g. closing the modal).
  useEffect(() => () => { if (typeof window !== "undefined") window.speechSynthesis?.cancel(); }, []);

  function toggleMic() {
    if (listening) { recognitionRef.current?.stop(); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let txt = "";
      for (let i = 0; i < e.results.length; i++) txt += e.results[i][0].transcript;
      setInput(txt);
      if (e.results[e.results.length - 1].isFinal) {
        rec.stop();
        setListening(false);
        const final = txt.trim();
        if (final) send(final);
      }
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  }

  function toggleSpeak() {
    setSpeakOn((on) => {
      const next = !on;
      if (!next && typeof window !== "undefined") window.speechSynthesis?.cancel();
      // Only read messages that arrive AFTER turning the speaker on.
      spokenRef.current = messages.filter((m) => m.role === "assistant" && m.content).length;
      return next;
    });
  }

  function decide(toolCallId: string, decision: "approve" | "decline") {
    const nextDecisions = { ...decisions, [toolCallId]: decision };
    setDecisions(nextDecisions);
    if (pendingActions.every((a) => nextDecisions[a.toolCallId])) {
      setPendingActions([]);
      void post(messages, nextDecisions);
    }
  }

  function reset() {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    spokenRef.current = 0;
    setMessages([]);
    setPendingActions([]);
    setDecisions({});
    setError(null);
  }

  const hasConversation = messages.some((m) => m.role === "user");

  return (
    <Card className={cn("flex flex-col overflow-hidden", heightClassName)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">{title}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {audio && (
            <Button variant="ghost" size="icon" onClick={toggleSpeak} title={speakOn ? "Mute spoken replies" : "Read replies aloud"} aria-pressed={speakOn} className="h-8 w-8">
              {speakOn ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          )}
          {hasConversation && (
            <Button variant="ghost" size="sm" onClick={reset} disabled={loading} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> New chat
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
        {!hasConversation && (
          <div className="mx-auto max-w-md space-y-4 pt-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Sparkles className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">{emptyTitle}</p>
              <p className="mt-1 text-sm text-muted-foreground">{emptyHint}</p>
            </div>
            <div className="grid gap-2">
              {suggestions.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:bg-accent">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => <MessageRow key={i} message={m} />)}

        {pendingActions.map((action) => (
          <div key={action.toolCallId} className="flex justify-start">
            <Card className="w-full max-w-[85%] border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/40">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                  <ShieldAlert className="h-4 w-4" />
                  <span className="text-sm font-semibold">Approval required</span>
                </div>
                <p className="text-sm text-foreground">{action.summary}</p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => decide(action.toolCallId, "approve")} disabled={loading || Boolean(decisions[action.toolCallId])} className="gap-1.5 bg-green-600 hover:bg-green-700">
                    <Check className="h-3.5 w-3.5" /> Approve &amp; run
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => decide(action.toolCallId, "decline")} disabled={loading || Boolean(decisions[action.toolCallId])} className="gap-1.5">
                    <X className="h-3.5 w-3.5" /> Decline
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> {title} is thinking…
          </div>
        )}

        {error && (
          <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t p-3">
        <div className="flex items-end gap-2">
          {speechSupported && (
            <Button
              type="button" variant={listening ? "default" : "outline"} onClick={toggleMic} disabled={loading}
              title={listening ? "Stop listening" : "Speak your question"}
              className={cn("h-[42px] w-[42px] shrink-0 p-0", listening && "animate-pulse")}
            >
              <Mic className="h-4 w-4" />
            </Button>
          )}
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder={listening ? "Listening…" : placeholder}
            rows={1}
            disabled={loading}
            className="max-h-32 min-h-[42px] resize-none"
          />
          <Button onClick={() => send(input)} disabled={loading || !input.trim()} className="h-[42px] gap-1.5">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function MessageRow({ message }: { message: ChatMessage }) {
  if (message.role === "system" || message.role === "tool") return null;

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
          {message.content}
        </div>
      </div>
    );
  }

  const usedTools = message.tool_calls?.map((tc) => friendlyToolName(tc.function.name)) ?? [];
  return (
    <div className="flex flex-col items-start gap-1.5">
      {message.content && (
        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-sm">
          {message.content}
        </div>
      )}
      {usedTools.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {usedTools.map((t, i) => (
            <span key={i} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              <Wrench className="h-3 w-3" /> {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

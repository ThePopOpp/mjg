"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, Send, Loader2, Check, X, ShieldAlert, Wrench, Sparkles, RefreshCw } from "lucide-react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

type ToolCall = { id: string; type: "function"; function: { name: string; arguments: string } };
type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
};
type PendingAction = { toolCallId: string; name: string; args: Record<string, unknown>; summary: string };

const SUGGESTIONS = [
  "Give me a pilot overview.",
  "Show me the last 10 calls.",
  "Find participant John and summarize their check-ins.",
  "Draft a warm SMS to a participant who missed a check-in.",
];

function friendlyToolName(name: string) {
  return name.replace(/_/g, " ");
}

export function AgentChat() {
  const actionToken = useDashboardActionToken();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [decisions, setDecisions] = useState<Record<string, "approve" | "decline">>({});
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    void post(next);
  }

  function decide(toolCallId: string, decision: "approve" | "decline") {
    const nextDecisions = { ...decisions, [toolCallId]: decision };
    setDecisions(nextDecisions);
    // Once every pending action has a decision, submit them all together.
    if (pendingActions.every((a) => nextDecisions[a.toolCallId])) {
      setPendingActions([]);
      void post(messages, nextDecisions);
    }
  }

  function reset() {
    setMessages([]);
    setPendingActions([]);
    setDecisions({});
    setError(null);
  }

  const hasConversation = messages.some((m) => m.role === "user");

  return (
    <Card className="flex h-[calc(100vh-220px)] min-h-[480px] flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">Hermes</p>
            <p className="text-xs text-muted-foreground">AI operations agent</p>
          </div>
        </div>
        {hasConversation && (
          <Button variant="ghost" size="sm" onClick={reset} disabled={loading} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> New chat
          </Button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
        {!hasConversation && (
          <div className="mx-auto max-w-md space-y-4 pt-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Sparkles className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">How can I help?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                I can read pilot data and, with your approval, send SMS and email.
              </p>
            </div>
            <div className="grid gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <MessageRow key={i} message={m} />
        ))}

        {/* Pending action confirmation cards */}
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
                  <Button
                    size="sm"
                    onClick={() => decide(action.toolCallId, "approve")}
                    disabled={loading || Boolean(decisions[action.toolCallId])}
                    className="gap-1.5 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve &amp; run
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => decide(action.toolCallId, "decline")}
                    disabled={loading || Boolean(decisions[action.toolCallId])}
                    className="gap-1.5"
                  >
                    <X className="h-3.5 w-3.5" /> Decline
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Hermes is thinking…
          </div>
        )}

        {error && (
          <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t p-3">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask Hermes… (Enter to send, Shift+Enter for a new line)"
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

  // assistant
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
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              <Wrench className="h-3 w-3" /> {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

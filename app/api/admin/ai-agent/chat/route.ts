import { NextResponse } from "next/server";
import { requireAdminManager } from "@/lib/user-management/auth";
import { runAgent, SYSTEM_PROMPT, type ChatMessage, type AgentDecision } from "@/lib/ai-agent/agent";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireAdminManager(request, body.actionToken);

    const incoming: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
    const decisions: Record<string, AgentDecision> = body.decisions ?? {};

    // Ensure the system prompt leads the conversation exactly once.
    const messages: ChatMessage[] =
      incoming[0]?.role === "system"
        ? incoming
        : [{ role: "system", content: SYSTEM_PROMPT }, ...incoming];

    const ctx = { actorId: actor.id, actorEmail: actor.email ?? "" };
    const result = await runAgent(messages, ctx, decisions);

    return NextResponse.json({
      messages: result.messages,
      pendingActions: result.pendingActions ?? null,
      done: result.done,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI agent request failed.";
    const status = /permission|required|authenticated/i.test(message) ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

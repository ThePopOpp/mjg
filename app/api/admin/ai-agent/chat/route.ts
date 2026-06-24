import { NextResponse } from "next/server";
import { requireAdminManager } from "@/lib/user-management/auth";
import { runAgent, buildSystemPrompt, type ChatMessage, type AgentDecision } from "@/lib/ai-agent/agent";
import { getAgentMemories } from "@/lib/ai-agent/memory";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireAdminManager(request, body.actionToken);

    const incoming: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
    const decisions: Record<string, AgentDecision> = body.decisions ?? {};

    // Rebuild a fresh system prompt every turn (skills + latest recalled memory),
    // replacing any stale system message the client echoed back.
    const memories = await getAgentMemories();
    const systemContent = buildSystemPrompt(memories);
    const conversation = incoming.filter((m) => m.role !== "system");
    const messages: ChatMessage[] = [{ role: "system", content: systemContent }, ...conversation];

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

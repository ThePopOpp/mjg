import { NextResponse } from "next/server";
import { requireAdminManager } from "@/lib/user-management/auth";
import { runAgent, buildSystemPrompt, type ChatMessage, type AgentDecision } from "@/lib/ai-agent/agent";
import { getAgentMemories } from "@/lib/ai-agent/memory";
import { renderTrainingDocsForPrompt } from "@/lib/ai-agent/training-docs/data";
import { renderWebsiteContextForPrompt } from "@/lib/website/brand";
import { renderComponentsForPrompt, renderSiteMapForPrompt } from "@/lib/website/steward-tools";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireAdminManager(request, body.actionToken);

    const incoming: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
    const decisions: Record<string, AgentDecision> = body.decisions ?? {};

    // Rebuild a fresh system prompt every turn (skills + latest recalled memory +
    // the training-docs index), replacing any stale system message the client
    // echoed back. The index is titles/summaries only — bodies come from the
    // search_training_docs / read_training_doc tools on demand.
    // The Frontend Editor context is retrieval, not a dump (spec §30): the rules,
    // the brand voice, a one-line-per-page site map and the approved component
    // schemas. Page CONTENT is only ever read through the website_* tools.
    const [memories, trainingDocsIndex, siteMap] = await Promise.all([
      getAgentMemories(),
      renderTrainingDocsForPrompt(),
      renderSiteMapForPrompt(),
    ]);
    const websiteContext = renderWebsiteContextForPrompt(siteMap, renderComponentsForPrompt());
    const systemContent = buildSystemPrompt(memories, trainingDocsIndex, websiteContext);
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

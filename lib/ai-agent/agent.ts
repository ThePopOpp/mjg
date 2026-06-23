import { AGENT_TOOLS, TOOL_MAP, openAiToolSchemas, type AgentContext } from "./tools";

export type ToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

export type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
};

export type PendingAction = {
  toolCallId: string;
  name: string;
  args: Record<string, unknown>;
  summary: string;
};

export type AgentDecision = "approve" | "decline";

export type AgentRunResult = {
  messages: ChatMessage[];
  pendingActions?: PendingAction[];
  done: boolean;
};

const MAX_ITERATIONS = 8;
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

export const SYSTEM_PROMPT = `You are Hermes, the AI operations agent embedded in the Michael J. Gauthier ("Created for More" / 7-Day Stewardship Pilot) admin dashboard.

You help the team manage participants, calls, SMS, and email. You have tools to read pilot data and to take actions (sending SMS and email).

Guidelines:
- Use the read tools to ground every answer in real data. Never invent participant names, numbers, stats, or message history.
- When asked to contact someone, first look them up (search_participants) to confirm the correct phone/email before proposing a send.
- For any action that sends a message (send_sms, send_email), the user must approve it before it runs — propose the exact recipient and content, and let the confirmation step handle approval. Do not claim a message was sent until the tool result confirms it.
- Keep replies concise and professional. Use the pilot member's first name when drafting outreach.
- If a request is ambiguous or you lack a required detail (like which participant), ask a brief clarifying question instead of guessing.
- Today's context is a faith-based stewardship pilot; keep tone warm and pastoral when drafting outreach.`;

function getModel(): string {
  const model = process.env.OPENAI_MODEL?.trim();
  if (model && !model.includes("your_")) return model;
  return "gpt-4o";
}

async function callOpenAI(messages: ChatMessage[]): Promise<ChatMessage> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: getModel(),
      messages,
      tools: openAiToolSchemas(),
      tool_choice: "auto",
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`OpenAI request failed (${res.status}). ${detail}`.trim());
  }

  const data = await res.json();
  const message = data?.choices?.[0]?.message;
  if (!message) throw new Error("OpenAI returned no message.");
  return message as ChatMessage;
}

function safeParse(argstr: string): Record<string, unknown> {
  try {
    return JSON.parse(argstr || "{}");
  } catch {
    return {};
  }
}

// Find tool_calls in the most recent assistant message that have not yet been
// answered by a following tool message. These are the calls awaiting resolution.
function unansweredToolCalls(messages: ChatMessage[]): { assistantIndex: number; calls: ToolCall[] } | null {
  let assistantIndex = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "assistant" && messages[i].tool_calls?.length) {
      assistantIndex = i;
      break;
    }
  }
  if (assistantIndex === -1) return null;

  const answered = new Set(
    messages
      .slice(assistantIndex + 1)
      .filter((m) => m.role === "tool" && m.tool_call_id)
      .map((m) => m.tool_call_id as string),
  );
  const calls = (messages[assistantIndex].tool_calls ?? []).filter((tc) => !answered.has(tc.id));
  return calls.length ? { assistantIndex, calls } : null;
}

function toolMessage(toolCallId: string, name: string, payload: unknown): ChatMessage {
  return { role: "tool", tool_call_id: toolCallId, name, content: JSON.stringify(payload) };
}

/**
 * Runs the agent: resolves any pending tool calls (using `decisions` for
 * confirmation-gated actions), then loops with OpenAI until it returns a plain
 * text answer or surfaces new actions that need confirmation.
 */
export async function runAgent(
  messages: ChatMessage[],
  ctx: AgentContext,
  decisions: Record<string, AgentDecision> = {},
): Promise<AgentRunResult> {
  const work = [...messages];

  // Step 1: resolve any outstanding tool calls from a previous (paused) turn.
  const outstanding = unansweredToolCalls(work);
  if (outstanding) {
    const stillPending: PendingAction[] = [];
    for (const tc of outstanding.calls) {
      const tool = TOOL_MAP[tc.function.name];
      const args = safeParse(tc.function.arguments);
      if (!tool) {
        work.push(toolMessage(tc.id, tc.function.name, { error: "Unknown tool." }));
        continue;
      }
      if (tool.requiresConfirmation) {
        const decision = decisions[tc.id];
        if (decision === "approve") {
          try {
            const result = await tool.execute(args, ctx);
            work.push(toolMessage(tc.id, tool.name, { ok: true, result }));
          } catch (err) {
            work.push(toolMessage(tc.id, tool.name, { ok: false, error: err instanceof Error ? err.message : "Action failed." }));
          }
        } else if (decision === "decline") {
          work.push(toolMessage(tc.id, tool.name, { ok: false, declined: true, note: "User declined this action." }));
        } else {
          stillPending.push({ toolCallId: tc.id, name: tool.name, args, summary: tool.summarize?.(args) ?? tool.name });
        }
      } else {
        // Read tool left unanswered — execute it now.
        try {
          const result = await tool.execute(args, ctx);
          work.push(toolMessage(tc.id, tool.name, result));
        } catch (err) {
          work.push(toolMessage(tc.id, tool.name, { error: err instanceof Error ? err.message : "Tool failed." }));
        }
      }
    }
    if (stillPending.length) {
      return { messages: work, pendingActions: stillPending, done: false };
    }
  }

  // Step 2: main reasoning loop.
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const assistant = await callOpenAI(work);
    work.push(assistant);

    if (!assistant.tool_calls?.length) {
      return { messages: work, done: true };
    }

    const pending: PendingAction[] = [];
    for (const tc of assistant.tool_calls) {
      const tool = TOOL_MAP[tc.function.name];
      const args = safeParse(tc.function.arguments);
      if (!tool) {
        work.push(toolMessage(tc.id, tc.function.name, { error: "Unknown tool." }));
        continue;
      }
      if (tool.requiresConfirmation) {
        pending.push({ toolCallId: tc.id, name: tool.name, args, summary: tool.summarize?.(args) ?? tool.name });
      } else {
        try {
          const result = await tool.execute(args, ctx);
          work.push(toolMessage(tc.id, tool.name, result));
        } catch (err) {
          work.push(toolMessage(tc.id, tool.name, { error: err instanceof Error ? err.message : "Tool failed." }));
        }
      }
    }

    if (pending.length) {
      return { messages: work, pendingActions: pending, done: false };
    }
    // otherwise: read tools executed, loop again so the model can use results.
  }

  return { messages: work, done: true };
}

export const AGENT_TOOL_NAMES = AGENT_TOOLS.map((t) => t.name);

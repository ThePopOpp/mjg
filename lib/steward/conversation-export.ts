// Steward conversation export: turns eve's session event stream into a
// readable transcript, and a set of transcripts into one Markdown file for
// Mike's ChatGPT Steward to review.
//
// Pure — no I/O — so it is tested directly (conversation-export.test.mjs).
//
// The stream is eve's own durable event log for a session (NDJSON from
// GET /eve/v1/session/:id/stream). Only the events that matter for a review
// are read: what the member said, what Steward said, which tools it used with
// what input, which model answered, and anything that failed. Model reasoning
// is deliberately left out — it is not what the member saw.

export type ExportTurn = {
  member: string;
  steward: string;
  tools: { name: string; input?: unknown; failed?: boolean }[];
  models: string[];
  errors: string[];
};

export type ExportConversation = {
  sessionId: string;
  title: string;
  startedAt: string | null;
  lastActiveAt: string | null;
  turns: ExportTurn[];
  /** Set when the transcript could not be read; the conversation is still listed. */
  unavailable?: string;
};

type StreamEvent = { type?: string; data?: Record<string, unknown> };

const str = (v: unknown) => (typeof v === "string" ? v : "");

/** Parse eve's NDJSON session stream into turns, in order. Unknown events are ignored. */
export function parseSessionStream(ndjson: string): ExportTurn[] {
  const turns: ExportTurn[] = [];
  const byId = new Map<string, ExportTurn>();
  const toolByCall = new Map<string, ExportTurn["tools"][number]>();

  const turnFor = (turnId: string): ExportTurn => {
    let turn = byId.get(turnId);
    if (!turn) {
      turn = { member: "", steward: "", tools: [], models: [], errors: [] };
      byId.set(turnId, turn);
      turns.push(turn);
    }
    return turn;
  };

  for (const line of ndjson.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("{")) continue;
    let event: StreamEvent;
    try {
      event = JSON.parse(trimmed) as StreamEvent;
    } catch {
      continue;
    }
    const data = event.data ?? {};
    const turnId = str(data.turnId);
    if (!turnId) continue;

    switch (event.type) {
      case "message.received": {
        const turn = turnFor(turnId);
        turn.member = [turn.member, str(data.message)].filter(Boolean).join("\n\n");
        break;
      }
      case "message.completed": {
        const text = str(data.message).trim();
        if (text) {
          const turn = turnFor(turnId);
          turn.steward = [turn.steward, text].filter(Boolean).join("\n\n");
        }
        break;
      }
      case "step.started": {
        const model = str(data.modelId);
        const turn = turnFor(turnId);
        if (model && !turn.models.includes(model)) turn.models.push(model);
        break;
      }
      case "actions.requested": {
        const turn = turnFor(turnId);
        for (const raw of (data.actions as Record<string, unknown>[] | undefined) ?? []) {
          const name = str(raw.toolName) || str(raw.name) || str(raw.kind) || "tool";
          const tool = { name, input: raw.input ?? raw.args };
          turn.tools.push(tool);
          if (str(raw.callId)) toolByCall.set(str(raw.callId), tool);
        }
        break;
      }
      case "action.result": {
        const result = (data.result ?? {}) as Record<string, unknown>;
        const failed = data.status === "error" || data.status === "failed" || Boolean(data.error) || result.isError === true;
        if (!failed) break;
        const tool = toolByCall.get(str(result.callId));
        if (tool) tool.failed = true;
        else turnFor(turnId).tools.push({ name: str(result.toolName) || "tool", failed: true });
        break;
      }
      case "step.failed":
      case "turn.failed": {
        turnFor(turnId).errors.push(str(data.message) || str(data.code) || event.type);
        break;
      }
    }
  }
  return turns.filter((t) => t.member || t.steward || t.errors.length);
}

/** The instructions at the top of the file, for Mike's ChatGPT Steward. */
export const REVIEW_PROMPT = `You are reviewing conversations between members and Steward, the AI guide in the Stewardship Blueprint app. Use your Steward project instructions, the response-quality standard and the source documents as the standard to judge against.

For EVERY Steward reply below, decide whether it is right. For each reply that falls short, report:

1. Conversation number and turn number.
2. The exact words from Steward's reply that are the problem (quote them).
3. What is wrong, in one or two sentences.
4. Which rule or source it breaks (e.g. "Response-quality standard: assessment completion", "T4 Guardrails definition", "Listen First").
5. What a better reply would say — write it, at the depth it deserves.

Score each reply 0 / 1 / 2 on: (a) understands the person's actual facts, (b) interprets evidence accurately with nothing invented, (c) correct Blueprint teaching, (d) explains why it matters, (e) realistic next step or appropriate no-action, (f) respects the mode and listens, (g) protects agency and avoids assumptions, (h) clear, natural, right depth. Flag any hard failure: invented score, mixed-up instruments, a false "saved/sent/paid" claim, quoted Scripture translation text, unsafe crisis handling, pressure selling or an invented price.

Finish with: the three most important patterns to fix across all conversations, and anything Steward did well that must be kept.

Notes on this file: "Steward used" lists the tools Steward called before answering (read_assessments = the member's own assessment answers; search_library = the teaching library; read_blueprint / read_blueprint_page = the member's Blueprint; propose_wording = a proposal the member must approve). "What Steward could see" shows the member's records as of the export, which may differ from the day of a conversation.`;

const fence = (s: string) => s.replace(/\r/g, "").trim();

function toolLabel(tool: ExportTurn["tools"][number]): string {
  const input = tool.input && typeof tool.input === "object" ? (tool.input as Record<string, unknown>) : null;
  const detail = input ? str(input.query) || str(input.page) || (str(input.wording) ? `"${str(input.wording)}"` : "") : "";
  return `${tool.name}${detail ? ` (${detail})` : ""}${tool.failed ? " — FAILED" : ""}`;
}

const when = (iso: string | null) => (iso ? new Date(iso).toISOString().replace("T", " ").slice(0, 16) + " UTC" : "unknown");

export function renderExport(args: {
  exportedBy: string;
  exportedAt: string;
  library: string;
  instructionVersion: string | null;
  context: string;
  conversations: ExportConversation[];
}): string {
  const out: string[] = [
    `# Steward conversation export`,
    "",
    `Exported ${when(args.exportedAt)} by ${args.exportedBy} · ${args.conversations.length} conversation${args.conversations.length === 1 ? "" : "s"} · ` +
      `teaching library ${args.library}${args.instructionVersion ? ` · instruction version ${args.instructionVersion}` : ""}`,
    "",
    "## Review instructions",
    "",
    REVIEW_PROMPT,
    "",
    "## What Steward could see (as of this export)",
    "",
    "```",
    fence(args.context),
    "```",
  ];

  args.conversations.forEach((c, i) => {
    const models = [...new Set(c.turns.flatMap((t) => t.models))];
    out.push(
      "",
      "---",
      "",
      `## Conversation ${i + 1}: ${c.title}`,
      "",
      `Started ${when(c.startedAt)} · last active ${when(c.lastActiveAt)}${models.length ? ` · model ${models.join(", ")}` : ""}`,
    );
    if (c.unavailable) {
      out.push("", `_Transcript unavailable: ${c.unavailable}_`);
      return;
    }
    if (!c.turns.length) {
      out.push("", "_No messages._");
      return;
    }
    c.turns.forEach((t, j) => {
      out.push("", `### Turn ${j + 1}`, "", `**Member:**`, "", fence(t.member) || "_(no text)_");
      if (t.tools.length) out.push("", `_Steward used: ${t.tools.map(toolLabel).join("; ")}_`);
      out.push("", `**Steward:**`, "", fence(t.steward) || "_(no reply)_");
      if (t.errors.length) out.push("", `_Errors this turn: ${t.errors.join("; ")}_`);
    });
  });
  return out.join("\n") + "\n";
}

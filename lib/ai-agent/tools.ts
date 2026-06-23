import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getParticipantDetail } from "@/lib/dashboard/pilot-data";
import { sendSms, getOrCreateConversation } from "@/lib/twilio/sms";
import { sendSmtpEmail } from "@/lib/email/smtp";
import { logUserActivity } from "@/lib/user-management/repository";

export type AgentContext = {
  actorId: string;
  actorEmail: string;
};

export type AgentTool = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  // Action tools mutate state / reach the outside world and must be confirmed by
  // the user before they run. Read tools execute automatically.
  requiresConfirmation: boolean;
  // Human-readable summary of what the action will do, shown on the confirm card.
  summarize?: (args: any) => string;
  execute: (args: any, ctx: AgentContext) => Promise<unknown>;
};

function htmlFromText(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const paragraphs = escaped
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;line-height:1.6">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a1a1a">${paragraphs}</div>`;
}

// ──────────────────────────────────────────────────────────────────────────────
// Read tools (auto-execute)
// ──────────────────────────────────────────────────────────────────────────────

const searchParticipants: AgentTool = {
  name: "search_participants",
  description:
    "Search pilot participants by name, email, or phone. Returns matching participants with their id, contact info, wave, and type. Use this to find a participant before acting on them.",
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "Name, email, or phone fragment to search for." },
      limit: { type: "number", description: "Max results (default 10, max 25)." },
    },
    required: ["query"],
  },
  requiresConfirmation: false,
  async execute(args) {
    const supabase = createSupabaseAdminClient();
    const q = String(args.query ?? "").trim();
    const limit = Math.min(Number(args.limit) || 10, 25);
    const like = `%${q}%`;
    const { data, error } = await supabase
      .from("participants")
      .select("id, first_name, last_name, email, phone, wave, participant_type, source, created_at")
      .or(`first_name.ilike.${like},last_name.ilike.${like},email.ilike.${like},phone.ilike.${like}`)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return { count: data?.length ?? 0, participants: data ?? [] };
  },
};

const getParticipant: AgentTool = {
  name: "get_participant",
  description:
    "Get full detail for one participant by id: profile fields, recent check-in results, survey responses, and scheduled email journey events.",
  parameters: {
    type: "object",
    properties: { id: { type: "string", description: "Participant id (uuid)." } },
    required: ["id"],
  },
  requiresConfirmation: false,
  async execute(args) {
    const detail = await getParticipantDetail(String(args.id));
    if (detail.error) throw new Error(detail.error);
    return {
      participant: detail.participant,
      checkIns: detail.checkIns.slice(0, 10),
      surveys: detail.surveys.slice(0, 10),
      emailEvents: detail.emailEvents.slice(0, 20),
    };
  },
};

const getPilotOverview: AgentTool = {
  name: "get_pilot_overview",
  description:
    "Get high-level pilot stats: total participants, participants by wave, total check-ins, total surveys, recent call volume, and SMS conversation count.",
  parameters: { type: "object", properties: {} },
  requiresConfirmation: false,
  async execute() {
    const supabase = createSupabaseAdminClient();
    const count = (table: string) =>
      supabase.from(table).select("*", { count: "exact", head: true });
    const [participants, checkIns, surveys, calls, sms, waves] = await Promise.all([
      count("participants"),
      count("check_in_results"),
      count("survey_responses"),
      count("calls"),
      count("sms_conversations"),
      supabase.from("participants").select("wave"),
    ]);
    const byWave: Record<string, number> = {};
    (waves.data ?? []).forEach((r: any) => {
      const w = r.wave ?? "unassigned";
      byWave[w] = (byWave[w] ?? 0) + 1;
    });
    return {
      participants: participants.count ?? 0,
      participantsByWave: byWave,
      checkIns: checkIns.count ?? 0,
      surveys: surveys.count ?? 0,
      calls: calls.count ?? 0,
      smsConversations: sms.count ?? 0,
    };
  },
};

const listRecentCalls: AgentTool = {
  name: "list_recent_calls",
  description: "List recent phone calls from the dialer with direction, status, duration, cost, and contact number.",
  parameters: {
    type: "object",
    properties: {
      limit: { type: "number", description: "Max calls (default 15, max 50)." },
      direction: { type: "string", enum: ["inbound", "outbound"], description: "Optional direction filter." },
    },
  },
  requiresConfirmation: false,
  async execute(args) {
    const supabase = createSupabaseAdminClient();
    const limit = Math.min(Number(args.limit) || 15, 50);
    let query = supabase
      .from("calls")
      .select("id, direction, from_number, to_number, status, duration_seconds, price, price_unit, started_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (args.direction === "inbound" || args.direction === "outbound") {
      query = query.eq("direction", args.direction);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return { count: data?.length ?? 0, calls: data ?? [] };
  },
};

const listSmsConversations: AgentTool = {
  name: "list_sms_conversations",
  description: "List recent SMS conversations with contact name/number and last message preview.",
  parameters: {
    type: "object",
    properties: { limit: { type: "number", description: "Max conversations (default 15, max 50)." } },
  },
  requiresConfirmation: false,
  async execute(args) {
    const supabase = createSupabaseAdminClient();
    const limit = Math.min(Number(args.limit) || 15, 50);
    const { data, error } = await supabase
      .from("sms_conversations")
      .select("id, contact_number, contact_name, last_message_preview, last_message_at")
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return { count: data?.length ?? 0, conversations: data ?? [] };
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Action tools (require user confirmation)
// ──────────────────────────────────────────────────────────────────────────────

const sendSmsAction: AgentTool = {
  name: "send_sms",
  description:
    "Send an SMS text message to a phone number via the pilot's Twilio number. Use E.164 format (e.g. +14805551234). This sends a real text message.",
  parameters: {
    type: "object",
    properties: {
      to: { type: "string", description: "Recipient phone number in E.164 format, e.g. +14805551234." },
      body: { type: "string", description: "The message text to send." },
    },
    required: ["to", "body"],
  },
  requiresConfirmation: true,
  summarize: (args) => `Send SMS to ${args.to}: “${args.body}”`,
  async execute(args, ctx) {
    const to = String(args.to).trim();
    const body = String(args.body).trim();
    if (!to || !body) throw new Error("Both 'to' and 'body' are required.");
    const conversationId = await getOrCreateConversation(to);
    const result = await sendSms({ to, body, conversationId, sentByProfileId: ctx.actorId });
    await logUserActivity({
      userId: ctx.actorId,
      action: "ai_agent_send_sms",
      entityType: "sms_conversations",
      entityId: conversationId,
      metadata: { to, sid: result.sid },
    }).catch(() => {});
    return { sid: result.sid, status: result.status, to };
  },
};

const sendEmailAction: AgentTool = {
  name: "send_email",
  description:
    "Send an email to a recipient. Provide a plain-text body; it will be formatted as HTML. This sends a real email.",
  parameters: {
    type: "object",
    properties: {
      to: { type: "string", description: "Recipient email address." },
      subject: { type: "string", description: "Email subject line." },
      body: { type: "string", description: "Plain-text email body (paragraphs separated by blank lines)." },
    },
    required: ["to", "subject", "body"],
  },
  requiresConfirmation: true,
  summarize: (args) => `Send email to ${args.to} — subject: “${args.subject}”`,
  async execute(args, ctx) {
    const to = String(args.to).trim();
    const subject = String(args.subject).trim();
    const body = String(args.body).trim();
    if (!to || !subject || !body) throw new Error("'to', 'subject', and 'body' are required.");
    const result = await sendSmtpEmail({ to, subject, html: htmlFromText(body), text: body });
    if (result.skipped) throw new Error(result.reason ?? "Email provider not configured.");
    await logUserActivity({
      userId: ctx.actorId,
      action: "ai_agent_send_email",
      entityType: "email",
      entityId: result.messageId ?? to,
      metadata: { to, subject },
    }).catch(() => {});
    return { ok: result.ok, messageId: result.messageId, to };
  },
};

export const AGENT_TOOLS: AgentTool[] = [
  searchParticipants,
  getParticipant,
  getPilotOverview,
  listRecentCalls,
  listSmsConversations,
  sendSmsAction,
  sendEmailAction,
];

export const TOOL_MAP: Record<string, AgentTool> = Object.fromEntries(
  AGENT_TOOLS.map((t) => [t.name, t]),
);

// OpenAI tool schema (function-calling format).
export function openAiToolSchemas() {
  return AGENT_TOOLS.map((t) => ({
    type: "function" as const,
    function: { name: t.name, description: t.description, parameters: t.parameters },
  }));
}

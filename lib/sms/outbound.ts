import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildMergeData, getOrCreateConversation, sendSms } from "@/lib/twilio/sms";
import { buildSmsSlug, extractSmsFields, renderSmsTemplate } from "@/lib/sms/templates";
import { phoneKey } from "@/lib/sms/contacts";

// Outbound SMS — one place for the dashboard routes (app/api/admin/sms/*) and the
// Claude connector tools (lib/tools/sms.ts), so both apply the same consent rules.
//
// Consent (A2P 10DLC), two strengths:
//   • always — nobody with this number has opted out (STOP / unticked, any record);
//   • strict (Claude / agents) — and someone with this number has opted in, OR
//     they texted us first (a reply in a conversation is not marketing).
// The dashboard uses the first only, as it always has (staff text people they
// know); the connector uses strict. Twilio also blocks numbers that sent STOP.

export type SmsConsent = { allowed: true; via: "opted_in" | "replied" | "not_opted_out" } | { allowed: false; reason: string };

export async function checkSmsConsent(phone: string, opts: { strict?: boolean } = {}): Promise<SmsConsent> {
  const strict = opts.strict ?? true;
  const key = phoneKey(phone);
  if (!key) return { allowed: false, reason: "That isn't a valid phone number." };
  const supabase = createSupabaseAdminClient();
  const [participants, profiles, conversations] = await Promise.all([
    supabase.from("participants").select("phone, sms_opt_in").not("phone", "is", null),
    supabase.from("profiles").select("phone, sms_opt_in").not("phone", "is", null),
    supabase.from("sms_conversations").select("id, contact_number"),
  ]);
  const people = [...(participants.data ?? []), ...(profiles.data ?? [])].filter((p) => phoneKey(p.phone) === key);
  if (people.some((p) => p.sms_opt_in === false)) return { allowed: false, reason: "This number has opted out of texts." };
  if (people.some((p) => p.sms_opt_in === true)) return { allowed: true, via: "opted_in" };
  if (!strict) return { allowed: true, via: "not_opted_out" };

  const threadIds = (conversations.data ?? []).filter((c) => phoneKey(c.contact_number) === key).map((c) => c.id);
  if (threadIds.length) {
    const { count } = await supabase
      .from("sms_messages")
      .select("id", { count: "exact", head: true })
      .in("conversation_id", threadIds)
      .eq("direction", "inbound");
    if ((count ?? 0) > 0) return { allowed: true, via: "replied" };
  }
  return {
    allowed: false,
    reason: "There's no record of this number agreeing to texts. Add them with SMS opt-in (or they can text in / use /sms/opt-in) first.",
  };
}

type RecipientKind = "participant" | "profile" | "manual";

async function recipientRecord(kind: RecipientKind, id: string | null) {
  if (!id || kind === "manual") return {};
  const { data } = await createSupabaseAdminClient()
    .from(kind === "participant" ? "participants" : "profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data ?? {}) as Record<string, unknown>;
}

async function templateBody(templateId: string) {
  const { data } = await createSupabaseAdminClient().from("sms_templates").select("body").eq("id", templateId).maybeSingle();
  if (!data) throw new Error("SMS template not found.");
  return data.body as string;
}

/** Render the message for one recipient (template merge fields or plain text). */
export async function renderOutboundSms(input: { body?: string | null; templateId?: string | null; recipientType?: RecipientKind; recipientId?: string | null }) {
  const plain = (input.body ?? "").trim();
  if (!plain && !input.templateId) throw new Error("Message body or template is required.");
  if (!input.templateId) return plain;
  const data = await recipientRecord(input.recipientType ?? "manual", input.recipientId ?? null);
  return renderSmsTemplate(await templateBody(input.templateId), buildMergeData(data));
}

/** Send one text after the consent check. */
export async function sendOneSms(input: {
  to: string;
  body?: string | null;
  templateId?: string | null;
  recipientType?: RecipientKind;
  recipientId?: string | null;
  actorId: string;
  /** Require a recorded opt-in or prior reply (default). The dashboard passes false. */
  strict?: boolean;
}) {
  const to = input.to.trim();
  if (!to) throw new Error("Recipient phone number is required.");
  const consent = await checkSmsConsent(to, { strict: input.strict });
  if (!consent.allowed) throw new SmsConsentError(consent.reason);
  const message = await renderOutboundSms(input);
  const conversationId = await getOrCreateConversation(to);
  const result = await sendSms({ to, body: message, conversationId, sentByProfileId: input.actorId });
  return { sid: result.sid, status: result.status, conversationId, body: message, consent: consent.via };
}

export class SmsConsentError extends Error {
  skipped = true;
}

// ── Broadcasts ───────────────────────────────────────────────────────────────

export type BroadcastInput = {
  audience?: "participants" | "profiles" | "manual";
  recipientIds?: string[];
  phoneNumbers?: string[];
  body?: string | null;
  templateId?: string | null;
  /** For typed-in numbers: require a recorded opt-in or prior reply (default). The dashboard passes false. */
  strict?: boolean;
};

type Recipient = { id: string | null; phone: string; name: string; data: Record<string, unknown>; type: RecipientKind };

const SELECT = {
  participants: "id, first_name, last_name, email, phone, wave, source, participant_type, check_in_status, survey_status, sms_opt_in",
  profiles: "id, full_name, email, phone, sms_opt_in",
} as const;

/** Who a broadcast would reach — opted-in only — and who it skips. */
export async function resolveBroadcastRecipients(input: BroadcastInput): Promise<{ recipients: Recipient[]; skipped: { phone: string; reason: string }[] }> {
  const audience = input.audience ?? "participants";
  const supabase = createSupabaseAdminClient();
  const recipients: Recipient[] = [];
  const skipped: { phone: string; reason: string }[] = [];

  if (input.phoneNumbers?.length && (audience === "manual" || !input.recipientIds?.length)) {
    // Typed-in numbers get the same consent check as single sends.
    for (const phone of input.phoneNumbers) {
      const consent = await checkSmsConsent(phone, { strict: input.strict });
      if (consent.allowed) recipients.push({ id: null, phone, name: phone, data: {}, type: "manual" });
      else skipped.push({ phone, reason: consent.reason });
    }
    return { recipients, skipped };
  }

  const table = audience === "profiles" ? "profiles" : "participants";
  let query = supabase.from(table).select(SELECT[table]).eq("sms_opt_in", true).not("phone", "is", null);
  if (input.recipientIds?.length) query = query.in("id", input.recipientIds);
  const { data, error } = await query;
  if (error) throw error;
  for (const row of (data ?? []) as any[]) {
    if (!row.phone) continue;
    recipients.push({
      id: row.id,
      phone: row.phone,
      name: row.full_name ?? `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim(),
      data: row,
      type: table === "profiles" ? "profile" : "participant",
    });
  }
  return { recipients, skipped };
}

export async function sendSmsBroadcast(input: BroadcastInput & { actorId: string }) {
  if (!(input.body ?? "").trim() && !input.templateId) throw new Error("Message body or template is required.");
  const template = input.templateId ? await templateBody(input.templateId) : (input.body ?? "").trim();
  const { recipients, skipped } = await resolveBroadcastRecipients(input);
  const supabase = createSupabaseAdminClient();
  const broadcastId = crypto.randomUUID();
  const now = new Date().toISOString();
  const results = { sent: 0, failed: 0, skipped: skipped.length };
  const logs: object[] = [];

  for (const r of recipients) {
    const base = {
      broadcast_id: broadcastId,
      template_id: input.templateId ?? null,
      recipient_type: r.type,
      recipient_id: r.id,
      recipient_phone: r.phone,
      recipient_name: r.name,
      sent_by: input.actorId,
    };
    try {
      const rendered = renderSmsTemplate(template, buildMergeData(r.data));
      const conversationId = await getOrCreateConversation(r.phone, r.name);
      const sent = await sendSms({ to: r.phone, body: rendered, conversationId, sentByProfileId: input.actorId });
      results.sent++;
      logs.push({ ...base, body_rendered: rendered, status: "sent", twilio_message_sid: sent.sid, sent_at: now });
    } catch (err) {
      results.failed++;
      logs.push({ ...base, body_rendered: template, status: "failed", error_message: err instanceof Error ? err.message : "Unknown error" });
    }
  }
  if (logs.length) await supabase.from("sms_send_logs").insert(logs);
  return { broadcastId, ...results, total: recipients.length, skippedNumbers: skipped };
}

// ── Templates ────────────────────────────────────────────────────────────────

export async function listSmsTemplates(status: "active" | "draft" | "all" = "active") {
  let query = createSupabaseAdminClient()
    .from("sms_templates")
    .select("id, name, slug, body, available_fields, category, status, created_at, updated_at")
    .order("updated_at", { ascending: false });
  if (status !== "all") query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function saveSmsTemplate(input: { id?: string | null; name: string; body: string; category?: string; status?: string; actorId: string }) {
  const name = input.name.trim();
  const body = input.body.trim();
  if (!name) throw new Error("Template name is required.");
  if (!body) throw new Error("Template body is required.");
  const values = {
    name,
    body,
    category: input.category ?? "general",
    status: input.status === "active" ? "active" : "draft",
    available_fields: extractSmsFields(body),
    slug: buildSmsSlug(name),
    updated_by: input.actorId,
  };
  const supabase = createSupabaseAdminClient();
  if (input.id) {
    const { error } = await supabase.from("sms_templates").update({ ...values, updated_at: new Date().toISOString() }).eq("id", input.id);
    if (error) throw error;
    return { id: input.id };
  }
  const { data, error } = await supabase.from("sms_templates").insert({ ...values, created_by: input.actorId }).select("id").single();
  if (error) throw error;
  return { id: data.id as string };
}

// ── Threads ──────────────────────────────────────────────────────────────────

export async function getSmsThread(conversationId: string, opts: { markRead?: boolean } = {}) {
  const supabase = createSupabaseAdminClient();
  const { data: conversation, error } = await supabase
    .from("sms_conversations")
    .select("id, contact_number, contact_name, last_message_at, unread_count, status, participant_id, profile_id")
    .eq("id", conversationId)
    .single();
  if (error) throw new Error(error.message);
  const { data: messages, error: msgError } = await supabase
    .from("sms_messages")
    .select("id, direction, body, status, sent_at, delivered_at, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (msgError) throw new Error(msgError.message);
  if (opts.markRead) {
    await supabase.from("sms_conversations").update({ unread_count: 0, updated_at: new Date().toISOString() }).eq("id", conversationId);
  }
  return { conversation, messages: messages ?? [] };
}

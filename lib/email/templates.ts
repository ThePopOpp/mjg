import { sendSmtpEmail } from "@/lib/email/smtp";
import { DEFAULT_EMAIL_FIELDS, EMAIL_EVENT_KEYS, type EmailEventKey, eventKeyForJourneyStep } from "@/lib/email/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export { DEFAULT_EMAIL_FIELDS, EMAIL_EVENT_KEYS, eventKeyForJourneyStep };

export type EmailRecipient = {
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  phone?: string | null;
  role?: string | null;
  status?: string | null;
  wave?: string | null;
  source?: string | null;
  participant_type?: string | null;
  check_in_status?: string | null;
  survey_status?: string | null;
  inner_circle_status?: string | null;
  participant_id?: string | null;
  profile_id?: string | null;
  merge_data?: Record<string, string | null | undefined>;
};

export async function getEmailTemplateData() {
  const supabase = createSupabaseAdminClient();
  const [templates, logs] = await Promise.all([
    supabase.from("email_templates").select("*").order("updated_at", { ascending: false }).limit(100),
    supabase.from("email_send_logs").select("*, email_templates(name,html_body,text_body)").order("created_at", { ascending: false }).limit(100),
  ]);
  const mappings = await supabase
    .from("email_template_mappings")
    .select("*, email_templates(id,name,subject,status)")
    .order("event_key", { ascending: true });

  return {
    templates: templates.data ?? [],
    logs: logs.data ?? [],
    mappings: mappings.data ?? [],
    error: templates.error?.message ?? logs.error?.message ?? mappings.error?.message ?? null,
  };
}

export async function saveEmailTemplate(input: {
  id?: string;
  name: string;
  slug?: string;
  subject: string;
  preheader?: string;
  htmlBody: string;
  textBody?: string;
  category?: string;
  status?: "draft" | "active" | "archived";
  actorUserId?: string;
}) {
  if (!input.name || !input.subject || !input.htmlBody) {
    throw new Error("Template name, subject, and HTML body are required.");
  }

  const supabase = createSupabaseAdminClient();
  const slug = input.slug?.trim() || slugify(input.name);
  const body = `${input.subject} ${input.preheader ?? ""} ${input.htmlBody} ${input.textBody ?? ""}`;
  const payload = {
    name: input.name,
    slug,
    subject: input.subject,
    preheader: input.preheader || null,
    html_body: input.htmlBody,
    text_body: input.textBody || null,
    category: input.category || "general",
    status: input.status || "draft",
    available_fields: Array.from(extractMergeFields(body)),
    updated_by: input.actorUserId ?? null,
    updated_at: new Date().toISOString(),
  };

  const query = input.id
    ? supabase.from("email_templates").update(payload).eq("id", input.id)
    : supabase.from("email_templates").insert({ ...payload, created_by: input.actorUserId ?? null });

  const { data, error } = await query.select("*").single();
  if (error) throw error;
  return data;
}

export async function sendTemplateEmail(input: {
  templateId: string;
  recipient: EmailRecipient;
  actorUserId?: string;
}) {
  const supabase = createSupabaseAdminClient();
  const { data: template, error } = await supabase.from("email_templates").select("*").eq("id", input.templateId).maybeSingle();
  if (error) throw error;
  if (!template) throw new Error("Email template not found.");
  if (template.status === "archived") throw new Error("Archived templates cannot be sent.");

  const mergeData = buildMergeData(input.recipient);
  const subject = renderTemplate(template.subject, mergeData);
  const html = renderTemplate(template.html_body, mergeData);
  const text = renderTemplate(template.text_body || stripHtml(html), mergeData);

  const logBase = {
    template_id: template.id,
    recipient_email: input.recipient.email,
    recipient_name: mergeData.full_name || mergeData.first_name || null,
    recipient_type: input.recipient.participant_id ? "participant" : input.recipient.profile_id ? "profile" : "manual",
    participant_id: input.recipient.participant_id ?? null,
    profile_id: input.recipient.profile_id ?? null,
    subject,
    provider: "smtp",
    merge_data: mergeData,
    sent_by: input.actorUserId ?? null,
  };

  try {
    const result = await sendSmtpEmail({ to: input.recipient.email, subject, html, text });
    const { data: log, error: logError } = await supabase
      .from("email_send_logs")
      .insert({
        ...logBase,
        status: result.skipped ? "skipped" : "sent",
        provider_message_id: result.messageId ?? null,
        error_message: result.reason ?? null,
        sent_at: result.skipped ? null : new Date().toISOString(),
      })
      .select("*")
      .single();
    if (logError) throw logError;
    return { ...result, log };
  } catch (sendError) {
    const message = sendError instanceof Error ? sendError.message : "Email send failed.";
    await supabase.from("email_send_logs").insert({ ...logBase, status: "failed", error_message: message });
    throw new Error(message);
  }
}

export async function sendTemplateForEvent(input: {
  eventKey: EmailEventKey;
  recipient: EmailRecipient;
  actorUserId?: string;
  fallback?: {
    subject: string;
    html: string;
    text?: string;
  };
}) {
  const mapping = await getTemplateMapping(input.eventKey);
  if (mapping?.enabled && mapping.template_id) {
    return sendTemplateEmail({
      templateId: mapping.template_id,
      recipient: input.recipient,
      actorUserId: input.actorUserId,
    });
  }

  if (!input.fallback) {
    return {
      ok: false,
      skipped: true,
      reason: `No active template mapping is configured for ${input.eventKey}.`,
    };
  }

  const mergeData = buildMergeData(input.recipient);
  const subject = renderTemplate(input.fallback.subject, mergeData);
  const html = renderTemplate(input.fallback.html, mergeData);
  const text = renderTemplate(input.fallback.text || stripHtml(html), mergeData);
  const result = await sendSmtpEmail({ to: input.recipient.email, subject, html, text });

  const supabase = createSupabaseAdminClient();
  await supabase.from("email_send_logs").insert({
    template_id: null,
    recipient_email: input.recipient.email,
    recipient_name: mergeData.full_name || mergeData.first_name || null,
    recipient_type: input.recipient.participant_id ? "participant" : input.recipient.profile_id ? "profile" : "manual",
    participant_id: input.recipient.participant_id ?? null,
    profile_id: input.recipient.profile_id ?? null,
    subject,
    status: result.skipped ? "skipped" : "sent",
    provider: "smtp",
    provider_message_id: result.messageId ?? null,
    error_message: result.reason ?? null,
    merge_data: mergeData,
    sent_by: input.actorUserId ?? null,
    sent_at: result.skipped ? null : new Date().toISOString(),
  });

  return result;
}

export async function getRecipientsForAudience(audience: "profiles" | "participants", limit = 25) {
  const supabase = createSupabaseAdminClient();

  if (audience === "profiles") {
    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,first_name,last_name,full_name,phone,role,status")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map((profile) => ({
      email: profile.email,
      first_name: profile.first_name,
      last_name: profile.last_name,
      full_name: profile.full_name,
      phone: profile.phone,
      role: profile.role,
      status: profile.status,
      profile_id: profile.id,
    }));
  }

  const { data, error } = await supabase
    .from("participants")
    .select("id,email,first_name,last_name,phone,wave,source,participant_type,check_in_status,survey_status,inner_circle_status")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((participant) => ({
    email: participant.email,
    first_name: participant.first_name,
    last_name: participant.last_name,
    full_name: `${participant.first_name ?? ""} ${participant.last_name ?? ""}`.trim(),
    phone: participant.phone,
    wave: participant.wave,
    source: participant.source,
    participant_type: participant.participant_type,
    check_in_status: participant.check_in_status,
    survey_status: participant.survey_status,
    inner_circle_status: participant.inner_circle_status,
    participant_id: participant.id,
    }));
}

export async function countRecipientsForAudience(audience: "profiles" | "participants") {
  const supabase = createSupabaseAdminClient();
  const query =
    audience === "profiles"
      ? supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "active")
      : supabase.from("participants").select("id", { count: "exact", head: true }).not("email", "is", null);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function saveEmailTemplateMapping(input: {
  eventKey: EmailEventKey;
  templateId?: string | null;
  enabled: boolean;
  actorUserId?: string;
}) {
  if (!EMAIL_EVENT_KEYS.some((event) => event.key === input.eventKey)) {
    throw new Error("Unknown email event.");
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("email_template_mappings")
    .upsert(
      {
        event_key: input.eventKey,
        template_id: input.templateId || null,
        enabled: input.enabled,
        updated_by: input.actorUserId ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "event_key" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function getTemplateMapping(eventKey: EmailEventKey) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("email_template_mappings")
    .select("*")
    .eq("event_key", eventKey)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function sendDueJourneyEmails(input: { actorUserId?: string; limit?: number }) {
  const supabase = createSupabaseAdminClient();
  const limit = Math.min(Math.max(Number(input.limit ?? 10), 1), 50);
  const now = new Date().toISOString();

  const { data: events, error } = await supabase
    .from("email_journey_events")
    .select("*, participants(id,email,first_name,last_name,phone,wave,source,participant_type,check_in_status,survey_status,inner_circle_status,email_journey_opt_in)")
    .eq("status", "scheduled")
    .lte("scheduled_at", now)
    .order("scheduled_at", { ascending: true })
    .limit(limit);
  if (error) throw error;

  const results = [];
  for (const event of events ?? []) {
    const participant = event.participants;
    const eventKey = eventKeyForJourneyStep(event.step_key);
    if (!participant?.email || !participant.email_journey_opt_in) {
      await supabase
        .from("email_journey_events")
        .update({ status: "skipped", error_message: "Participant email missing or journey opt-in is false.", last_attempt_at: now, updated_at: now })
        .eq("id", event.id);
      results.push({ id: event.id, status: "skipped", reason: "Missing email or opt-in." });
      continue;
    }

    try {
      const mapping = await getTemplateMapping(eventKey);
      if (!mapping?.enabled || !mapping.template_id) {
        await supabase
          .from("email_journey_events")
          .update({ status: "skipped", error_message: `No template mapping for ${eventKey}.`, last_attempt_at: now, updated_at: now })
          .eq("id", event.id);
        results.push({ id: event.id, status: "skipped", reason: `No template mapping for ${eventKey}.` });
        continue;
      }

      const sendResult = await sendTemplateEmail({
        templateId: mapping.template_id,
        actorUserId: input.actorUserId,
        recipient: {
          email: participant.email,
          first_name: participant.first_name,
          last_name: participant.last_name,
          full_name: `${participant.first_name ?? ""} ${participant.last_name ?? ""}`.trim(),
          phone: participant.phone,
          wave: participant.wave,
          source: participant.source,
          participant_type: participant.participant_type,
          check_in_status: participant.check_in_status,
          survey_status: participant.survey_status,
          inner_circle_status: participant.inner_circle_status,
          participant_id: participant.id,
        },
      });

      await supabase
        .from("email_journey_events")
        .update({
          status: sendResult.skipped ? "skipped" : "sent",
          provider: "smtp",
          provider_message_id: sendResult.messageId ?? null,
          template_id: mapping.template_id,
          error_message: sendResult.reason ?? null,
          sent_at: sendResult.skipped ? null : new Date().toISOString(),
          last_attempt_at: now,
          updated_at: now,
        })
        .eq("id", event.id);

      results.push({ id: event.id, status: sendResult.skipped ? "skipped" : "sent", messageId: sendResult.messageId ?? null });
    } catch (sendError) {
      const message = sendError instanceof Error ? sendError.message : "Journey email failed.";
      await supabase
        .from("email_journey_events")
        .update({ status: "failed", error_message: message, last_attempt_at: now, updated_at: now })
        .eq("id", event.id);
      results.push({ id: event.id, status: "failed", error: message });
    }
  }

  return {
    processed: results.length,
    sent: results.filter((result) => result.status === "sent").length,
    skipped: results.filter((result) => result.status === "skipped").length,
    failed: results.filter((result) => result.status === "failed").length,
    results,
  };
}

export function renderTemplate(template: string, data: Record<string, string>) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_match, key: string) => data[key] ?? "");
}

function buildMergeData(recipient: EmailRecipient) {
  const firstName = recipient.first_name ?? "";
  const lastName = recipient.last_name ?? "";
  const fullName = recipient.full_name || `${firstName} ${lastName}`.trim();
  return {
    first_name: firstName,
    last_name: lastName,
    full_name: fullName,
    email: recipient.email,
    phone: recipient.phone ?? "",
    role: recipient.role ?? "",
    status: recipient.status ?? "",
    wave: recipient.wave ?? "",
    source: recipient.source ?? "",
    participant_type: recipient.participant_type ?? "",
    check_in_status: recipient.check_in_status ?? "",
    survey_status: recipient.survey_status ?? "",
    inner_circle_status: recipient.inner_circle_status ?? "",
    invite_url: recipient.merge_data?.invite_url ?? "",
    site_url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    checkin_link: recipient.merge_data?.checkin_link ?? `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/check-in`,
    survey_link: recipient.merge_data?.survey_link ?? `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/surveys/general`,
    inner_circle_link: recipient.merge_data?.inner_circle_link ?? `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/stewardship-blueprint-inner-circle`,
    forward_link: recipient.merge_data?.forward_link ?? `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/created-for-more-7-day-stewardship-pilot`,
    preferences_url: recipient.merge_data?.preferences_url ?? `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/contact`,
    unsubscribe_url: recipient.merge_data?.unsubscribe_url ?? `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/contact`,
    ...Object.fromEntries(
      Object.entries(recipient.merge_data ?? {}).map(([key, value]) => [key, value ?? ""]),
    ),
  };
}

function extractMergeFields(value: string) {
  const fields = new Set<string>();
  for (const match of value.matchAll(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g)) fields.add(match[1]);
  return fields;
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

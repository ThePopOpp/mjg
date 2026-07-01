import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getParticipantDetail, updateParticipantTags, getPilotDashboardData, getPilotMetrics } from "@/lib/dashboard/pilot-data";
import { loadBookingManagerData } from "@/lib/booking/data";
import { sendSms, getOrCreateConversation } from "@/lib/twilio/sms";
import { sendSmtpEmail } from "@/lib/email/smtp";
import { logUserActivity } from "@/lib/user-management/repository";
import {
  getEmailTemplateData,
  saveEmailTemplate,
  deleteEmailTemplate,
  sendTemplateEmail,
  saveEmailTemplateMapping,
  sendDueJourneyEmails,
} from "@/lib/email/templates";
import { EMAIL_EVENT_KEYS } from "@/lib/email/constants";
import { getBlogAdminData, getBlogPostById, saveBlogPost, updateBlogPostStatus, normalizePostTags } from "@/lib/content/blog";
import { upsertParticipant } from "@/lib/pilot/repository";
import { saveMediaAsset, getMediaStudioData } from "@/lib/content/media";
import { BRAND_KIT, brandEmailButton, brandEmailHeader } from "@/lib/brand/assets";
import { saveAgentMemory, deleteAgentMemory } from "@/lib/ai-agent/memory";
import {
  getSocialTemplateData, saveSocialTemplate, listAccounts as listSocialAccounts,
  listPosts as listSocialPosts, createPost as createSocialPostRow, publishPost as publishSocialPostRow,
  getSocialReport, listMessages as listSocialMessages, saveAutomation as saveSocialAutomation,
} from "@/lib/social-media/data";
import { SOCIAL_EVENT_KEYS } from "@/lib/social-media/constants";
import { loadProjectManagerData } from "@/lib/project-manager/data";
import { listCmsPages, createCmsDraftPage, saveCmsDraft, getCmsPage } from "@/lib/cms/data";
import type { CmsBlock } from "@/lib/cms/types";

const SOCIAL_EVENT_OPTIONS = SOCIAL_EVENT_KEYS.map((e) => e.key);

// Project Manager validation sets (mirror the API route).
const PM_STATUSES = new Set(["pending", "scheduled", "in_progress", "waiting", "delayed", "blocked", "needs_approval", "complete", "canceled"]);
const PM_PRIORITIES = new Set(["low", "normal", "high", "urgent", "critical", "blocking_closeout"]);
const PM_TYPES = new Set(["project", "phase", "task", "milestone"]);
const PM_DEP_TYPES = new Set(["finish_to_start", "start_to_start", "finish_to_finish", "start_to_finish"]);

async function pmViewer(ctx: AgentContext) {
  const sb = createSupabaseAdminClient();
  const { data } = await sb.from("profiles").select("role, email").eq("id", ctx.actorId).maybeSingle();
  return { id: ctx.actorId, role: (data?.role as string) ?? "admin", email: ctx.actorEmail || (data?.email as string) || "" };
}

const EMAIL_EVENT_OPTIONS = EMAIL_EVENT_KEYS.map((e) => e.key);
const BLOG_STATUSES = ["draft", "scheduled", "published", "hidden", "archived", "deleted"];

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

// ── Dashboard USERS (profiles) — distinct from participants and contacts ──

const searchUsers: AgentTool = {
  name: "search_users",
  description:
    "Search DASHBOARD USERS — the admin/team accounts in the 'profiles' table who log into the dashboard. These are NOT pilot participants and NOT CRM contacts. Match by name, email, or role. Returns id, name, email, role, status, and any linked participant. Use this for any question about 'users', team members, admins, staff, or accounts.",
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "Name, email, or role fragment to search for." },
      limit: { type: "number", description: "Max results (default 25, max 100)." },
    },
    required: ["query"],
  },
  requiresConfirmation: false,
  async execute(args) {
    const supabase = createSupabaseAdminClient();
    const q = String(args.query ?? "").trim();
    const limit = Math.min(Number(args.limit) || 25, 100);
    const like = `%${q}%`;
    const { data, error, count } = await supabase
      .from("profiles")
      .select("id, full_name, first_name, last_name, email, role, status, related_participant_id, created_at", { count: "exact" })
      .or(`full_name.ilike.${like},first_name.ilike.${like},last_name.ilike.${like},email.ilike.${like},role.ilike.${like}`)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return { total: count ?? data?.length ?? 0, returned: data?.length ?? 0, users: data ?? [] };
  },
};

const listUsers: AgentTool = {
  name: "list_users",
  description:
    "List dashboard users (profiles), optionally filtered by exact role or status. Use for 'how many users', 'list all admins/super admins', or a team roster. Returns a total count plus rows. Distinct from participants (pilot members) and contacts (CRM leads).",
  parameters: {
    type: "object",
    properties: {
      role: { type: "string", description: "Optional exact role filter (e.g. super_admin, admin, leader, viewer)." },
      status: { type: "string", description: "Optional status filter: active | invited | inactive | suspended." },
      limit: { type: "number", description: "Max rows returned (default 50, max 200). The total count is exact regardless." },
    },
  },
  requiresConfirmation: false,
  async execute(args) {
    const supabase = createSupabaseAdminClient();
    const limit = Math.min(Number(args.limit) || 50, 200);
    let query = supabase
      .from("profiles")
      .select("id, full_name, email, role, status, related_participant_id, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(limit);
    if (args.role) query = query.eq("role", String(args.role));
    if (args.status) query = query.eq("status", String(args.status));
    const { data, error, count } = await query;
    if (error) throw new Error(error.message);
    return { total: count ?? data?.length ?? 0, returned: data?.length ?? 0, users: data ?? [] };
  },
};

const getUser: AgentTool = {
  name: "get_user",
  description: "Get full detail for one dashboard user (profile) by id: role, status, contact info, the participant they're linked to (if any), and their most recent activity-log entries.",
  parameters: { type: "object", properties: { id: { type: "string", description: "Profile id (uuid)." } }, required: ["id"] },
  requiresConfirmation: false,
  async execute(args) {
    const supabase = createSupabaseAdminClient();
    const id = String(args.id);
    const { data: user, error } = await supabase
      .from("profiles")
      .select("*, participant:related_participant_id(id,first_name,last_name,email,wave,participant_type)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!user) throw new Error("User not found.");
    const { data: activity } = await supabase
      .from("user_activity_logs")
      .select("action, entity_type, entity_id, created_at")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(15);
    return { user, recentActivity: activity ?? [] };
  },
};

// ── Reports / bookings / form submissions (previously blind sections) ──

const getPilotMetricsTool: AgentTool = {
  name: "get_pilot_metrics",
  description:
    "Get the pilot FUNNEL / report metrics (the Reports page numbers): invited, opted-in, check-ins completed, average stewardship score, journey started, surveys completed, inner-circle accepted, follow-up permission granted, and pastor/elder responses. Use for funnel, conversion, and progress questions.",
  parameters: { type: "object", properties: {} },
  requiresConfirmation: false,
  async execute() {
    const data = await getPilotDashboardData();
    if (data.error) throw new Error(data.error);
    return getPilotMetrics(data);
  },
};

const listBookings: AgentTool = {
  name: "list_bookings",
  description:
    "List Bookings & Events data: booking types, upcoming/recent bookings, events, event registrations, and summary stats (active types, upcoming & pending bookings, published events, total registrations).",
  parameters: { type: "object", properties: { limit: { type: "number", description: "Max bookings & registrations to include (default 25, max 100)." } } },
  requiresConfirmation: false,
  async execute(args) {
    const limit = Math.min(Number(args.limit) || 25, 100);
    const data = await loadBookingManagerData();
    return {
      stats: data.stats,
      bookingTypes: data.bookingTypes,
      events: data.events,
      bookings: data.bookings.slice(0, limit),
      registrations: data.registrations.slice(0, limit),
    };
  },
};

const listFormSubmissions: AgentTool = {
  name: "list_form_submissions",
  description: "List website form submissions (contact forms, CMS forms, lead captures) with their form/source, submitted fields, and timestamp.",
  parameters: { type: "object", properties: { limit: { type: "number", description: "Max submissions (default 20, max 100)." } } },
  requiresConfirmation: false,
  async execute(args) {
    const supabase = createSupabaseAdminClient();
    const limit = Math.min(Number(args.limit) || 20, 100);
    const { data, error } = await supabase.from("form_submissions").select("*").order("created_at", { ascending: false }).limit(limit);
    if (error) throw new Error(error.message);
    return { count: data?.length ?? 0, submissions: data ?? [] };
  },
};

// ── Read-only SQL (Super Admin) — for the long tail of ad-hoc questions ──

const SQL_TABLE_HINTS =
  "participants, profiles (dashboard users), contacts, tags, participant_tags, check_in_results, survey_responses, inner_circle_responses, " +
  "calls, sms_conversations, email_templates, email_journey_events, blog_posts, media_assets, brand_assets, booking_types, bookings, events, " +
  "event_registrations, form_submissions, project_schedule_items, cms_pages, social_posts, social_accounts, notifications, user_activity_logs, user_invitations";

const runSqlQuery: AgentTool = {
  name: "run_sql_query",
  description:
    "Run a READ-ONLY SQL SELECT against the dashboard's Postgres database and return the rows. Super Admin only. Use ONLY when no dedicated tool answers the question — ad-hoc counts, joins, or tables that lack a tool (e.g. waves, inner_circle_responses, survey_responses details, settings). " +
    "Rules enforced by the database: a SINGLE SELECT (or WITH … SELECT) statement; NO INSERT/UPDATE/DELETE/DDL; the transaction is read-only; results are capped at 200 rows. Always prefer a dedicated read tool when one exists (search_users, get_pilot_metrics, list_bookings, etc.). " +
    "Common tables: " + SQL_TABLE_HINTS + ".",
  parameters: {
    type: "object",
    properties: { query: { type: "string", description: "A single read-only SQL SELECT statement (no trailing semicolon needed)." } },
    required: ["query"],
  },
  requiresConfirmation: false,
  async execute(args, ctx) {
    await assertSuperAdmin(ctx, "Ad-hoc database queries are restricted to Super Admins.");
    const query = String(args.query ?? "").trim();
    if (!/^\s*(select|with)\b/i.test(query)) throw new Error("Only SELECT / WITH queries are allowed.");
    if (/\b(insert|update|delete|drop|alter|truncate|create|grant|revoke|comment|copy|vacuum|merge|call|do|refresh|reindex|cluster|lock|set|reset)\b/i.test(query)) {
      throw new Error("Only read-only SELECT queries are allowed (no writes or DDL).");
    }
    if (/;/.test(query.replace(/;+\s*$/, ""))) throw new Error("Only a single statement is allowed.");
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.rpc("steward_readonly_query", { query_text: query });
    if (error) throw new Error(error.message);
    const rows = Array.isArray(data) ? data : data == null ? [] : [data];
    await logUserActivity({ userId: ctx.actorId, action: "ai_agent_sql_query", entityType: "database", metadata: { query: query.slice(0, 500), rows: rows.length } }).catch(() => {});
    return { rowCount: rows.length, rows, truncated: rows.length >= 200 };
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

// ──────────────────────────────────────────────────────────────────────────────
// Email templates & automations
// ──────────────────────────────────────────────────────────────────────────────

const listEmailTemplates: AgentTool = {
  name: "list_email_templates",
  description:
    "List all email templates (id, name, subject, category, status) and the current automation mappings (which template fires for each event).",
  parameters: { type: "object", properties: {} },
  requiresConfirmation: false,
  async execute() {
    const data = await getEmailTemplateData();
    if (data.error) throw new Error(data.error);
    return {
      templates: data.templates.map((t: any) => ({
        id: t.id, name: t.name, slug: t.slug, subject: t.subject, category: t.category, status: t.status,
      })),
      automations: data.mappings.map((m: any) => ({
        eventKey: m.event_key, enabled: m.enabled, templateId: m.template_id, templateName: m.email_templates?.name ?? null,
      })),
    };
  },
};

const createEmailTemplate: AgentTool = {
  name: "create_email_template",
  description:
    "Create a new email template. Provide HTML for the body. Supports {{merge_fields}} like {{first_name}}, {{site_url}}, {{checkin_link}}. New templates start as 'draft' unless status is set.",
  parameters: {
    type: "object",
    properties: {
      name: { type: "string", description: "Internal template name." },
      subject: { type: "string", description: "Email subject line (supports merge fields)." },
      htmlBody: { type: "string", description: "HTML body of the email (supports merge fields)." },
      preheader: { type: "string", description: "Optional preview text." },
      textBody: { type: "string", description: "Optional plain-text version." },
      category: { type: "string", description: "Optional category label." },
      status: { type: "string", enum: ["draft", "active", "archived"], description: "Default draft." },
    },
    required: ["name", "subject", "htmlBody"],
  },
  requiresConfirmation: true,
  summarize: (a) => `Create email template “${a.name}” (subject: “${a.subject}”, status: ${a.status ?? "draft"})`,
  async execute(args, ctx) {
    const tpl = await saveEmailTemplate({
      name: args.name, subject: args.subject, htmlBody: args.htmlBody,
      preheader: args.preheader, textBody: args.textBody, category: args.category,
      status: args.status ?? "draft", actorUserId: ctx.actorId,
    });
    return { id: tpl.id, name: tpl.name, status: tpl.status };
  },
};

const updateEmailTemplate: AgentTool = {
  name: "update_email_template",
  description: "Update an existing email template by id. Only pass the fields you want to change (name, subject, htmlBody, status, etc.).",
  parameters: {
    type: "object",
    properties: {
      id: { type: "string", description: "Template id to update." },
      name: { type: "string" },
      subject: { type: "string" },
      htmlBody: { type: "string" },
      preheader: { type: "string" },
      textBody: { type: "string" },
      category: { type: "string" },
      status: { type: "string", enum: ["draft", "active", "archived"] },
    },
    required: ["id"],
  },
  requiresConfirmation: true,
  summarize: (a) => `Update email template ${a.id}`,
  async execute(args, ctx) {
    // saveEmailTemplate requires name/subject/htmlBody — backfill from the existing row.
    const data = await getEmailTemplateData();
    const existing = data.templates.find((t: any) => t.id === args.id);
    if (!existing) throw new Error("Template not found.");
    const tpl = await saveEmailTemplate({
      id: args.id,
      name: args.name ?? existing.name,
      subject: args.subject ?? existing.subject,
      htmlBody: args.htmlBody ?? existing.html_body,
      preheader: args.preheader ?? existing.preheader ?? undefined,
      textBody: args.textBody ?? existing.text_body ?? undefined,
      category: args.category ?? existing.category ?? undefined,
      status: args.status ?? existing.status,
      actorUserId: ctx.actorId,
    });
    return { id: tpl.id, name: tpl.name, status: tpl.status };
  },
};

const setEmailAutomation: AgentTool = {
  name: "set_email_automation",
  description:
    "Configure which email template automatically fires for a lifecycle/journey event (e.g. check_in_completed, email_journey_day_1). Set enabled true/false and the template to use.",
  parameters: {
    type: "object",
    properties: {
      eventKey: { type: "string", enum: EMAIL_EVENT_OPTIONS, description: "The event to map." },
      templateId: { type: "string", description: "Template id to fire (omit to clear)." },
      enabled: { type: "boolean", description: "Whether this automation is active." },
    },
    required: ["eventKey", "enabled"],
  },
  requiresConfirmation: true,
  summarize: (a) => `Set automation for “${a.eventKey}” → ${a.enabled ? "enabled" : "disabled"}${a.templateId ? `, template ${a.templateId}` : ""}`,
  async execute(args, ctx) {
    const m = await saveEmailTemplateMapping({
      eventKey: args.eventKey, templateId: args.templateId ?? null, enabled: Boolean(args.enabled), actorUserId: ctx.actorId,
    });
    return { eventKey: m.event_key, enabled: m.enabled, templateId: m.template_id };
  },
};

const sendTemplateEmailAction: AgentTool = {
  name: "send_template_email",
  description: "Send a specific email template to one recipient. Merge fields are filled from the recipient details you provide.",
  parameters: {
    type: "object",
    properties: {
      templateId: { type: "string", description: "Template id to send." },
      email: { type: "string", description: "Recipient email address." },
      firstName: { type: "string" },
      lastName: { type: "string" },
    },
    required: ["templateId", "email"],
  },
  requiresConfirmation: true,
  summarize: (a) => `Send template ${a.templateId} to ${a.email}`,
  async execute(args, ctx) {
    const result = await sendTemplateEmail({
      templateId: args.templateId,
      recipient: { email: args.email, first_name: args.firstName, last_name: args.lastName },
      actorUserId: ctx.actorId,
    });
    return { ok: result.ok, skipped: result.skipped, messageId: result.messageId };
  },
};

const runDueJourneyEmails: AgentTool = {
  name: "run_due_journey_emails",
  description:
    "Process and send any scheduled email-journey (automation) messages that are now due. Returns how many were sent/skipped/failed. This sends real emails.",
  parameters: {
    type: "object",
    properties: { limit: { type: "number", description: "Max events to process (1–50, default 10)." } },
  },
  requiresConfirmation: true,
  summarize: (a) => `Send all due journey/automation emails (up to ${a.limit ?? 10})`,
  async execute(args, ctx) {
    return await sendDueJourneyEmails({ actorUserId: ctx.actorId, limit: Number(args.limit) || 10 });
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Blog posts
// ──────────────────────────────────────────────────────────────────────────────

const listBlogPosts: AgentTool = {
  name: "list_blog_posts",
  description: "List blog posts (id, title, slug, status, category, publish date).",
  parameters: { type: "object", properties: {} },
  requiresConfirmation: false,
  async execute() {
    const data = await getBlogAdminData();
    if (data.error) throw new Error(data.error);
    return {
      posts: data.posts.map((p: any) => ({
        id: p.id, title: p.title, slug: p.slug, status: p.status,
        category: p.category?.name ?? null, publishAt: p.publish_at, updatedAt: p.updated_at,
      })),
    };
  },
};

const getBlogPost: AgentTool = {
  name: "get_blog_post",
  description:
    "Read one blog post's full editable fields by id (title, body HTML, excerpt, featured image, gallery, video, category, tags, status, publish date). Call this before update_blog_post so you only change the intended fields.",
  parameters: {
    type: "object",
    properties: { id: { type: "string", description: "Blog post id." } },
    required: ["id"],
  },
  requiresConfirmation: false,
  async execute(args) {
    const post: any = await getBlogPostById(String(args.id));
    if (!post) throw new Error("Blog post not found.");
    return {
      id: post.id, title: post.title, slug: post.slug, excerpt: post.excerpt,
      contentHtml: post.content_html, featuredImageUrl: post.featured_image_url,
      galleryUrls: post.gallery_urls ?? [], videoUrl: post.video_url,
      category: post.category?.name ?? null,
      tags: normalizePostTags(post).map((t: any) => t.name),
      status: post.status, publishAt: post.publish_at,
    };
  },
};

const createBlogPost: AgentTool = {
  name: "create_blog_post",
  description:
    "Create a blog post. Provide HTML content for the body. IMPORTANT: a header/cover image URL goes in the 'featuredImageUrl' field — do NOT embed it in contentHtml. Posts default to 'draft'; set status 'published' to publish now, or 'scheduled' with publishAt to schedule.",
  parameters: {
    type: "object",
    properties: {
      title: { type: "string" },
      contentHtml: { type: "string", description: "HTML body of the post. Do not put the cover image here." },
      excerpt: { type: "string", description: "Short summary." },
      category: { type: "string" },
      tags: { type: "array", items: { type: "string" } },
      featuredImageUrl: { type: "string", description: "URL of the post's featured/cover image (the header image)." },
      videoUrl: { type: "string" },
      status: { type: "string", enum: BLOG_STATUSES, description: "Default draft." },
      publishAt: { type: "string", description: "ISO timestamp if scheduling." },
    },
    required: ["title", "contentHtml"],
  },
  requiresConfirmation: true,
  summarize: (a) => `Create blog post “${a.title}” (status: ${a.status ?? "draft"}${a.featuredImageUrl ? ", with featured image" : ""})`,
  async execute(args, ctx) {
    const post = await saveBlogPost({
      title: args.title, contentHtml: args.contentHtml, excerpt: args.excerpt,
      category: args.category, tags: args.tags, featuredImageUrl: args.featuredImageUrl,
      videoUrl: args.videoUrl, status: args.status ?? "draft", publishAt: args.publishAt,
      actorUserId: ctx.actorId,
    });
    return { id: post.id, title: post.title, slug: post.slug, status: post.status };
  },
};

const updateBlogPost: AgentTool = {
  name: "update_blog_post",
  description:
    "Update an existing blog post by id. Only pass the fields you want to change — everything else is preserved. Use 'featuredImageUrl' to set the header/cover image (NOT in the body). To set a cover image on a post, call this with id + featuredImageUrl.",
  parameters: {
    type: "object",
    properties: {
      id: { type: "string", description: "Blog post id to update." },
      title: { type: "string" },
      contentHtml: { type: "string", description: "New HTML body. Do not put the cover image here." },
      excerpt: { type: "string" },
      category: { type: "string" },
      tags: { type: "array", items: { type: "string" } },
      featuredImageUrl: { type: "string", description: "URL of the featured/cover image." },
      videoUrl: { type: "string" },
      status: { type: "string", enum: BLOG_STATUSES },
      publishAt: { type: "string", description: "ISO timestamp." },
    },
    required: ["id"],
  },
  requiresConfirmation: true,
  summarize: (a) => {
    const changed = Object.keys(a).filter((k) => k !== "id");
    return `Update blog post ${a.id} (${changed.join(", ") || "no fields"})`;
  },
  async execute(args, ctx) {
    // Fetch-before-edit: saveBlogPost replaces the full row, so backfill unchanged
    // fields from the existing post to avoid wiping content/image/tags.
    const existing: any = await getBlogPostById(String(args.id));
    if (!existing) throw new Error("Blog post not found.");
    const post = await saveBlogPost({
      id: args.id,
      title: args.title ?? existing.title,
      contentHtml: args.contentHtml ?? existing.content_html ?? "",
      excerpt: args.excerpt ?? existing.excerpt ?? undefined,
      category: args.category ?? existing.category?.name ?? undefined,
      tags: args.tags ?? normalizePostTags(existing).map((t: any) => t.name),
      featuredImageUrl: args.featuredImageUrl ?? existing.featured_image_url ?? undefined,
      videoUrl: args.videoUrl ?? existing.video_url ?? undefined,
      status: args.status ?? existing.status,
      publishAt: args.publishAt ?? existing.publish_at ?? undefined,
      actorUserId: ctx.actorId,
    });
    return { id: post.id, title: post.title, slug: post.slug, status: post.status, featuredImageUrl: post.featured_image_url };
  },
};

const updateBlogPostStatusAction: AgentTool = {
  name: "update_blog_post_status",
  description: "Change only a blog post's status (draft, scheduled, published, hidden, archived, deleted). For content/image edits use update_blog_post.",
  parameters: {
    type: "object",
    properties: {
      id: { type: "string" },
      status: { type: "string", enum: BLOG_STATUSES },
    },
    required: ["id", "status"],
  },
  requiresConfirmation: true,
  summarize: (a) => `Set blog post ${a.id} status to “${a.status}”`,
  async execute(args, ctx) {
    const post = await updateBlogPostStatus({ id: args.id, status: args.status, actorUserId: ctx.actorId });
    return { id: post.id, status: post.status };
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Contacts
// ──────────────────────────────────────────────────────────────────────────────

const listContacts: AgentTool = {
  name: "list_contacts",
  description: "List contacts/leads (name, email, phone, type, status). Optionally filter by a search term.",
  parameters: {
    type: "object",
    properties: {
      search: { type: "string", description: "Optional name/email/phone search." },
      limit: { type: "number", description: "Max results (default 20, max 50)." },
    },
  },
  requiresConfirmation: false,
  async execute(args) {
    const supabase = createSupabaseAdminClient();
    const limit = Math.min(Number(args.limit) || 20, 50);
    let query = supabase
      .from("contacts")
      .select("id, first_name, last_name, email, phone, company, church, type, status, source")
      .order("created_at", { ascending: false })
      .limit(limit);
    const q = String(args.search ?? "").trim();
    if (q) {
      const like = `%${q}%`;
      query = query.or(`first_name.ilike.${like},last_name.ilike.${like},email.ilike.${like},phone.ilike.${like}`);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return { count: data?.length ?? 0, contacts: data ?? [] };
  },
};

const createContact: AgentTool = {
  name: "create_contact",
  description: "Add a new contact/lead to the dashboard.",
  parameters: {
    type: "object",
    properties: {
      firstName: { type: "string" },
      lastName: { type: "string" },
      email: { type: "string" },
      phone: { type: "string" },
      company: { type: "string" },
      church: { type: "string" },
      type: { type: "string", description: "e.g. lead, contact, partner." },
      status: { type: "string" },
      source: { type: "string" },
      notes: { type: "string" },
    },
    required: ["firstName", "lastName"],
  },
  requiresConfirmation: true,
  summarize: (a) => `Add contact ${a.firstName} ${a.lastName}${a.email ? ` (${a.email})` : ""}`,
  async execute(args, ctx) {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("contacts")
      .insert({
        first_name: args.firstName, last_name: args.lastName,
        email: args.email ?? null, phone: args.phone ?? null,
        company: args.company ?? null, church: args.church ?? null,
        type: args.type ?? "contact", status: args.status ?? "active",
        source: args.source ?? "ai_agent", notes: args.notes ?? null,
        created_by: ctx.actorId,
      })
      .select("id, first_name, last_name, email")
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
};

const updateContact: AgentTool = {
  name: "update_contact",
  description: "Update an existing contact by id. Only pass the fields you want to change.",
  parameters: {
    type: "object",
    properties: {
      id: { type: "string", description: "Contact id." },
      firstName: { type: "string" },
      lastName: { type: "string" },
      email: { type: "string" },
      phone: { type: "string" },
      company: { type: "string" },
      church: { type: "string" },
      type: { type: "string" },
      status: { type: "string" },
      source: { type: "string" },
      notes: { type: "string" },
    },
    required: ["id"],
  },
  requiresConfirmation: true,
  summarize: (a) => `Update contact ${a.id} (${Object.keys(a).filter((k) => k !== "id").join(", ") || "no fields"})`,
  async execute(args) {
    const map: Record<string, string> = {
      firstName: "first_name", lastName: "last_name", email: "email", phone: "phone",
      company: "company", church: "church", type: "type", status: "status", source: "source", notes: "notes",
    };
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const [arg, col] of Object.entries(map)) if (args[arg] !== undefined) patch[col] = args[arg];
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("contacts").update(patch).eq("id", args.id).select("id, first_name, last_name, email").single();
    if (error) throw new Error(error.message);
    return data;
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Participants & tags
// ──────────────────────────────────────────────────────────────────────────────

const createParticipant: AgentTool = {
  name: "create_participant",
  description:
    "Create a pilot participant (or update one by matching email). Use this to enroll someone in the pilot.",
  parameters: {
    type: "object",
    properties: {
      firstName: { type: "string" },
      lastName: { type: "string" },
      email: { type: "string" },
      phone: { type: "string" },
      wave: { type: "string", description: "Wave / source label." },
      participantType: { type: "string" },
      relationshipCategory: { type: "string" },
    },
    required: ["firstName", "lastName", "email"],
  },
  requiresConfirmation: true,
  summarize: (a) => `Create/enroll participant ${a.firstName} ${a.lastName} (${a.email})`,
  async execute(args) {
    const p = await upsertParticipant({
      firstName: args.firstName, lastName: args.lastName, email: args.email,
      phone: args.phone, waveSource: args.wave, participantType: args.participantType,
      relationshipCategory: args.relationshipCategory,
    });
    return { id: (p as any)?.id ?? null, email: args.email };
  },
};

const updateParticipant: AgentTool = {
  name: "update_participant",
  description:
    "Update an existing participant by id. Only pass fields you want to change. Use get_participant first to confirm the id and current values.",
  parameters: {
    type: "object",
    properties: {
      id: { type: "string", description: "Participant id." },
      firstName: { type: "string" },
      lastName: { type: "string" },
      email: { type: "string" },
      phone: { type: "string" },
      wave: { type: "string" },
      source: { type: "string" },
      participantType: { type: "string" },
      relationshipCategory: { type: "string" },
      checkInStatus: { type: "string" },
      journeyStatus: { type: "string" },
      surveyStatus: { type: "string" },
      innerCircleStatus: { type: "string" },
      notes: { type: "string" },
    },
    required: ["id"],
  },
  requiresConfirmation: true,
  summarize: (a) => `Update participant ${a.id} (${Object.keys(a).filter((k) => k !== "id").join(", ") || "no fields"})`,
  async execute(args, ctx) {
    const map: Record<string, string> = {
      firstName: "first_name", lastName: "last_name", email: "email", phone: "phone",
      wave: "wave", source: "source", participantType: "participant_type", relationshipCategory: "relationship_category",
      checkInStatus: "check_in_status", journeyStatus: "journey_status", surveyStatus: "survey_status",
      innerCircleStatus: "inner_circle_status", notes: "notes",
    };
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const [arg, col] of Object.entries(map)) if (args[arg] !== undefined) patch[col] = args[arg];
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("participants").update(patch).eq("id", args.id).select("id, first_name, last_name, email").single();
    if (error) throw new Error(error.message);
    await logUserActivity({ userId: ctx.actorId, action: "ai_agent_update_participant", entityType: "participants", entityId: args.id }).catch(() => {});
    return data;
  },
};

const listTags: AgentTool = {
  name: "list_tags",
  description: "List all participant tags (id, name, category).",
  parameters: { type: "object", properties: {} },
  requiresConfirmation: false,
  async execute() {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("tags").select("id, name, category").order("name");
    if (error) throw new Error(error.message);
    return { tags: data ?? [] };
  },
};

const setParticipantTags: AgentTool = {
  name: "set_participant_tags",
  description: "Replace the full set of tags on a participant. Pass the complete list of tag ids the participant should have.",
  parameters: {
    type: "object",
    properties: {
      participantId: { type: "string" },
      tagIds: { type: "array", items: { type: "string" }, description: "Complete list of tag ids." },
    },
    required: ["participantId", "tagIds"],
  },
  requiresConfirmation: true,
  summarize: (a) => `Set ${Array.isArray(a.tagIds) ? a.tagIds.length : 0} tag(s) on participant ${a.participantId}`,
  async execute(args, ctx) {
    await updateParticipantTags({ participantId: args.participantId, tagIds: args.tagIds ?? [], actorId: ctx.actorId });
    return { participantId: args.participantId, tagCount: (args.tagIds ?? []).length };
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Media studio
// ──────────────────────────────────────────────────────────────────────────────

const listBusinessCards: AgentTool = {
  name: "list_business_cards",
  description: "List digital business cards (name, owner, status, public slug, view/click counts, lead count).",
  parameters: { type: "object", properties: {} },
  requiresConfirmation: false,
  async execute() {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("business_cards")
      .select("id, card_name, display_name, slug, status, view_count, click_count, owner:profiles!business_cards_staff_user_id_fkey(full_name)")
      .neq("status", "archived")
      .order("updated_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    const { count: leadCount } = await supabase.from("business_card_leads").select("id", { count: "exact", head: true }).eq("status", "new");
    return {
      newLeads: leadCount ?? 0,
      cards: (data ?? []).map((c: any) => ({
        id: c.id, name: c.display_name || c.card_name, slug: c.slug, status: c.status,
        owner: c.owner?.full_name ?? null, views: c.view_count, clicks: c.click_count,
      })),
    };
  },
};

const listMediaAssets: AgentTool = {
  name: "list_media_assets",
  description: "List media studio assets (id, title, type, status, visibility).",
  parameters: { type: "object", properties: {} },
  requiresConfirmation: false,
  async execute() {
    const data = await getMediaStudioData();
    const assets = (data as any).assets ?? (data as any).media ?? [];
    return {
      assets: (assets as any[]).map((a) => ({
        id: a.id, title: a.title, type: a.asset_type, status: a.status, visibility: a.visibility,
      })),
    };
  },
};

const createMediaAsset: AgentTool = {
  name: "create_media_asset",
  description: "Add a media asset (audio, video, photo, or gallery) by external URL or embed URL.",
  parameters: {
    type: "object",
    properties: {
      title: { type: "string" },
      assetType: { type: "string", enum: ["audio", "video", "photo", "gallery"] },
      fileUrl: { type: "string", description: "Direct file URL (for uploads/external files)." },
      embedUrl: { type: "string", description: "Embed URL (e.g. YouTube/Vimeo)." },
      description: { type: "string" },
      status: { type: "string", enum: ["draft", "published", "hidden", "archived"] },
      visibility: { type: "string", enum: ["private", "public", "assigned"] },
    },
    required: ["title", "assetType"],
  },
  requiresConfirmation: true,
  summarize: (a) => `Create ${a.assetType} media asset “${a.title}” (${a.status ?? "draft"})`,
  async execute(args, ctx) {
    const asset = await saveMediaAsset({
      title: args.title, assetType: args.assetType,
      sourceType: args.embedUrl ? "embed" : "external_url",
      fileUrl: args.fileUrl, embedUrl: args.embedUrl, description: args.description,
      status: args.status ?? "draft", visibility: args.visibility ?? "private",
      actorUserId: ctx.actorId,
    });
    return { id: (asset as any)?.id ?? null, title: args.title };
  },
};

const updateMediaAsset: AgentTool = {
  name: "update_media_asset",
  description: "Update an existing media asset by id (title, description, URL, status, visibility). Only pass fields to change.",
  parameters: {
    type: "object",
    properties: {
      id: { type: "string", description: "Media asset id." },
      title: { type: "string" },
      description: { type: "string" },
      fileUrl: { type: "string" },
      embedUrl: { type: "string" },
      status: { type: "string", enum: ["draft", "published", "hidden", "archived"] },
      visibility: { type: "string", enum: ["private", "public", "assigned"] },
    },
    required: ["id"],
  },
  requiresConfirmation: true,
  summarize: (a) => `Update media asset ${a.id} (${Object.keys(a).filter((k) => k !== "id").join(", ") || "no fields"})`,
  async execute(args, ctx) {
    const map: Record<string, string> = {
      title: "title", description: "description", fileUrl: "file_url", embedUrl: "embed_url",
      status: "status", visibility: "visibility",
    };
    const patch: Record<string, unknown> = { updated_by: ctx.actorId, updated_at: new Date().toISOString() };
    for (const [arg, col] of Object.entries(map)) if (args[arg] !== undefined) patch[col] = args[arg];
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("media_assets").update(patch).eq("id", args.id).select("id, title, status").single();
    if (error) throw new Error(error.message);
    return data;
  },
};

const deleteEmailTemplateAction: AgentTool = {
  name: "delete_email_template",
  description: "Permanently delete an email template by id. This cannot be undone; any automation pointing at it is disabled. Prefer archiving (update_email_template status=archived) unless the user explicitly wants it removed.",
  parameters: {
    type: "object",
    properties: { id: { type: "string", description: "Template id to delete." } },
    required: ["id"],
  },
  requiresConfirmation: true,
  summarize: (a) => `Permanently delete email template ${a.id}`,
  async execute(args) {
    await deleteEmailTemplate(String(args.id));
    return { deleted: true, id: args.id };
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Brand kit / design system
// ──────────────────────────────────────────────────────────────────────────────

const getBrandKit: AgentTool = {
  name: "get_brand_kit",
  description:
    "Get the MJG brand kit / design system: official logo URLs, color palette (hex), font stacks, brand voice, and ready-to-use on-brand email header & button HTML snippets. ALWAYS call this before generating member-facing email or blog content so it stays on-brand.",
  parameters: { type: "object", properties: {} },
  requiresConfirmation: false,
  async execute() {
    return {
      name: BRAND_KIT.name,
      tagline: BRAND_KIT.tagline,
      logos: BRAND_KIT.logos,
      colors: BRAND_KIT.colors,
      fonts: BRAND_KIT.fonts,
      voice: BRAND_KIT.voice,
      links: BRAND_KIT.links,
      snippets: {
        emailHeaderHtml: brandEmailHeader(),
        emailButtonExample: brandEmailButton("{{site_url}}", "Read more"),
      },
    };
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Memory
// ──────────────────────────────────────────────────────────────────────────────

const rememberTool: AgentTool = {
  name: "remember",
  description:
    "Save a durable, non-sensitive fact to recall in future conversations (e.g. an ongoing task, a created entity id, or an owner preference). Do NOT store financial, legal, medical, or other sensitive personal data.",
  parameters: {
    type: "object",
    properties: {
      key: { type: "string", description: "Short identifier, e.g. 'draft_blog_post_id' or 'reminder_preference'." },
      value: { type: "string", description: "The fact to remember." },
    },
    required: ["key", "value"],
  },
  requiresConfirmation: false,
  async execute(args, ctx) {
    const m = await saveAgentMemory({ key: String(args.key), value: String(args.value), createdBy: ctx.actorId });
    return { saved: true, key: m.key };
  },
};

const forgetTool: AgentTool = {
  name: "forget",
  description: "Delete a saved memory fact by its key when it is obsolete.",
  parameters: {
    type: "object",
    properties: { key: { type: "string", description: "The memory key to remove." } },
    required: ["key"],
  },
  requiresConfirmation: false,
  async execute(args) {
    await deleteAgentMemory(String(args.key));
    return { forgotten: true, key: args.key };
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Social Media tools
// ──────────────────────────────────────────────────────────────────────────────

const listSocialTemplatesTool: AgentTool = {
  name: "list_social_templates",
  description: "List social media post templates (id, name, category, status, platforms, body) and the current social automations.",
  parameters: { type: "object", properties: {} },
  requiresConfirmation: false,
  async execute() {
    const data = await getSocialTemplateData();
    return {
      templates: data.templates.map((t) => ({ id: t.id, name: t.name, category: t.category, status: t.status, platforms: t.platforms, body: t.body_text, hashtags: t.hashtags })),
      automations: data.automations.map((a) => ({ eventKey: a.event_key, enabled: a.enabled, templateId: a.template_id, platforms: a.platforms })),
    };
  },
};

const listSocialAccountsTool: AgentTool = {
  name: "list_social_accounts",
  description: "List connected social media accounts (id, platform, display name, status, active). Credentials are never returned. Use the account id when creating a post.",
  parameters: { type: "object", properties: {} },
  requiresConfirmation: false,
  async execute() {
    const accounts = await listSocialAccounts();
    return { accounts: accounts.map((a) => ({ id: a.id, platform: a.platform, displayName: a.display_name, status: a.status, active: a.is_active })) };
  },
};

const listSocialPostsTool: AgentTool = {
  name: "list_social_posts",
  description: "List social posts, optionally filtered by status (draft, scheduled, published, failed). Returns platform, status, body, schedule/publish time, and engagement.",
  parameters: { type: "object", properties: { status: { type: "string", enum: ["draft", "scheduled", "published", "failed", "skipped"], description: "Optional status filter." } } },
  requiresConfirmation: false,
  async execute(args) {
    const posts = await listSocialPosts({ status: args.status, limit: 50 });
    return { posts: posts.map((p) => ({ id: p.id, platform: p.platform, status: p.status, body: p.body_text, scheduledAt: p.scheduled_at, publishedAt: p.published_at, engagement: p.engagement })) };
  },
};

const getSocialReportTool: AgentTool = {
  name: "get_social_report",
  description: "Get a social media performance report for a date range (default 30 days): totals, per-platform breakdown, daily activity, and top posts. Use to run reports and analyze data.",
  parameters: { type: "object", properties: { rangeDays: { type: "number", description: "Days to include (default 30)." } } },
  requiresConfirmation: false,
  async execute(args) { return await getSocialReport(Number(args.rangeDays) || 30); },
};

const listSocialInboxTool: AgentTool = {
  name: "list_social_inbox",
  description: "List social inbox items (messages, comments, reviews, mentions), optionally filtered by kind or status.",
  parameters: { type: "object", properties: { kind: { type: "string", enum: ["message", "comment", "review", "mention"] }, status: { type: "string", enum: ["new", "read", "replied", "archived"] } } },
  requiresConfirmation: false,
  async execute(args) {
    const messages = await listSocialMessages({ kind: args.kind, status: args.status, limit: 50 });
    return { messages: messages.map((m) => ({ id: m.id, kind: m.kind, platform: m.platform, author: m.author_name, text: m.text, rating: m.rating, status: m.status, receivedAt: m.received_at })) };
  },
};

const createSocialTemplateTool: AgentTool = {
  name: "create_social_template",
  description: "Create a social media post template. Provide the post body text, target platforms, and optional hashtags. New templates default to 'draft'.",
  parameters: {
    type: "object",
    properties: {
      name: { type: "string", description: "Template name." },
      bodyText: { type: "string", description: "The post copy. Supports {{merge_fields}} like {{event_title}}, {{event_url}}, {{site_url}}." },
      platforms: { type: "array", items: { type: "string" }, description: "Target platforms, e.g. [\"facebook\",\"linkedin\"]." },
      hashtags: { type: "array", items: { type: "string" }, description: "Optional hashtags." },
      category: { type: "string", description: "Optional category label." },
      status: { type: "string", enum: ["draft", "active", "archived"], description: "Default draft." },
    },
    required: ["name", "bodyText"],
  },
  requiresConfirmation: true,
  summarize: (a) => `Create social template "${a.name}" for ${(a.platforms ?? []).join(", ") || "no platforms"} (status: ${a.status ?? "draft"})`,
  async execute(args, ctx) {
    const t = await saveSocialTemplate({ name: args.name, bodyText: args.bodyText, platforms: args.platforms ?? [], hashtags: args.hashtags ?? [], category: args.category, status: args.status ?? "draft", actorUserId: ctx.actorId });
    return { id: t.id, name: t.name, status: t.status };
  },
};

const createSocialPostTool: AgentTool = {
  name: "create_social_post",
  description: "Create a social media post as a draft or scheduled. Provide platform and body. Pass accountId (from list_social_accounts) to attach an account. Pass scheduledAt (ISO) to schedule; otherwise it is a draft. Does NOT publish — use publish_social_post or let the owner publish from History.",
  parameters: {
    type: "object",
    properties: {
      platform: { type: "string", description: "Platform id, e.g. facebook or linkedin." },
      bodyText: { type: "string", description: "The post copy." },
      accountId: { type: "string", description: "Optional account id from list_social_accounts." },
      hashtags: { type: "array", items: { type: "string" } },
      mediaUrls: { type: "array", items: { type: "string" } },
      linkUrl: { type: "string" },
      scheduledAt: { type: "string", description: "Optional ISO datetime to schedule the post." },
    },
    required: ["platform", "bodyText"],
  },
  requiresConfirmation: true,
  summarize: (a) => `${a.scheduledAt ? `Schedule (${a.scheduledAt})` : "Draft"} a ${a.platform} post: "${String(a.bodyText).slice(0, 80)}…"`,
  async execute(args, ctx) {
    const post = await createSocialPostRow({
      platform: args.platform, account_id: args.accountId ?? null, body_text: args.bodyText,
      hashtags: args.hashtags ?? [], media_urls: args.mediaUrls ?? [], link_url: args.linkUrl ?? null,
      scheduled_at: args.scheduledAt ?? null, status: args.scheduledAt ? "scheduled" : "draft", actorUserId: ctx.actorId,
    });
    return { id: post.id, status: post.status, platform: post.platform };
  },
};

const publishSocialPostTool: AgentTool = {
  name: "publish_social_post",
  description: "Publish an existing social post now (by id). The post must have a connected account. Use list_social_posts to find the id.",
  parameters: { type: "object", properties: { id: { type: "string", description: "The post id." } }, required: ["id"] },
  requiresConfirmation: true,
  summarize: (a) => `Publish social post ${a.id} now`,
  async execute(args) {
    const post = await publishSocialPostRow(String(args.id));
    return { id: post.id, status: post.status, url: post.external_url };
  },
};

const setSocialAutomationTool: AgentTool = {
  name: "set_social_automation",
  description: "Bind a social template to an automation event (or enable/disable it). Events: " + SOCIAL_EVENT_OPTIONS.join(", ") + ".",
  parameters: {
    type: "object",
    properties: {
      eventKey: { type: "string", enum: SOCIAL_EVENT_OPTIONS, description: "The automation event." },
      templateId: { type: "string", description: "Template id to fire (from list_social_templates), or omit to clear." },
      platforms: { type: "array", items: { type: "string" } },
      enabled: { type: "boolean", description: "Whether the automation is active." },
    },
    required: ["eventKey", "enabled"],
  },
  requiresConfirmation: true,
  summarize: (a) => `${a.enabled ? "Enable" : "Disable"} social automation "${a.eventKey}"${a.templateId ? ` → template ${a.templateId}` : ""}`,
  async execute(args, ctx) {
    await saveSocialAutomation({ event_key: args.eventKey, template_id: args.templateId ?? null, platforms: args.platforms ?? [], enabled: Boolean(args.enabled), actorUserId: ctx.actorId });
    return { ok: true, eventKey: args.eventKey, enabled: Boolean(args.enabled) };
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Project Manager tools
// ──────────────────────────────────────────────────────────────────────────────

const listProjectItems: AgentTool = {
  name: "list_project_items",
  description: "List Project Manager items the current user can see (projects, phases, tasks, milestones): id, title, type, project/group, status, priority, dates, assignee, progress. Use to answer questions or to find an item's id before connecting/updating it.",
  parameters: {
    type: "object",
    properties: {
      status: { type: "string", description: "Optional status filter (e.g. in_progress, blocked, complete)." },
      query: { type: "string", description: "Optional text filter on title / project / assignee." },
    },
  },
  requiresConfirmation: false,
  async execute(args, ctx) {
    const data = await loadProjectManagerData("default", await pmViewer(ctx));
    let items = data.items;
    if (args.status) items = items.filter((i) => i.status === String(args.status));
    if (args.query) { const q = String(args.query).toLowerCase(); items = items.filter((i) => `${i.title} ${i.project_title ?? ""} ${i.assignee ?? ""}`.toLowerCase().includes(q)); }
    return {
      count: items.length,
      items: items.slice(0, 100).map((i) => ({
        id: i.id, title: i.title, type: i.type, project: i.schedule_group_key || i.project_title || null,
        status: i.status, priority: i.priority, start: i.start_date, end: i.end_date, assignee: i.assignee, progress: i.progress,
      })),
      dependencies: data.dependencies.map((d) => ({ id: d.id, source: d.source_item_id, target: d.target_item_id, type: d.dependency_type })),
    };
  },
};

const listProjectTemplates: AgentTool = {
  name: "list_project_templates",
  description: "List Project Manager templates that scaffold a whole project with phased tasks + dependencies.",
  parameters: { type: "object", properties: {} },
  requiresConfirmation: false,
  async execute(_args, ctx) {
    const data = await loadProjectManagerData("default", await pmViewer(ctx));
    return { templates: data.templates.map((t) => ({ id: t.id, name: t.name, slug: t.slug, category: t.category, suggestedDurationDays: t.suggested_duration_days })) };
  },
};

const createProjectItem: AgentTool = {
  name: "create_project_item",
  description: "Create a Project Manager item. To nest a task under a project, pass that project's name as 'project'. Dates are YYYY-MM-DD.",
  parameters: {
    type: "object",
    properties: {
      title: { type: "string" },
      type: { type: "string", enum: ["project", "phase", "task", "milestone"], description: "Default task." },
      project: { type: "string", description: "Project/group name to nest under." },
      startDate: { type: "string", description: "YYYY-MM-DD (default today)." },
      endDate: { type: "string", description: "YYYY-MM-DD (default = start)." },
      status: { type: "string" },
      priority: { type: "string" },
      assignee: { type: "string", description: "Assignee email." },
      description: { type: "string" },
    },
    required: ["title"],
  },
  requiresConfirmation: true,
  summarize: (a) => `Create ${a.type ?? "task"} "${a.title}"${a.project ? ` under project "${a.project}"` : ""}`,
  async execute(args, ctx) {
    const sb = createSupabaseAdminClient();
    const type = PM_TYPES.has(String(args.type)) ? String(args.type) : "task";
    const today = new Date().toISOString().slice(0, 10);
    const start = args.startDate ? String(args.startDate).slice(0, 10) : today;
    const end = args.endDate ? String(args.endDate).slice(0, 10) : start;
    const project = args.project ? String(args.project) : null;
    const groupKey = type === "project" ? (project || String(args.title)) : project;
    const row = {
      board_id: "default", type, title: String(args.title), project_title: project,
      assignee: args.assignee ? String(args.assignee) : null, start_date: start, end_date: end,
      status: PM_STATUSES.has(String(args.status)) ? String(args.status) : "scheduled",
      priority: PM_PRIORITIES.has(String(args.priority)) ? String(args.priority) : "normal",
      description: args.description ? String(args.description) : null,
      schedule_group_key: groupKey, created_by: ctx.actorId, visibility: "team", visible_roles: [],
    };
    const { data, error } = await sb.from("project_schedule_items").insert(row).select("id, title, type, status").single();
    if (error) throw new Error(error.message);
    return data;
  },
};

const connectProjectItems: AgentTool = {
  name: "connect_project_items",
  description: "Create a dependency between two schedule items (the target waits on the source). Get ids from list_project_items.",
  parameters: {
    type: "object",
    properties: {
      sourceId: { type: "string" },
      targetId: { type: "string" },
      dependencyType: { type: "string", enum: ["finish_to_start", "start_to_start", "finish_to_finish", "start_to_finish"], description: "Default finish_to_start." },
      lagDays: { type: "number" },
      autoShift: { type: "boolean", description: "Cascade dates when the source moves. Default true." },
    },
    required: ["sourceId", "targetId"],
  },
  requiresConfirmation: true,
  summarize: (a) => `Connect ${a.sourceId} → ${a.targetId} (${a.dependencyType ?? "finish_to_start"})`,
  async execute(args) {
    const sb = createSupabaseAdminClient();
    const dt = PM_DEP_TYPES.has(String(args.dependencyType)) ? String(args.dependencyType) : "finish_to_start";
    const { data, error } = await sb.from("project_schedule_dependencies").insert({
      board_id: "default", source_item_id: String(args.sourceId), target_item_id: String(args.targetId),
      dependency_type: dt, lag_days: Number(args.lagDays) || 0, auto_shift: args.autoShift !== false,
    }).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true, id: data.id };
  },
};

const updateProjectItem: AgentTool = {
  name: "update_project_item",
  description: "Update a schedule item by id — status, progress (0-100), dates (YYYY-MM-DD), assignee (email), or priority.",
  parameters: {
    type: "object",
    properties: {
      id: { type: "string" },
      status: { type: "string" }, progress: { type: "number" },
      startDate: { type: "string" }, endDate: { type: "string" },
      assignee: { type: "string" }, priority: { type: "string" },
    },
    required: ["id"],
  },
  requiresConfirmation: true,
  summarize: (a) => `Update project item ${a.id}`,
  async execute(args) {
    const sb = createSupabaseAdminClient();
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (args.status && PM_STATUSES.has(String(args.status))) patch.status = String(args.status);
    if (args.priority && PM_PRIORITIES.has(String(args.priority))) patch.priority = String(args.priority);
    if (typeof args.progress === "number") patch.progress = Math.max(0, Math.min(100, args.progress));
    if (args.startDate) patch.start_date = String(args.startDate).slice(0, 10);
    if (args.endDate) patch.end_date = String(args.endDate).slice(0, 10);
    if (args.assignee !== undefined) patch.assignee = args.assignee ? String(args.assignee) : null;
    const { data, error } = await sb.from("project_schedule_items").update(patch).eq("id", String(args.id)).select("id, title, status").single();
    if (error) throw new Error(error.message);
    return data;
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// CMS authoring (Super-Admin only; Steward can only ever produce DRAFTS)
// ──────────────────────────────────────────────────────────────────────────────

// CMS is Super-Admin-only at every layer. The chat route admits any admin+, so
// these tools re-check the actor's role and refuse for anyone below super_admin.
async function assertSuperAdmin(ctx: AgentContext, message = "CMS authoring is restricted to Super Admins."): Promise<void> {
  const sb = createSupabaseAdminClient();
  const { data } = await sb.from("profiles").select("role").eq("id", ctx.actorId).maybeSingle();
  if ((data?.role as string) !== "super_admin") {
    throw new Error(message);
  }
}

const CMS_BLOCK_SCHEMA_DOC =
  "Each block is an object { type, ...fields }. Types & their fields: " +
  "heading{text}; subheading{text}; paragraph{text}; richtext{text: markdown — **bold**, *italic*, [links](url), \"- \" bullet lists}; " +
  "list{variant('check'|'bullet'|'number'), items:[{title}]}; " +
  "image{url, alt}; button{label, url}; gallery{columns(2-4), items:[{imageUrl, title?}]}; " +
  "hero{eyebrow, text(=headline), subtext, label, url, label2, url2, bgImage?, bgColor?, overlay?, overlayOpacity?, minHeight?}; " +
  "cta{eyebrow, text(=heading), subtext, label, url, label2, url2}; " +
  "cardgrid{columns(2-4), items:[{title, body, imageUrl?, url?}]}; " +
  "statgrid{columns(2-4), items:[{title(=number), body(=label)}]}; " +
  "quote{text, author, role}; scripture{text(=verse), author(=reference), role(=version), subtext(=reflection)}; " +
  "alert{variant('info'|'success'|'warning'|'error'), text(=title), subtext(=message)}; " +
  "resource{text(=title), subtext, label(=button), url(=file), role(=filetype label)}; " +
  "accordion{items:[{q, a}]}; form{text(=title), eyebrow(=description), label(=submit), items:[{title(=label), fieldType('text'|'email'|'phone'|'number'|'date'|'textarea'|'select'|'checkbox'), placeholder?, options?(comma-separated for select), required?}]}; " +
  "video{url, aspect('16/9'|'4/3'|'1/1')}; embed{url, height} or embed{html}; divider{}; spacer{height}; html{html}. " +
  "Any block also accepts optional design fields: align('left'|'center'|'right'), bgColor, textColor, padTop, padBottom, marginTop, marginBottom, maxWidth, " +
  "and typography: fontFamily(a Google font name like 'Poppins'|'Playfair Display'|'Inter'), fontWeight(100-900), fontStyle('italic'), textTransform('uppercase'|'capitalize'), letterSpacing, lineHeight, textShadow, plus border/effects borderWidth, borderColor, radius, boxShadow. " +
  "Build a page as an ordered array — usually a hero, some paragraph/richtext/cardgrid/statgrid/quote/accordion sections, and a closing cta.";

let cmsBlockSeq = 0;
function normalizeCmsBlock(raw: unknown): CmsBlock {
  const b = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  cmsBlockSeq += 1;
  const id = `s${Date.now().toString(36)}${cmsBlockSeq}`;
  const type = String(b.type || "paragraph") as CmsBlock["type"];
  return { ...(b as Partial<CmsBlock>), id, type } as CmsBlock;
}

const listCmsPagesTool: AgentTool = {
  name: "list_cms_pages",
  description: "List CMS pages (id, title, slug, status, type). Super Admin only. Use to find a page id before updating its draft.",
  parameters: { type: "object", properties: {} },
  requiresConfirmation: false,
  async execute(_args, ctx) {
    await assertSuperAdmin(ctx);
    const pages = await listCmsPages();
    return { pages: pages.map((p) => ({ id: p.id, title: p.title, slug: p.slug, status: p.status, type: p.page_type })) };
  },
};

const createCmsDraftPageTool: AgentTool = {
  name: "create_cms_draft_page",
  description:
    "Create a NEW CMS page as a DRAFT (never published — a Super Admin reviews and publishes it later). Provide a title and an ordered array of content blocks. " +
    CMS_BLOCK_SCHEMA_DOC,
  parameters: {
    type: "object",
    properties: {
      title: { type: "string", description: "Page title." },
      slug: { type: "string", description: "Optional URL slug (auto-generated from the title if omitted)." },
      pageType: { type: "string", enum: ["page", "landing", "stewardship", "experience", "resource", "informational"], description: "Default page." },
      description: { type: "string", description: "Optional internal description / SEO summary." },
      blocks: {
        type: "array",
        description: "Ordered content blocks. See the block schema in the tool description.",
        items: { type: "object", properties: { type: { type: "string" } }, required: ["type"] },
      },
    },
    required: ["title", "blocks"],
  },
  requiresConfirmation: true,
  summarize: (a) => `Create DRAFT CMS page “${a.title}” with ${Array.isArray(a.blocks) ? a.blocks.length : 0} block(s)`,
  async execute(args, ctx) {
    await assertSuperAdmin(ctx);
    const blocks = (Array.isArray(args.blocks) ? args.blocks : []).map(normalizeCmsBlock);
    const page = await createCmsDraftPage({
      title: String(args.title), slug: args.slug ? String(args.slug) : undefined,
      page_type: args.pageType ? String(args.pageType) : undefined,
      description: args.description ? String(args.description) : null,
      blocks, actorUserId: ctx.actorId,
    });
    await logUserActivity({ userId: ctx.actorId, action: "ai_agent_create_cms_draft", entityType: "cms_pages", entityId: page.id, metadata: { title: page.title, blocks: blocks.length } }).catch(() => {});
    return { id: page.id, title: page.title, slug: page.slug, status: page.status, blocks: blocks.length, editUrl: `/dashboard/cms/pages/${page.id}` };
  },
};

const updateCmsDraftPageTool: AgentTool = {
  name: "update_cms_draft_page",
  description:
    "Replace the DRAFT block content of an existing CMS page (by id, from list_cms_pages). The page stays a draft. Pass the full new array of blocks. " +
    CMS_BLOCK_SCHEMA_DOC,
  parameters: {
    type: "object",
    properties: {
      pageId: { type: "string", description: "The CMS page id to update." },
      blocks: { type: "array", description: "The complete new ordered block list.", items: { type: "object", properties: { type: { type: "string" } }, required: ["type"] } },
    },
    required: ["pageId", "blocks"],
  },
  requiresConfirmation: true,
  summarize: (a) => `Replace draft content of CMS page ${a.pageId} with ${Array.isArray(a.blocks) ? a.blocks.length : 0} block(s)`,
  async execute(args, ctx) {
    await assertSuperAdmin(ctx);
    const page = await getCmsPage(String(args.pageId));
    if (!page) throw new Error("CMS page not found.");
    const blocks = (Array.isArray(args.blocks) ? args.blocks : []).map(normalizeCmsBlock);
    await saveCmsDraft(page.id, { version: 1, blocks }, ctx.actorId);
    await logUserActivity({ userId: ctx.actorId, action: "ai_agent_update_cms_draft", entityType: "cms_pages", entityId: page.id, metadata: { blocks: blocks.length } }).catch(() => {});
    return { ok: true, pageId: page.id, title: page.title, blocks: blocks.length, editUrl: `/dashboard/cms/pages/${page.id}` };
  },
};

export const AGENT_TOOLS: AgentTool[] = [
  // Reads
  searchParticipants,
  getParticipant,
  getPilotOverview,
  listRecentCalls,
  listSmsConversations,
  listEmailTemplates,
  listBlogPosts,
  getBlogPost,
  listContacts,
  listTags,
  listMediaAssets,
  listBusinessCards,
  getBrandKit,
  listSocialTemplatesTool,
  listSocialAccountsTool,
  listSocialPostsTool,
  getSocialReportTool,
  listSocialInboxTool,
  listProjectItems,
  listProjectTemplates,
  listCmsPagesTool,
  // Dashboard users + previously-blind read sections
  searchUsers,
  listUsers,
  getUser,
  getPilotMetricsTool,
  listBookings,
  listFormSubmissions,
  runSqlQuery,
  // Actions (confirmation-gated)
  sendSmsAction,
  sendEmailAction,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplateAction,
  setEmailAutomation,
  sendTemplateEmailAction,
  runDueJourneyEmails,
  createBlogPost,
  updateBlogPost,
  updateBlogPostStatusAction,
  createContact,
  updateContact,
  createParticipant,
  updateParticipant,
  setParticipantTags,
  createMediaAsset,
  updateMediaAsset,
  createSocialTemplateTool,
  createSocialPostTool,
  publishSocialPostTool,
  setSocialAutomationTool,
  createProjectItem,
  connectProjectItems,
  updateProjectItem,
  createCmsDraftPageTool,
  updateCmsDraftPageTool,
  // Memory (internal, no confirmation)
  rememberTool,
  forgetTool,
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

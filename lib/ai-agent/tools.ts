import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getParticipantDetail, updateParticipantTags } from "@/lib/dashboard/pilot-data";
import { sendSms, getOrCreateConversation } from "@/lib/twilio/sms";
import { sendSmtpEmail } from "@/lib/email/smtp";
import { logUserActivity } from "@/lib/user-management/repository";
import {
  getEmailTemplateData,
  saveEmailTemplate,
  sendTemplateEmail,
  saveEmailTemplateMapping,
  sendDueJourneyEmails,
} from "@/lib/email/templates";
import { EMAIL_EVENT_KEYS } from "@/lib/email/constants";
import { getBlogAdminData, getBlogPostById, saveBlogPost, updateBlogPostStatus, normalizePostTags } from "@/lib/content/blog";
import { upsertParticipant } from "@/lib/pilot/repository";
import { saveMediaAsset, getMediaStudioData } from "@/lib/content/media";

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
  // Actions (confirmation-gated)
  sendSmsAction,
  sendEmailAction,
  createEmailTemplate,
  updateEmailTemplate,
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

import { getStewardMemberStatus, getStewardUsageSummary } from "@/lib/steward/admin-usage";
import { listStewardConfigGroup, setStewardConfig } from "@/lib/steward/config";
import { getPublishedMedia, getPublishedNews } from "@/lib/facilitator/content";
import { findOrCreateConversation, getThread, listConversations, sendMessage, type DmImportance } from "@/lib/direct-messages/data";
import { REPORTS, listInnerCircleResponses, listWaves, runReport, type ReportName } from "@/lib/dashboard/reports";
import { listStripePrices, listStripeProducts } from "@/lib/stripe-admin/products";
import { getJourneyStep, listJourney, updateJourneyEvent } from "@/lib/email/journey-admin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ToolDef } from "./types";

// Dashboard areas that had no connector tools: Steward (admin view), the portal
// library, Direct Messages, Reports, Stripe products/prices, the 7-day email
// journey, connected MCP clients, Inner Circle and Waves. Thin wrappers over the
// same lib code the dashboard pages use.

// ── Steward (admin view — usage and status, never content) ─────────────────

/** Settings groups the Steward page exposes. Others (commerce policy) are not editable here. */
const STEWARD_SETTING_GROUPS = ["agent", "retention"];

const stewardUsage: ToolDef = {
  name: "steward_usage_summary",
  title: "Steward usage",
  description: "Counts only: members using Steward, conversations, replies by model and status, tokens, Blueprints by edition, active access and orders over the last N days. No conversation or Blueprint content.",
  domain: "people",
  inputSchema: { type: "object", properties: { days: { type: "integer", minimum: 1, maximum: 365, description: "Default 30." } } },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { days?: number }) => getStewardUsageSummary(a.days ?? 30),
};

const stewardMember: ToolDef = {
  name: "steward_member_status",
  title: "A member's Steward status",
  description: "One member's Steward status by email: Blueprint edition and dates, active access, conversation count and last active, recent reply count, orders. Never their conversations, titles or Blueprint wording.",
  domain: "people",
  inputSchema: { type: "object", properties: { email: { type: "string" } }, required: ["email"] },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { email: string }) => getStewardMemberStatus(a.email),
};

const stewardSettingsGet: ToolDef = {
  name: "steward_settings_get",
  title: "Steward settings",
  description: "The Steward page's settings: AI provider/model choices and retention periods, with whether each is enabled for production and when it last changed.",
  domain: "ops",
  inputSchema: { type: "object", properties: {} },
  risk: "read",
  minRole: "super_admin",
  run: async () =>
    (await listStewardConfigGroup(STEWARD_SETTING_GROUPS)).map((r) => ({
      key: r.key, label: r.label, description: r.description, group: r.config_group, valueType: r.value_type,
      value: r.value, productionEnabled: r.production_enabled, updatedAt: r.updated_at,
    })),
};

async function stewardSetting(key: string) {
  const row = (await listStewardConfigGroup(STEWARD_SETTING_GROUPS)).find((r) => r.key === key);
  if (!row) throw new Error(`"${key}" isn't a Steward setting that can be changed here (see steward_settings_get).`);
  return row;
}

const stewardSettingsUpdate: ToolDef = {
  name: "steward_settings_update",
  title: "Change a Steward setting",
  description: "Sets one Steward setting (from steward_settings_get). value null means deliberately unset — features that need it then refuse to run. The previous value is kept as a version.",
  domain: "ops",
  inputSchema: {
    type: "object",
    properties: {
      key: { type: "string" },
      value: { description: "New value (number, string, boolean, object) or null to unset." },
      production_enabled: { type: "boolean" },
      note: { type: "string", description: "Why — kept with the version." },
    },
    required: ["key", "value"],
  },
  risk: "high",
  minRole: "super_admin",
  summarize: (a: { key: string; value: unknown }) => `Set Steward setting ${a.key} to ${JSON.stringify(a.value)}`,
  preview: async (a: { key: string; value: unknown; production_enabled?: boolean }) => {
    const row = await stewardSetting(a.key);
    return { key: row.key, label: row.label, current: row.value, next: a.value ?? null, productionEnabled: { current: row.production_enabled, next: a.production_enabled ?? row.production_enabled } };
  },
  run: async (a: { key: string; value: unknown; production_enabled?: boolean; note?: string }, ctx) => {
    await stewardSetting(a.key);
    const row = await setStewardConfig({ key: a.key, value: a.value ?? null, productionEnabled: a.production_enabled, actorId: ctx.actorId, note: a.note ?? `Changed via ${ctx.clientLabel ?? ctx.via}` });
    return { key: row.key, value: row.value, productionEnabled: row.production_enabled, updatedAt: row.updated_at };
  },
};

// ── Portal library (News / Resources / Downloads pages) ─────────────────────

const portalLibrary: ToolDef = {
  name: "portal_library_list",
  title: "News, Resources & Downloads",
  description:
    "What members see on the portal's In The News, Resources and Downloads pages: published blog posts and published audio/video/document media. To add or change items use the blog and media tools (create_blog_post, update_media_asset, …).",
  domain: "media",
  inputSchema: { type: "object", properties: { page: { type: "string", enum: ["news", "resources", "downloads"] } }, required: ["page"] },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { page: "news" | "resources" | "downloads" }) => {
    const media = (t: "audio" | "video" | "document") => getPublishedMedia(t);
    if (a.page === "news") {
      const [posts, audio] = await Promise.all([getPublishedNews(), media("audio")]);
      return { posts, audio };
    }
    const [audio, video, documents] = await Promise.all([media("audio"), media("video"), media("document")]);
    if (a.page === "downloads") return { audio, ebooks: documents, videos: video };
    return { posts: await getPublishedNews(), audio, video, documents };
  },
};

// ── Direct Messages (as the signed-in person) ───────────────────────────────

const dmThreads: ToolDef = {
  name: "dm_threads_list",
  title: "My direct messages",
  description: "Your Direct Message conversations, newest first, with the other person, last message preview and unread count.",
  domain: "people",
  inputSchema: { type: "object", properties: { search: { type: "string" }, from: { type: "string", description: "ISO date" }, to: { type: "string", description: "ISO date" } } },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { search?: string; from?: string; to?: string }, ctx) => listConversations(ctx.actorId, a),
};

const dmThread: ToolDef = {
  name: "dm_thread_get",
  title: "One DM conversation",
  description: "The messages in one of your Direct Message conversations (marks it read, as opening it in the dashboard does).",
  domain: "people",
  inputSchema: { type: "object", properties: { conversation_id: { type: "string" } }, required: ["conversation_id"] },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { conversation_id: string }, ctx) => {
    const thread = await getThread(ctx.actorId, a.conversation_id);
    if (!thread) throw new Error("Conversation not found (or you're not in it).");
    return thread;
  },
};

const dmSend: ToolDef = {
  name: "dm_send",
  title: "Send a direct message",
  description: "Sends one Direct Message from you to one person — into an existing conversation, or starts one (by their profile id or email). They're alerted by email/SMS per their preferences.",
  domain: "people",
  inputSchema: {
    type: "object",
    properties: {
      conversation_id: { type: "string" },
      to_user_id: { type: "string", description: "Instead of conversation_id: their profile id." },
      to_email: { type: "string", description: "Instead of conversation_id: their account email." },
      body: { type: "string", minLength: 1, maxLength: 5000 },
      importance: { type: "string", enum: ["normal", "important", "urgent"] },
    },
    required: ["body"],
  },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { conversation_id?: string; to_user_id?: string; to_email?: string; body: string; importance?: DmImportance }, ctx) => {
    let conversationId = a.conversation_id;
    if (!conversationId) {
      let other = a.to_user_id;
      if (!other && a.to_email) {
        const db = createSupabaseAdminClient();
        const { data } = await db.from("profiles").select("id").ilike("email", a.to_email.trim()).eq("status", "active").maybeSingle();
        if (!data) throw new Error(`No active account for ${a.to_email}.`);
        other = data.id as string;
      }
      if (!other) throw new Error("Give conversation_id, to_user_id or to_email.");
      conversationId = await findOrCreateConversation(ctx.actorId, other);
    }
    const message = await sendMessage(ctx.actorId, conversationId, { body: a.body, importance: a.importance });
    return { conversationId, ...message };
  },
};

// ── Reports ─────────────────────────────────────────────────────────────────

const reportsRun: ToolDef = {
  name: "reports_run",
  title: "Run a report",
  description:
    "One table from the Reports page: funnel, waves, lowest_layers (Check-In lowest areas), permissions, tags, energy_audit, book_waitlist. since/until limit it to records created in that range (not book_waitlist).",
  domain: "ops",
  inputSchema: {
    type: "object",
    properties: { report: { type: "string", enum: [...REPORTS] }, since: { type: "string", description: "ISO date" }, until: { type: "string", description: "ISO date" } },
    required: ["report"],
  },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { report: ReportName; since?: string; until?: string }) => ({ report: a.report, range: { since: a.since ?? null, until: a.until ?? null }, rows: await runReport(a.report, a) }),
};

// ── Stripe (read only; products and prices are managed in Stripe) ──────────

const productsList: ToolDef = {
  name: "products_list",
  title: "Stripe products",
  description: "Products in Stripe (live or test, as configured), with the Steward offers that use each. Read only — create or change products in Stripe.",
  domain: "commerce",
  inputSchema: { type: "object", properties: { active: { type: "boolean" }, limit: { type: "integer", minimum: 1, maximum: 100 } } },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { active?: boolean; limit?: number }) => listStripeProducts(a),
};

const pricesList: ToolDef = {
  name: "prices_list",
  title: "Stripe prices",
  description: "Prices in Stripe (amount, currency, one-time or recurring interval), optionally for one product, with the Steward offers that use each. Read only.",
  domain: "commerce",
  inputSchema: { type: "object", properties: { product: { type: "string", description: "Stripe product id (prod_…)." }, active: { type: "boolean" }, limit: { type: "integer", minimum: 1, maximum: 100 } } },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { product?: string; active?: boolean; limit?: number }) => listStripePrices(a),
};

// ── 7-day email journey ─────────────────────────────────────────────────────

const journeyList: ToolDef = {
  name: "journey_list",
  title: "Email journey steps",
  description: "The 7-day pilot email journey: each step (0–12) with subject, delay, its template and automation on/off, and how many emails are scheduled/sent/skipped/failed.",
  domain: "email",
  inputSchema: { type: "object", properties: {} },
  risk: "read",
  minRole: "super_admin",
  run: async () => listJourney(),
};

const journeyGet: ToolDef = {
  name: "journey_get",
  title: "One journey step",
  description: "One journey step and each participant's email for it (status, scheduled/sent time, error).",
  domain: "email",
  inputSchema: {
    type: "object",
    properties: { step: { type: "integer", minimum: 0, maximum: 12 }, status: { type: "string", enum: ["scheduled", "sent", "skipped", "failed"] }, limit: { type: "integer", minimum: 1, maximum: 500 } },
    required: ["step"],
  },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { step: number; status?: string; limit?: number }) => getJourneyStep(a.step, a),
};

const journeyUpdate: ToolDef = {
  name: "journey_update_step",
  title: "Change one journey email",
  description: "Reschedules, skips, or re-queues (status scheduled) ONE participant's journey email (an id from journey_get). Already-sent emails can't change. To switch a whole step's automation use set_email_automation.",
  domain: "email",
  inputSchema: {
    type: "object",
    properties: { event_id: { type: "string" }, scheduled_at: { type: "string", description: "ISO date-time." }, status: { type: "string", enum: ["scheduled", "skipped"] } },
    required: ["event_id"],
  },
  risk: "write",
  minRole: "super_admin",
  record: { entity: "journey_event", id: (a: { event_id: string }) => a.event_id },
  run: async (a: { event_id: string; scheduled_at?: string; status?: "scheduled" | "skipped" }) => updateJourneyEvent(a.event_id, { scheduledAt: a.scheduled_at, status: a.status }),
};

// ── Connected MCP clients ───────────────────────────────────────────────────

const clientsList: ToolDef = {
  name: "mjg_clients_list",
  title: "Connected AI clients",
  description: "The AI apps registered with this connector (Claude, ChatGPT, Other): name, label, whether switched off, when registered and last used. Switching clients on/off stays in the dashboard (Claude & Agents).",
  domain: "core",
  inputSchema: { type: "object", properties: {} },
  risk: "read",
  minRole: "super_admin",
  run: async () => {
    const db = createSupabaseAdminClient();
    const { data, error } = await db
      .from("mcp_oauth_clients")
      .select("client_id, client_name, client_label, disabled_at, created_at, last_used_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return (data ?? []).map((c) => ({
      clientId: c.client_id, name: c.client_name, label: c.client_label, disabled: Boolean(c.disabled_at), disabledAt: c.disabled_at, created: c.created_at, lastUsed: c.last_used_at,
    }));
  },
};

// ── Inner Circle & Waves (read only) ────────────────────────────────────────

const innerCircle: ToolDef = {
  name: "inner_circle_list",
  title: "Inner Circle responses",
  description: "Inner Circle responses: who, whether willing, and the feedback / story-interview / public-use permissions they gave.",
  domain: "people",
  inputSchema: { type: "object", properties: { limit: { type: "integer", minimum: 1, maximum: 500 } } },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { limit?: number }) => listInnerCircleResponses(a.limit ?? 100),
};

const waves: ToolDef = {
  name: "waves_list",
  title: "Pilot waves",
  description: "Pilot waves (Wave 0–3) with launch dates and counts: participants, opted in, Check-Ins, surveys, Inner Circle accepted.",
  domain: "people",
  inputSchema: { type: "object", properties: {} },
  risk: "read",
  minRole: "super_admin",
  run: async () => listWaves(),
};

export const DASHBOARD_PLUS_TOOLS: ToolDef[] = [
  stewardUsage, stewardMember, stewardSettingsGet, stewardSettingsUpdate,
  portalLibrary,
  dmThreads, dmThread, dmSend,
  reportsRun,
  productsList, pricesList,
  journeyList, journeyGet, journeyUpdate,
  clientsList,
  innerCircle, waves,
];

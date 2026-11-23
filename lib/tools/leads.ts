import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendSmtpEmail } from "@/lib/email/smtp";
import type { ToolContext, ToolDef } from "./types";

// Lead pipeline tools (contacts with type = 'lead'; columns from migration
// 202611230147_contact_leads_pipeline.sql). Built for the Paperclip prospecting
// agents (docs/agents/mjg-agent-loop-skill.md) and for people in Claude/ChatGPT.
// Importing is deduplicated on dedupe_key, so running the same research twice
// fills blanks instead of creating duplicates.

export const LEAD_STAGES = ["new", "researched", "contacted", "replied", "qualified", "converted", "disqualified"] as const;
export const LEAD_SEGMENTS = ["church", "facilitator", "individual", "partner"] as const;

const LEAD_COLUMNS =
  "id, first_name, last_name, email, phone, company, church, job_title, website, city, state, lead_segment, lead_stage, source, tags, research_notes, found_by, consent_basis, last_contacted_at, created_at, updated_at";

const clip = (v: unknown, n = 300): string | null => {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s ? s.slice(0, n) : null;
};

export function websiteDomain(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
    return u.hostname.toLowerCase().replace(/^www\./, "") || null;
  } catch {
    return null;
  }
}

/** lower(email), else website domain + person/org name. Null when there's nothing stable to match on. */
export function leadDedupeKey(row: { email?: string | null; website?: string | null; first_name?: string | null; last_name?: string | null; organization?: string | null }): string | null {
  const email = row.email?.trim().toLowerCase();
  if (email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return `email:${email}`;
  const domain = websiteDomain(row.website);
  const who = [row.first_name, row.last_name].filter(Boolean).join(" ").trim().toLowerCase() || row.organization?.trim().toLowerCase() || "";
  if (domain && who) return `site:${domain}|${who.replace(/\s+/g, " ")}`;
  return null;
}

async function actorLabel(ctx: ToolContext): Promise<string> {
  if (ctx.tokenKind === "agent" && ctx.tokenId) {
    const { data } = await createSupabaseAdminClient().from("mcp_tokens").select("name").eq("id", ctx.tokenId).maybeSingle();
    return `agent:${data?.name ?? ctx.tokenId}`;
  }
  return ctx.actorEmail || ctx.actorId;
}

function stamp(note: string, by: string) {
  return `[${new Date().toISOString().slice(0, 10)} · ${by}] ${note.trim()}`;
}

// ── leads_list ───────────────────────────────────────────────────────────────

const leadsList: ToolDef = {
  name: "leads_list",
  title: "List leads",
  description:
    "Lists leads in the prospecting pipeline (contacts of type 'lead'), newest first. Filter by segment (church, facilitator, individual, partner), stage (new, researched, contacted, replied, qualified, converted, disqualified), source, state, or a search over name, email, organization and website.",
  domain: "crm",
  risk: "read",
  minRole: "super_admin",
  inputSchema: {
    type: "object",
    properties: {
      segment: { type: "string", enum: [...LEAD_SEGMENTS] },
      stage: { type: "string", enum: [...LEAD_STAGES] },
      source: { type: "string" },
      state: { type: "string", description: "US state, e.g. AZ." },
      search: { type: "string" },
      limit: { type: "number", description: "Default 25, max 100." },
    },
  },
  run: async (a: { segment?: string; stage?: string; source?: string; state?: string; search?: string; limit?: number }) => {
    let q = createSupabaseAdminClient()
      .from("contacts")
      .select(LEAD_COLUMNS)
      .eq("type", "lead")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(Number(a.limit) || 25, 1), 100));
    if (a.segment) q = q.eq("lead_segment", a.segment);
    if (a.stage) q = q.eq("lead_stage", a.stage);
    if (a.source) q = q.eq("source", a.source);
    if (a.state) q = q.ilike("state", a.state.trim());
    const s = a.search?.trim().replace(/[,()]/g, " ");
    if (s) {
      const like = `%${s}%`;
      q = q.or(`first_name.ilike.${like},last_name.ilike.${like},email.ilike.${like},company.ilike.${like},church.ilike.${like},website.ilike.${like}`);
    }
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return { count: data?.length ?? 0, leads: data ?? [] };
  },
};

// ── leads_import ─────────────────────────────────────────────────────────────

type LeadInput = {
  first_name?: string; last_name?: string; email?: string; phone?: string;
  organization?: string; church?: string; job_title?: string; website?: string;
  city?: string; state?: string; segment?: string; source?: string;
  notes?: string; consent_basis?: string; tags?: string[];
};

const leadsImport: ToolDef = {
  name: "leads_import",
  title: "Import leads",
  description:
    "Adds up to 50 researched leads to the pipeline. Duplicates (same email, or same website + name) are not created again: blank fields on the existing lead are filled and the new notes appended. Every lead needs a segment and a consent_basis saying where the details were published (e.g. 'Published on church staff page https://…'). Only record contact details the person or organization published themselves; never details from LinkedIn or Facebook profiles, or from Google Places results. New leads are not opted in to SMS.",
  domain: "crm",
  risk: "write",
  minRole: "super_admin",
  inputSchema: {
    type: "object",
    properties: {
      leads: {
        type: "array",
        minItems: 1,
        maxItems: 50,
        items: {
          type: "object",
          properties: {
            first_name: { type: "string" },
            last_name: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            organization: { type: "string", description: "Church, ministry, company, podcast or event name." },
            church: { type: "string", description: "Church name, when the person is on a church staff." },
            job_title: { type: "string" },
            website: { type: "string" },
            city: { type: "string" },
            state: { type: "string" },
            segment: { type: "string", enum: [...LEAD_SEGMENTS] },
            source: { type: "string", description: "How it was found, e.g. 'agent:church-prospector', 'brave-search', 'conference-list'." },
            notes: { type: "string", description: "Why this is a good lead for MJG; what you found." },
            consent_basis: { type: "string", description: "Where the contact details were published." },
            tags: { type: "array", items: { type: "string" } },
          },
          required: ["segment", "consent_basis"],
        },
      },
    },
    required: ["leads"],
  },
  run: async (a: { leads: LeadInput[] }, ctx) => {
    const rows = (a.leads ?? []).slice(0, 50);
    const by = await actorLabel(ctx);
    const supabase = createSupabaseAdminClient();
    const created: string[] = [];
    const updated: string[] = [];
    const skipped: Array<{ index: number; reason: string }> = [];

    for (const [index, raw] of rows.entries()) {
      const segment = LEAD_SEGMENTS.includes(raw.segment as any) ? raw.segment! : null;
      const consent = clip(raw.consent_basis, 500);
      if (!segment) { skipped.push({ index, reason: "segment must be church, facilitator, individual or partner" }); continue; }
      if (!consent) { skipped.push({ index, reason: "consent_basis is required" }); continue; }
      const email = clip(raw.email, 254)?.toLowerCase() ?? null;
      if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { skipped.push({ index, reason: "invalid email" }); continue; }
      const organization = clip(raw.organization, 200);
      const row = {
        first_name: clip(raw.first_name, 100),
        last_name: clip(raw.last_name, 100),
        email,
        phone: clip(raw.phone, 40),
        company: organization,
        church: clip(raw.church, 200) ?? (segment === "church" ? organization : null),
        job_title: clip(raw.job_title, 120),
        website: clip(raw.website, 300),
        city: clip(raw.city, 100),
        state: clip(raw.state, 40),
      };
      const key = leadDedupeKey({ ...row, organization });
      if (!key && !row.first_name && !organization) { skipped.push({ index, reason: "needs a name or organization" }); continue; }
      const note = clip(raw.notes, 2000);
      const tags = Array.isArray(raw.tags) ? raw.tags.map((t) => clip(t, 60)).filter((t): t is string => Boolean(t)).slice(0, 10) : [];

      const existing = key
        ? (await supabase.from("contacts").select("*").eq("dedupe_key", key).is("deleted_at", null).maybeSingle()).data
        : null;

      if (existing) {
        const patch: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(row)) if (v && !existing[k]) patch[k] = v;
        if (!existing.lead_segment) patch.lead_segment = segment;
        if (note) patch.research_notes = [existing.research_notes, stamp(note, by)].filter(Boolean).join("\n");
        const mergedTags = [...new Set([...(existing.tags ?? []), ...tags])];
        if (mergedTags.length !== (existing.tags ?? []).length) patch.tags = mergedTags;
        if (Object.keys(patch).length) {
          const { error } = await supabase.from("contacts").update(patch).eq("id", existing.id);
          if (error) { skipped.push({ index, reason: error.message }); continue; }
          updated.push(existing.id);
        } else {
          skipped.push({ index, reason: "already in the pipeline, nothing new" });
        }
        continue;
      }

      const { data, error } = await supabase
        .from("contacts")
        .insert({
          ...row,
          type: "lead",
          status: "active",
          lead_segment: segment,
          lead_stage: "new",
          source: clip(raw.source, 120) ?? by,
          tags,
          research_notes: note ? stamp(note, by) : null,
          found_by: by,
          consent_basis: consent,
          dedupe_key: key,
          sms_opt_in: false,
          created_by: ctx.actorId,
        })
        .select("id")
        .single();
      if (error) { skipped.push({ index, reason: /duplicate key/i.test(error.message) ? "already in the pipeline" : error.message }); continue; }
      created.push(data.id);
    }
    return { created: created.length, updated: updated.length, skipped, created_ids: created, updated_ids: updated };
  },
};

// ── lead_update_stage ────────────────────────────────────────────────────────

const leadUpdateStage: ToolDef = {
  name: "lead_update_stage",
  title: "Move a lead to a stage",
  description:
    "Moves a lead to a pipeline stage (new, researched, contacted, replied, qualified, converted, disqualified) and appends a dated note. Use 'contacted' only after a message was actually sent (by a person, or through an approved send).",
  domain: "crm",
  risk: "write",
  minRole: "super_admin",
  record: { entity: "contact", id: (a: { id: string }) => a.id },
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string", description: "Lead (contact) id from leads_list." },
      stage: { type: "string", enum: [...LEAD_STAGES] },
      note: { type: "string" },
    },
    required: ["id", "stage"],
  },
  run: async (a: { id: string; stage: string; note?: string }, ctx) => {
    if (!LEAD_STAGES.includes(a.stage as any)) throw new Error("Unknown stage.");
    const supabase = createSupabaseAdminClient();
    const { data: lead, error: readErr } = await supabase
      .from("contacts").select("id, type, research_notes").eq("id", a.id).is("deleted_at", null).maybeSingle();
    if (readErr) throw new Error(readErr.message);
    if (!lead || lead.type !== "lead") throw new Error("Lead not found.");
    const by = await actorLabel(ctx);
    const patch: Record<string, unknown> = {
      lead_stage: a.stage,
      research_notes: [lead.research_notes, stamp(`Stage → ${a.stage}${a.note?.trim() ? `: ${a.note.trim().slice(0, 1000)}` : ""}`, by)].filter(Boolean).join("\n"),
    };
    if (a.stage === "contacted") patch.last_contacted_at = new Date().toISOString();
    if (a.stage === "converted") patch.status = "converted";
    const { error } = await supabase.from("contacts").update(patch).eq("id", a.id);
    if (error) throw new Error(error.message);
    return { ok: true, id: a.id, stage: a.stage };
  },
};

// ── business_card_leads_list ─────────────────────────────────────────────────

const businessCardLeadsList: ToolDef = {
  name: "business_card_leads_list",
  title: "List business card leads",
  description: "Lists people who shared their details from a digital business card (name, email, phone, company, message, status), newest first.",
  domain: "crm",
  risk: "read",
  minRole: "super_admin",
  inputSchema: {
    type: "object",
    properties: {
      status: { type: "string", enum: ["new", "contacted", "qualified", "archived"] },
      limit: { type: "number", description: "Default 25, max 100." },
    },
  },
  run: async (a: { status?: string; limit?: number }) => {
    let q = createSupabaseAdminClient()
      .from("business_card_leads")
      .select("id, name, email, phone, company, message, preferred_contact, source, status, created_at, card:business_cards(slug, display_name)")
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(Number(a.limit) || 25, 1), 100));
    if (a.status) q = q.eq("status", a.status);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return { count: data?.length ?? 0, leads: data ?? [] };
  },
};

// ── lead_outreach_email ─────────────────────────────────────────────────────
// The only way agents email a lead. High risk, so an agent's request always waits
// for a person's approval (lib/mcp/confirm.ts), and it counts against the daily
// email cap (lib/mcp/caps.ts). CAN-SPAM: honest sender, an unsubscribe link and the
// postal address in every message; opted-out addresses are refused.

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "https://michaeljgauthier.com").replace(/\/$/, "");

async function outreachCheck(leadId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: lead, error } = await supabase
    .from("contacts")
    .select("id, type, first_name, last_name, email, email_opt_in, lead_stage, research_notes, company, church")
    .eq("id", leadId).is("deleted_at", null).maybeSingle();
  if (error) throw new Error(error.message);
  if (!lead || lead.type !== "lead") throw new Error("Lead not found.");
  const email = lead.email?.trim().toLowerCase();
  if (!email) throw new Error("This lead has no email address.");
  if (lead.email_opt_in === false) throw new Error("This lead has unsubscribed from email.");
  const [{ data: profile }, { data: participant }, { data: settings }] = await Promise.all([
    supabase.from("profiles").select("email_opt_in").ilike("email", email).maybeSingle(),
    supabase.from("participants").select("email_opt_in").ilike("email", email).maybeSingle(),
    supabase.from("facilitator_welcome_settings").select("mailing_address").eq("id", 1).maybeSingle(),
  ]);
  if (profile?.email_opt_in === false || participant?.email_opt_in === false) throw new Error("This address has unsubscribed from MJG email.");
  const address = (settings?.mailing_address ?? "").trim();
  if (!address) throw new Error("Set the postal address first (Emails → Facilitator Welcome Series settings): every outreach email must include it.");
  return { lead, email, address };
}

export function outreachFooter(address: string) {
  const unsubscribe = `${siteUrl()}/email/opt-out`;
  return {
    html: `<p style="margin:20px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:#8a8275;">You're receiving this one-time note because your contact details are published for ministry or partnership enquiries. Not interested? <a href="${escapeHtml(unsubscribe)}" style="color:#8a8275;">Unsubscribe</a> and we won't write again.<br />${escapeHtml(address)}</p>`,
    text: `\n\n--\nYou're receiving this one-time note because your contact details are published for ministry or partnership enquiries. Unsubscribe: ${unsubscribe}\n${address}`,
  };
}

function bodyHtml(text: string) {
  const paragraphs = escapeHtml(text)
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;line-height:1.6">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1a1a1a">${paragraphs}</div>`;
}

const leadOutreachEmail: ToolDef = {
  name: "lead_outreach_email",
  title: "Email a lead (needs approval)",
  description:
    "Sends one personal outreach email to a lead in the pipeline. Always shown to a person first: from an agent it waits in 'Waiting for your approval'. MJG adds the unsubscribe link and postal address. Refused if the lead has unsubscribed. After it sends, the lead moves to 'contacted'. Write a short, personal plain-text note (no links except michaeljgauthier.com), signed by Michael's team.",
  domain: "crm",
  risk: "high",
  minRole: "super_admin",
  record: { entity: "contact", id: (a: { lead_id: string }) => a.lead_id },
  inputSchema: {
    type: "object",
    properties: {
      lead_id: { type: "string", description: "Lead (contact) id from leads_list." },
      subject: { type: "string", maxLength: 150 },
      body: { type: "string", description: "Plain text; blank lines between paragraphs.", maxLength: 4000 },
    },
    required: ["lead_id", "subject", "body"],
  },
  summarize: (a: { subject: string }) => `Send one outreach email to a lead: “${a.subject}”`,
  preview: async (a: { lead_id: string; subject: string; body: string }) => {
    const { lead, email } = await outreachCheck(a.lead_id);
    return {
      to: `${[lead.first_name, lead.last_name].filter(Boolean).join(" ") || "Lead"} <${email}>`,
      organization: lead.church ?? lead.company ?? null,
      stage: lead.lead_stage,
      subject: a.subject,
      body: a.body,
      footer: "Unsubscribe link + postal address added automatically",
    };
  },
  run: async (a: { lead_id: string; subject: string; body: string }, ctx) => {
    const subject = String(a.subject ?? "").trim().slice(0, 150);
    const body = String(a.body ?? "").trim().slice(0, 4000);
    if (!subject || !body) throw new Error("A subject and body are required.");
    const { lead, email, address } = await outreachCheck(a.lead_id);
    const footer = outreachFooter(address);
    const result = await sendSmtpEmail({ to: email, subject, html: bodyHtml(body) + footer.html, text: body + footer.text });
    if (result.skipped) throw new Error(result.reason ?? "Email provider not configured.");
    if (!result.ok) throw new Error("The email didn't send.");
    const by = await actorLabel(ctx);
    const patch: Record<string, unknown> = {
      last_contacted_at: new Date().toISOString(),
      research_notes: [lead.research_notes, stamp(`Outreach email sent: “${subject}”`, by)].filter(Boolean).join("\n"),
    };
    if (["new", "researched", null].includes(lead.lead_stage)) patch.lead_stage = "contacted";
    await createSupabaseAdminClient().from("contacts").update(patch).eq("id", lead.id);
    return { ok: true, to: email, messageId: result.messageId ?? null, stage: patch.lead_stage ?? lead.lead_stage };
  },
};

export const LEAD_TOOLS: ToolDef[] = [leadsList, leadsImport, leadUpdateStage, businessCardLeadsList, leadOutreachEmail];

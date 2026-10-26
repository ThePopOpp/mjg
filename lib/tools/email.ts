import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { previewEmailAudienceSend, sendEmailToAudience } from "@/lib/email/audience";
import { getEmailInboxData, syncInboxEmails } from "@/lib/email/inbox";
import type { ToolDef } from "./types";

// Email beyond Shepherd's tools (templates, one-off sends, automations and the
// journey batch already exist): sending a template to an audience, and the inbox.

const AUDIENCE = { type: "string", enum: ["profiles", "participants"], description: "profiles = active dashboard users; participants = program participants." };

const sendToAudience: ToolDef = {
  name: "email_send_to_audience",
  title: "Email a template to an audience",
  description:
    "Sends an email template to an audience, leaving out anyone who opted out of email. Send a test to yourself first with send_template_email. Preview shows how many will receive it.",
  domain: "email",
  inputSchema: {
    type: "object",
    properties: {
      template_id: { type: "string", description: "From list_email_templates." },
      audience: AUDIENCE,
      limit: { type: "integer", minimum: 1, maximum: 2000, description: "Maximum recipients (default 500)." },
    },
    required: ["template_id", "audience"],
  },
  risk: "high",
  minRole: "super_admin",
  summarize: (a: { audience: string }) => `Email this template to ${a.audience === "participants" ? "participants" : "all active users"} (opted-out excluded)`,
  preview: async (a: { template_id: string; audience: "profiles" | "participants"; limit?: number }) =>
    previewEmailAudienceSend({ templateId: a.template_id, audience: a.audience, limit: a.limit ?? 500 }),
  run: async (a: { template_id: string; audience: "profiles" | "participants"; limit?: number }, ctx) =>
    sendEmailToAudience({ templateId: a.template_id, audience: a.audience, limit: a.limit ?? 500, actorId: ctx.actorId }),
};

const inbox: ToolDef = {
  name: "email_inbox",
  title: "Email inbox",
  description: "Recent messages in the MJG inbox (newest first): sender, subject, a snippet and who it's linked to. Use email_read_message for the full text.",
  domain: "email",
  inputSchema: { type: "object", properties: { limit: { type: "integer", minimum: 1, maximum: 100 } } },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { limit?: number }) => {
    const { messages, error } = await getEmailInboxData();
    if (error) throw new Error(error);
    return (messages as Array<Record<string, any>>).slice(0, a.limit ?? 30).map((m) => ({
      id: m.id,
      receivedAt: m.received_at,
      from: m.from_email ?? m.from_address ?? m.from,
      fromName: m.from_name ?? null,
      subject: m.subject,
      snippet: String(m.text_body ?? m.body_text ?? m.snippet ?? "").replace(/\s+/g, " ").slice(0, 300),
      participant: m.participants ? `${m.participants.first_name ?? ""} ${m.participants.last_name ?? ""}`.trim() : null,
      profile: m.profile?.full_name ?? null,
    }));
  },
};

const readMessage: ToolDef = {
  name: "email_read_message",
  title: "Read an email",
  description: "The full content of one inbox message (id from email_inbox).",
  domain: "email",
  inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { id: string }) => {
    const { data, error } = await createSupabaseAdminClient().from("email_messages").select("*").eq("id", a.id).maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("Message not found.");
    const { html_body, ...rest } = data as Record<string, unknown>;
    return { ...rest, hasHtml: Boolean(html_body) };
  },
};

const syncInbox: ToolDef = {
  name: "email_sync_inbox",
  title: "Check for new email",
  description: "Fetches new messages from the mailbox into the MJG inbox.",
  domain: "email",
  inputSchema: { type: "object", properties: { limit: { type: "integer", minimum: 1, maximum: 100 } } },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { limit?: number }) => syncInboxEmails({ limit: a.limit ?? 25 }),
};

export const EMAIL_TOOLS: ToolDef[] = [sendToAudience, inbox, readMessage, syncInbox];

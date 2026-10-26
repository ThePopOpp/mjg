import { checkSmsConsent, getSmsThread, listSmsTemplates, renderOutboundSms, resolveBroadcastRecipients, saveSmsTemplate, sendOneSms, sendSmsBroadcast } from "@/lib/sms/outbound";
import type { ToolDef } from "./types";

// SMS from Claude, through the same code as the dashboard (lib/sms/outbound.ts)
// but with STRICT consent: a number must have a recorded opt-in or have texted
// us first, and never one that opted out. (Shepherd's own send_sms is not
// exposed through the connector; these replace it.) list_sms_conversations
// comes from Shepherd's tools.

const consent: ToolDef = {
  name: "sms_check_consent",
  title: "Can we text this number?",
  description: "Checks whether a phone number may receive texts (opted in, or texted us first; never if opted out).",
  domain: "sms",
  inputSchema: { type: "object", properties: { phone: { type: "string" } }, required: ["phone"] },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { phone: string }) => checkSmsConsent(a.phone, { strict: true }),
};

const send: ToolDef = {
  name: "sms_send",
  title: "Send a text",
  description:
    "Texts one person — plain text or an SMS template (merge fields filled from their record). Refused unless the number has a recorded opt-in or has texted us first. Keep it conversational; use sms_broadcast for announcements.",
  domain: "sms",
  inputSchema: {
    type: "object",
    properties: {
      to: { type: "string", description: "Phone number, e.g. +14805551234." },
      body: { type: "string", maxLength: 1600 },
      template_id: { type: "string", description: "Instead of body: an SMS template id (sms_templates)." },
      recipient_type: { type: "string", enum: ["participant", "profile", "manual"], description: "For template merge fields." },
      recipient_id: { type: "string" },
    },
    required: ["to"],
  },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { to: string; body?: string; template_id?: string; recipient_type?: "participant" | "profile" | "manual"; recipient_id?: string }, ctx) =>
    sendOneSms({ to: a.to, body: a.body, templateId: a.template_id, recipientType: a.recipient_type, recipientId: a.recipient_id, actorId: ctx.actorId, strict: true }),
};

const broadcast: ToolDef = {
  name: "sms_broadcast",
  title: "Text many people",
  description:
    "Sends one message (or template) to many people: all opted-in participants or users, chosen ids, or a list of numbers (each must have consent). Preview shows exactly who receives it and who is skipped.",
  domain: "sms",
  inputSchema: {
    type: "object",
    properties: {
      audience: { type: "string", enum: ["participants", "profiles", "manual"] },
      recipient_ids: { type: "array", items: { type: "string" }, description: "Limit to these participant/profile ids." },
      phone_numbers: { type: "array", items: { type: "string" }, description: "For audience 'manual'." },
      body: { type: "string", maxLength: 1600 },
      template_id: { type: "string" },
    },
    required: ["audience"],
  },
  risk: "high",
  minRole: "super_admin",
  summarize: (a: { audience: string }) => `Text ${a.audience === "manual" ? "the listed numbers" : `opted-in ${a.audience}`}`,
  preview: async (a: { audience: "participants" | "profiles" | "manual"; recipient_ids?: string[]; phone_numbers?: string[]; body?: string; template_id?: string }) => {
    const { recipients, skipped } = await resolveBroadcastRecipients({ audience: a.audience, recipientIds: a.recipient_ids, phoneNumbers: a.phone_numbers, strict: true });
    if (!recipients.length) throw new Error("Nobody in that selection can be texted.");
    const sample = await renderOutboundSms({ body: a.body, templateId: a.template_id, recipientType: recipients[0].type, recipientId: recipients[0].id });
    return {
      willReceive: recipients.length,
      skipped,
      exampleMessage: sample,
      recipients: recipients.slice(0, 25).map((r) => `${r.name || "—"} (${r.phone})`),
    };
  },
  run: async (a: { audience: "participants" | "profiles" | "manual"; recipient_ids?: string[]; phone_numbers?: string[]; body?: string; template_id?: string }, ctx) =>
    sendSmsBroadcast({ audience: a.audience, recipientIds: a.recipient_ids, phoneNumbers: a.phone_numbers, body: a.body, templateId: a.template_id, actorId: ctx.actorId, strict: true }),
};

const thread: ToolDef = {
  name: "sms_get_thread",
  title: "Read a text conversation",
  description: "All messages in one SMS conversation, oldest first (id from list_sms_conversations).",
  domain: "sms",
  inputSchema: { type: "object", properties: { conversation_id: { type: "string" }, mark_read: { type: "boolean" } }, required: ["conversation_id"] },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { conversation_id: string; mark_read?: boolean }) => getSmsThread(a.conversation_id, { markRead: a.mark_read }),
};

const templates: ToolDef = {
  name: "sms_list_templates",
  title: "SMS templates",
  description: "SMS templates with their merge fields ({{first_name}} …).",
  domain: "sms",
  inputSchema: { type: "object", properties: { status: { type: "string", enum: ["active", "draft", "all"] } } },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { status?: "active" | "draft" | "all" }) => listSmsTemplates(a.status ?? "active"),
};

const saveTemplate: ToolDef = {
  name: "sms_save_template",
  title: "Create or edit an SMS template",
  description: "Creates a template, or updates one when id is given. Merge fields use {{first_name}} style. Status draft or active.",
  domain: "sms",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      body: { type: "string", maxLength: 1600 },
      category: { type: "string" },
      status: { type: "string", enum: ["draft", "active"] },
    },
    required: ["name", "body"],
  },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { id?: string; name: string; body: string; category?: string; status?: string }, ctx) =>
    saveSmsTemplate({ id: a.id, name: a.name, body: a.body, category: a.category, status: a.status, actorId: ctx.actorId }),
};

export const SMS_TOOLS: ToolDef[] = [consent, send, broadcast, thread, templates, saveTemplate];

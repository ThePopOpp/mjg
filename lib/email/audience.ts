import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRecipientsForAudience, sendTemplateEmail } from "@/lib/email/templates";

// Sending an email template to an audience (all active users, or participants),
// leaving out anyone who has opted out of email (email_opt_in = false).
// Used by the Claude connector; the dashboard's Deploy uses getRecipientsForAudience
// directly.

type Audience = "profiles" | "participants";

async function optedOutEmails(audience: Audience): Promise<Set<string>> {
  const { data } = await createSupabaseAdminClient()
    .from(audience)
    .select("email")
    .eq("email_opt_in", false)
    .not("email", "is", null);
  return new Set((data ?? []).map((r) => String(r.email).trim().toLowerCase()));
}

export async function resolveEmailAudience(audience: Audience, limit: number) {
  const [all, optedOut] = await Promise.all([getRecipientsForAudience(audience, limit), optedOutEmails(audience)]);
  const recipients = all.filter((r) => r.email && !optedOut.has(String(r.email).trim().toLowerCase()));
  return { recipients, excludedOptedOut: all.length - recipients.length };
}

export async function previewEmailAudienceSend(input: { templateId: string; audience: Audience; limit: number }) {
  const { data: template } = await createSupabaseAdminClient().from("email_templates").select("id, name, subject, status").eq("id", input.templateId).maybeSingle();
  if (!template) throw new Error("Email template not found.");
  if (template.status === "archived") throw new Error("Archived templates cannot be sent.");
  const { recipients, excludedOptedOut } = await resolveEmailAudience(input.audience, input.limit);
  if (!recipients.length) throw new Error("Nobody in that audience can receive this email.");
  return {
    template: { name: template.name, subject: template.subject },
    audience: input.audience,
    willReceive: recipients.length,
    excludedOptedOut,
    sample: recipients.slice(0, 10).map((r) => r.email),
  };
}

export async function sendEmailToAudience(input: { templateId: string; audience: Audience; limit: number; actorId: string }) {
  const { recipients, excludedOptedOut } = await resolveEmailAudience(input.audience, input.limit);
  const results: { email: string; status: "sent" | "skipped" | "failed"; error?: string }[] = [];
  for (const recipient of recipients) {
    try {
      const result = await sendTemplateEmail({ templateId: input.templateId, recipient, actorUserId: input.actorId });
      results.push({ email: recipient.email, status: result.skipped ? "skipped" : "sent" });
    } catch (err) {
      results.push({ email: recipient.email, status: "failed", error: err instanceof Error ? err.message : "Send failed." });
    }
  }
  return {
    sent: results.filter((r) => r.status === "sent").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    failed: results.filter((r) => r.status === "failed").length,
    excludedOptedOut,
    failures: results.filter((r) => r.status === "failed").slice(0, 20),
  };
}

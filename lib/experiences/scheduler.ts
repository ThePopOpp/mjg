import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendTemplateEmail } from "@/lib/email/templates";

/**
 * Release due Experience emails. Selects scheduled send events whose time has come,
 * renders + sends each via the shared template engine (which also writes email_send_logs),
 * and advances the event's status. Modeled on sendDueJourneyEmails().
 *
 * Invoked by the /api/admin/experiences/send-due endpoint, which a recurring job hits.
 */
export async function sendDueExperienceEmails(input: { actorUserId?: string | null; limit?: number } = {}) {
  const supabase = createSupabaseAdminClient();
  const limit = Math.min(Math.max(Number(input.limit ?? 25), 1), 100);
  const now = new Date().toISOString();

  const { data: events, error } = await supabase
    .from("experience_send_events")
    .select(
      "*, experience_attendees(id,email,name,participant_id,opted_out), experiences(id,name,status)",
    )
    .eq("status", "scheduled")
    .lte("scheduled_at", now)
    .order("scheduled_at", { ascending: true })
    .limit(limit);
  if (error) throw error;

  const results: { id: string; status: string; reason?: string; messageId?: string | null; error?: string }[] = [];

  for (const event of events ?? []) {
    const attendee = (event as any).experience_attendees;
    const experience = (event as any).experiences;

    // Guard rails: skip when the attendee opted out, the experience is not live,
    // or the step has no template configured.
    const cancelled = experience?.status === "cancelled" || experience?.status === "completed";
    if (!attendee?.email || attendee.opted_out || cancelled) {
      await markEvent(supabase, event.id, "skipped", now, "Attendee opted out, missing email, or experience not active.");
      results.push({ id: event.id, status: "skipped", reason: "Opted out / inactive." });
      continue;
    }
    if (!event.template_id) {
      await markEvent(supabase, event.id, "skipped", now, `No email template configured for step ${event.step_number}.`);
      results.push({ id: event.id, status: "skipped", reason: `No template for step ${event.step_number}.` });
      continue;
    }

    try {
      const { firstName, lastName } = splitName(attendee.name);
      const sendResult = await sendTemplateEmail({
        templateId: event.template_id,
        actorUserId: input.actorUserId ?? undefined,
        recipient: {
          email: attendee.email,
          first_name: firstName,
          last_name: lastName,
          full_name: (attendee.name ?? "").trim() || undefined,
          participant_id: attendee.participant_id ?? null,
          merge_data: {
            experience_name: experience?.name ?? "",
            session_number: String(event.step_number),
          },
        },
      });

      await supabase
        .from("experience_send_events")
        .update({
          status: sendResult.skipped ? "skipped" : "sent",
          provider: "smtp",
          provider_message_id: sendResult.messageId ?? null,
          error_message: sendResult.reason ?? null,
          sent_at: sendResult.skipped ? null : new Date().toISOString(),
          last_attempt_at: now,
        })
        .eq("id", event.id);

      results.push({ id: event.id, status: sendResult.skipped ? "skipped" : "sent", messageId: sendResult.messageId ?? null });
    } catch (sendError) {
      const message = sendError instanceof Error ? sendError.message : "Experience email failed.";
      await markEvent(supabase, event.id, "failed", now, message);
      results.push({ id: event.id, status: "failed", error: message });
    }
  }

  return {
    processed: results.length,
    sent: results.filter((r) => r.status === "sent").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    failed: results.filter((r) => r.status === "failed").length,
    results,
  };
}

async function markEvent(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  id: string,
  status: "skipped" | "failed",
  now: string,
  error_message: string,
) {
  await supabase.from("experience_send_events").update({ status, error_message, last_attempt_at: now }).eq("id", id);
}

function splitName(name?: string | null): { firstName: string; lastName: string } {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const parts = trimmed.split(/\s+/);
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

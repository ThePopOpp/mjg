import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendTemplateEmail, experienceMonitorBcc } from "@/lib/email/templates";

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
    // Paused experiences are HELD, not skipped: leave the event "scheduled" so it fires
    // on a later run once the experience is resumed (past-due events go out then).
    if (event.experiences?.status === "paused") {
      results.push({ id: event.id, status: "held", reason: "Experience paused." });
      continue;
    }
    results.push(await processSendEvent(supabase, event, input.actorUserId ?? null, now));
  }

  return {
    processed: results.length,
    sent: results.filter((r) => r.status === "sent").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    failed: results.filter((r) => r.status === "failed").length,
    results,
  };
}

/**
 * Send one experience email now (out of schedule). Used by the per-email "Send now"
 * control on the experience detail page. Reuses the exact render/send/guard logic the
 * recurring scheduler uses. Only acts on events still in "scheduled" status.
 */
export async function sendExperienceEventNow(eventId: string, actorUserId?: string | null) {
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const { data: event, error } = await supabase
    .from("experience_send_events")
    .select("*, experience_attendees(id,email,name,participant_id,opted_out), experiences(id,name,status)")
    .eq("id", eventId)
    .maybeSingle();
  if (error) throw error;
  if (!event) throw new Error("Scheduled email not found.");
  if (event.status === "sent") throw new Error("This email was already sent.");
  return processSendEvent(supabase, event, actorUserId ?? null, now);
}

/** Render + send a single send event and advance its status. Shared by the scheduler and Send-now. */
async function processSendEvent(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  event: any,
  actorUserId: string | null,
  now: string,
): Promise<{ id: string; status: string; reason?: string; messageId?: string | null; error?: string }> {
  const attendee = event.experience_attendees;
  const experience = event.experiences;

  // Guard rails: skip when the attendee opted out, the experience is not live,
  // or the step has no template configured.
  const cancelled = experience?.status === "cancelled" || experience?.status === "completed";
  if (!attendee?.email || attendee.opted_out || cancelled) {
    await markEvent(supabase, event.id, "skipped", now, "Attendee opted out, missing email, or experience not active.");
    return { id: event.id, status: "skipped", reason: "Opted out / inactive." };
  }
  if (!event.template_id) {
    await markEvent(supabase, event.id, "skipped", now, `No email template configured for step ${event.step_number}.`);
    return { id: event.id, status: "skipped", reason: `No template for step ${event.step_number}.` };
  }

  try {
    const { firstName, lastName } = splitName(attendee.name);
    const sendResult = await sendTemplateEmail({
      templateId: event.template_id,
      actorUserId: actorUserId ?? undefined,
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
      bcc: experienceMonitorBcc(),
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

    return { id: event.id, status: sendResult.skipped ? "skipped" : "sent", messageId: sendResult.messageId ?? null };
  } catch (sendError) {
    const message = sendError instanceof Error ? sendError.message : "Experience email failed.";
    await markEvent(supabase, event.id, "failed", now, message);
    return { id: event.id, status: "failed", error: message };
  }
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

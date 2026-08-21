import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { upsertParticipant } from "@/lib/pilot/repository";
import { createUserInvitation } from "@/lib/user-management/repository";
import { computeStepDate } from "./schedule";
import { sendExperienceEventNow } from "./scheduler";
import { ROLES } from "@/lib/rbac/roles";
import type { OffsetUnit } from "./types";

function splitName(name?: string | null): { firstName: string; lastName: string } {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const parts = trimmed.split(/\s+/);
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export type BacklogEmail = { stepNumber: number; templateName: string; scheduledAt: string };

/** The emails a NEW participant would have missed: steps whose send time already passed
 *  (and that actually have a template). Shown in the Add-participant wizard so the admin can
 *  choose to send them. */
export async function getExperienceBacklog(experienceId: string): Promise<BacklogEmail[]> {
  const supabase = createSupabaseAdminClient();
  const { data: exp } = await supabase.from("experiences").select("start_date,start_time").eq("id", experienceId).maybeSingle();
  if (!exp) return [];
  const { data: steps } = await supabase
    .from("experience_steps")
    .select("step_number,offset_value,offset_unit, email_templates(name)")
    .eq("experience_id", experienceId)
    .order("step_number", { ascending: true });
  const startDate = exp.start_date as string;
  const startTime = (exp.start_time as string) || "09:00";
  const now = Date.now();
  const out: BacklogEmail[] = [];
  for (const s of steps ?? []) {
    const templateName = (s as any).email_templates?.name as string | undefined;
    if (!templateName) continue; // skip "No email" steps
    const when = computeStepDate(startDate, startTime, (s as any).offset_value, (s as any).offset_unit as OffsetUnit);
    if (when.getTime() > now) continue; // still upcoming — not missed
    out.push({ stepNumber: (s as any).step_number, templateName, scheduledAt: when.toISOString() });
  }
  return out;
}

/**
 * Add one participant to an experience that's already running. Upserts them as a participant,
 * links them to the facilitator's team, and schedules the UPCOMING steps. If `sendBacklog` is
 * set, it also sends the emails they missed (the already-past steps) right now.
 */
export async function addAttendeeToExperience(
  experienceId: string,
  input: { name?: string; email: string; sendInvitation?: boolean; sendBacklog?: boolean },
  actorId?: string | null,
) {
  const supabase = createSupabaseAdminClient();

  const email = (input.email ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("A valid email is required.");
  const name = (input.name ?? "").trim();

  const { data: experience, error: expErr } = await supabase.from("experiences").select("*").eq("id", experienceId).maybeSingle();
  if (expErr) throw expErr;
  if (!experience) throw new Error("Experience not found.");

  // Attendee (idempotent by email within the experience).
  const { data: existing } = await supabase
    .from("experience_attendees")
    .select("id")
    .eq("experience_id", experienceId)
    .ilike("email", email)
    .maybeSingle();
  let attendeeId: string;
  let alreadyOnList = false;
  if (existing) {
    attendeeId = existing.id;
    alreadyOnList = true;
    if (name) await supabase.from("experience_attendees").update({ name }).eq("id", attendeeId);
  } else {
    const { data: att, error } = await supabase
      .from("experience_attendees")
      .insert({ experience_id: experienceId, name: name || null, email })
      .select("id")
      .single();
    if (error) throw error;
    attendeeId = att.id;
  }

  // Upsert as a participant + link to the attendee row.
  const { firstName, lastName } = splitName(name);
  const participant = await upsertParticipant({ firstName: firstName || email, lastName, email, participantType: "general_participant" });
  await supabase.from("experience_attendees").update({ participant_id: participant.id }).eq("id", attendeeId);

  // Add to the facilitator's team for this experience (create it if needed).
  if (experience.facilitator_id) {
    let teamId: string;
    const { data: team } = await supabase.from("facilitator_teams").select("id").eq("experience_id", experienceId).maybeSingle();
    if (team) {
      teamId = team.id;
    } else {
      const { data: created, error: teamErr } = await supabase
        .from("facilitator_teams")
        .insert({ name: experience.name, facilitator_id: experience.facilitator_id, experience_id: experienceId, created_by: actorId || null })
        .select("id")
        .single();
      if (teamErr) throw teamErr;
      teamId = created.id;
    }
    await supabase.from("facilitator_team_members").upsert({ team_id: teamId, participant_id: participant.id }, { onConflict: "team_id,participant_id" });
  }

  // Split the sequence into past (missed) and upcoming steps.
  const { data: steps } = await supabase
    .from("experience_steps")
    .select("step_number,email_template_id,offset_value,offset_unit")
    .eq("experience_id", experienceId)
    .order("step_number", { ascending: true });
  const startDate = experience.start_date as string;
  const startTime = (experience.start_time as string) || "09:00";
  const now = Date.now();
  const futureRows: any[] = [];
  const pastRows: any[] = [];
  for (const step of steps ?? []) {
    const when = computeStepDate(startDate, startTime, step.offset_value, step.offset_unit as OffsetUnit);
    const row = {
      experience_id: experienceId,
      attendee_id: attendeeId,
      step_number: step.step_number,
      template_id: step.email_template_id,
      status: "scheduled",
      scheduled_at: when.toISOString(),
    };
    (when.getTime() <= now ? pastRows : futureRows).push(row);
  }

  // Always schedule upcoming emails. Only materialize the past ones when we're sending them.
  const toInsert = input.sendBacklog ? [...pastRows, ...futureRows] : futureRows;
  if (toInsert.length) {
    const { error: seErr } = await supabase.from("experience_send_events").upsert(toInsert, { onConflict: "attendee_id,step_number", ignoreDuplicates: true });
    if (seErr) throw seErr;
  }

  // Send the missed emails now (out of schedule), reusing the scheduler's render/send logic.
  let backlogSent = 0;
  if (input.sendBacklog && pastRows.length) {
    const { data: due } = await supabase
      .from("experience_send_events")
      .select("id")
      .eq("attendee_id", attendeeId)
      .eq("status", "scheduled")
      .lte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true });
    for (const ev of due ?? []) {
      try {
        const r = await sendExperienceEventNow((ev as any).id, actorId ?? null);
        if (r.status === "sent") backlogSent += 1;
      } catch (e) {
        console.error("[add-attendee] backlog send failed", (ev as any).id, e instanceof Error ? e.message : e);
      }
    }
  }

  let invited = false;
  let inviteError: string | null = null;
  if (input.sendInvitation) {
    try {
      await createUserInvitation({ email, role: ROLES.PARTICIPANT, inviteMethod: "email", invitedBy: actorId ?? undefined });
      invited = true;
    } catch (e) {
      inviteError = e instanceof Error ? e.message : "Unknown error";
      console.error("[add-attendee] invite failed", email, inviteError);
    }
  }

  return { attendeeId, alreadyOnList, upcomingEmails: futureRows.length, backlogSent, invited, inviteError };
}

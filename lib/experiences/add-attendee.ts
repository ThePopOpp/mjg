import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { upsertParticipant } from "@/lib/pilot/repository";
import { createUserInvitation } from "@/lib/user-management/repository";
import { computeStepDate } from "./schedule";
import { ROLES } from "@/lib/rbac/roles";
import type { OffsetUnit } from "./types";

function splitName(name?: string | null): { firstName: string; lastName: string } {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const parts = trimmed.split(/\s+/);
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

/**
 * Add one participant to an experience that's already running. They join "where the group
 * is": we generate send events only for steps still in the FUTURE, so they get the rest of
 * the challenge — never a backlog of emails that already went out. Also upserts them as a
 * participant, links them to the facilitator's team, and (optionally) sends an invite.
 */
export async function addAttendeeToExperience(
  experienceId: string,
  input: { name?: string; email: string; sendInvitation?: boolean },
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

  // Generate send events for FUTURE steps only (no backlog of already-sent emails).
  const { data: steps } = await supabase
    .from("experience_steps")
    .select("step_number,email_template_id,offset_value,offset_unit")
    .eq("experience_id", experienceId)
    .order("step_number", { ascending: true });
  const startDate = experience.start_date as string;
  const startTime = (experience.start_time as string) || "09:00";
  const now = Date.now();
  const rows: any[] = [];
  for (const step of steps ?? []) {
    const when = computeStepDate(startDate, startTime, step.offset_value, step.offset_unit as OffsetUnit);
    if (when.getTime() <= now) continue; // already passed — skip it for this late joiner
    rows.push({
      experience_id: experienceId,
      attendee_id: attendeeId,
      step_number: step.step_number,
      template_id: step.email_template_id,
      status: "scheduled",
      scheduled_at: when.toISOString(),
    });
  }
  if (rows.length) {
    const { error: seErr } = await supabase.from("experience_send_events").upsert(rows, { onConflict: "attendee_id,step_number", ignoreDuplicates: true });
    if (seErr) throw seErr;
  }

  let invited = false;
  if (input.sendInvitation) {
    await createUserInvitation({ email, role: ROLES.PARTICIPANT, inviteMethod: "email", invitedBy: actorId ?? undefined })
      .then(() => { invited = true; })
      .catch((e) => console.error("[add-attendee] invite failed", email, e instanceof Error ? e.message : e));
  }

  return { attendeeId, alreadyOnList, upcomingEmails: rows.length, invited };
}

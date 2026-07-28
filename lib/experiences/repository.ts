import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { upsertParticipant } from "@/lib/pilot/repository";
import { sendTemplateEmail } from "@/lib/email/templates";
import { computeStepDate } from "./schedule";
import type {
  CreateExperienceInput,
  Experience,
  ExperienceFrequency,
  ExperienceType,
  ExperienceTypeStep,
  EmailEvent,
  OffsetUnit,
  WizardStepInput,
} from "./types";

function splitName(name?: string | null): { firstName: string; lastName: string } {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const parts = trimmed.split(/\s+/);
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

// ── Reads ────────────────────────────────────────────────────────────────────────

export async function getExperienceTypes(includeArchived = false) {
  const supabase = createSupabaseAdminClient();
  let query = supabase.from("experience_types").select("*").order("name", { ascending: true });
  if (!includeArchived) query = query.eq("status", "active");
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ExperienceType[];
}

export async function getExperienceTypeWithSteps(typeId: string) {
  const supabase = createSupabaseAdminClient();
  const [{ data: type, error: typeError }, { data: steps, error: stepsError }] = await Promise.all([
    supabase.from("experience_types").select("*").eq("id", typeId).maybeSingle(),
    supabase.from("experience_type_steps").select("*").eq("experience_type_id", typeId).order("step_number", { ascending: true }),
  ]);
  if (typeError) throw typeError;
  if (stepsError) throw stepsError;
  return { type: (type as ExperienceType | null) ?? null, steps: (steps ?? []) as ExperienceTypeStep[] };
}

export async function getAllTypesWithSteps() {
  const supabase = createSupabaseAdminClient();
  const [{ data: types, error: typesErr }, { data: steps, error: stepsErr }] = await Promise.all([
    supabase.from("experience_types").select("*").order("name", { ascending: true }),
    supabase.from("experience_type_steps").select("*").order("step_number", { ascending: true }),
  ]);
  if (typesErr) throw typesErr;
  if (stepsErr) throw stepsErr;
  const stepsByType = new Map<string, ExperienceTypeStep[]>();
  for (const s of (steps ?? []) as ExperienceTypeStep[]) {
    stepsByType.set(s.experience_type_id, [...(stepsByType.get(s.experience_type_id) ?? []), s]);
  }
  return ((types ?? []) as ExperienceType[]).map((t) => ({ ...t, steps: stepsByType.get(t.id) ?? [] }));
}

export async function getFacilitators() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,first_name,last_name,full_name,email")
    .eq("role", "facilitator")
    .eq("status", "active")
    .order("full_name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getEmailTemplateOptions() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("email_templates")
    .select("id,name,subject,status")
    .neq("status", "archived")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getExperiencesData() {
  const supabase = createSupabaseAdminClient();
  const { data: experiences, error } = await supabase
    .from("experiences")
    .select("*, experience_types(name,slug), profiles!experiences_facilitator_id_fkey(id,full_name,first_name,last_name,email)")
    .order("start_date", { ascending: false });
  if (error) throw error;

  // Per-experience attendee counts (one grouped query).
  const ids = (experiences ?? []).map((e: any) => e.id);
  const counts: Record<string, number> = {};
  if (ids.length) {
    const { data: attendees } = await supabase
      .from("experience_attendees")
      .select("experience_id")
      .in("experience_id", ids);
    for (const row of attendees ?? []) counts[row.experience_id] = (counts[row.experience_id] ?? 0) + 1;
  }

  const expList = (experiences ?? []).map((e: any) => ({ ...e, attendee_count: counts[e.id] ?? 0 }));

  // Every scheduled email, computed from each experience's step offsets (works for
  // drafts too — no need for send events to exist). One entry per experience × step.
  const expById = new Map<string, any>(expList.map((e: any) => [e.id, e]));
  const emailEvents: EmailEvent[] = [];
  if (ids.length) {
    const { data: steps } = await supabase
      .from("experience_steps")
      .select("id,experience_id,step_number,offset_value,offset_unit, email_templates(name)")
      .in("experience_id", ids)
      .order("step_number", { ascending: true });
    for (const s of steps ?? []) {
      const exp = expById.get((s as any).experience_id);
      if (!exp) continue;
      const when = computeStepDate(exp.start_date, exp.start_time || "09:00", (s as any).offset_value, (s as any).offset_unit as OffsetUnit);
      emailEvents.push({
        id: (s as any).id,
        experienceId: exp.id,
        experienceName: exp.name,
        stepNumber: (s as any).step_number,
        templateName: (s as any).email_templates?.name ?? null,
        scheduledAt: when.toISOString(),
        recipients: exp.attendee_count,
      });
    }
  }

  return { experiences: expList, emailEvents };
}

export async function getExperienceById(id: string) {
  const supabase = createSupabaseAdminClient();
  const { data: experience, error } = await supabase
    .from("experiences")
    .select("*, experience_types(name,slug), profiles!experiences_facilitator_id_fkey(id,full_name,first_name,last_name,email)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!experience) return null;

  const [{ data: attendees }, { data: sendEvents }] = await Promise.all([
    supabase.from("experience_attendees").select("*").eq("experience_id", id).order("created_at", { ascending: true }),
    supabase.from("experience_send_events").select("*").eq("experience_id", id).order("scheduled_at", { ascending: true }),
  ]);

  return {
    experience,
    attendees: attendees ?? [],
    sendEvents: sendEvents ?? [],
  };
}

// ── Writes ───────────────────────────────────────────────────────────────────────

export async function createExperience(input: CreateExperienceInput, actorUserId?: string | null): Promise<Experience> {
  const supabase = createSupabaseAdminClient();

  // Type is optional — a custom "New Experience" carries just a name.
  let type: ExperienceType | null = null;
  if (input.experienceTypeId) {
    type = (await supabase.from("experience_types").select("*").eq("id", input.experienceTypeId).maybeSingle()).data as ExperienceType | null;
  }
  const name = input.name?.trim() || (type ? `${type.name} — ${input.startDate}` : "");
  if (!name) throw new Error("Give the experience a name.");

  const { data: experience, error } = await supabase
    .from("experiences")
    .insert({
      experience_type_id: type?.id ?? null,
      name,
      facilitator_id: input.facilitatorId || null,
      preview_id: input.previewId || null,
      start_date: input.startDate,
      start_time: input.startTime || "09:00",
      frequency: input.frequency,
      custom_interval_value: input.frequency === "custom" ? input.customIntervalValue ?? null : null,
      custom_interval_unit: input.frequency === "custom" ? input.customIntervalUnit ?? null : null,
      duration_weeks: input.durationWeeks,
      status: "draft",
      created_by: actorUserId || null,
    })
    .select("*")
    .single();
  if (error) throw error;

  // Insert attendees (dedupe by email, skip blanks).
  const seen = new Set<string>();
  const attendeeRows = input.attendees
    .map((a) => ({ name: a.name?.trim() || null, email: (a.email ?? "").trim().toLowerCase() }))
    .filter((a) => a.email && !seen.has(a.email) && seen.add(a.email))
    .map((a) => ({ experience_id: experience.id, name: a.name, email: a.email }));
  if (attendeeRows.length) {
    const { error: attErr } = await supabase.from("experience_attendees").insert(attendeeRows);
    if (attErr) throw attErr;
  }

  // Insert the per-experience email sequence (the Selections repeater).
  const stepRows = (input.steps ?? []).map((s, i) => ({
    experience_id: experience.id,
    step_number: i + 1,
    label: s.label?.trim() || null,
    email_template_id: s.emailTemplateId || null,
    offset_value: Math.max(0, Math.floor(Number(s.offsetValue) || 0)),
    offset_unit: s.offsetUnit,
  }));
  if (stepRows.length) {
    const { error: stepErr } = await supabase.from("experience_steps").insert(stepRows);
    if (stepErr) throw stepErr;
  }

  return experience as Experience;
}

/** Instant test: render each configured step's template and email it to a test address now. */
export async function testExperience(
  input: { steps: WizardStepInput[]; testEmail: string; name?: string },
  actorUserId?: string | null,
) {
  const email = input.testEmail.trim().toLowerCase();
  if (!email.includes("@")) throw new Error("A valid test email is required.");
  const steps = (input.steps ?? []).filter((s) => s.emailTemplateId);
  if (!steps.length) throw new Error("Add at least one step with an email template to test.");

  let sent = 0;
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    await sendTemplateEmail({
      templateId: step.emailTemplateId as string,
      actorUserId: actorUserId ?? undefined,
      recipient: {
        email,
        merge_data: {
          experience_name: input.name ?? "Test Experience",
          session_number: String(i + 1),
        },
      },
    });
    sent++;
  }
  return { sent };
}

/**
 * Materialize an experience: upsert each attendee as a participant, create/refresh
 * the facilitator's team from the roster, generate the per-step scheduled send
 * events, and flip the experience to "scheduled". The automatic scheduler
 * (sendDueExperienceEmails) then releases each email when scheduled_at arrives.
 */
export async function sendExperience(experienceId: string, actorUserId?: string | null) {
  const supabase = createSupabaseAdminClient();

  const { data: experience, error: expErr } = await supabase.from("experiences").select("*").eq("id", experienceId).maybeSingle();
  if (expErr) throw expErr;
  if (!experience) throw new Error("Experience not found.");

  const { data: attendees, error: attErr } = await supabase.from("experience_attendees").select("*").eq("experience_id", experienceId);
  if (attErr) throw attErr;
  if (!attendees?.length) throw new Error("Add at least one attendee before sending.");

  // Per-experience email sequence (the Selections repeater) drives the schedule.
  const { data: steps, error: stepsErr } = await supabase
    .from("experience_steps")
    .select("step_number,email_template_id,offset_value,offset_unit")
    .eq("experience_id", experienceId)
    .order("step_number", { ascending: true });
  if (stepsErr) throw stepsErr;
  if (!steps?.length) throw new Error("Configure at least one step before sending.");

  // 1) Upsert every attendee as a participant, capturing the participant_id.
  const participantIds: string[] = [];
  for (const attendee of attendees) {
    const { firstName, lastName } = splitName(attendee.name);
    const participant = await upsertParticipant({
      firstName: firstName || attendee.email,
      lastName,
      email: attendee.email,
      participantType: "general_participant",
    });
    participantIds.push(participant.id);
    if (attendee.participant_id !== participant.id) {
      await supabase.from("experience_attendees").update({ participant_id: participant.id }).eq("id", attendee.id);
    }
  }

  // 2) Create/refresh the facilitator's team from this roster.
  if (experience.facilitator_id) {
    let teamId: string;
    const { data: existingTeam } = await supabase
      .from("facilitator_teams")
      .select("id")
      .eq("experience_id", experienceId)
      .maybeSingle();
    if (existingTeam) {
      teamId = existingTeam.id;
    } else {
      const { data: team, error: teamErr } = await supabase
        .from("facilitator_teams")
        .insert({
          name: experience.name,
          facilitator_id: experience.facilitator_id,
          experience_id: experienceId,
          created_by: actorUserId || null,
        })
        .select("id")
        .single();
      if (teamErr) throw teamErr;
      teamId = team.id;
    }
    const memberRows = participantIds.map((pid) => ({ team_id: teamId, participant_id: pid }));
    if (memberRows.length) {
      await supabase.from("facilitator_team_members").upsert(memberRows, { onConflict: "team_id,participant_id" });
    }
  }

  // 3) Generate scheduled send events (one per attendee × per step), idempotently.
  const startDate = experience.start_date as string;
  const startTime = (experience.start_time as string) || "09:00";
  const eventRows: any[] = [];
  for (const attendee of attendees) {
    for (const step of steps) {
      eventRows.push({
        experience_id: experienceId,
        attendee_id: attendee.id,
        step_number: step.step_number,
        template_id: step.email_template_id,
        subject: null,
        status: "scheduled",
        scheduled_at: computeStepDate(startDate, startTime, step.offset_value, step.offset_unit as OffsetUnit).toISOString(),
      });
    }
  }
  if (eventRows.length) {
    const { error: seErr } = await supabase
      .from("experience_send_events")
      .upsert(eventRows, { onConflict: "attendee_id,step_number", ignoreDuplicates: true });
    if (seErr) throw seErr;
  }

  // 4) Flip status.
  const { data: updated, error: updErr } = await supabase
    .from("experiences")
    .update({ status: "scheduled", updated_at: new Date().toISOString() })
    .eq("id", experienceId)
    .select("*")
    .single();
  if (updErr) throw updErr;

  return { experience: updated, scheduledEvents: eventRows.length };
}

// ── Types editor ───────────────────────────────────────────────────────────────

export async function saveExperienceType(input: {
  id?: string;
  name: string;
  description?: string | null;
  defaultFrequency: ExperienceFrequency;
  defaultDurationWeeks: number;
  actorUserId?: string | null;
}) {
  const supabase = createSupabaseAdminClient();
  const slug = input.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const payload = {
    name: input.name.trim(),
    slug,
    description: input.description?.trim() || null,
    default_frequency: input.defaultFrequency,
    default_duration_weeks: input.defaultDurationWeeks,
    updated_at: new Date().toISOString(),
  };
  const query = input.id
    ? supabase.from("experience_types").update(payload).eq("id", input.id)
    : supabase.from("experience_types").insert({ ...payload, created_by: input.actorUserId || null });
  const { data, error } = await query.select("*").single();
  if (error) throw error;
  return data as ExperienceType;
}

/** Replace the per-week email sequence for a type. */
export async function saveExperienceTypeSteps(
  typeId: string,
  steps: { stepNumber: number; label?: string | null; emailTemplateId?: string | null; subjectOverride?: string | null }[],
) {
  const supabase = createSupabaseAdminClient();
  await supabase.from("experience_type_steps").delete().eq("experience_type_id", typeId);
  const rows = steps
    .filter((s) => s.stepNumber > 0)
    .map((s) => ({
      experience_type_id: typeId,
      step_number: s.stepNumber,
      label: s.label?.trim() || null,
      email_template_id: s.emailTemplateId || null,
      subject_override: s.subjectOverride?.trim() || null,
    }));
  if (rows.length) {
    const { error } = await supabase.from("experience_type_steps").insert(rows);
    if (error) throw error;
  }
  return { count: rows.length };
}

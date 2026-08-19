import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { computeStepDate, defaultStepOffsets } from "@/lib/experiences/schedule";
import { createExperience, sendExperience } from "@/lib/experiences/repository";
import { createUserInvitation } from "@/lib/user-management/repository";
import { ROLES } from "@/lib/rbac/roles";
import type { EmailEvent, ExperienceFrequency, OffsetUnit } from "@/lib/experiences/types";

export type FacilitatorExperience = {
  id: string;
  name: string;
  status: string;
  start_date: string;
  start_time: string;
  frequency: string;
  duration_weeks: number;
  attendee_count: number;
  type_name: string | null;
  preview: {
    title: string;
    content: string | null;
    image_url: string | null;
    video_url: string | null;
    audio_url: string | null;
    document_url: string | null;
    frequency_label: string | null;
  } | null;
};

/** Experiences assigned to this facilitator, plus their computed email schedule (calendar). */
export async function getFacilitatorExperiences(profileId: string): Promise<{ experiences: FacilitatorExperience[]; emailEvents: EmailEvent[] }> {
  const supabase = createSupabaseAdminClient();
  const { data: rows } = await supabase
    .from("experiences")
    .select("*, experience_types(name), experience_previews(title,content,image_url,video_url,audio_url,document_url,frequency_label)")
    .eq("facilitator_id", profileId)
    .order("start_date", { ascending: false });

  const experiences = (rows ?? []).filter((e: any) => !e.archived_at);
  const ids = experiences.map((e: any) => e.id);

  const counts: Record<string, number> = {};
  if (ids.length) {
    const { data: att } = await supabase.from("experience_attendees").select("experience_id").in("experience_id", ids);
    for (const r of att ?? []) counts[r.experience_id] = (counts[r.experience_id] ?? 0) + 1;
  }

  const emailEvents: EmailEvent[] = [];
  if (ids.length) {
    const { data: steps } = await supabase
      .from("experience_steps")
      .select("id,experience_id,step_number,offset_value,offset_unit, email_templates(name)")
      .in("experience_id", ids);
    const byId = new Map<string, any>(experiences.map((e: any) => [e.id, e]));
    for (const s of steps ?? []) {
      const exp = byId.get((s as any).experience_id);
      if (!exp) continue;
      emailEvents.push({
        id: (s as any).id,
        experienceId: exp.id,
        experienceName: exp.name,
        stepNumber: (s as any).step_number,
        templateName: (s as any).email_templates?.name ?? null,
        scheduledAt: computeStepDate(exp.start_date, exp.start_time || "09:00", (s as any).offset_value, (s as any).offset_unit as OffsetUnit).toISOString(),
        recipients: counts[exp.id] ?? 0,
      });
    }
  }

  return {
    experiences: experiences.map((e: any) => ({
      id: e.id,
      name: e.name,
      status: e.status,
      start_date: e.start_date,
      start_time: e.start_time,
      frequency: e.frequency,
      duration_weeks: e.duration_weeks,
      attendee_count: counts[e.id] ?? 0,
      type_name: e.experience_types?.name ?? null,
      preview: e.experience_previews ?? null,
    })),
    emailEvents,
  };
}

export type StartChallengeInput = {
  attendees: { name?: string; email: string }[];
  frequency: "weekly" | "biweekly"; // weekly = 6 weeks, biweekly = 12 weeks (same emails)
  startDate: string; // yyyy-mm-dd
  startTime?: string;
  sendInvitations: boolean; // send account invitations to participants
  invitationSendAt?: string | null; // ISO; when set (future), invitations go out then, not now
  startChallenge: boolean; // generate the drip send events now (released per schedule)
};

/** The facilitator "Start 6-Week Challenge" launcher: creates the 6WC experience for their
 * group with the CORRECT per-step schedule (× pace for biweekly), optionally sends account
 * invitations to participants, and optionally starts the email drip. */
export async function startChallengeForFacilitator(profileId: string, input: StartChallengeInput) {
  const supabase = createSupabaseAdminClient();

  const { data: type } = await supabase.from("experience_types").select("id,name").eq("slug", "six-week-challenge").maybeSingle();
  if (!type) throw new Error("6-Week Challenge type not found.");

  // Governance: a facilitator may only start challenges a Super Admin granted them.
  const { data: access } = await supabase
    .from("facilitator_challenge_access")
    .select("id")
    .eq("facilitator_id", profileId)
    .eq("experience_type_id", type.id)
    .maybeSingle();
  if (!access) throw new Error("You don't have access to this challenge. Ask a Super Admin to grant it.");

  const { data: typeSteps } = await supabase
    .from("experience_type_steps")
    .select("step_number,email_template_id,offset_value,offset_unit")
    .eq("experience_type_id", type.id)
    .order("step_number", { ascending: true });
  if (!typeSteps?.length) throw new Error("The 6-Week Challenge sequence isn't configured yet.");

  const pace = input.frequency === "biweekly" ? 2 : 1;

  // Clean + dedupe attendees by email.
  const seen = new Set<string>();
  const attendees = input.attendees
    .map((a) => ({ name: (a.name ?? "").trim(), email: (a.email ?? "").trim().toLowerCase() }))
    .filter((a) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(a.email))
    .filter((a) => (seen.has(a.email) ? false : (seen.add(a.email), true)));
  if (!attendees.length) throw new Error("Add at least one participant with a valid email.");

  const steps = typeSteps.map((s: any) => {
    const raw = Math.trunc(s.offset_value ?? 0);
    // Positive offsets (the weekly curriculum) stretch with the pace (×2 for biweekly);
    // negative offsets are fixed pre-start reminders (48h/24h before the start) and keep
    // their lead time regardless of cadence.
    return {
      emailTemplateId: (s.email_template_id ?? null) as string | null,
      offsetValue: raw >= 0 ? Math.round(raw * pace) : raw,
      offsetUnit: (s.offset_unit ?? "day") as OffsetUnit,
    };
  });

  const experience = await createExperience(
    {
      experienceTypeId: type.id,
      startDate: input.startDate,
      startTime: input.startTime || "09:00",
      frequency: pace === 2 ? "biweekly" : "weekly",
      durationWeeks: steps.length,
      facilitatorId: profileId,
      attendees: attendees.map((a) => ({ name: a.name || undefined, email: a.email })),
      steps,
    },
    profileId,
  );

  let invited = 0;
  if (input.sendInvitations) {
    for (const a of attendees) {
      await createUserInvitation({ email: a.email, role: ROLES.PARTICIPANT, inviteMethod: "email", invitedBy: profileId, scheduledSendAt: input.invitationSendAt ?? null })
        .then(() => { invited += 1; })
        .catch((e) => console.error("[start-challenge] invite failed", a.email, e instanceof Error ? e.message : e));
    }
  }

  let started = false;
  if (input.startChallenge) {
    await sendExperience(experience.id, profileId); // generates scheduled send events from the start date
    started = true;
  }

  return { experienceId: experience.id, attendees: attendees.length, invited, started };
}

/** Facilitator self-assigns an experience type: creates a DRAFT experience for their
 * team (their current team members become attendees). Admin still controls sending. */
export async function assignExperienceType(profileId: string, typeId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: type } = await supabase.from("experience_types").select("*").eq("id", typeId).maybeSingle();
  if (!type) throw new Error("Experience type not found.");

  // Team members this facilitator leads → attendees.
  const { data: teams } = await supabase.from("facilitator_teams").select("id").eq("facilitator_id", profileId);
  const teamIds = (teams ?? []).map((t: any) => t.id);
  let participants: any[] = [];
  if (teamIds.length) {
    const { data: members } = await supabase.from("facilitator_team_members").select("participant_id").in("team_id", teamIds);
    const pids = Array.from(new Set((members ?? []).map((m: any) => m.participant_id)));
    if (pids.length) {
      const { data } = await supabase.from("participants").select("id,first_name,last_name,email").in("id", pids);
      participants = data ?? [];
    }
  }

  const startDate = new Date().toISOString().slice(0, 10);
  const frequency = (type.default_frequency === "custom" ? "weekly" : type.default_frequency) as ExperienceFrequency;
  const count = Math.max(1, type.default_duration_weeks);

  const { data: experience, error } = await supabase
    .from("experiences")
    .insert({
      experience_type_id: type.id,
      name: `${type.name} — ${startDate}`,
      facilitator_id: profileId,
      start_date: startDate,
      start_time: "09:00",
      frequency,
      duration_weeks: count,
      status: "draft",
      created_by: profileId,
    })
    .select("*")
    .single();
  if (error) throw error;

  // Attendees from the team roster.
  const attendeeRows = participants
    .filter((p) => p.email)
    .map((p) => ({ experience_id: experience.id, participant_id: p.id, name: `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || null, email: String(p.email).toLowerCase() }));
  if (attendeeRows.length) await supabase.from("experience_attendees").insert(attendeeRows);

  // Steps from the type's template sequence, spaced by the default cadence.
  const { data: typeSteps } = await supabase
    .from("experience_type_steps")
    .select("step_number,email_template_id")
    .eq("experience_type_id", typeId)
    .order("step_number", { ascending: true });
  const offsets = defaultStepOffsets(frequency, count, null);
  const stepRows = offsets.map((o, i) => ({
    experience_id: experience.id,
    step_number: i + 1,
    email_template_id: (typeSteps ?? []).find((s: any) => s.step_number === i + 1)?.email_template_id ?? null,
    offset_value: o.offsetValue,
    offset_unit: o.offsetUnit,
  }));
  if (stepRows.length) await supabase.from("experience_steps").insert(stepRows);

  return { id: experience.id };
}

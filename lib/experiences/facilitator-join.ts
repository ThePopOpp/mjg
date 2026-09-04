import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createExperience, sendExperience } from "@/lib/experiences/repository";
import type { OffsetUnit } from "@/lib/experiences/types";

/**
 * "Am I the facilitator, and am I joining this challenge?" — shared by the admin launcher and
 * the facilitator launcher.
 *
 * Two very different meanings of "joining", picked in the wizard:
 *  - "participant" — the facilitator is added to the group's own roster and receives the same
 *    drip everyone else gets.
 *  - "leader" — the facilitator instead receives the separate 5-email leader coaching series.
 *    Because an experience gives every attendee the same steps, the leader track is delivered
 *    as a companion experience anchored to the same start date.
 */
export type FacilitatorEmailTrack = "leader" | "participant";

export const LEADER_TYPE_SLUG = "six-week-challenge-leader";
/** The participant-facing challenge. The DB slug carries the "-biweekly" suffix for history. */
export const CHALLENGE_TYPE_SLUG = "six-week-challenge-biweekly";

export type ActorContact = { name: string; email: string };

/** Look up the launching user's own name + email so we can add them to a roster. */
export async function getActorContact(profileId: string): Promise<ActorContact | null> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("first_name,last_name,full_name,email")
    .eq("id", profileId)
    .maybeSingle();
  if (!data?.email) return null;

  const name =
    (data.full_name as string) ||
    [data.first_name, data.last_name].filter(Boolean).join(" ").trim() ||
    (data.email as string);
  return { name, email: (data.email as string).trim().toLowerCase() };
}

/**
 * Resolve the participant-facing 6-Week Challenge type. Tolerates the historical slug drift
 * (the code used to look for a bare "six-week-challenge", which does not exist in the DB and
 * made the facilitator launcher throw for everyone).
 */
export async function resolveChallengeType() {
  const supabase = createSupabaseAdminClient();
  const { data: exact } = await supabase
    .from("experience_types")
    .select("id,name,slug")
    .eq("slug", CHALLENGE_TYPE_SLUG)
    .maybeSingle();
  if (exact) return exact;

  // Fall back to any six-week-challenge type that isn't the leader track.
  const { data: candidates } = await supabase
    .from("experience_types")
    .select("id,name,slug")
    .like("slug", "six-week-challenge%")
    .order("slug", { ascending: true });
  return (candidates ?? []).find((t: any) => t.slug !== LEADER_TYPE_SLUG) ?? null;
}

/**
 * Create the companion leader-track experience for a facilitator who chose the leader emails.
 * Returns null (rather than throwing) when the leader type isn't configured — the main
 * challenge must still launch.
 */
export async function createLeaderTrackExperience(opts: {
  contact: ActorContact;
  facilitatorId: string;
  startDate: string;
  startTime: string;
  frequency: "weekly" | "biweekly";
  groupName?: string | null;
  actorId: string;
  start: boolean;
}): Promise<{ experienceId: string; steps: number } | null> {
  const supabase = createSupabaseAdminClient();

  const { data: leaderType } = await supabase
    .from("experience_types")
    .select("id,name")
    .eq("slug", LEADER_TYPE_SLUG)
    .maybeSingle();
  if (!leaderType) return null;

  const { data: typeSteps } = await supabase
    .from("experience_type_steps")
    .select("step_number,email_template_id,offset_value,offset_unit,label")
    .eq("experience_type_id", leaderType.id)
    .order("step_number", { ascending: true });
  if (!typeSteps?.length) return null;

  const pace = opts.frequency === "biweekly" ? 2 : 1;
  const steps = typeSteps.map((s: any) => {
    const raw = Math.trunc(s.offset_value ?? 0);
    // Same rule as the participant track: positive (curriculum) offsets stretch with the
    // pace; negative (pre-start reminder) offsets keep their fixed lead time.
    return {
      emailTemplateId: (s.email_template_id ?? null) as string | null,
      offsetValue: raw >= 0 ? Math.round(raw * pace) : raw,
      offsetUnit: (s.offset_unit ?? "day") as OffsetUnit,
      label: (s.label ?? null) as string | null,
    };
  });

  const experience = await createExperience(
    {
      experienceTypeId: leaderType.id,
      name: `${opts.groupName?.trim() || "6 Week Challenge"} — Leader track`,
      startDate: opts.startDate,
      startTime: opts.startTime,
      frequency: pace === 2 ? "biweekly" : "weekly",
      durationWeeks: steps.length,
      facilitatorId: opts.facilitatorId,
      attendees: [{ name: opts.contact.name, email: opts.contact.email }],
      steps,
    },
    opts.actorId,
  );

  if (opts.start) await sendExperience(experience.id, opts.actorId);
  return { experienceId: experience.id, steps: steps.length };
}

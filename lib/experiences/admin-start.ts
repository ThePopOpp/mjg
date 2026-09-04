import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createExperience, sendExperience } from "@/lib/experiences/repository";
import { createUserInvitation } from "@/lib/user-management/repository";
import { grantChallengeTypeVisibility, type VisibilityInput } from "@/lib/facilitator/access";
import {
  createLeaderTrackExperience,
  getActorContact,
  type FacilitatorEmailTrack,
} from "@/lib/experiences/facilitator-join";
import { ROLES } from "@/lib/rbac/roles";
import type { OffsetUnit } from "@/lib/experiences/types";

export type AdminStartChallengeInput = {
  experienceTypeId: string;
  name?: string;
  attendees: { name?: string; email: string }[];
  frequency: "weekly" | "biweekly"; // pace applied to the type's positive offsets
  startDate: string; // yyyy-mm-dd — the ACTUAL challenge start (Week 1)
  startTime?: string;
  facilitatorId?: string | null; // optional owner
  sendInvitations: boolean;
  invitationSendAt?: string | null; // ISO; future = scheduled invite
  startChallenge: boolean; // generate the drip send events now
  visibility?: VisibilityInput; // grant this challenge to facilitators
  // "Are you the facilitator of this group?" — when true the launching admin is added to the
  // challenge themselves, on whichever email track they picked.
  joinAsFacilitator?: boolean;
  facilitatorEmailTrack?: FacilitatorEmailTrack;
};

/**
 * The admin "Start New Challenge" wizard: mirrors the facilitator launcher but works for ANY
 * challenge/series type, takes arbitrary recipients (facilitators, participants, or any
 * user/contact by email), can assign an owning facilitator, and controls visibility. No
 * challenge-access gate — admins can start anything.
 */
export async function startChallengeForAdmin(actorId: string, input: AdminStartChallengeInput) {
  const supabase = createSupabaseAdminClient();

  const { data: type } = await supabase.from("experience_types").select("id,name,slug").eq("id", input.experienceTypeId).maybeSingle();
  if (!type) throw new Error("Challenge not found.");

  const { data: typeSteps } = await supabase
    .from("experience_type_steps")
    .select("step_number,email_template_id,offset_value,offset_unit,label")
    .eq("experience_type_id", type.id)
    .order("step_number", { ascending: true });
  if (!typeSteps?.length) throw new Error("This challenge has no email sequence configured yet.");

  const pace = input.frequency === "biweekly" ? 2 : 1;

  // Clean + dedupe recipients by email.
  const seen = new Set<string>();
  const attendees = input.attendees
    .map((a) => ({ name: (a.name ?? "").trim(), email: (a.email ?? "").trim().toLowerCase() }))
    .filter((a) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(a.email))
    .filter((a) => (seen.has(a.email) ? false : (seen.add(a.email), true)));
  if (!attendees.length) throw new Error("Add at least one recipient with a valid email.");

  // "I'm the facilitator of this group." On the participant track they join the group's own
  // roster; on the leader track they get the separate coaching series instead (below).
  const track: FacilitatorEmailTrack = input.facilitatorEmailTrack === "participant" ? "participant" : "leader";
  const joiner = input.joinAsFacilitator ? await getActorContact(actorId) : null;
  if (joiner && track === "participant" && !seen.has(joiner.email)) {
    attendees.push(joiner);
    seen.add(joiner.email);
  }

  // Positive (content) offsets scale with the pace; negative (pre-start reminder) offsets
  // keep their fixed lead time.
  const steps = typeSteps.map((s: any) => {
    const raw = Math.trunc(s.offset_value ?? 0);
    return {
      emailTemplateId: (s.email_template_id ?? null) as string | null,
      offsetValue: raw >= 0 ? Math.round(raw * pace) : raw,
      offsetUnit: (s.offset_unit ?? "day") as OffsetUnit,
      label: (s.label ?? null) as string | null,
    };
  });

  const experience = await createExperience(
    {
      experienceTypeId: type.id,
      name: input.name?.trim() || undefined,
      startDate: input.startDate,
      startTime: input.startTime || "09:00",
      frequency: pace === 2 ? "biweekly" : "weekly",
      durationWeeks: steps.length,
      facilitatorId: input.facilitatorId || null,
      attendees: attendees.map((a) => ({ name: a.name || undefined, email: a.email })),
      steps,
    },
    actorId,
  );

  let invited = 0;
  const failedInvites: { email: string; reason: string }[] = [];
  if (input.sendInvitations) {
    for (const a of attendees) {
      try {
        await createUserInvitation({ email: a.email, role: ROLES.PARTICIPANT, inviteMethod: "email", invitedBy: actorId, scheduledSendAt: input.invitationSendAt ?? null });
        invited += 1;
      } catch (e) {
        const reason = e instanceof Error ? e.message : "Unknown error";
        failedInvites.push({ email: a.email, reason });
        console.error("[admin-start] invite failed", a.email, reason);
      }
    }
  }

  let started = false;
  if (input.startChallenge) {
    await sendExperience(experience.id, actorId);
    started = true;
  }

  let visibility = 0;
  if (input.visibility) {
    visibility = await grantChallengeTypeVisibility(type.id, input.visibility, actorId);
  }

  // Leader track: a companion experience carrying the 5 leader coaching emails, with the
  // facilitator as its only attendee. Never let this take the main launch down.
  let leaderTrack: { experienceId: string; steps: number } | null = null;
  if (joiner && track === "leader") {
    try {
      leaderTrack = await createLeaderTrackExperience({
        contact: joiner,
        facilitatorId: input.facilitatorId || actorId,
        startDate: input.startDate,
        startTime: input.startTime || "09:00",
        frequency: pace === 2 ? "biweekly" : "weekly",
        groupName: input.name,
        actorId,
        start: input.startChallenge,
      });
    } catch (e) {
      console.error("[admin-start] leader track failed", e);
    }
  }

  return {
    experienceId: experience.id,
    attendees: attendees.length,
    invited,
    failedInvites,
    started,
    visibility,
    joinedAs: joiner ? track : null,
    leaderExperienceId: leaderTrack?.experienceId ?? null,
  };
}

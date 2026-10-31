import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { upsertParticipant } from "@/lib/pilot/repository";
import { PARTICIPANT_TYPES } from "@/lib/pilot/constants";
import { scoreCheckIn } from "@/lib/check-in/created-for-more";
import { scoreEnergyAudit } from "@/lib/energy-audit/energy-audit";
import { alertCheckIn } from "@/lib/notifications/check-in-alert";
import { alertEnergyAudit } from "@/lib/notifications/energy-audit-alert";
import { getAssessment } from "@/lib/assessments/registry";

// Saves a completed assessment to the member's account — called the moment the
// results are shown (no "Send my results" press needed), and when a signed-out
// visitor's results are attached after they sign in. One row per attempt: the
// client sends the same attempt id for every save of one sitting, so re-renders,
// edited answers and the sign-in hand-off update that row instead of adding rows.
// A retake is a new attempt, which keeps Steward's trend history.

export type SaveProfile = { id: string; email: string; firstName: string; lastName: string };

export type SaveResult = { id: string; created: boolean };

export class AssessmentSaveError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const ATTEMPT_ID = /^[A-Za-z0-9-]{8,64}$/;

export async function saveAssessmentResult(input: {
  key: string;
  profile: SaveProfile;
  answers: unknown;
  attemptId: string;
}): Promise<SaveResult> {
  const def = getAssessment(input.key);
  if (!def) throw new AssessmentSaveError("Unknown assessment.", 404);
  if (!ATTEMPT_ID.test(input.attemptId)) throw new AssessmentSaveError("Missing attempt id.", 400);
  const answers = def.cleanAnswers(input.answers);
  if (!answers) throw new AssessmentSaveError("Please answer every statement first.", 400);

  const db = createSupabaseAdminClient();
  const name = [input.profile.firstName, input.profile.lastName].filter(Boolean).join(" ").trim() || null;
  const email = input.profile.email.trim().toLowerCase() || null;
  const computed = { answers, ...def.columns(answers) };
  const computedDetails = def.details?.(answers) ?? {};

  const existing = await findAttempt(input.attemptId);
  if (existing) {
    if (existing.assessment !== def.key) throw new AssessmentSaveError("Attempt belongs to another assessment.", 409);
    if (existing.profile_id && existing.profile_id !== input.profile.id) throw new AssessmentSaveError("Attempt belongs to another account.", 403);
    const { error } = await db
      .from("check_in_submissions")
      .update({
        ...computed,
        profile_id: input.profile.id,
        name: existing.name ?? name,
        email: existing.email ?? email,
        details: { ...(existing.details ?? {}), ...computedDetails, attempt_id: input.attemptId },
      })
      .eq("id", existing.id);
    if (error) throw error;
    return { id: existing.id, created: false };
  }

  const { data, error } = await db
    .from("check_in_submissions")
    .insert({
      assessment: def.key,
      profile_id: input.profile.id,
      name,
      email,
      ...computed,
      details: { ...computedDetails, attempt_id: input.attemptId },
    })
    .select("id")
    .single();
  if (error) {
    // Two saves of the same attempt raced; the other one won — use its row.
    if (error.code === "23505") {
      const winner = await findAttempt(input.attemptId);
      if (winner) return { id: winner.id, created: false };
    }
    throw error;
  }

  const id = data.id as string;
  await afterFirstSave(def.key, { id, name, email, answers }).catch((e) =>
    console.error(`[assessments] ${def.key} follow-up failed`, e instanceof Error ? e.message : e),
  );
  return { id, created: true };
}

type AttemptRow = {
  id: string;
  assessment: string;
  profile_id: string | null;
  name: string | null;
  email: string | null;
  details: Record<string, unknown> | null;
};

async function findAttempt(attemptId: string): Promise<AttemptRow | null> {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("check_in_submissions")
    .select("id,assessment,profile_id,name,email,details")
    .eq("details->>attempt_id", attemptId)
    .maybeSingle();
  return (data as AttemptRow | null) ?? null;
}

/**
 * A submission saved by an earlier auto-save, if it belongs to this person —
 * the "Send my results" / "Save" routes then update it instead of adding a row.
 */
export async function ownedSubmission(id: unknown, profileId: string | null, assessment: string) {
  if (!profileId || typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("check_in_submissions")
    .select("id,participant_id,details")
    .eq("id", id)
    .eq("assessment", assessment)
    .eq("profile_id", profileId)
    .maybeSingle();
  return (data as { id: string; participant_id: string | null; details: Record<string, unknown> | null } | null) ?? null;
}

/**
 * What happens once per new result: the team alert, and for the Check-In the
 * participant record the pilot reports count. Best-effort — the result is saved.
 */
async function afterFirstSave(key: string, row: { id: string; name: string | null; email: string | null; answers: Record<string, number> }) {
  const db = createSupabaseAdminClient();

  if (key === "created-for-more") {
    const score = scoreCheckIn(row.answers);
    let participantId: string | null = null;
    if (row.email && row.name) {
      const [firstName, ...rest] = row.name.split(/\s+/);
      participantId = await upsertParticipant({
        firstName: firstName || row.name,
        lastName: rest.join(" "),
        email: row.email,
        waveSource: "created_for_more_check_in",
        participantType: PARTICIPANT_TYPES.GENERAL,
        consent: {},
      })
        .then((p) => p.id)
        .catch(() => null);
      if (participantId) {
        await db.from("check_in_submissions").update({ participant_id: participantId }).eq("id", row.id);
        await db.from("participants").update({ check_in_status: "completed" }).eq("id", participantId);
      }
    }
    await alertCheckIn({ name: row.name, email: row.email, score, participantId });
    return;
  }

  if (key === "energy-audit") {
    const score = scoreEnergyAudit(row.answers);
    await alertEnergyAudit({ name: row.name, email: row.email, score, auditId: row.id, focusSource: score.lowest });
  }
}

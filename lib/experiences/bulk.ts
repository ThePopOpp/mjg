// Bulk actions on a group's email sequence.
//
// Everything here operates on a SET OF STEP NUMBERS within one experience — the
// altitude the Email Automation views work at ("Week 3 and everything after it"),
// rather than individual per-recipient rows.
//
// The re-anchor is the important one. Moving "Week 3" to a new date has to move
// TWO things, and forgetting the second is the bug that bites later:
//
//   1. experience_send_events — the queued sends for the people already in the
//      group, which is what everyone sees.
//   2. experience_steps.offset_value — the schedule DEFINITION. add-attendee.ts
//      computes a newcomer's dates from it, so a group whose events moved but
//      whose offsets did not will silently give anyone added afterwards the old
//      pre-shift dates.
//
// SERVICE-ROLE ONLY: callers must already have proved they may manage this
// experience (requireExperienceManager for admins, or ownership for a
// facilitator — see assertCanManageExperience below).

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logUserActivity } from "@/lib/user-management/repository";
import { ROLES, normalizeAppRole } from "@/lib/rbac/roles";

/** Statuses a queued email can be in. */
export type SendEventStatus = "scheduled" | "sent" | "skipped" | "failed" | "paused";

export type BulkResult = {
  ok: true;
  /** Rows actually changed — the honest count, not the number requested. */
  affected: number;
  /** Per-step summary for the confirmation message. */
  steps: number[];
  message: string;
  /** Set when a re-anchor also moved the schedule definition. */
  offsetsShiftedDays?: number;
};

const MS_DAY = 86_400_000;

function uniqueSteps(steps: unknown): number[] {
  const list = Array.isArray(steps) ? steps : [];
  return Array.from(new Set(list.map((s) => Number(s)).filter((n) => Number.isInteger(n) && n > 0))).sort((a, b) => a - b);
}

function plural(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}

/**
 * Authorisation for both callers. Admins who can manage experiences may act on
 * any group; a facilitator may only act on a group they run. Throwing here means
 * no route can forget the ownership check.
 */
export async function assertCanManageExperience(
  experienceId: string,
  actor: { id: string; role?: string | null },
): Promise<void> {
  const role = normalizeAppRole(actor.role);
  if (role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN) return;

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("experiences")
    .select("id, facilitator_id")
    .eq("id", experienceId)
    .maybeSingle();

  if (!data) throw new Error("That group was not found.");
  if (data.facilitator_id !== actor.id) {
    throw new Error("You can only change the schedule for a group you run.");
  }
}

type Ctx = { actorId: string; experienceId: string };

async function loadEvents(experienceId: string, steps: number[]) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("experience_send_events")
    .select("id, step_number, status, scheduled_at, sent_at")
    .eq("experience_id", experienceId)
    .in("step_number", steps);
  if (error) throw new Error(error.message);
  return data ?? [];
}

async function audit(ctx: Ctx, action: string, summary: string, metadata: Record<string, unknown>) {
  await logUserActivity({
    actorUserId: ctx.actorId,
    action,
    entityType: "experience",
    entityId: ctx.experienceId,
    metadata: { summary, ...metadata },
  }).catch(() => {
    /* the audit log must never be why a legitimate schedule change fails */
  });
}

// ── Pause / resume ───────────────────────────────────────────────────────────

/** Hold selected emails. Only queued ones can be held; sent ones are left alone. */
export async function pauseSteps(ctx: Ctx, rawSteps: unknown): Promise<BulkResult> {
  const steps = uniqueSteps(rawSteps);
  if (!steps.length) throw new Error("Select at least one email first.");

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("experience_send_events")
    .update({ status: "paused" })
    .eq("experience_id", ctx.experienceId)
    .in("step_number", steps)
    .eq("status", "scheduled")
    .select("id");
  if (error) throw new Error(error.message);

  const affected = (data ?? []).length;
  const message = affected
    ? `Paused ${plural(affected, "queued send")} across ${plural(steps.length, "email")}. They will not go out until you resume them.`
    : "Nothing to pause — those emails have already gone out, or are paused already.";
  await audit(ctx, "experience_steps_paused", message, { steps, affected });
  return { ok: true, affected, steps, message };
}

export async function resumeSteps(ctx: Ctx, rawSteps: unknown): Promise<BulkResult> {
  const steps = uniqueSteps(rawSteps);
  if (!steps.length) throw new Error("Select at least one email first.");

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("experience_send_events")
    .update({ status: "scheduled" })
    .eq("experience_id", ctx.experienceId)
    .in("step_number", steps)
    .eq("status", "paused")
    .select("id, scheduled_at");
  if (error) throw new Error(error.message);

  const affected = (data ?? []).length;
  // A resumed email whose time already passed goes out on the scheduler's next
  // run. Say so, rather than letting it surprise anyone.
  const overdue = (data ?? []).filter((r) => new Date(r.scheduled_at as string).getTime() < Date.now()).length;
  const message = affected
    ? `Resumed ${plural(affected, "send")}.${overdue ? ` ${plural(overdue, "of them is", "of them are")} already past their send time and will go out on the next run.` : ""}`
    : "Nothing to resume — none of those emails were paused.";
  await audit(ctx, "experience_steps_resumed", message, { steps, affected, overdue });
  return { ok: true, affected, steps, message };
}

// ── Reschedule ───────────────────────────────────────────────────────────────

export type RescheduleMode =
  /** Put the EARLIEST selected email on `at`, and move the rest by the same delta. */
  | "anchor"
  /** Put every selected email on exactly `at`. */
  | "absolute"
  /** Move every selected email by `days`. */
  | "shift";

export type RescheduleInput = {
  mode: RescheduleMode;
  /** ISO datetime — required for "anchor" and "absolute". */
  at?: string;
  /** Required for "shift". May be negative. */
  days?: number;
  /**
   * Also move experience_steps.offset_value so people added later inherit the
   * new dates. On by default for anchor/shift, where it is almost always right.
   */
  updateDefinition?: boolean;
};

/**
 * Move selected emails. "anchor" is the one the owner reaches for: pick Week 3,
 * give it a new date, and the rest of the selection keeps its spacing.
 */
export async function rescheduleSteps(ctx: Ctx, rawSteps: unknown, input: RescheduleInput): Promise<BulkResult> {
  const steps = uniqueSteps(rawSteps);
  if (!steps.length) throw new Error("Select at least one email first.");

  const events = await loadEvents(ctx.experienceId, steps);
  // A sent email has no queue row to move; resend re-opens it instead.
  const movable = events.filter((e) => e.status === "scheduled" || e.status === "paused");
  if (!movable.length) {
    throw new Error("Those emails have all been sent already. Use Resend to send one again on a new date.");
  }

  let deltaMs = 0;
  let absoluteAt: Date | null = null;

  if (input.mode === "shift") {
    const days = Number(input.days);
    if (!Number.isFinite(days) || days === 0) throw new Error("Choose how many days to move these emails by.");
    deltaMs = Math.round(days) * MS_DAY;
  } else {
    if (!input.at) throw new Error("Choose a date and time.");
    const target = new Date(input.at);
    if (Number.isNaN(target.getTime())) throw new Error("That date and time could not be read.");
    if (input.mode === "absolute") {
      absoluteAt = target;
    } else {
      // Anchor on the earliest movable send, so the selection keeps its shape.
      const earliest = movable
        .map((e) => new Date(e.scheduled_at as string).getTime())
        .reduce((a, b) => Math.min(a, b));
      deltaMs = target.getTime() - earliest;
      if (deltaMs === 0) throw new Error("Those emails are already on that date and time.");
    }
  }

  const supabase = createSupabaseAdminClient();
  let affected = 0;

  if (absoluteAt) {
    const { data, error } = await supabase
      .from("experience_send_events")
      .update({ scheduled_at: absoluteAt.toISOString() })
      .in("id", movable.map((e) => e.id))
      .select("id");
    if (error) throw new Error(error.message);
    affected = (data ?? []).length;
  } else {
    // Per-row, because each keeps its own offset from the anchor. The set is one
    // sequence for one group, so this is tens of rows, not thousands.
    for (const event of movable) {
      const next = new Date(new Date(event.scheduled_at as string).getTime() + deltaMs).toISOString();
      const { error } = await supabase.from("experience_send_events").update({ scheduled_at: next }).eq("id", event.id);
      if (error) throw new Error(error.message);
      affected++;
    }
  }

  // Keep the schedule definition in step so later joiners get the new dates.
  let offsetsShiftedDays: number | undefined;
  const shiftDays = Math.round(deltaMs / MS_DAY);
  if (input.updateDefinition !== false && !absoluteAt && shiftDays !== 0) {
    const { data: defs } = await supabase
      .from("experience_steps")
      .select("id, step_number, offset_value, offset_unit")
      .eq("experience_id", ctx.experienceId)
      .in("step_number", steps);

    for (const def of defs ?? []) {
      // Only day-based offsets can absorb a day shift cleanly; week/month offsets
      // are left alone rather than silently mangled.
      if (def.offset_unit !== "day") continue;
      await supabase
        .from("experience_steps")
        .update({ offset_value: Number(def.offset_value) + shiftDays })
        .eq("id", def.id);
    }
    offsetsShiftedDays = shiftDays;
  }

  const when = absoluteAt ?? new Date(new Date(movable[0].scheduled_at as string).getTime() + deltaMs);
  // Same warning resumeSteps gives: a move backwards can leave sends overdue,
  // and overdue means "goes out on the next run", not "goes out on that date".
  const nowMs = Date.now();
  const overdueAfter = absoluteAt
    ? (absoluteAt.getTime() < nowMs ? movable.length : 0)
    : movable.filter((e) => new Date(e.scheduled_at as string).getTime() + deltaMs < nowMs).length;
  const overdueNote = overdueAfter
    ? ` ${plural(overdueAfter, "is", "are")} now past their send time and will go out on the next run.`
    : "";

  const message =
    (input.mode === "absolute"
      ? `Moved ${plural(steps.length, "email")} to ${when.toISOString()}.`
      : `Moved ${plural(steps.length, "email")} by ${shiftDays >= 0 ? "+" : ""}${shiftDays} day${Math.abs(shiftDays) === 1 ? "" : "s"}, keeping the spacing between them.`) +
    overdueNote;

  await audit(ctx, "experience_steps_rescheduled", message, {
    steps, affected, mode: input.mode, shiftDays, at: input.at ?? null, offsetsShiftedDays, overdueAfter,
  });
  return { ok: true, affected, steps, message, offsetsShiftedDays };
}

// ── Resend ───────────────────────────────────────────────────────────────────

/**
 * Re-open already-sent emails so they go out again.
 *
 * experience_send_events is UNIQUE (attendee_id, step_number), so a resend
 * cannot add a second row — the existing rows are reset. That overwrites the
 * record of the original send, so it is copied into the audit log first.
 */
export async function resendSteps(
  ctx: Ctx,
  rawSteps: unknown,
  input: { at?: string; updateDefinition?: boolean },
): Promise<BulkResult> {
  const steps = uniqueSteps(rawSteps);
  if (!steps.length) throw new Error("Select at least one email first.");

  const at = input.at ? new Date(input.at) : new Date();
  if (Number.isNaN(at.getTime())) throw new Error("That date and time could not be read.");

  const events = await loadEvents(ctx.experienceId, steps);
  const resendable = events.filter((e) => e.status === "sent" || e.status === "failed");
  if (!resendable.length) throw new Error("None of those emails have been sent yet, so there is nothing to resend.");

  const supabase = createSupabaseAdminClient();
  const history = resendable.map((e) => ({ id: e.id, step: e.step_number, status: e.status, sentAt: e.sent_at }));

  const { data, error } = await supabase
    .from("experience_send_events")
    .update({
      status: "scheduled",
      scheduled_at: at.toISOString(),
      sent_at: null,
      provider: null,
      provider_message_id: null,
      error_message: null,
      last_attempt_at: null,
    })
    .in("id", resendable.map((e) => e.id))
    .select("id");
  if (error) throw new Error(error.message);

  const affected = (data ?? []).length;
  const message = `Queued ${plural(affected, "send")} to go out again. Everyone who already received ${steps.length === 1 ? "this email" : "these emails"} will receive ${steps.length === 1 ? "it" : "them"} a second time.`;
  await audit(ctx, "experience_steps_resent", message, { steps, affected, at: at.toISOString(), previousSends: history });
  return { ok: true, affected, steps, message };
}

// Steward lifecycle arithmetic — activation clocks, refund windows, renewal grace.
//
// Every rule here is transcribed from CONFIG/dec09_lifecycle_policies.example.json
// in the accepted docset. Nothing is invented, and where that file leaves a value
// null (provider_retry_schedule, final_invoice_disposition) this module has no
// opinion either — lib/steward/config.ts throws instead.
//
// FOUR SEMANTICS THAT ARE EASY TO GET WRONG, stated once so the functions below
// can be read against them:
//
//   1. "START_INCLUSIVE_END_EXCLUSIVE". A 30-day window starting at T covers
//      [T, T+30d). An instant exactly equal to the end is OUTSIDE the window.
//      Getting this backwards hands out a free extra day on every term and makes
//      a refund window off by one in the customer's favour — which sounds
//      harmless until it is the 90-day automatic refund.
//
//   2. "LAST_VALID_DAY_IF_TARGET_ANNIVERSARY_INVALID". Adding 12 calendar months
//      to 29 Feb or 31 Jan must land on the last valid day of the target month,
//      not spill into the next one. JavaScript's Date does spill: new Date(2026,
//      0, 31) plus one month is 3 March. That is a real billing bug.
//
//   3. "store_utc_instants" + "display_timezone_change_moves_interval: false".
//      Day and month arithmetic is done in America/Phoenix, because a "calendar
//      day" is a local-calendar idea, but the result is stored as a UTC instant
//      and never recomputed from a display timezone.
//
//   4. "request_received_time_controls". Refund eligibility is judged on when
//      the REQUEST arrived, not when staff processed it. Every window function
//      therefore takes the request instant explicitly rather than reading a clock.
//
// Arizona does not observe DST, so America/Phoenix is a fixed UTC-7. That makes
// the local-calendar arithmetic below exact rather than approximate, and it is
// the reason the docset picked that timezone. If the billing timezone ever
// changes to one with DST, these helpers must move to a real timezone library.

/** Fixed offset for America/Phoenix (MST, no DST). */
const PHOENIX_OFFSET_MINUTES = -7 * 60;

/** Instant -> the Phoenix wall-clock fields, carried on a UTC-based Date. */
function toPhoenixParts(instant: Date): Date {
  return new Date(instant.getTime() + PHOENIX_OFFSET_MINUTES * 60_000);
}

/** Phoenix wall-clock fields -> the UTC instant they name. */
function fromPhoenixParts(parts: Date): Date {
  return new Date(parts.getTime() - PHOENIX_OFFSET_MINUTES * 60_000);
}

/** Days in a given month, 1-indexed month. */
function daysInMonth(year: number, month1: number): number {
  return new Date(Date.UTC(year, month1, 0)).getUTCDate();
}

/**
 * Adds whole calendar days in the billing timezone.
 *
 * With a DST-free timezone this is the same as adding 24h per day, but it is
 * written as calendar arithmetic so the intent survives a timezone change.
 */
export function addCalendarDays(instant: Date, days: number): Date {
  const p = toPhoenixParts(instant);
  p.setUTCDate(p.getUTCDate() + days);
  return fromPhoenixParts(p);
}

/**
 * Adds whole calendar months, clamping to the last valid day of the target
 * month rather than spilling forward.
 *
 *   2026-01-31 + 1 month  -> 2026-02-28   (not 2026-03-03)
 *   2028-02-29 + 12 months-> 2029-02-28   (not 2029-03-01)
 */
export function addCalendarMonths(instant: Date, months: number): Date {
  const p = toPhoenixParts(instant);
  const day = p.getUTCDate();

  // Move to the 1st first, so the month shift cannot overflow on the way.
  p.setUTCDate(1);
  p.setUTCMonth(p.getUTCMonth() + months);

  const maxDay = daysInMonth(p.getUTCFullYear(), p.getUTCMonth() + 1);
  p.setUTCDate(Math.min(day, maxDay));
  return fromPhoenixParts(p);
}

/**
 * Start-inclusive, end-exclusive membership: start <= at < end.
 *
 * An `end` of null means "no expiry" and the interval is open-ended.
 */
export function isWithin(at: Date, start: Date, end: Date | null): boolean {
  if (at.getTime() < start.getTime()) return false;
  if (end === null) return true;
  return at.getTime() < end.getTime();
}

// == Activation ==============================================================

export type ActivationPolicy = {
  /** Calendar days from confirmed payment in which activation stays available. */
  activationDeadlineDays: number;
  /** Calendar days of the initial build window. */
  buildDays: number;
  /** Calendar months of the initial premium term. */
  premiumMonths: number;
  policyVersion: string;
};

export type ActivationWindows = {
  activatedAt: Date;
  buildStartsAt: Date;
  buildEndsAt: Date;
  premiumStartsAt: Date;
  premiumEndsAt: Date;
  /** Activation + premiumMonths. The billing anniversary. */
  renewalAnchorAt: Date;
};

/**
 * The clocks an activation starts.
 *
 * Both windows start at the SAME instant — the docset is explicit that the
 * initial build sits inside the premium term (initial_build_inside_term: true),
 * so these run concurrently, not in sequence. Treating them as sequential would
 * give a member 12 months of premium starting a month late.
 */
export function computeActivationWindows(activatedAt: Date, policy: ActivationPolicy): ActivationWindows {
  const premiumEndsAt = addCalendarMonths(activatedAt, policy.premiumMonths);
  return {
    activatedAt,
    buildStartsAt: activatedAt,
    buildEndsAt: addCalendarDays(activatedAt, policy.buildDays),
    premiumStartsAt: activatedAt,
    premiumEndsAt,
    // first_due: ACTIVATION_PLUS_12_CALENDAR_MONTHS — the same instant the
    // initial term ends, which is why end-exclusive matters: the renewal charge
    // is for the term that begins there.
    renewalAnchorAt: premiumEndsAt,
  };
}

/** The last instant at which an unactivated purchase may still be activated. */
export function activationDeadline(paidAt: Date, policy: ActivationPolicy): Date {
  return addCalendarDays(paidAt, policy.activationDeadlineDays);
}

export function canActivate(input: { paidAt: Date; at: Date; policy: ActivationPolicy }): boolean {
  return isWithin(input.at, input.paidAt, activationDeadline(input.paidAt, input.policy));
}

// == Refund windows ==========================================================

export type RefundPolicy = {
  initialPostActivationDays: number;
  annualChargeDays: number;
  unusedUnactivatedDays: number;
};

export type RefundWindowKind =
  | "before_activation"
  | "initial_post_activation"
  | "annual_charge"
  | "unused_unactivated";

export type RefundAssessment = {
  eligible: boolean;
  kind: RefundWindowKind | null;
  /** Full refund, per before_activation: "FULL". */
  full: boolean;
  reason: string;
};

/**
 * Which refund window, if any, a request falls in.
 *
 * `requestedAt` is the moment the REQUEST was received, never "now" — the
 * docset sets request_received_time_controls, so a request that arrived in time
 * stays eligible however long it then sits in a queue.
 *
 * The windows genuinely overlap, so order matters. Before activation wins,
 * because it is the only one that is unconditionally full.
 */
export function assessRefund(input: {
  requestedAt: Date;
  paidAt: Date;
  activatedAt: Date | null;
  /** Most recent annual renewal charge, when the request is about a renewal. */
  lastAnnualChargeAt?: Date | null;
  policy: RefundPolicy;
}): RefundAssessment {
  const { requestedAt, paidAt, activatedAt, lastAnnualChargeAt, policy } = input;

  if (activatedAt === null) {
    // Not activated. Full refund, and after the automatic window it is not a
    // request at all — the docset has it initiated automatically.
    const autoAt = addCalendarDays(paidAt, policy.unusedUnactivatedDays);
    if (!isWithin(requestedAt, paidAt, autoAt)) {
      return {
        eligible: true,
        kind: "unused_unactivated",
        full: true,
        reason: `Unactivated past ${policy.unusedUnactivatedDays} days — refunded automatically, not on request.`,
      };
    }
    return {
      eligible: true,
      kind: "before_activation",
      full: true,
      reason: "Requested before activation — refunded in full.",
    };
  }

  const postActivationEnd = addCalendarDays(activatedAt, policy.initialPostActivationDays);
  if (isWithin(requestedAt, activatedAt, postActivationEnd)) {
    return {
      eligible: true,
      kind: "initial_post_activation",
      full: true,
      // "including meaningful use" — usage is explicitly NOT a disqualifier,
      // and private_content_inspection is false, so nobody reads someone's
      // Blueprint to decide whether they used it enough.
      reason: `Within ${policy.initialPostActivationDays} days of activation. Meaningful use does not disqualify.`,
    };
  }

  if (lastAnnualChargeAt) {
    const annualEnd = addCalendarDays(lastAnnualChargeAt, policy.annualChargeDays);
    if (isWithin(requestedAt, lastAnnualChargeAt, annualEnd)) {
      return {
        eligible: true,
        kind: "annual_charge",
        full: true,
        // annual_refund_preserves_initial_full_qualification: refunding a
        // renewal must not claw back the original full acquisition.
        reason: `Within ${policy.annualChargeDays} days of the annual renewal charge. The initial full purchase is unaffected.`,
      };
    }
  }

  return {
    eligible: false,
    kind: null,
    full: false,
    reason: "Outside every refund window. Statutory rights are unaffected.",
  };
}

// == Renewal grace ===========================================================

/**
 * Whether paid access still stands during the grace period after a failed
 * renewal.
 *
 * Three rules the docset is specific about, and all three are easy to get wrong:
 *   - the grace is anchored to PRIOR_PAID_THROUGH_END, not to the failure;
 *   - retries do NOT reset it (retry_resets: false), so a provider retrying on
 *     day 5 does not buy another 7 days;
 *   - it never applies to a failed INITIAL purchase
 *     (initial_failed_purchase_eligible: false) — there is no paid term to
 *     extend, so a failed first payment grants nothing.
 */
export function isWithinRenewalGrace(input: {
  at: Date;
  paidThroughEnd: Date;
  graceDays: number;
  isInitialPurchase: boolean;
}): boolean {
  if (input.isInitialPurchase) return false;
  const graceEnd = addCalendarDays(input.paidThroughEnd, input.graceDays);
  return isWithin(input.at, input.paidThroughEnd, graceEnd);
}

/** When advance notice of an annual renewal is due. */
export function annualNoticeDueAt(renewalAt: Date, advanceDays: number): Date {
  return addCalendarDays(renewalAt, -advanceDays);
}

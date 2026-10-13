// Tests for the Steward lifecycle arithmetic.
//
// These are the rules that decide what a paying customer gets, so they are
// tested against the exact edges the docset calls out: end-exclusive bounds,
// invalid month anniversaries, concurrent build/premium terms, overlapping
// refund windows, and a renewal grace that retries must not reset.
//
// Run: node lib/steward/lifecycle.test.mjs

import {
  addCalendarDays,
  addCalendarMonths,
  annualNoticeDueAt,
  assessRefund,
  activationDeadline,
  canActivate,
  computeActivationWindows,
  isWithin,
  isWithinRenewalGrace,
} from "./lifecycle.ts";

let pass = 0;
let fail = 0;
const failures = [];

function check(name, actual, expected) {
  const a = actual instanceof Date ? actual.toISOString() : JSON.stringify(actual);
  const e = expected instanceof Date ? expected.toISOString() : JSON.stringify(expected);
  if (a === e) {
    pass++;
  } else {
    fail++;
    failures.push(`  ${name}\n      got      ${a}\n      expected ${e}`);
  }
}

/** 08:00 Phoenix == 15:00 UTC, year round. */
const d = (iso) => new Date(iso);

const POLICY = { activationDeadlineDays: 90, buildDays: 30, premiumMonths: 12, policyVersion: "dec09_lifecycle_v1" };
const REFUND = { initialPostActivationDays: 14, annualChargeDays: 14, unusedUnactivatedDays: 90 };

// -- calendar days ----------------------------------------------------------
check("add 30 days", addCalendarDays(d("2026-10-13T15:00:00Z"), 30), d("2026-11-12T15:00:00Z"));
check("add days across year end", addCalendarDays(d("2026-12-20T15:00:00Z"), 30), d("2027-01-19T15:00:00Z"));
check("negative days", addCalendarDays(d("2026-03-01T15:00:00Z"), -1), d("2026-02-28T15:00:00Z"));
check("leap day exists in 2028", addCalendarDays(d("2028-02-28T15:00:00Z"), 1), d("2028-02-29T15:00:00Z"));

// -- calendar months, the clamping rule -------------------------------------
check("Jan 31 + 1 month clamps to Feb 28", addCalendarMonths(d("2026-01-31T15:00:00Z"), 1), d("2026-02-28T15:00:00Z"));
check("Jan 31 + 1 month clamps to Feb 29 in a leap year", addCalendarMonths(d("2028-01-31T15:00:00Z"), 1), d("2028-02-29T15:00:00Z"));
check("Feb 29 + 12 months clamps to Feb 28", addCalendarMonths(d("2028-02-29T15:00:00Z"), 12), d("2029-02-28T15:00:00Z"));
check("Mar 31 + 1 month clamps to Apr 30", addCalendarMonths(d("2026-03-31T15:00:00Z"), 1), d("2026-04-30T15:00:00Z"));
check("plain 12 months", addCalendarMonths(d("2026-10-13T15:00:00Z"), 12), d("2027-10-13T15:00:00Z"));
check("month add keeps time of day", addCalendarMonths(d("2026-10-13T22:30:00Z"), 1), d("2026-11-13T22:30:00Z"));

// -- end-exclusive bounds ---------------------------------------------------
const s = d("2026-10-13T15:00:00Z");
const e = d("2026-11-12T15:00:00Z");
check("start is inside", isWithin(s, s, e), true);
check("one ms before end is inside", isWithin(new Date(e.getTime() - 1), s, e), true);
check("exact end is OUTSIDE", isWithin(e, s, e), false);
check("before start is outside", isWithin(new Date(s.getTime() - 1), s, e), false);
check("null end means open-ended", isWithin(d("2099-01-01T00:00:00Z"), s, null), true);

// -- activation windows run CONCURRENTLY ------------------------------------
const act = computeActivationWindows(d("2026-10-13T15:00:00Z"), POLICY);
check("build starts at activation", act.buildStartsAt, d("2026-10-13T15:00:00Z"));
check("premium starts at the SAME instant", act.premiumStartsAt, act.buildStartsAt);
check("build ends +30 days", act.buildEndsAt, d("2026-11-12T15:00:00Z"));
check("premium ends +12 months", act.premiumEndsAt, d("2027-10-13T15:00:00Z"));
check("renewal anchor == premium end", act.renewalAnchorAt, act.premiumEndsAt);
check("build window sits inside the premium term", act.buildEndsAt.getTime() < act.premiumEndsAt.getTime(), true);

const actLeap = computeActivationWindows(d("2028-02-29T15:00:00Z"), POLICY);
check("activation on a leap day renews Feb 28", actLeap.premiumEndsAt, d("2029-02-28T15:00:00Z"));

// -- activation deadline ----------------------------------------------------
const paid = d("2026-10-13T15:00:00Z");
check("deadline is +90 days", activationDeadline(paid, POLICY), d("2027-01-11T15:00:00Z"));
check("can activate on day 0", canActivate({ paidAt: paid, at: paid, policy: POLICY }), true);
check("can activate on day 89", canActivate({ paidAt: paid, at: addCalendarDays(paid, 89), policy: POLICY }), true);
check("cannot activate exactly at day 90", canActivate({ paidAt: paid, at: addCalendarDays(paid, 90), policy: POLICY }), false);

// -- refunds ----------------------------------------------------------------
const r1 = assessRefund({ requestedAt: addCalendarDays(paid, 10), paidAt: paid, activatedAt: null, policy: REFUND });
check("unactivated within 90d -> before_activation, full", [r1.kind, r1.full], ["before_activation", true]);

const r2 = assessRefund({ requestedAt: addCalendarDays(paid, 95), paidAt: paid, activatedAt: null, policy: REFUND });
check("unactivated past 90d -> automatic unused refund", [r2.kind, r2.eligible], ["unused_unactivated", true]);

const activated = addCalendarDays(paid, 5);
const r3 = assessRefund({ requestedAt: addCalendarDays(activated, 13), paidAt: paid, activatedAt: activated, policy: REFUND });
check("day 13 after activation -> eligible", [r3.kind, r3.eligible], ["initial_post_activation", true]);

const r4 = assessRefund({ requestedAt: addCalendarDays(activated, 14), paidAt: paid, activatedAt: activated, policy: REFUND });
check("day 14 after activation -> OUTSIDE (end-exclusive)", r4.eligible, false);

const renewal = d("2027-10-13T15:00:00Z");
const r5 = assessRefund({
  requestedAt: addCalendarDays(renewal, 3), paidAt: paid, activatedAt: activated,
  lastAnnualChargeAt: renewal, policy: REFUND,
});
check("within 14d of the annual charge -> eligible", [r5.kind, r5.eligible], ["annual_charge", true]);

const r6 = assessRefund({
  requestedAt: addCalendarDays(renewal, 20), paidAt: paid, activatedAt: activated,
  lastAnnualChargeAt: renewal, policy: REFUND,
});
check("20d after the annual charge -> not eligible", r6.eligible, false);

// -- renewal grace ----------------------------------------------------------
const paidThrough = d("2027-10-13T15:00:00Z");
check("day 0 of grace is inside",
  isWithinRenewalGrace({ at: paidThrough, paidThroughEnd: paidThrough, graceDays: 7, isInitialPurchase: false }), true);
check("day 6 is inside",
  isWithinRenewalGrace({ at: addCalendarDays(paidThrough, 6), paidThroughEnd: paidThrough, graceDays: 7, isInitialPurchase: false }), true);
check("day 7 is OUTSIDE (end-exclusive)",
  isWithinRenewalGrace({ at: addCalendarDays(paidThrough, 7), paidThroughEnd: paidThrough, graceDays: 7, isInitialPurchase: false }), false);
check("a failed INITIAL purchase gets no grace at all",
  isWithinRenewalGrace({ at: paidThrough, paidThroughEnd: paidThrough, graceDays: 7, isInitialPurchase: true }), false);
// retry_resets: false — grace is anchored to paid-through end, so a retry
// partway through cannot extend it. Same anchor in, same answer out.
check("a retry on day 5 does not extend the grace",
  isWithinRenewalGrace({ at: addCalendarDays(paidThrough, 8), paidThroughEnd: paidThrough, graceDays: 7, isInitialPurchase: false }), false);

// -- notices ----------------------------------------------------------------
check("annual notice is 30 days ahead", annualNoticeDueAt(d("2027-10-13T15:00:00Z"), 30), d("2027-09-13T15:00:00Z"));

// -- report -----------------------------------------------------------------
console.log(`\n${pass} passed, ${fail} failed`);
if (failures.length) {
  console.log("\nFAILURES:");
  for (const f of failures) console.log(f);
}
process.exit(fail === 0 ? 0 : 1);

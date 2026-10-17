// Tests for the definition-state evaluator.
//
// These are STATE-001 as assertions. The handoff notice names two cases that
// have to hold in both directions, and they are the first two groups below:
// an approved field must not promote its parent, and a section may be settled
// with a nonessential field still in flight.
//
// Run: node lib/steward/state.test.mjs

import {
  countNeedsClarity,
  currentWording,
  evaluateFieldState,
  evaluateSection,
  evaluateSectionState,
} from "./state.ts";

let passed = 0;
let failed = 0;

function is(actual, expected, label) {
  if (actual === expected) {
    passed += 1;
  } else {
    failed += 1;
    console.error(`  ✗ ${label}\n      expected: ${expected}\n      actual:   ${actual}`);
  }
}

function group(name, fn) {
  console.log(`\n${name}`);
  fn();
}

/** Shorthand builders. */
const approved = (value, needs_clarity = false) => ({
  content_state: "participant_approved",
  value,
  needs_clarity,
  superseded_at: null,
});
const proposed = (value) => ({
  content_state: "proposed",
  value,
  needs_clarity: false,
  superseded_at: null,
});
const field = (field_key, essential, versions) => ({ field_key, essential, versions });

// ---------------------------------------------------------------------------

group("An approved field does NOT promote its parent section", () => {
  const fields = [
    field("bedrock", true, [approved("I am held, not measured.")]),
    field("foundation", true, []),
    field("practice", true, []),
  ];

  is(evaluateFieldState(fields[0]), "defined_for_this_season", "the approved field itself is settled");
  is(evaluateSectionState(fields), "taking_shape", "but the section is only taking shape");

  // The same assertion the other way round: completing the rest settles it.
  const complete = fields.map((f) => field(f.field_key, true, [approved("something real")]));
  is(evaluateSectionState(complete), "defined_for_this_season", "all essential fields settled -> section settled");
});

group("A section may be settled with a nonessential field still in flight", () => {
  const fields = [
    field("who", true, [approved("Dave. Thursday mornings.")]),
    field("cadence", true, [approved("Weekly, before work.")]),
    field("backup_person", false, [proposed("Maybe my brother?")]),
  ];

  is(evaluateFieldState(fields[2]), "taking_shape", "the nonessential field is taking shape");
  is(evaluateSectionState(fields), "defined_for_this_season", "the section is still settled");
});

group("Needs Clarity is a content marker, never a state", () => {
  const unclear = field("foundation", true, [approved("Still working this out.", true)]);
  is(evaluateFieldState(unclear), "taking_shape", "a clarity-flagged field is taking shape, not a fourth state");

  const section = [
    field("bedrock", true, [approved("Settled wording.")]),
    unclear,
  ];
  is(evaluateSectionState(section), "taking_shape", "one unclear essential field holds the section back");

  is(countNeedsClarity(section), 1, "markers are counted as markers");
});

group("Nothing started", () => {
  is(evaluateSectionState([]), "not_yet_explored", "a section with no fields");
  is(
    evaluateSectionState([field("a", true, []), field("b", true, [])]),
    "not_yet_explored",
    "a section whose fields are all empty",
  );
  is(
    evaluateFieldState(field("a", true, [approved("   ")])),
    "not_yet_explored",
    "whitespace-only wording is absent, not approved",
  );
});

group("Work in a nonessential field still counts as having come to the page", () => {
  const fields = [field("required", true, []), field("optional", false, [proposed("a first thought")])];
  is(evaluateSectionState(fields), "taking_shape", "not not_yet_explored — the participant has been here");
});

group("Superseded wording is not current", () => {
  const rewritten = field("phone", true, [
    { content_state: "participant_approved", value: "Old wording.", needs_clarity: false, superseded_at: "2026-10-01T00:00:00Z" },
    proposed("New wording, not yet approved."),
  ]);
  is(currentWording(rewritten), null, "a superseded approval is not the current wording");
  is(evaluateFieldState(rewritten), "taking_shape", "a field mid-rewrite is taking shape again");

  const onlySuperseded = field("phone", true, [
    { content_state: "participant_approved", value: "Old.", needs_clarity: false, superseded_at: "2026-10-01T00:00:00Z" },
  ]);
  is(evaluateFieldState(onlySuperseded), "not_yet_explored", "nothing live left");
});

group("A proposal alone never settles anything", () => {
  const unapproved = field("guardrail", true, [proposed("I don't answer yes on the spot.")]);
  is(evaluateFieldState(unapproved), "taking_shape", "proposed is not approved");
  is(
    evaluateSectionState([unapproved]),
    "taking_shape",
    "a section of proposals is taking shape — the model cannot settle a page by writing one",
  );
});

group("evaluateSection returns both axes from one pass", () => {
  const fields = [
    field("a", true, [approved("one")]),
    field("b", true, [proposed("two")]),
    field("c", false, []),
  ];
  const result = evaluateSection(fields);
  is(result.sectionState, "taking_shape", "section state");
  is(result.fieldStates.a, "defined_for_this_season", "field a");
  is(result.fieldStates.b, "taking_shape", "field b");
  is(result.fieldStates.c, "not_yet_explored", "field c");
  is(result.ruleVersion, "functional-sufficiency-v1", "rule version is stamped");
});

group("A section of only optional fields is not stuck forever", () => {
  const fields = [field("note", false, [approved("Something I want to remember.")])];
  is(evaluateSectionState(fields), "defined_for_this_season", "no essential fields -> the optional ones are the bar");
});

// ---------------------------------------------------------------------------

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);

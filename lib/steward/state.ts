// The definition-state evaluator — the STATE-001 fix, as code.
//
// Clause D25 keeps six facts independent. This file derives exactly ONE of
// them: definition state, for a field and (separately) for the section that
// holds it. It must not be handed persistence results, entitlements, consents
// or practice evidence, and it is not given them: the input types below have no
// room for any of those.
//
// WHAT "FUNCTIONAL SUFFICIENCY" MEANS, and what it does not:
//
//   It is NOT a count of filled boxes, and it is NOT a percentage. A section is
//   Defined for This Season when the things that make the page USABLE are
//   settled — which the docset expresses as: every essential field carries
//   wording the participant approved and did not flag as unclear.
//
//   Two consequences the docset names explicitly, both tested:
//     * One approved field NEVER promotes its parent section on its own.
//     * A section may be Defined for This Season while a NONESSENTIAL field is
//       still Taking Shape. That is correct, not a gap to close.
//
// "Needs Clarity" is a CONTENT MARKER on a wording object, not a fourth
// definition state. It is read here only as evidence that a field is not yet
// settled — it is never returned as a state, and `DefinitionState` has no
// fourth member for it to leak into.

export type DefinitionState = "not_yet_explored" | "taking_shape" | "defined_for_this_season";

export type ContentState = "exploratory" | "proposed" | "participant_approved" | "superseded";

/** The rule set used, stamped onto the row so a state can be read back later. */
export const STATE_RULE_VERSION = "functional-sufficiency-v1";

/** One wording object, as far as the evaluator is concerned. */
export type WordingInput = {
  content_state: ContentState;
  /** The exact approved words, or a draft. Whitespace-only counts as absent. */
  value: string;
  needs_clarity: boolean;
  /** Set once another version replaces this one. */
  superseded_at?: string | null;
};

export type FieldInput = {
  field_key: string;
  /** False for a field whose absence does not stop the page being usable. */
  essential: boolean;
  versions: WordingInput[];
};

/** The wording currently in force: approved, and not yet superseded. */
export function currentWording(field: FieldInput): WordingInput | null {
  return (
    field.versions.find(
      (v) => v.content_state === "participant_approved" && !v.superseded_at && v.value.trim().length > 0,
    ) ?? null
  );
}

/**
 * Definition state for ONE field.
 *
 *   nothing at all                     -> not_yet_explored
 *   something in flight, not approved  -> taking_shape
 *   approved, but flagged unclear      -> taking_shape
 *   approved and clear                 -> defined_for_this_season
 *
 * An approved-but-superseded version is not current wording: a field whose only
 * approved version has been replaced by a draft is back to taking_shape, which
 * is the honest reading of "they are rewriting this".
 */
export function evaluateFieldState(field: FieldInput): DefinitionState {
  const live = field.versions.filter((v) => !v.superseded_at && v.value.trim().length > 0);
  if (live.length === 0) return "not_yet_explored";

  const approved = currentWording(field);
  if (!approved) return "taking_shape";

  // The marker makes the wording insufficient. It does not become a state.
  return approved.needs_clarity ? "taking_shape" : "defined_for_this_season";
}

/**
 * Definition state for a SECTION, derived from its fields.
 *
 * Deliberately not `Math.max` over the children. A section is settled only when
 * every essential field is settled; until then it is taking shape, however many
 * individual fields are done.
 */
export function evaluateSectionState(fields: FieldInput[]): DefinitionState {
  if (fields.length === 0) return "not_yet_explored";

  const states = fields.map((f) => ({ field: f, state: evaluateFieldState(f) }));

  // Nothing started anywhere — including in nonessential fields, because a
  // participant who has written only an optional note HAS come to this page.
  if (states.every((s) => s.state === "not_yet_explored")) return "not_yet_explored";

  const essential = states.filter((s) => s.field.essential);

  // A section with no essential fields at all is settled once anything in it
  // is. Rare, but a page of purely optional prompts should not be permanently
  // stuck at taking_shape.
  const bar = essential.length > 0 ? essential : states;

  return bar.every((s) => s.state === "defined_for_this_season")
    ? "defined_for_this_season"
    : "taking_shape";
}

/** How many fields carry a clarity marker. A count of markers, not of states. */
export function countNeedsClarity(fields: FieldInput[]): number {
  return fields.filter((f) => {
    const live = f.versions.filter((v) => !v.superseded_at);
    return live.some((v) => v.needs_clarity);
  }).length;
}

/**
 * The whole evaluation for one section, ready to write back.
 *
 * Returns field states as well as the section state, because they are stored
 * separately and must be written from the same pass — deriving one from the
 * other later is how they drift apart.
 */
export function evaluateSection(fields: FieldInput[]): {
  sectionState: DefinitionState;
  fieldStates: Record<string, DefinitionState>;
  needsClarityCount: number;
  ruleVersion: string;
} {
  const fieldStates: Record<string, DefinitionState> = {};
  for (const field of fields) fieldStates[field.field_key] = evaluateFieldState(field);

  return {
    sectionState: evaluateSectionState(fields),
    fieldStates,
    needsClarityCount: countNeedsClarity(fields),
    ruleVersion: STATE_RULE_VERSION,
  };
}

/** Display labels. The three states, and only these three. */
export const DEFINITION_STATE_LABEL: Record<DefinitionState, string> = {
  not_yet_explored: "Not Yet Explored",
  taking_shape: "Taking Shape",
  defined_for_this_season: "Defined for This Season",
};

/**
 * Definition state for a DERIVED page — one that summarises others.
 *
 * My North Star is the only one today. It "summarizes the underlying Blueprint
 * rather than redefining it", so it is exactly as settled as the least settled
 * page it draws on. Taking the lowest rather than an average is deliberate: an
 * overview that reads as finished while a page beneath it is empty is the
 * "finished-looking participant" the docset forbids.
 */
export function evaluateDerivedSectionState(sourceStates: DefinitionState[]): DefinitionState {
  if (sourceStates.length === 0) return "not_yet_explored";
  const order: DefinitionState[] = ["not_yet_explored", "taking_shape", "defined_for_this_season"];
  return sourceStates.reduce((lowest, state) =>
    order.indexOf(state) < order.indexOf(lowest) ? state : lowest,
  );
}

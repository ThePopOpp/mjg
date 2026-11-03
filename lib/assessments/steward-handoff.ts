// Finishing an assessment hands the member to Steward.
//
// The results screen counts down and opens /steward?from=<assessment key>; Steward's
// live conversation sees `from` and opens with the member asking about those results,
// in their own words, so the first thing Steward does is talk about what they just saw.
// Signed-out visitors go the same way after signing in from the save-results modal.
//
// Client-safe (no server imports) — the registry in ./registry.ts is server-only.
// A new assessment adds its opener here.

export const STEWARD_HANDOFF_SECONDS = 6;

const OPENERS: Record<string, string> = {
  "created-for-more": "I just finished the Created for More Check-In. Can we talk about what my results mean for me?",
  "energy-audit": "I just finished the Energy Audit. Can we talk about what my results mean for me?",
};

export function stewardHandoffHref(assessment: string) {
  return `/steward?from=${encodeURIComponent(assessment)}`;
}

/** The first message Steward receives after a handoff, or null for an unknown key. */
export function stewardHandoffOpener(from: string | null | undefined): string | null {
  return (from && OPENERS[from]) || null;
}

// Publication readiness checks for legal documents.
//
// The 2026-10-09 package tells us what to enforce, in its own words:
//
//   "DRAFT ONLY — Verify all factual descriptions against production
//    architecture and obtain qualified legal review before publication.
//    Bracketed items are not settled. Do not publish this draft with
//    placeholders."
//
// A prompt or a checklist is not an enforcement mechanism. These functions are
// what the publish endpoint actually calls, so "do not publish with
// placeholders" is a 422 rather than a reminder someone can click past.
//
// Deliberately biased toward refusing: a false positive costs someone a minute
// editing wording, while a false negative publishes "[INSERT ON PUBLICATION]"
// or a page headed "ATTORNEY REVIEW DRAFT" as the site's governing terms.

export type LegalIssue = {
  kind: "placeholder" | "draft-marker";
  /** The exact text found, trimmed for display. */
  text: string;
  /** 1-indexed line in the markdown, for jumping to it in the editor. */
  line: number;
};

/**
 * Bracketed runs that are not markdown links and not empty checkboxes.
 *
 * - `[INSERT ON PUBLICATION]`, `[CONFIRM]`, `[LINK TO TERMS]` -> placeholders.
 * - `[text](url)` -> a markdown link, skipped via the trailing `(` check.
 * - `[ ]` / `[]` -> a consent checkbox in the UI copy document, skipped.
 *
 * Nested brackets are not expected in these documents, so the inner class
 * simply excludes `[` and `]`.
 */
const BRACKETED = /\[([^[\]]*)\]/g;

/** Headings and callouts that mark a document as not ready for the public. */
const DRAFT_MARKERS = [
  /ATTORNEY\s+REVIEW\s+DRAFT/i,
  /\bDRAFT\s+ONLY\b/i,
  /^#.*\bDRAFT\b/im,
  /\bPUBLIC\s+PAGE\s+DRAFT\b/i,
  /\bINTERNAL\s+DRAFT\b/i,
  /FINALIZE\s+BEFORE\s+ACCEPTING\s+PAYMENTS/i,
  /\bCounsel\s+to\s+(finalize|supply)\b/i,
];

function lineOf(markdown: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < markdown.length; i++) {
    if (markdown[i] === "\n") line++;
  }
  return line;
}

/** Every unresolved placeholder and draft marker, in document order. */
export function findLegalIssues(markdown: string): LegalIssue[] {
  const issues: LegalIssue[] = [];

  BRACKETED.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = BRACKETED.exec(markdown)) !== null) {
    const inner = match[1];
    const after = markdown[match.index + match[0].length];

    // `[text](url)` is a link, not a placeholder.
    if (after === "(") continue;
    // `[ ]` is a consent checkbox in the account/consent copy.
    if (inner.trim() === "") continue;

    issues.push({
      kind: "placeholder",
      text: match[0].length > 120 ? `${match[0].slice(0, 117)}…` : match[0],
      line: lineOf(markdown, match.index),
    });
  }

  for (const marker of DRAFT_MARKERS) {
    const found = markdown.match(marker);
    if (found && typeof found.index === "number") {
      issues.push({
        kind: "draft-marker",
        text: found[0].trim(),
        line: lineOf(markdown, found.index),
      });
    }
  }

  return issues.sort((a, b) => a.line - b.line);
}

export type LegalReadiness = {
  ready: boolean;
  issues: LegalIssue[];
  placeholderCount: number;
  draftMarkerCount: number;
  /** One sentence suitable for an error response or a UI banner. */
  reason: string | null;
};

/** Whether a markdown body may be published, and why not when it may not. */
export function checkLegalReadiness(markdown: string): LegalReadiness {
  const issues = findLegalIssues(markdown);
  const placeholderCount = issues.filter((i) => i.kind === "placeholder").length;
  const draftMarkerCount = issues.filter((i) => i.kind === "draft-marker").length;

  const body = markdown.trim();
  if (body.length === 0) {
    return {
      ready: false,
      issues,
      placeholderCount,
      draftMarkerCount,
      reason: "The document is empty.",
    };
  }

  if (issues.length === 0) {
    return { ready: true, issues, placeholderCount, draftMarkerCount, reason: null };
  }

  const parts: string[] = [];
  if (placeholderCount > 0) {
    parts.push(`${placeholderCount} unresolved placeholder${placeholderCount === 1 ? "" : "s"}`);
  }
  if (draftMarkerCount > 0) {
    parts.push(`${draftMarkerCount} draft marker${draftMarkerCount === 1 ? "" : "s"}`);
  }

  return {
    ready: false,
    issues,
    placeholderCount,
    draftMarkerCount,
    reason: `This document still contains ${parts.join(" and ")}. Resolve them before publishing — the package's own instruction is "Do not publish this draft with placeholders."`,
  };
}

import { readFileSync } from "node:fs";
import path from "node:path";
import { getPublishedLegalDocument, listPublishedLegalDocuments } from "@/lib/legal/data";
import { markdownToHtml, extractEffectiveDate } from "./markdown";

// Legal pages (/privacy, /terms, /sms-terms, /ai-trust) and the /legal index.
//
// This file loads the content; the pages themselves are React, inside the
// marketing layout (app/(marketing)/<slug>, components/marketing/pages/legal.tsx),
// so they share the site's navigation and footer.
//
// The published body now comes from public.legal_documents, so these pages can
// be edited in the dashboard (CMS -> Legal) instead of requiring a deploy. The
// markdown in docs/legal remains the import source and, for /privacy and
// /terms, the FALLBACK: if the published row is missing for any reason, the
// route serves the file rather than 404ing, because Twilio's A2P 10DLC campaign
// registration requires both URLs to stay publicly reachable. A page that is
// only a draft — /sms-terms and /ai-trust today — has no fallback and 404s,
// which is correct: it has not been published yet.

// NOTE: the fallback reads from disk at runtime, so docs/legal MUST be COPY'd
// into the Docker runtime stage — see the Dockerfile. It works in `next dev`
// regardless (the repo is on disk), so a missing COPY only shows up in production.
function readLegalDoc(file: string) {
  const filePath = path.join(process.cwd(), "docs", "legal", file);
  try {
    return readFileSync(filePath, "utf8");
  } catch (error) {
    // A bare ENOENT here says nothing about the cause; name it.
    throw new Error(
      `Legal document not found at ${filePath}. If this is production, docs/legal is missing from the runtime image — check the COPY in the Dockerfile. (${
        error instanceof Error ? error.message : String(error)
      })`,
    );
  }
}

export type LegalDocumentView = {
  title: string;
  eyebrow: string;
  /** "July 16, 2026", or null when the document carries no date. */
  effective: string | null;
  /** Rendered from markdown we control (CMS -> Legal or docs/legal). */
  bodyHtml: string;
  related: Array<{ slug: string; title: string }>;
};

function formatDate(isoDate: string) {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Loads a legal page by slug, or null when it should 404.
 *
 * Resolution order: the published row in legal_documents, then `fallbackFile`
 * when one is given, then null. `fallbackFile` is only supplied for the two
 * A2P-10DLC-required pages — see the note at the top of this file.
 */
export async function loadLegalDocument(input: {
  slug: string;
  title: string;
  eyebrow: string;
  fallbackFile?: string;
}): Promise<LegalDocumentView | null> {
  let markdown: string | null = null;
  let title = input.title;
  let eyebrow = input.eyebrow;
  let effectiveOverride: string | null = null;

  try {
    const published = await getPublishedLegalDocument(input.slug);
    if (published) {
      markdown = published.body_md;
      title = published.title || title;
      eyebrow = published.eyebrow || eyebrow;
      effectiveOverride = published.effective_date;
    }
  } catch {
    // A database problem must not take down a page the SMS registration depends
    // on. Fall through to the file when there is one.
  }

  if (markdown === null) {
    if (!input.fallbackFile) return null;
    markdown = readLegalDoc(input.fallbackFile);
  }

  let related: Array<{ slug: string; title: string }> = [];
  try {
    related = (await listPublishedLegalDocuments())
      .filter((d) => d.slug !== input.slug)
      .map((d) => ({ slug: d.slug, title: d.title }));
  } catch {
    // The related-links card is a convenience; losing it must not fail the page.
  }

  // The doc's own H1 and "Effective Date" line are lifted into the page header,
  // then dropped from the body so they don't render twice. A published
  // document's own effective_date column wins: it is the value someone
  // deliberately set in the dashboard, where the markdown may still carry the
  // package's "Effective: [INSERT]" line.
  const effective = effectiveOverride ? formatDate(effectiveOverride) : extractEffectiveDate(markdown);
  const bodyHtml = markdownToHtml(
    markdown
      .replace(/^#\s+.*$/m, "")
      // "Effective Date:" is how the A2P documents write it; the 2026-10-09
      // package uses a bare "Effective:". Both are lifted into the header, so
      // both are dropped here or they render twice.
      .replace(/^\*\*Effective(?:\s+Date)?:\*\*.*$/gim, "")
      .replace(/^\*\*Last Updated:\*\*.*$/m, "")
      .trim(),
  );

  return { title, eyebrow, effective: effective || null, bodyHtml, related };
}

/** The /legal index: every published document, newest wording first as listed. */
export async function loadLegalIndex(): Promise<Array<{ slug: string; title: string; summary: string; effective: string | null }>> {
  try {
    return (await listPublishedLegalDocuments()).map((d) => ({
      slug: d.slug,
      title: d.title,
      summary: d.summary,
      effective: d.effective_date ? formatDate(d.effective_date) : null,
    }));
  } catch {
    // An empty index still renders the contact details, which are the part a
    // person actually needs to exercise a privacy right.
    return [];
  }
}

import { readFileSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getPublishedLegalDocument, listPublishedLegalDocuments } from "@/lib/legal/data";
import { LEGAL_ENTITY, PRIVACY_EMAIL, SUPPORT_EMAIL } from "@/lib/legal/addresses";
import { markdownToHtml, extractEffectiveDate } from "./markdown";
import {
  publicSiteUrl,
  renderFaviconLinks,
  renderFonts,
  renderInstallScript,
  renderNavScript,
  renderNavStyles,
  renderPwaHeadTags,
  renderSiteFooter,
  renderSiteHeader,
  renderThemeScript,
} from "./static-pages";

// Legal pages (/privacy, /terms, /sms-terms, /ai-trust).
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

/**
 * Serves a legal page by slug.
 *
 * Resolution order: the published row in legal_documents, then `fallbackFile`
 * when one is given, then 404. `fallbackFile` is only supplied for the two
 * A2P-10DLC-required pages — see the note at the top of this file.
 */
export async function renderLegalRoute(input: {
  slug: string;
  title: string;
  eyebrow: string;
  fallbackFile?: string;
}) {
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
    if (!input.fallbackFile) {
      return new NextResponse("Not found", { status: 404 });
    }
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

  return renderLegalPage({ markdown, title, eyebrow, effectiveOverride, related });
}

export function renderLegalPage(input: {
  markdown: string;
  title: string;
  eyebrow: string;
  effectiveOverride?: string | null;
  related?: Array<{ slug: string; title: string }>;
}) {
  const siteUrl = publicSiteUrl();
  const markdown = input.markdown;

  // The doc's own H1 and "Effective Date" line are lifted into the page header,
  // then dropped from the body so they don't render twice.
  // A published document's own effective_date column wins: it is the value
  // someone deliberately set in the dashboard, where the markdown may still
  // carry the package's "Effective: [INSERT]" line.
  const effective =
    input.effectiveOverride
      ? new Date(`${input.effectiveOverride}T00:00:00Z`).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "UTC",
        })
      : extractEffectiveDate(markdown);
  const body = markdownToHtml(
    markdown
      .replace(/^#\s+.*$/m, "")
      // "Effective Date:" is how the A2P documents write it; the 2026-10-09
      // package uses a bare "Effective:". Both are lifted into the header, so
      // both are dropped here or they render twice.
      .replace(/^\*\*Effective(?:\s+Date)?:\*\*.*$/gim, "")
      .replace(/^\*\*Last Updated:\*\*.*$/m, "")
      .trim(),
  );

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${input.title} | Michael J. Gauthier</title>
  <meta name="description" content="${input.title} for Michael J. Gauthier — Created for More and The Stewardship Blueprint." />
  ${renderFaviconLinks()}
  ${renderPwaHeadTags()}
  ${renderThemeScript()}
  ${renderFonts()}
  <style>
    ${renderNavStyles()}

    *, *::before, *::after { box-sizing: border-box; }

    :root {
      --paper: #fbfaf7;
      --ink: #070807;
      --muted: #5f6d66;
      --line: #e4ded2;
      --gold: #C9A46E;
      --card: #ffffff;
    }
    [data-theme="dark"] {
      --paper: #10110f;
      --ink: #f8f6f1;
      --muted: #b6bcb6;
      --line: #2b2a25;
      --card: #1a1b18;
    }

    body { margin:0; background:var(--paper); color:var(--ink); font-family:var(--font-body); }

    .legal-hero { padding:72px 20px 40px; border-bottom:1px solid var(--line); }
    .legal-hero-inner { max-width:820px; margin:0 auto; }
    .legal-eyebrow {
      display:inline-flex; border:1px solid var(--line); border-radius:999px; padding:7px 16px;
      color:var(--gold); font-weight:700; letter-spacing:.16em; text-transform:uppercase; font-size:11px; margin-bottom:20px;
    }
    .legal-hero h1 { font-family:var(--font-display); font-size:clamp(34px,6vw,58px); line-height:1.05; margin:0 0 14px; }
    .legal-updated { color:var(--muted); font-size:14px; margin:0; }

    .legal-body { max-width:820px; margin:0 auto; padding:44px 20px 88px; }
    .legal-body h2 {
      font-family:var(--font-display); font-size:26px; line-height:1.25;
      margin:44px 0 14px; padding-top:20px; border-top:1px solid var(--line);
    }
    .legal-body h2:first-child { margin-top:0; padding-top:0; border-top:0; }
    .legal-body h3 { font-size:17px; font-weight:700; margin:28px 0 10px; color:var(--ink); }
    .legal-body p { color:var(--muted); font-size:16px; line-height:1.75; margin:0 0 16px; }
    .legal-body ul, .legal-body ol { color:var(--muted); font-size:16px; line-height:1.75; margin:0 0 16px; padding-left:22px; }
    .legal-body li { margin:0 0 8px; }
    .legal-body strong { color:var(--ink); font-weight:600; }
    .legal-body a { color:var(--gold); text-decoration:underline; text-underline-offset:2px; }
    .legal-body a:hover { opacity:.8; }
    .legal-body hr { border:0; border-top:1px solid var(--line); margin:32px 0; }
    .legal-body code { font-size:14px; background:var(--card); border:1px solid var(--line); border-radius:4px; padding:1px 5px; }

    /* Quick links to the consent pages Twilio reviews alongside these documents. */
    .legal-related { max-width:820px; margin:0 auto 88px; padding:0 20px; }
    .legal-related-card { border:1px solid var(--line); border-radius:12px; background:var(--card); padding:22px 24px; }
    .legal-related h4 { font-family:var(--font-display); font-size:19px; margin:0 0 6px; color:var(--ink); }
    .legal-related p { color:var(--muted); font-size:14px; line-height:1.7; margin:0 0 14px; }
    .legal-related-links { display:flex; flex-wrap:wrap; gap:10px; }
    .legal-related-links a {
      display:inline-flex; align-items:center; border:1px solid var(--line); border-radius:8px;
      padding:8px 14px; font-size:14px; font-weight:600; color:var(--ink); text-decoration:none; transition:border-color .2s,color .2s;
    }
    .legal-related-links a:hover { border-color:var(--gold); color:var(--gold); }
  </style>
</head>
<body>
  ${renderSiteHeader(siteUrl)}

  <main>
    <section class="legal-hero">
      <div class="legal-hero-inner">
        <div class="legal-eyebrow">${input.eyebrow}</div>
        <h1>${input.title}</h1>
        ${effective ? `<p class="legal-updated">Effective ${effective}</p>` : ""}
      </div>
    </section>

    <article class="legal-body">
      ${body}
    </article>

    <section class="legal-related">
      <div class="legal-related-card">
        <h4>Manage your communication preferences</h4>
        <p>You can opt in or out of text messages and emails at any time. Opting out of one doesn&rsquo;t affect the other.</p>
        <div class="legal-related-links">
          <a href="/sms/opt-in">SMS opt-in</a>
          <a href="/sms/opt-out">SMS opt-out</a>
          <a href="/email/opt-in">Email opt-in</a>
          <a href="/email/opt-out">Email opt-out</a>
        </div>
      </div>
      ${
        (input.related ?? []).length > 0
          ? `<div class="legal-related-card" style="margin-top:16px">
        <h4>Other policies</h4>
        <p>The rest of the documents that govern this service.</p>
        <div class="legal-related-links">
          ${(input.related ?? []).map((d) => `<a href="/${d.slug}">${d.title}</a>`).join("\n          ")}
        </div>
      </div>`
          : ""
      }
    </section>
  </main>

  ${renderSiteFooter(siteUrl)}
  ${renderNavScript()}
  ${renderInstallScript()}
</body>
</html>`;

  return new NextResponse(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}

/**
 * /legal — an index of the published legal documents.
 *
 * The footer links here rather than to each policy individually, because which
 * documents exist changes as they are published. /privacy and /terms keep their
 * own direct footer links: those two URLs are registered with the A2P 10DLC
 * campaign and must not move.
 */
export async function renderLegalIndexRoute() {
  const siteUrl = publicSiteUrl();

  let docs: Array<{ slug: string; title: string; summary: string; effective_date: string | null }> = [];
  try {
    docs = await listPublishedLegalDocuments();
  } catch {
    // An empty index still renders the contact details below, which are the
    // part a person actually needs to exercise a privacy right.
  }

  const cards = docs
    .map((d) => {
      const effective = d.effective_date
        ? new Date(`${d.effective_date}T00:00:00Z`).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "UTC",
          })
        : null;
      return `<a class="legal-index-card" href="/${d.slug}">
          <h3>${d.title}</h3>
          ${d.summary ? `<p>${d.summary}</p>` : ""}
          ${effective ? `<span class="legal-index-date">Effective ${effective}</span>` : ""}
        </a>`;
    })
    .join("\n        ");

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Legal &amp; Trust | Michael J. Gauthier</title>
  <meta name="description" content="Policies and trust documents for services operated by ${LEGAL_ENTITY.name}." />
  ${renderFaviconLinks()}
  ${renderPwaHeadTags()}
  ${renderThemeScript()}
  ${renderFonts()}
  <style>
    ${renderNavStyles()}
    *, *::before, *::after { box-sizing: border-box; }
    :root { --paper:#fbfaf7; --ink:#070807; --muted:#5f6d66; --line:#e4ded2; --gold:#C9A46E; --card:#ffffff; }
    [data-theme="dark"] { --paper:#10110f; --ink:#f8f6f1; --muted:#b6bcb6; --line:#2b2a25; --card:#1a1b18; }
    body { margin:0; background:var(--paper); color:var(--ink); font-family:var(--font-body); }
    .legal-hero { padding:72px 20px 40px; border-bottom:1px solid var(--line); }
    .legal-hero-inner { max-width:820px; margin:0 auto; }
    .legal-eyebrow { display:inline-flex; border:1px solid var(--line); border-radius:999px; padding:7px 16px;
      color:var(--gold); font-weight:700; letter-spacing:.16em; text-transform:uppercase; font-size:11px; margin-bottom:20px; }
    .legal-hero h1 { font-family:var(--font-display); font-size:clamp(34px,6vw,58px); line-height:1.05; margin:0 0 14px; }
    .legal-hero p { color:var(--muted); font-size:17px; line-height:1.7; margin:0; max-width:60ch; }
    .legal-index { max-width:820px; margin:0 auto; padding:44px 20px 20px; display:grid; gap:14px; }
    .legal-index-card { display:block; border:1px solid var(--line); border-radius:12px; background:var(--card);
      padding:22px 24px; text-decoration:none; transition:border-color .2s; }
    .legal-index-card:hover { border-color:var(--gold); }
    .legal-index-card h3 { font-family:var(--font-display); font-size:21px; margin:0 0 6px; color:var(--ink); }
    .legal-index-card p { color:var(--muted); font-size:15px; line-height:1.65; margin:0 0 10px; }
    .legal-index-date { color:var(--gold); font-size:12px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; }
    .legal-contact { max-width:820px; margin:0 auto; padding:24px 20px 88px; }
    .legal-contact-card { border:1px solid var(--line); border-radius:12px; background:var(--card); padding:22px 24px; }
    .legal-contact h4 { font-family:var(--font-display); font-size:19px; margin:0 0 10px; color:var(--ink); }
    .legal-contact p { color:var(--muted); font-size:15px; line-height:1.75; margin:0 0 8px; }
    .legal-contact a { color:var(--gold); }
    .legal-contact address { color:var(--muted); font-size:15px; line-height:1.75; font-style:normal; margin-top:12px; }
  </style>
</head>
<body>
  ${renderSiteHeader(siteUrl)}
  <main>
    <section class="legal-hero">
      <div class="legal-hero-inner">
        <div class="legal-eyebrow">Legal &amp; Trust</div>
        <h1>Legal &amp; Trust</h1>
        <p>The policies that govern services operated by ${LEGAL_ENTITY.name}.</p>
      </div>
    </section>

    <section class="legal-index">
      ${cards || `<p style="color:var(--muted)">No policies have been published yet.</p>`}
    </section>

    <section class="legal-contact">
      <div class="legal-contact-card">
        <h4>Contact</h4>
        <p>General account and product support: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
        <p>To access, correct, export or delete your personal information: <a href="mailto:${PRIVACY_EMAIL}">${PRIVACY_EMAIL}</a></p>
        <address>
          ${LEGAL_ENTITY.name}<br />
          ${LEGAL_ENTITY.addressLines.join("<br />\n          ")}
        </address>
      </div>
    </section>
  </main>
  ${renderSiteFooter(siteUrl)}
  ${renderNavScript()}
  ${renderInstallScript()}
</body>
</html>`;

  return new NextResponse(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}

import { readFileSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
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

// Legal pages (/privacy, /terms) — rendered straight from the markdown in
// docs/legal, so the document the team edits IS the published page; there's no
// second copy to drift. Twilio's A2P 10DLC review needs these publicly reachable,
// alongside the SMS/email opt-in and opt-out pages.

export function renderLegalPage(input: { file: string; title: string; eyebrow: string }) {
  const siteUrl = publicSiteUrl();
  const markdown = readFileSync(path.join(process.cwd(), "docs", "legal", input.file), "utf8");

  // The doc's own H1 and "Effective Date" line are lifted into the page header,
  // then dropped from the body so they don't render twice.
  const effective = extractEffectiveDate(markdown);
  const body = markdownToHtml(
    markdown
      .replace(/^#\s+.*$/m, "")
      .replace(/^\*\*Effective Date:\*\*.*$/m, "")
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
    </section>
  </main>

  ${renderSiteFooter(siteUrl)}
  ${renderNavScript()}
  ${renderInstallScript()}
</body>
</html>`;

  return new NextResponse(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}

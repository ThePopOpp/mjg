import { NextResponse } from "next/server";
import { getPublishedImpactScore } from "@/lib/content/impact-score";
import {
  publicSiteUrl,
  renderFaviconLinks,
  renderFonts,
  renderNavScript,
  renderNavStyles,
  renderSiteHeader,
  renderThemeScript,
} from "@/lib/public-site/static-pages";

const ICON_SVGS: Record<string, string> = {
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  refresh: '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  "trending-up": '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  dollar: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
  gift: '<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  building: '<rect x="2" y="7" width="9" height="14"/><rect x="13" y="3" width="9" height="18"/><path d="M6 21v-2"/><path d="M17 21v-2"/>',
};

function iconSvg(name: string) {
  const paths = ICON_SVGS[name] ?? ICON_SVGS.star;
  return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

export async function GET() {
  const siteUrl = publicSiteUrl();
  const score = await getPublishedImpactScore();

  const headline = score?.headline ?? "Tracking Progress Towards";
  const goalLabel = score?.goal_label ?? "$1 Billion";
  const bodyText = score?.body_text ?? "Every dollar given, every investment made with purpose — it all counts. This is our running total of the real-world impact created by our community.";
  const categories: Array<{ icon: string; title: string; description: string }> = score?.categories ?? [];

  const categoryCards = categories
    .map(
      (cat) => `
      <div class="impact-cat-card">
        <div class="impact-cat-icon">${iconSvg(cat.icon)}</div>
        <div class="impact-cat-title">${cat.title}</div>
        <div class="impact-cat-desc">${cat.description}</div>
      </div>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Mission | Michael J. Gauthier</title>
  ${renderFaviconLinks()}
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
      --green: #315f43;
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

    body {
      margin: 0;
      background: var(--paper);
      color: var(--ink);
      font-family: var(--font-body);
    }

    /* ── Mission hero ── */
    .mission-hero {
      padding: 80px 20px 72px;
      text-align: center;
      background: var(--paper);
      border-bottom: 1px solid var(--line);
    }
    .mission-hero-inner { max-width: 760px; margin: 0 auto; }
    .mission-eyebrow {
      display: inline-flex;
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 8px 18px;
      color: var(--gold);
      font-weight: 700;
      letter-spacing: .16em;
      text-transform: uppercase;
      font-size: 12px;
      margin-bottom: 28px;
    }
    .mission-hero h1 {
      font-family: var(--font-display);
      font-size: clamp(38px, 7vw, 72px);
      line-height: 1;
      margin: 0 0 24px;
      color: var(--ink);
    }
    .mission-hero p {
      color: var(--muted);
      font-size: 18px;
      line-height: 1.7;
      max-width: 660px;
      margin: 0 auto 36px;
    }
    .mission-cta {
      display: inline-block;
      background: var(--ink);
      color: var(--paper);
      padding: 14px 28px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      transition: opacity .2s;
    }
    .mission-cta:hover { opacity: .85; }

    /* ── Impact Score section ── */
    .impact-section {
      background: #0d0e0c;
      color: #f8f6f1;
      padding: 80px 20px;
    }
    .impact-inner { max-width: 1080px; margin: 0 auto; }

    .impact-eyebrow {
      font-family: var(--font-body);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .2em;
      text-transform: uppercase;
      color: #C9A46E;
      margin-bottom: 16px;
    }
    .impact-heading {
      font-family: var(--font-display);
      font-size: clamp(32px, 5.5vw, 58px);
      line-height: 1.05;
      color: #f8f6f1;
      margin: 0 0 20px;
    }
    .impact-heading .impact-goal {
      color: #C9A46E;
      font-style: italic;
    }
    .impact-body {
      font-size: 16px;
      line-height: 1.7;
      color: rgba(248,246,241,.65);
      max-width: 640px;
      margin: 0 0 56px;
    }

    .impact-categories {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
    }
    .impact-cat-card {
      background: rgba(255,255,255,.05);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 10px;
      padding: 28px 24px;
    }
    .impact-cat-icon {
      color: #C9A46E;
      margin-bottom: 14px;
    }
    .impact-cat-title {
      font-weight: 600;
      font-size: 15px;
      color: #f8f6f1;
      margin-bottom: 8px;
    }
    .impact-cat-desc {
      font-size: 13px;
      line-height: 1.6;
      color: rgba(248,246,241,.55);
    }
  </style>
</head>
<body>
  ${renderSiteHeader(siteUrl)}

  <main>
    <section class="mission-hero">
      <div class="mission-hero-inner">
        <div class="mission-eyebrow">Mission</div>
        <h1>Created for God-given purpose.</h1>
        <p>Encouraging and inspiring people to use their God-given resources, time, talents, and treasure, for the people and causes God has placed on their hearts.</p>
        <a href="${siteUrl}/#join" class="mission-cta">Join the Journey</a>
      </div>
    </section>

    <section class="impact-section">
      <div class="impact-inner">
        <div class="impact-eyebrow">What Drives Us</div>
        <h2 class="impact-heading">${headline} <span class="impact-goal">${goalLabel}</span></h2>
        <p class="impact-body">${bodyText}</p>

        ${categoryCards ? `<div class="impact-categories">${categoryCards}</div>` : ""}
      </div>
    </section>
  </main>

  ${renderNavScript()}
</body>
</html>`;

  return new NextResponse(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}

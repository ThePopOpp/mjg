import { NextResponse } from "next/server";
import {
  publicSiteUrl,
  renderFaviconLinks,
  renderFonts,
  renderInstallScript,
  renderJoinCta,
  renderNavScript,
  renderNavStyles,
  renderPwaHeadTags,
  renderSiteFooter,
  renderSiteHeader,
  renderThemeScript,
} from "@/lib/public-site/static-pages";

// Mission page.
//
// The second section used to be the Impact Score ("Tracking Progress Towards
// $1 Billion"), rendered from the impact_scores table. That feature has been
// retired — its dashboard editor was removed and it's gone from the frontend — so
// this page no longer reads the database; the copy below is the source of truth,
// like every other static page in lib/public-site.
//
// Content per CMS frontend edit requests from Michael on /mission (2026-07-10).

const ICON_SVGS: Record<string, string> = {
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
  gift: '<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
};

function iconSvg(name: string) {
  const paths = ICON_SVGS[name] ?? ICON_SVGS.target;
  return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

const PILLARS: Array<{ icon: string; title: string; tagline: string; body: string }> = [
  {
    icon: "clock",
    title: "Time",
    tagline: "Steward your days with intention.",
    body: "Time is one of the most valuable resources God gives us. The Blueprint helps people examine where their time is going, clarify what matters most, and build rhythms that reflect their faith, priorities, and calling.",
  },
  {
    icon: "award",
    title: "Talent",
    tagline: "Develop and deploy your God-given gifts.",
    body: "Each person has been entrusted with abilities, experiences, passions, and opportunities. The Blueprint helps people recognize those gifts and use them to serve their family, church, workplace, and community.",
  },
  {
    icon: "gift",
    title: "Treasure",
    tagline: "Use financial resources with wisdom and generosity.",
    body: "Money matters, but it is not the whole mission. The Blueprint helps people view treasure as a tool for faithfulness, provision, generosity, freedom, and impact — not as the ultimate measure of success.",
  },
  {
    icon: "target",
    title: "Purpose",
    tagline: "Build the life God is placing on your heart.",
    body: "God places different callings, burdens, and opportunities on each person’s heart. The Blueprint helps people discern those purposes and take faithful next steps toward a life of greater clarity, stewardship, and impact.",
  },
];

export function GET() {
  const siteUrl = publicSiteUrl();

  const pillarCards = PILLARS.map(
    (pillar) => `
      <div class="blueprint-card">
        <div class="blueprint-card-icon">${iconSvg(pillar.icon)}</div>
        <div class="blueprint-card-title">${pillar.title}</div>
        <div class="blueprint-card-tagline">${pillar.tagline}</div>
        <p class="blueprint-card-body">${pillar.body}</p>
      </div>`,
  ).join("");

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Mission | Michael J. Gauthier</title>
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
      font-size: clamp(34px, 6vw, 62px);
      line-height: 1.05;
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

    /* ── Stewardship Blueprint section ── */
    .blueprint-section {
      background: #0d0e0c;
      color: #f8f6f1;
      padding: 80px 20px;
    }
    .blueprint-inner { max-width: 1080px; margin: 0 auto; }

    .blueprint-eyebrow {
      font-family: var(--font-body);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .2em;
      text-transform: uppercase;
      color: #C9A46E;
      margin-bottom: 16px;
    }
    .blueprint-heading {
      font-family: var(--font-display);
      font-size: clamp(32px, 5.5vw, 58px);
      line-height: 1.05;
      color: #f8f6f1;
      margin: 0 0 24px;
    }

    .blueprint-copy { max-width: 640px; margin: 0 0 56px; }
    .blueprint-copy p {
      font-size: 16px;
      line-height: 1.7;
      color: rgba(248,246,241,.65);
      margin: 0 0 18px;
    }
    .blueprint-copy p:last-child { margin-bottom: 0; }
    /* The pivot line of the copy — set apart in gold italic, the accent this page
       already used for the old headline's goal figure. */
    .blueprint-question {
      font-family: var(--font-display);
      font-size: clamp(20px, 2.6vw, 26px);
      line-height: 1.4;
      font-style: italic;
      color: #C9A46E !important;
      margin: 26px 0 !important;
    }

    .blueprint-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
    }
    .blueprint-card {
      background: rgba(255,255,255,.05);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 10px;
      padding: 28px 24px;
    }
    .blueprint-card-icon {
      color: #C9A46E;
      margin-bottom: 14px;
    }
    .blueprint-card-title {
      font-family: var(--font-display);
      font-size: 22px;
      color: #f8f6f1;
      margin-bottom: 6px;
    }
    .blueprint-card-tagline {
      font-size: 14px;
      font-weight: 600;
      line-height: 1.5;
      color: rgba(248,246,241,.8);
      margin-bottom: 12px;
    }
    .blueprint-card-body {
      font-size: 13px;
      line-height: 1.65;
      color: rgba(248,246,241,.5);
      margin: 0;
      padding-top: 12px;
      border-top: 1px solid rgba(255,255,255,.08);
    }
  </style>
</head>
<body>
  ${renderSiteHeader(siteUrl)}

  <main>
    <section class="mission-hero">
      <div class="mission-hero-inner">
        <div class="mission-eyebrow">Mission</div>
        <h1>Using God-Given Resources for God-Given Purposes</h1>
        <p>Encouraging and inspiring people to use their God-given resources, time, talents, and treasure, for the people and causes God has placed on their hearts.</p>
        <a href="${siteUrl}/#join" class="mission-cta">Join the Journey</a>
      </div>
    </section>

    <section class="blueprint-section">
      <div class="blueprint-inner">
        <div class="blueprint-eyebrow">What Drives Us</div>
        <h2 class="blueprint-heading">How the Stewardship Blueprint Helps</h2>

        <div class="blueprint-copy">
          <p>The Stewardship Blueprint is a practical framework for helping people move from inspiration to intentional action.</p>
          <p>It begins with a simple but life-changing question:</p>
          <p class="blueprint-question">What has God entrusted to me, and how can I use it for His purposes?</p>
          <p>That question applies to every area of life.</p>
          <p>Not just money.<br />Not just work.<br />Not just Sunday faith.</p>
          <p>It applies to how we spend our time, develop our gifts, lead our families, care for our health, build relationships, serve others, give generously, and create a legacy that points back to God.</p>
          <p>The Stewardship Blueprint helps people slow down, examine the life they are building, clarify what matters most, and begin aligning their daily decisions with the purposes God has placed on their hearts.</p>
          <p>This is not about building a perfect life.</p>
          <p>It is about building a faithful one.</p>
        </div>

        <div class="blueprint-cards">${pillarCards}</div>
      </div>
    </section>

    ${renderJoinCta(siteUrl)}
  </main>

  ${renderSiteFooter(siteUrl)}

  ${renderNavScript()}
  ${renderInstallScript()}
</body>
</html>`;

  return new NextResponse(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}

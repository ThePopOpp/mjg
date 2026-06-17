import { readFileSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

const DEFAULT_SITE_URL = "https://my.michaeljgauthier.com";

const STATIC_ROUTES: Record<string, string> = {
  "index.html": "/",
  "about-us.html": "/about",
  "contact.html": "/contact",
  "resources.html": "/resources",
  "post.html": "/post",
  "join-the-movement.html": "/join-the-movement",
  "created-for-more.html": "/created-for-more",
};

/** Inline script for <head> — sets data-theme before first paint to prevent flash */
export function renderThemeScript() {
  return `<script>(function(){var s=localStorage.getItem('theme');var m=window.matchMedia('(prefers-color-scheme:dark)').matches;document.documentElement.dataset.theme=(s==='dark'||(s!=='light'&&m))?'dark':'light';})();</script>`;
}

/** Google Fonts <link> tags — must go in <head> */
export function renderFonts() {
  return `<link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />`;
}

export function renderFaviconLinks() {
  return `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="shortcut icon" href="/favicon.svg" />`;
}

/** Nav CSS — include inside the page <style> block */
export function renderNavStyles() {
  return `
    :root {
      --font-display: 'DM Serif Display', serif;
      --font-body: 'Roboto', sans-serif;
      --nav-bg: #ffffff;
      --nav-text: #111110;
      --btn-bg: #111110;
      --btn-text: #ffffff;
      --border: #e8e6e0;
      --gold: #C9A46E;
      --ctrl-bg: rgba(17,17,17,0.06);
      --ctrl-border: rgba(17,17,17,0.16);
      --ctrl-hover: rgba(17,17,17,0.10);
      --ctrl-text: #111111;
    }
    [data-theme="dark"] {
      --nav-bg: #0f0f0f;
      --nav-text: #f7f5f2;
      --btn-bg: #f7f5f2;
      --btn-text: #0f0f0f;
      --border: rgba(255,255,255,0.08);
      --ctrl-bg: rgba(255,255,255,0.08);
      --ctrl-border: rgba(255,255,255,0.18);
      --ctrl-hover: rgba(255,255,255,0.12);
      --ctrl-text: #f7f5f2;
    }
    nav {
      position: sticky; top: 0; z-index: 100; width: 100%;
      background: var(--nav-bg); border-bottom: 1px solid var(--border);
    }
    .nav-inner {
      max-width: 1160px; width: 100%; margin: 0 auto; padding: 0 2rem;
      display: flex; align-items: center; justify-content: space-between; min-height: 60px;
    }
    .nav-logo { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; }
    .nav-logo img { height: 36px; width: auto; display: block; }
    .nav-logo-text {
      font-family: var(--font-display); font-size: 0.95rem; font-style: italic;
      color: var(--nav-text); letter-spacing: -0.02em;
    }
    .nav-logo-text .gold { color: var(--gold); }
    .nav-links {
      display: flex; align-items: center; gap: 1.75rem;
      list-style: none; margin: 0; padding: 0;
    }
    .nav-links a {
      font-family: var(--font-body); font-size: 0.875rem;
      color: var(--nav-text); text-decoration: none; transition: opacity 0.2s;
    }
    .nav-links a:hover { opacity: 0.7; }
    .nav-cta {
      display: inline-block; padding: 0.55rem 1.25rem; border-radius: 4px;
      background: var(--btn-bg); color: var(--btn-text) !important;
      font-weight: 500; font-size: 0.875rem; text-decoration: none; transition: opacity 0.2s;
    }
    .nav-cta:hover { opacity: 0.9; }
    .theme-toggle, .mobile-menu-toggle {
      display: inline-flex; align-items: center; justify-content: center;
      width: 42px; height: 42px; border-radius: 14px; padding: 0; cursor: pointer;
      background: var(--ctrl-bg); border: 1px solid var(--ctrl-border); color: var(--ctrl-text);
      transition: background 0.2s, transform 0.2s;
    }
    .theme-toggle:hover, .mobile-menu-toggle:hover { background: var(--ctrl-hover); transform: translateY(-1px); }
    .mobile-menu-toggle { display: none; }
    .nav-links.open { display: flex; }
    @media (max-width: 768px) {
      .mobile-menu-toggle { display: inline-flex; }
      .nav-links {
        position: absolute; top: 60px; left: 0; right: 0;
        flex-direction: column; gap: 1rem; padding: 1.25rem 1.5rem 1.75rem;
        background: var(--nav-bg); border-bottom: 1px solid var(--border); display: none;
      }
      .nav-links li { width: 100%; }
      .nav-links a, .nav-cta { width: 100%; box-sizing: border-box; }
      .nav-cta { text-align: center; }
      .theme-toggle { width: 100%; border-radius: 8px; height: 44px; }
    }`;
}

/** Nav HTML — the <nav> element with logo, links, and controls */
export function renderSiteHeader(siteUrl: string) {
  return `<nav>
    <div class="nav-inner">
      <a href="${siteUrl}/" class="nav-logo">
        <img id="nav-logo"
          src="https://michaeljgauthier.com/wp-content/uploads/2025/03/MJG_Logo_Black-1.svg"
          alt="Michael J. Gauthier"
          data-logo-light="https://michaeljgauthier.com/wp-content/uploads/2025/03/MJG_Logo_Black-1.svg"
          data-logo-dark="https://michaeljgauthier.com/wp-content/uploads/2025/03/MJG_Logo_White-1.svg" />
        <span class="nav-logo-text">Michael <span class="gold">J.</span> Gauthier</span>
      </a>
      <button id="mobile-menu-toggle" class="mobile-menu-toggle" type="button" aria-label="Open menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
      <ul class="nav-links" id="nav-links">
        <li><a href="${siteUrl}/">Home</a></li>
        <li><a href="${siteUrl}/about">About</a></li>
        <li><a href="${siteUrl}/mission">Mission</a></li>
        <li><a href="${siteUrl}/#listen">Listen</a></li>
        <li><a href="${siteUrl}/resources">Resources</a></li>
        <li><a href="${siteUrl}/contact">Contact</a></li>
        <li><a href="${siteUrl}/#join" class="nav-cta">Join the Journey</a></li>
        <li><button id="theme-toggle" class="theme-toggle" type="button" aria-label="Toggle light/dark mode">
          <svg id="theme-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></svg>
        </button></li>
      </ul>
    </div>
  </nav>`;
}

/** Nav JS — place just before </body> */
export function renderNavScript() {
  return `<script>(function(){
    var logo=document.getElementById('nav-logo'),ti=document.getElementById('theme-icon'),
        tt=document.getElementById('theme-toggle'),mt=document.getElementById('mobile-menu-toggle'),
        nl=document.getElementById('nav-links');
    var SUN='<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
    var MOON='<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
    var HAM='<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>';
    var X='<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>';
    function applyTheme(t){
      document.documentElement.dataset.theme=t;
      localStorage.setItem('theme',t);
      if(logo)logo.src=t==='dark'?logo.dataset.logoDark:logo.dataset.logoLight;
      if(ti)ti.innerHTML=t==='dark'?MOON:SUN;
    }
    function openMenu(){nl&&nl.classList.add('open');mt&&(mt.querySelector('svg').innerHTML=X);}
    function closeMenu(){nl&&nl.classList.remove('open');mt&&(mt.querySelector('svg').innerHTML=HAM);}
    tt&&tt.addEventListener('click',function(){applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');});
    mt&&mt.addEventListener('click',function(){nl&&nl.classList.contains('open')?closeMenu():openMenu();});
    document.addEventListener('click',function(e){if(nl&&nl.classList.contains('open')&&!e.target.closest('nav'))closeMenu();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape')closeMenu();});
    applyTheme(document.documentElement.dataset.theme||'light');
  })();</script>`;
}

export function publicSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");
}

export function renderStaticPage(fileName: string) {
  const html = getStaticPageHtml(fileName);

  return new NextResponse(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}

export function getStaticPageHtml(fileName: string) {
  const filePath = path.join(process.cwd(), "main", fileName);
  return transformStaticHtml(readFileSync(filePath, "utf8"));
}

export function renderGeneratedPage(input: { title: string; eyebrow: string; body: string; ctaLabel?: string; ctaHref?: string }) {
  const siteUrl = publicSiteUrl();
  return new NextResponse(
    `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(input.title)} | Michael J. Gauthier</title>
  ${renderFaviconLinks()}
  <style>
    :root { color-scheme: light dark; --ink:#070807; --muted:#5f6d66; --line:#e4ded2; --gold:#c9a96d; --green:#315f43; --paper:#fbfaf7; }
    @media (prefers-color-scheme: dark) { :root { --ink:#f8f6f1; --muted:#b6bcb6; --line:#2b2a25; --paper:#10110f; } }
    body { margin:0; background:var(--paper); color:var(--ink); font-family:Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { min-height:100vh; display:grid; place-items:center; padding:48px 20px; background-image:linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px); background-size:80px 80px; }
    section { width:min(780px, 100%); text-align:center; }
    .logo { font-size:56px; font-weight:900; letter-spacing:-.04em; margin-bottom:8px; }
    .script { font-family:Georgia, serif; font-style:italic; font-weight:700; margin-bottom:72px; }
    .eyebrow { display:inline-flex; border:1px solid var(--line); border-radius:999px; padding:8px 18px; color:var(--gold); font-weight:800; letter-spacing:.16em; text-transform:uppercase; font-size:13px; }
    h1 { font-family:Georgia, serif; font-size:clamp(44px, 8vw, 84px); line-height:.95; margin:28px 0 20px; }
    p { color:var(--muted); font-size:20px; line-height:1.7; margin:0 auto; max-width:680px; }
    a { display:inline-flex; margin-top:36px; background:var(--ink); color:var(--paper); border-radius:6px; padding:16px 24px; text-decoration:none; font-weight:800; }
  </style>
</head>
<body>
  <main>
    <section>
      <div class="logo">MJG</div>
      <div class="script">Michael J. Gauthier</div>
      <div class="eyebrow">${escapeHtml(input.eyebrow)}</div>
      <h1>${escapeHtml(input.title)}</h1>
      <p>${escapeHtml(input.body)}</p>
      ${input.ctaLabel && input.ctaHref ? `<a href="${escapeHtml(input.ctaHref.startsWith("http") ? input.ctaHref : `${siteUrl}${input.ctaHref}`)}">${escapeHtml(input.ctaLabel)}</a>` : ""}
    </section>
  </main>
</body>
</html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

function transformStaticHtml(html: string) {
  const siteUrl = publicSiteUrl();
  let output = html
    .replaceAll("https://blueprint.michaeljgauthier.com", siteUrl)
    .replace(/https:\/\/michaeljgauthier\.com\/login\/?/g, `${siteUrl}/login`)
    .replace(/https:\/\/michaeljgauthier\.com\/register\/?/g, `${siteUrl}/#join`)
    .replace(
      /const FLUENT_CRM_ENDPOINT = 'https:\/\/michaeljgauthier\.com\/\?fluentcrm=1&route=contact&hash=[^']+';/g,
      "const FLUENT_CRM_ENDPOINT = '/api/public/join-journey';",
    )
    .replace(
      /var FLUENT_CRM_URL = 'https:\/\/michaeljgauthier\.com\/\?fluentcrm=1&route=contact&hash=[^']+';/g,
      "var FLUENT_CRM_URL = '/api/public/join-journey';",
    )
    .replace("const POST_PAGE = 'post.html';", "const POST_PAGE = '/post';");

  for (const [fileName, route] of Object.entries(STATIC_ROUTES)) {
    const absolute = `${siteUrl}${route === "/" ? "/" : route}`;
    output = output
      .replace(new RegExp(`href="${escapeRegExp(fileName)}"`, "g"), `href="${absolute}"`)
      .replace(new RegExp(`href='${escapeRegExp(fileName)}'`, "g"), `href='${absolute}'`);
  }

  return injectFaviconLinks(output);
}

function injectFaviconLinks(html: string) {
  if (/<link[^>]+rel=["'](?:shortcut )?icon["']/i.test(html)) return html;
  return html.replace(/<\/head>/i, `  ${renderFaviconLinks()}\n</head>`);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

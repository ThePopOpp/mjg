import { readFileSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { INSTALL_GUIDES, SHARE_ICON_SVG } from "@/lib/pwa/install-guide";

const DEFAULT_SITE_URL = "https://my.michaeljgauthier.com";
// Where THIS app is served — login, the legal pages, and the SMS/email consent
// pages all live here. It's separate from publicSiteUrl() because the marketing
// site and the app are different hosts today. Set NEXT_PUBLIC_APP_URL to move it
// (e.g. when the primary domain changes) rather than editing links one by one.
const DEFAULT_APP_URL = "https://my.michaeljgauthier.com";

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

/** "Join the Journey" sign-up CTA — matches the homepage. Posts to the
 *  public join-journey endpoint via a small inline AJAX handler. */
export function renderJoinCta(siteUrl: string) {
  return `<style>
    .mjg-join{background:var(--paper,#fbfaf7);padding:92px 20px;text-align:center;border-top:1px solid var(--line,#e4ded2);}
    .mjg-join .in{max-width:720px;margin:0 auto;}
    .mjg-join .qm{font-family:var(--font-display);font-size:110px;line-height:.5;color:var(--gold,#c9aa70);opacity:.16;height:52px;user-select:none;}
    .mjg-join h2{font-family:var(--font-display);font-size:clamp(34px,5vw,54px);margin:0 0 18px;color:var(--ink,#111);}
    .mjg-join h2 em{color:var(--gold,#c9aa70);font-style:italic;}
    .mjg-join .lead{font-size:18px;line-height:1.6;color:var(--muted,#5f6d66);margin:0 auto 10px;max-width:560px;}
    .mjg-join .sub{font-size:14px;color:var(--muted,#5f6d66);opacity:.85;margin:0 0 28px;}
    .mjg-join .perks{display:flex;flex-wrap:wrap;justify-content:center;gap:24px;margin:0 0 34px;}
    .mjg-join .perk{font-size:14px;color:var(--ink,#111);display:inline-flex;align-items:center;gap:8px;}
    .mjg-join .perk::before{content:"\\2713";color:var(--gold,#c9aa70);font-weight:800;}
    .mjg-join form{max-width:560px;margin:0 auto;background:var(--card,#fff);border:1px solid var(--line,#e4ded2);border-radius:14px;padding:28px;text-align:left;}
    .mjg-join .row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;}
    .mjg-join input{width:100%;padding:13px 15px;border:1px solid var(--line,#e4ded2);border-radius:8px;background:var(--paper,#fff);color:var(--ink,#111);font-size:15px;font-family:var(--font-body,inherit);}
    .mjg-join input::placeholder{color:var(--muted,#8a8a8a);}
    .mjg-join button{width:100%;margin-top:12px;background:var(--gold,#c9aa70);color:#fff;border:none;border-radius:8px;padding:15px;font-size:16px;font-weight:600;cursor:pointer;font-family:var(--font-body,inherit);transition:opacity .2s;}
    .mjg-join button:hover{opacity:.9;}
    .mjg-join button:disabled{opacity:.6;cursor:default;}
    .mjg-join .fine{font-size:12.5px;line-height:1.6;color:var(--muted,#5f6d66);text-align:center;margin:16px 0 0;}
    .mjg-join .ok{color:var(--ink,#111);font-size:16px;text-align:center;padding:14px 4px;margin:0;}
    @media(max-width:520px){.mjg-join .row{grid-template-columns:1fr;}}
  </style>
  <section class="mjg-join" id="join">
    <div class="in">
      <div class="qm">&ldquo;</div>
      <h2>Join the <em>Journey</em></h2>
      <p class="lead">Join the conversation &mdash; share your thoughts and reflections from your own journey.</p>
      <p class="sub">You&rsquo;re one of the early supporters &mdash; your input will shape the book.</p>
      <div class="perks">
        <span class="perk">Early chapter drafts</span>
        <span class="perk">Reflection worksheets</span>
        <span class="perk">Live Q&amp;A invites</span>
        <span class="perk">Blueprint actions</span>
      </div>
      <form id="mjgJoinForm" method="post" action="${siteUrl}/api/public/join-journey">
        <input type="hidden" name="form_type" value="join_the_journey" />
        <input type="hidden" name="source" value="Website Sign Up" />
        <div class="row">
          <input type="text" name="first_name" placeholder="First name" required />
          <input type="text" name="last_name" placeholder="Last name" required />
        </div>
        <input type="email" name="email" placeholder="Email address" required />
        <button type="submit">Join the Journey &rarr;</button>
        <p class="fine">Your information will only be used to send you updates about The Stewardship Blueprint. No spam, ever. Unsubscribe at any time.</p>
      </form>
    </div>
  </section>
  <script>(function(){
    var f=document.getElementById('mjgJoinForm');if(!f)return;
    f.addEventListener('submit',function(e){e.preventDefault();
      var b=f.querySelector('button');b.disabled=true;b.textContent='Joining\\u2026';
      var d={};new FormData(f).forEach(function(v,k){d[k]=v;});
      fetch(f.action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)})
        .then(function(r){return r.json();})
        .then(function(res){if(res&&res.ok!==false){f.innerHTML='<p class="ok">Thank you &mdash; you are on the journey. Watch your inbox for a first note.</p>';}
          else{b.disabled=false;b.textContent='Join the Journey \\u2192';alert((res&&res.error)||'Something went wrong. Please try again.');}})
        .catch(function(){b.disabled=false;b.textContent='Join the Journey \\u2192';alert('Something went wrong. Please try again.');});
    });
  })();</script>`;
}

/** Site footer — matches the homepage (Explore / Account / Contact + social). */
export function renderSiteFooter(siteUrl: string) {
  const year = new Date().getFullYear();
  const app = appUrl();
  const mapHref = "https://www.google.com/maps/dir//2330+W+Ray+Rd+Ste+%233,+Chandler,+AZ+85224/@33.3208879,-111.964255,45043m/data=!3m1!1e3";
  return `<style>
    .mjg-ftr{background:var(--paper,#0f0f0f);border-top:1px solid var(--line,#2b2a25);padding:64px 0 26px;color:var(--muted,#b6bcb6);}
    .mjg-ftr .in{max-width:1160px;margin:0 auto;padding:0 2rem;}
    .mjg-ftr .cols{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr 1.1fr;gap:36px;}
    .mjg-ftr .logo{height:32px;width:auto;}
    .mjg-ftr .logo-dark{display:none;}
    [data-theme="dark"] .mjg-ftr .logo-light{display:none;}
    [data-theme="dark"] .mjg-ftr .logo-dark{display:inline;}
    .mjg-ftr .desc{font-size:14px;line-height:1.7;color:var(--muted,#b6bcb6);max-width:280px;margin:18px 0 0;}
    .mjg-ftr h4{font-family:var(--font-display);font-size:20px;color:var(--ink,#f8f6f1);margin:0 0 18px;}
    .mjg-ftr ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:14px;}
    .mjg-ftr a{color:var(--muted,#b6bcb6);text-decoration:none;font-size:15px;transition:color .2s;}
    .mjg-ftr a:hover{color:var(--gold,#c9aa70);}
    .mjg-ftr .bottom{display:flex;align-items:center;justify-content:space-between;gap:16px;border-top:1px solid var(--line,#2b2a25);margin-top:44px;padding-top:24px;font-size:14px;color:var(--muted,#b6bcb6);}
    .mjg-ftr .gold-j{color:var(--gold,#c9aa70);}
    .mjg-ftr .bottom-right{display:flex;align-items:center;gap:14px;}
    .mjg-ftr .install{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line,#2b2a25);border-radius:8px;padding:6px 12px;font-size:14px;font-weight:600;color:var(--ink,#f8f6f1);text-decoration:none;white-space:nowrap;line-height:1;transition:background .2s,border-color .2s,color .2s;}
    .mjg-ftr .install:hover{border-color:var(--gold,#c9aa70);color:var(--gold,#c9aa70);}
    .mjg-ftr .install svg{width:20px;height:20px;}
    .mjg-ftr .social{display:flex;gap:14px;}
    .mjg-ftr .social a{display:inline-flex;color:var(--ink,#f8f6f1);}
    .mjg-ftr .social a:hover{color:var(--gold,#c9aa70);}
    .mjg-ftr .social svg{width:20px;height:20px;fill:currentColor;}
    @media(max-width:1024px){.mjg-ftr .cols{grid-template-columns:1fr 1fr 1fr;gap:32px;}}
    @media(max-width:820px){.mjg-ftr .cols{grid-template-columns:1fr 1fr;gap:32px;}.mjg-ftr .bottom{flex-direction:column;align-items:flex-start;}}
  </style>
  <footer class="mjg-ftr">
    <div class="in">
      <div class="cols">
        <div>
          <img class="logo logo-light" src="https://michaeljgauthier.com/wp-content/uploads/2025/03/MJG_Logo_Black-1.svg" alt="Michael J. Gauthier" />
          <img class="logo logo-dark" src="https://michaeljgauthier.com/wp-content/uploads/2025/03/MJG_Logo_White-1.svg" alt="Michael J. Gauthier" />
          <p class="desc">Welcome to my personal mission: Encouraging others to use their God given resources for God given purposes</p>
        </div>
        <div>
          <h4>Explore</h4>
          <ul>
            <li><a href="${siteUrl}/">Home</a></li>
            <li><a href="${siteUrl}/about">About</a></li>
            <li><a href="${siteUrl}/resources">Resources</a></li>
            <li><a href="${siteUrl}/contact">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4>Account</h4>
          <ul>
            <li><a href="${app}/login">Login</a></li>
            <li><a href="${siteUrl}/#join">Register</a></li>
            <li><a href="tel:+14804667070">Call Us</a></li>
            <li><a href="mailto:mike@strategicincomegroup.com">Email Us</a></li>
          </ul>
        </div>
        <div>
          <h4>Legal</h4>
          <ul>
            <li><a href="${app}/privacy">Privacy Policy</a></li>
            <li><a href="${app}/terms">Terms of Service</a></li>
            <li><a href="${app}/sms/opt-in">SMS Management</a></li>
            <li><a href="${app}/email/opt-in">Email Management</a></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul>
            <li><a href="tel:+14804667070">(480) 466-7070</a></li>
            <li><a href="${mapHref}" target="_blank" rel="noopener">2330 W Ray Rd Ste #3,<br />Chandler, AZ 85224</a></li>
          </ul>
        </div>
      </div>
      <div class="bottom">
        <span>${year} &copy; Michael<span class="gold-j">J.</span>Gauthier.com &nbsp;- All rights reserved.</span>
        <span class="bottom-right">
          <a href="#" class="install" data-mjg-install onclick="mjgInstall();return false;">${DOWNLOAD_SVG}Install app</a>
          <span class="social">
            <a href="https://www.facebook.com/StrategicIncomeGroup" aria-label="Facebook" target="_blank" rel="noopener"><svg viewBox="0 0 24 24"><path d="M18 2h-3a6 6 0 0 0-6 6v3H7v4h2v8h4v-8h3l1-4h-4V8a1 1 0 0 1 1-1h3z"/></svg></a>
            <a href="https://www.linkedin.com/in/michaeljgauthier/" aria-label="LinkedIn" target="_blank" rel="noopener"><svg viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg></a>
          </span>
        </span>
      </div>
    </div>
  </footer>`;
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

export function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || DEFAULT_APP_URL).replace(/\/$/, "");
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
    :root { color-scheme: light dark; --ink:#070807; --muted:#5f6d66; --line:#e4ded2; --gold:#c9a96d; --green:#c9aa70; --paper:#fbfaf7; }
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

  return injectLegalFooterColumn(injectPwa(injectFaviconLinks(output)));
}

// The static pages in main/*.html carry their own hardcoded <footer>, separate from
// renderSiteFooter() (which serves /mission, /resources and CMS pages). Rather than
// paste a Legal column into five HTML files — and have it drift the next time a link
// changes — it's injected here, so both footers stay in step from one place.
function injectLegalFooterColumn(html: string) {
  if (!/<h3>Contact<\/h3>/.test(html)) return html; // landing pages have no footer
  if (/>Legal</.test(html)) return html; // already present — don't double-inject

  const app = appUrl();
  const column = `<!-- Legal Column -->
      <div class="footer-section">
        <h3>Legal</h3>
        <ul class="footer-links">
          <li><a href="${app}/privacy">Privacy Policy</a></li>
          <li><a href="${app}/terms">Terms of Service</a></li>
          <li><a href="${app}/sms/opt-in">SMS Management</a></li>
          <li><a href="${app}/email/opt-in">Email Management</a></li>
        </ul>
      </div>

      `;

  // Insert before the Contact column so the order is Logo · Explore · Account ·
  // Legal · Contact, and widen the grid from 4 columns to 5.
  return html
    .replace(/(<div class="footer-section">\s*<h3>Contact<\/h3>)/, `${column}$1`)
    .replace(
      /<\/head>/i,
      `  <style>
    .footer-container{grid-template-columns:1.4fr 1fr 1fr 1fr 1fr;gap:2.25rem;}
    @media(max-width:1100px){.footer-container{grid-template-columns:1fr 1fr 1fr;gap:2rem;}}
    @media(max-width:900px){.footer-container{grid-template-columns:1fr 1fr;gap:2rem;}}
    @media(max-width:640px){.footer-container{grid-template-columns:1fr;gap:1.5rem;}}
  </style>
</head>`,
    );
}

function injectFaviconLinks(html: string) {
  if (/<link[^>]+rel=["'](?:shortcut )?icon["']/i.test(html)) return html;
  return html.replace(/<\/head>/i, `  ${renderFaviconLinks()}\n</head>`);
}

// Client helper for the public site: registers the service worker (so the site is
// installable) and exposes window.mjgInstall() for the "Install app" buttons —
// native prompt when available, else a styled guide.
//
// The guides and platform detection come from lib/pwa/install-guide.ts and are
// serialised in below, so this and the React button can't drift apart. It used to
// be a window.alert() with one sentence, which on iOS — where the Share menu is
// the ONLY install route — was the entire install experience.
const INSTALL_HELPER_JS = `(function(){
  var GUIDES=${JSON.stringify(INSTALL_GUIDES)};
  var SHARE=${JSON.stringify(SHARE_ICON_SVG)};
  var deferred=null;

  function platform(){
    var ua=navigator.userAgent||'';
    if(/FBAN|FBAV|FB_IAB|Instagram|LinkedInApp|Twitter|MicroMessenger|Snapchat|Pinterest|\\bLine\\//i.test(ua))return 'in-app';
    if(/iPhone|iPod/.test(ua))return 'iphone';
    // iPadOS 13+ reports as "Macintosh"; touch points are what give it away.
    if(/iPad/.test(ua)||(/Macintosh/.test(ua)&&(navigator.maxTouchPoints||0)>1))return 'ipad';
    if(/Android/.test(ua))return 'android';
    var safari=/Safari/.test(ua)&&!/Chrome|Chromium|Edg|OPR|Brave/.test(ua);
    if(/Macintosh|Mac OS X/.test(ua)&&safari)return 'macos-safari';
    return 'desktop';
  }

  function hideIfInstalled(){
    try{var s=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
      if(s){var els=document.querySelectorAll('[data-mjg-install]');for(var i=0;i<els.length;i++){els[i].style.display='none';}}}catch(e){}
  }

  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  function showGuide(){
    var g=GUIDES[platform()]||GUIDES.desktop;
    var old=document.getElementById('mjg-install-modal');
    if(old)old.remove();

    var steps='';
    for(var i=0;i<g.steps.length;i++){
      var showShare=i===0&&/Share button/.test(g.steps[i]);
      steps+='<li><span class="n">'+(i+1)+'</span><span class="t">'+esc(g.steps[i])+(showShare?'<span class="share">'+SHARE+'</span>':'')+'</span></li>';
    }

    var el=document.createElement('div');
    el.id='mjg-install-modal';
    el.innerHTML=
      '<style>'+
      '#mjg-install-modal{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;}'+
      '#mjg-install-modal .bd{position:absolute;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(2px);}'+
      '#mjg-install-modal .pn{position:relative;z-index:1;width:min(420px,100%);max-height:86vh;overflow:auto;background:var(--paper,#fff);color:var(--ink,#111);border:1px solid var(--line,#e4ded2);border-radius:14px;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.3);font-family:var(--font-body,system-ui,sans-serif);}'+
      '#mjg-install-modal h3{font-family:var(--font-display,Georgia,serif);font-size:21px;margin:0 0 6px;}'+
      '#mjg-install-modal .sub{color:var(--muted,#5f6d66);font-size:13px;line-height:1.6;margin:0 0 16px;}'+
      '#mjg-install-modal .warn{display:flex;gap:8px;border:1px solid rgba(201,164,110,.45);background:rgba(201,164,110,.12);border-radius:8px;padding:9px 11px;font-size:12px;line-height:1.6;margin:0 0 14px;}'+
      '#mjg-install-modal ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px;}'+
      '#mjg-install-modal li{display:flex;gap:10px;font-size:14px;line-height:1.6;}'+
      '#mjg-install-modal .n{flex:0 0 20px;height:20px;border-radius:999px;background:rgba(201,164,110,.18);color:var(--gold,#c9a46e);font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;margin-top:2px;}'+
      '#mjg-install-modal .t{color:var(--muted,#5f6d66);}'+
      '#mjg-install-modal .share{display:inline-flex;width:24px;height:24px;padding:3px;margin-left:6px;vertical-align:-6px;border:1px solid var(--line,#e4ded2);border-radius:6px;color:var(--ink,#111);}'+
      '#mjg-install-modal .share svg{width:100%;height:100%;}'+
      '#mjg-install-modal .note{color:var(--muted,#5f6d66);font-size:12px;line-height:1.6;margin:16px 0 0;}'+
      '#mjg-install-modal .cl{margin-top:18px;width:100%;border:0;border-radius:8px;background:var(--ink,#111);color:var(--paper,#fff);padding:11px;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;}'+
      '</style>'+
      '<div class="bd" data-close></div>'+
      '<div class="pn" role="dialog" aria-modal="true" aria-label="'+esc(g.title)+'">'+
      '<h3>'+esc(g.title)+'</h3>'+
      '<p class="sub">It installs like a normal app \\u2014 its own icon and window, and it works offline. No app store needed.</p>'+
      (g.blocked?'<div class="warn">'+esc(g.blocked)+'</div>':'')+
      '<ol>'+steps+'</ol>'+
      (g.note?'<p class="note">'+esc(g.note)+'</p>':'')+
      '<button class="cl" data-close>Got it</button>'+
      '</div>';

    el.addEventListener('click',function(e){if(e.target&&e.target.hasAttribute('data-close'))el.remove();});
    document.addEventListener('keydown',function onKey(e){if(e.key==='Escape'){el.remove();document.removeEventListener('keydown',onKey);}});
    document.body.appendChild(el);
  }

  window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferred=e;});
  window.addEventListener('appinstalled',function(){deferred=null;hideIfInstalled();});
  window.mjgInstall=function(){
    if(deferred){deferred.prompt();try{deferred.userChoice.finally(function(){deferred=null;});}catch(e){}return;}
    showGuide();
  };
  if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});});}
  if(document.readyState!=='loading')hideIfInstalled();else document.addEventListener('DOMContentLoaded',hideIfInstalled);
})();`;

/** PWA <head> tags (manifest + apple icon/meta) for hand-built Next pages. */
export function renderPwaHeadTags() {
  // apple-mobile-web-app-* are what iOS reads when adding to the Home Screen —
  // without them it saves a browser shortcut instead of a standalone app. Mirrors
  // the `appleWebApp` metadata the React pages get from app/layout.tsx.
  return `<link rel="manifest" href="/manifest.webmanifest" />
  <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="MJG" />`;
}

/** The install helper <script> (defines window.mjgInstall + registers the SW). */
export function renderInstallScript() {
  return `<script>${INSTALL_HELPER_JS}</script>`;
}

const DOWNLOAD_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;

// An "Install app" pill (download icon + label) + 20×20 social icons for the
// static-page sub-footer.
const FOOTER_INSTALL_CSS = `<style>
    .mjg-install-btn{display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(130,130,130,.4);border-radius:8px;padding:6px 12px;font-size:14px;font-weight:600;text-decoration:none;color:var(--text,#111);white-space:nowrap;line-height:1;transition:background .2s;}
    .mjg-install-btn:hover{background:rgba(130,130,130,.12);}
    .mjg-install-btn svg{width:20px;height:20px;}
    .social-icons{gap:14px;}
    .social-icon{width:20px !important;height:20px !important;color:var(--text);}
    .footer-container{padding:0 2rem;}
    .sub-footer{padding:0 2rem;}
  </style>`;

// Place the "Install app" button in the sub-footer, to the left of the social icons.
function injectFooterInstall(html: string) {
  if (!/<div class="social-icons">/.test(html)) return html;
  const btn = `<a href="#" class="mjg-install-btn" data-mjg-install onclick="mjgInstall();return false;">${DOWNLOAD_SVG}Install app</a>`;
  return html.replace(/<div class="social-icons">/, `<div class="social-icons">${btn}`);
}

function injectPwa(html: string) {
  let out = html;
  if (!/rel=["']manifest["']/i.test(out)) {
    const head = `  ${renderPwaHeadTags()}\n  ${FOOTER_INSTALL_CSS}`;
    out = /<\/head>/i.test(out) ? out.replace(/<\/head>/i, `${head}\n</head>`) : `${head}\n${out}`;
  }
  out = injectFooterInstall(out);
  // Some exported pages are missing a closing </body>; fall back to </html> / append.
  const script = renderInstallScript();
  if (/<\/body>/i.test(out)) out = out.replace(/<\/body>/i, `${script}\n</body>`);
  else if (/<\/html>/i.test(out)) out = out.replace(/<\/html>/i, `${script}\n</html>`);
  else out = `${out}\n${script}`;
  return out;
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

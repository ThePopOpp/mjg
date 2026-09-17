import { readFileSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { INSTALL_GUIDES, SHARE_ICON_SVG } from "@/lib/pwa/install-guide";
import { ACCOUNT_LABEL, RESOURCES_LABEL, joinJourneyHref, publicNavItems } from "@/lib/public-site/nav-items";

// The primary domain is the apex michaeljgauthier.com. The my.* sub-domain still resolves but
// is no longer the canonical host, so it must not be the fallback. Override per environment
// with NEXT_PUBLIC_SITE_URL / NEXT_PUBLIC_APP_URL.
const DEFAULT_SITE_URL = "https://michaeljgauthier.com";
// Where THIS app is served — login, the legal pages, and the SMS/email consent
// pages all live here. It's separate from publicSiteUrl() because the marketing
// site and the app are different hosts today. Set NEXT_PUBLIC_APP_URL to move it
// (e.g. when the primary domain changes) rather than editing links one by one.
const DEFAULT_APP_URL = "https://michaeljgauthier.com";

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
    /* Dropdowns (Resources, Account). A parent with a link keeps the label clickable and
       puts the caret in its own button; a parent without one is a single button. */
    .nav-dropdown { position: relative; display: flex; align-items: center; gap: 0.15rem; }
    .nav-parent-btn, .nav-caret-btn {
      display: inline-flex; align-items: center; gap: 0.3rem; cursor: pointer;
      background: none; border: none; padding: 0; font-family: var(--font-body);
      font-size: 0.875rem; color: var(--nav-text); transition: opacity 0.2s;
    }
    .nav-parent-btn:hover, .nav-caret-btn:hover { opacity: 0.7; }
    .nav-caret { transition: transform 0.2s; }
    [aria-expanded="true"] .nav-caret { transform: rotate(180deg); }
    .nav-dropdown-menu {
      display: none; position: absolute; top: calc(100% + 0.7rem); left: 0; min-width: 180px;
      background: var(--nav-bg); border: 1px solid var(--border); border-radius: 10px;
      padding: 0.4rem; box-shadow: 0 12px 30px rgba(0,0,0,0.12); z-index: 110;
    }
    .nav-dropdown:last-of-type .nav-dropdown-menu { left: auto; right: 0; }
    .nav-dropdown-menu.open { display: block; }
    .nav-dropdown-menu a {
      display: block; padding: 0.6rem 0.75rem; border-radius: 6px; white-space: nowrap;
      font-size: 0.875rem; color: var(--nav-text); text-decoration: none; transition: background 0.15s;
    }
    .nav-dropdown-menu a:hover { background: var(--ctrl-bg); opacity: 1; }
    /* Mobile-only rows (flattened Resources children, Join the Journey, Sign in/Register). */
    .nav-mobile-only { display: none; }
    .mjg-nav-cta {
      display: block; text-align: center; padding: 0.85rem 1.25rem; border-radius: 8px;
      background: var(--btn-bg); color: var(--btn-text) !important;
      font-weight: 700; font-size: 1rem; text-decoration: none;
    }
    .mjg-nav-auth-btn {
      display: block; text-align: center; padding: 0.8rem 1rem; border-radius: 8px;
      border: 1px solid var(--ctrl-border); color: var(--nav-text) !important;
      font-weight: 600; font-size: 0.95rem; text-decoration: none;
    }
    .theme-toggle, .mobile-menu-toggle {
      display: inline-flex; align-items: center; justify-content: center;
      width: 42px; height: 42px; border-radius: 14px; padding: 0; cursor: pointer;
      background: var(--ctrl-bg); border: 1px solid var(--ctrl-border); color: var(--ctrl-text);
      transition: background 0.2s, transform 0.2s;
    }
    .theme-toggle:hover, .mobile-menu-toggle:hover { background: var(--ctrl-hover); transform: translateY(-1px); }
    .mobile-menu-toggle { display: none; }
    @media (max-width: 768px) {
      .mobile-menu-toggle { display: inline-flex; }
      /* Hide the "Michael J. Gauthier" wordmark on phones — keep just the logo mark. */
      .nav-logo-text { display: none; }
      /* Full-page mobile menu: fixed, full viewport, its own scroll. */
      .nav-links {
        display: none; position: fixed; top: 60px; left: 0; right: 0; bottom: 0;
        flex-direction: column; align-items: stretch; gap: 0.35rem;
        padding: 1.25rem 1.5rem 2.5rem; overflow-y: auto;
        background: var(--nav-bg); z-index: 105;
      }
      .nav-links.open { display: flex; }
      .nav-links li { width: 100%; }
      .nav-links > li > a, .nav-parent-link {
        display: block; width: 100%; box-sizing: border-box;
        padding: 0.85rem 0; font-size: 1.05rem; border-bottom: 1px solid var(--border);
      }
      .nav-mobile-only { display: block; }
      /* The desktop dropdowns collapse: the parent stays a plain row, the caret and the
         floating menu disappear, and the children show as their own mobile rows. */
      .nav-dropdown { display: block; }
      .nav-caret-btn, .nav-parent-btn { display: none; }
      .nav-dropdown-menu { display: none !important; }
      /* Mobile order per spec: Home, About, Mission, Resources, Videos, Book Waitlist,
         Join the Journey, Contact, Sign in/Register, theme toggle. DOM order stays
         desktop-correct; only the flex order changes. */
      .nav-item-home { order: 1; }
      .nav-item-about { order: 2; }
      .nav-item-mission { order: 3; }
      .nav-item-resources { order: 4; }
      .nav-mobile-child { order: 5; }
      .nav-mobile-join { order: 7; }
      .nav-item-contact { order: 8; }
      .nav-mobile-auth { order: 9; }
      .nav-toggle-item { order: 10; }
      /* Account collapses on mobile — Sign in / Register are their own buttons below. */
      .nav-item-account { display: none; }
      .nav-mobile-auth {
        display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-top: 0.9rem;
      }
      .mjg-nav-cta { margin-top: 1.1rem; }
      .nav-toggle-item { margin-top: 0.9rem; }
      .theme-toggle { width: 100%; border-radius: 8px; height: 46px; }
    }
    /* Lock the page behind the open mobile menu. */
    body.mjg-nav-open { overflow: hidden; }`;
}

/**
 * The nav list items, shared by renderSiteHeader() and the main/*.html injection.
 *
 * Desktop shows: Home · About · Mission · Resources▾ · Contact · Account▾ · theme toggle.
 * "Join the Journey" is mobile-only (it was removed from the desktop bar), and the mobile
 * menu adds the Resources children as flat rows plus a Sign in / Register button pair.
 *
 * `themeToggleHtml` lets the static pages keep their OWN toggle button markup — they use two
 * different element ids (theme-toggle / nav-theme-toggle) wired to their own inline scripts,
 * so re-emitting a single id would break the toggle on half of them.
 */
export function renderNavListItems(siteUrl: string, themeToggleHtml?: string) {
  const app = appUrl();
  const items = publicNavItems(siteUrl, app);
  const caret = `<svg class="nav-caret" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;

  const desktop = items
    .map((item, index) => {
      const slug = item.label.toLowerCase().replace(/[^a-z]+/g, "-");
      if (!item.children) return `<li class="nav-item-plain nav-item-${slug}"><a href="${item.href}">${item.label}</a></li>`;
      const menuId = `nav-menu-${index}`;
      // A parent with both a link and a dropdown: the label navigates, the caret opens.
      const trigger = item.href
        ? `<a href="${item.href}" class="nav-parent-link">${item.label}</a>
            <button class="nav-caret-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="${menuId}" aria-label="Open ${item.label} menu">${caret}</button>`
        : `<button class="nav-parent-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="${menuId}">${item.label}${caret}</button>`;
      return `<li class="nav-dropdown nav-item-${slug}">
          ${trigger}
          <div class="nav-dropdown-menu" id="${menuId}">
            ${item.children.map((c) => `<a href="${c.href}">${c.label}</a>`).join("\n            ")}
          </div>
        </li>`;
    })
    .join("\n        ");

  // Mobile-only rows: the Resources children flattened, then the CTA and account buttons.
  const resources = items.find((i) => i.label === RESOURCES_LABEL);
  const account = items.find((i) => i.label === ACCOUNT_LABEL);
  const mobileExtras = `
        ${(resources?.children ?? []).map((c) => `<li class="nav-mobile-only nav-mobile-child"><a href="${c.href}">${c.label}</a></li>`).join("\n        ")}
        <li class="nav-mobile-only nav-mobile-join"><a href="${joinJourneyHref(siteUrl)}" class="mjg-nav-cta">Join the Journey</a></li>
        <li class="nav-mobile-only nav-mobile-auth">
          ${(account?.children ?? []).map((c) => `<a href="${c.href}" class="mjg-nav-auth-btn">${c.label}</a>`).join("\n          ")}
        </li>`;

  const toggle =
    themeToggleHtml ??
    `<li class="nav-toggle-item"><button id="theme-toggle" class="theme-toggle" type="button" aria-label="Toggle light/dark mode">
          <svg id="theme-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></svg>
        </button></li>`;

  return `${desktop}${mobileExtras}
        ${toggle}`;
}

/** Nav HTML — the <nav> element with logo, links, and controls */
export function renderSiteHeader(siteUrl: string) {
  return `<nav>
    <div class="nav-inner">
      <a href="${siteUrl}/" class="nav-logo">
        <img id="nav-logo"
          src="/mjg-logos/mjg_black_white.png"
          alt="Michael J. Gauthier"
          data-logo-light="/mjg-logos/mjg_black_white.png"
          data-logo-dark="/mjg-logos/mjg_white.png" />
        <span class="nav-logo-text">Michael <span class="gold">J.</span> Gauthier</span>
      </a>
      <button id="mobile-menu-toggle" class="mobile-menu-toggle" type="button" aria-label="Open menu" aria-expanded="false">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
      <ul class="nav-links" id="nav-links">
        ${renderNavListItems(siteUrl)}
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
          <img class="logo logo-light" src="/mjg-logos/mjg_black_white.png" alt="Michael J. Gauthier" />
          <img class="logo logo-dark" src="/mjg-logos/mjg_white.png" alt="Michael J. Gauthier" />
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
            <li><a href="${app}/login">Sign in</a></li>
            <li><a href="${app}/register">Register</a></li>
            <li><a href="${siteUrl}/#join">Join the Journey</a></li>
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
  return `<script>${NAV_BEHAVIOUR_JS}</script>`;
}

/**
 * Nav behaviour, shared by the server-rendered pages and the main/*.html injection: theme
 * toggle, the full-page mobile menu (with a scroll lock on <body>), and the dropdowns.
 *
 * Written defensively — the static pages carry their own inline nav scripts with differing
 * element ids, so every lookup is optional and the mobile/dropdown wiring works even when
 * this is the only script on the page.
 */
export const NAV_BEHAVIOUR_JS = `(function(){
  var logo=document.getElementById('nav-logo'),ti=document.getElementById('theme-icon'),
      tt=document.getElementById('theme-toggle'),mt=document.getElementById('mobile-menu-toggle'),
      nl=document.getElementById('nav-links');
  var SUN='<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
  var MOON='<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
  var HAM='<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>';
  var X='<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>';

  function applyTheme(t){
    document.documentElement.dataset.theme=t;
    try{localStorage.setItem('theme',t);}catch(e){}
    if(logo&&logo.dataset)logo.src=t==='dark'?logo.dataset.logoDark:logo.dataset.logoLight;
    if(ti)ti.innerHTML=t==='dark'?MOON:SUN;
  }
  function closeDropdowns(){
    var open=document.querySelectorAll('.nav-dropdown-menu.open');
    for(var i=0;i<open.length;i++)open[i].classList.remove('open');
    var exp=document.querySelectorAll('.nav-dropdown [aria-expanded="true"]');
    for(var j=0;j<exp.length;j++)exp[j].setAttribute('aria-expanded','false');
  }
  function openMenu(){
    if(nl)nl.classList.add('open');
    document.body.classList.add('mjg-nav-open');
    if(mt){mt.setAttribute('aria-expanded','true');var s=mt.querySelector('svg');if(s)s.innerHTML=X;}
  }
  function closeMenu(){
    if(nl)nl.classList.remove('open');
    document.body.classList.remove('mjg-nav-open');
    if(mt){mt.setAttribute('aria-expanded','false');var s=mt.querySelector('svg');if(s)s.innerHTML=HAM;}
  }

  if(tt)tt.addEventListener('click',function(){applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');});
  if(mt)mt.addEventListener('click',function(){
    if(nl&&nl.classList.contains('open'))closeMenu();else openMenu();
  });

  // Dropdown triggers: the caret button next to a parent link, or a parent that is itself a button.
  var triggers=document.querySelectorAll('.nav-caret-btn, .nav-parent-btn');
  for(var t2=0;t2<triggers.length;t2++){
    triggers[t2].addEventListener('click',function(e){
      e.preventDefault();e.stopPropagation();
      var parent=this.closest('.nav-dropdown');
      var menu=parent&&parent.querySelector('.nav-dropdown-menu');
      if(!menu)return;
      var isOpen=menu.classList.contains('open');
      closeDropdowns();
      if(!isOpen){menu.classList.add('open');this.setAttribute('aria-expanded','true');}
    });
  }

  document.addEventListener('click',function(e){
    if(!e.target.closest('.nav-dropdown'))closeDropdowns();
    // Tapping outside the bar closes the mobile menu, but taps inside it must not.
    if(nl&&nl.classList.contains('open')&&!e.target.closest('nav'))closeMenu();
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeDropdowns();closeMenu();}});
  // Leaving the mobile breakpoint should never strand the menu open.
  window.addEventListener('resize',function(){if(window.innerWidth>768)closeMenu();});

  applyTheme(document.documentElement.dataset.theme||'light');
})();`;

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

/**
 * Frontend nav for the STATIC marketing pages in main/*.html.
 *
 * Those pages ship their own hardcoded nav and never call renderSiteHeader(), so the shared
 * nav has to be injected. The whole <ul> body is rebuilt from renderNavListItems() — patching
 * item by item across five files with differing markup was the fragile way to do this.
 *
 * Their own theme-toggle <li> is preserved verbatim: the files use two different ids
 * (theme-toggle / nav-theme-toggle) wired to their own inline scripts, so re-emitting a single
 * id would break the toggle on half the pages.
 */
const STATIC_NAV_STYLES = `<style id="mjg-frontend-nav">
  .nav-dropdown { position: relative; display: flex; align-items: center; gap: 0.15rem; }
  .nav-parent-btn, .nav-caret-btn {
    display: inline-flex; align-items: center; gap: 0.3rem; cursor: pointer;
    background: none; border: none; padding: 0; font-family: var(--font-body, inherit);
    font-size: 0.875rem; color: var(--nav-text, #111110); transition: opacity 0.2s;
  }
  .nav-parent-btn:hover, .nav-caret-btn:hover { opacity: 0.7; }
  .nav-caret { transition: transform 0.2s; }
  [aria-expanded="true"] .nav-caret { transform: rotate(180deg); }
  .nav-dropdown-menu {
    display: none; position: absolute; top: calc(100% + 0.7rem); left: 0; min-width: 180px;
    background: var(--nav-background, var(--nav-bg, #fff)); border: 1px solid var(--border, #e8e6e0);
    border-radius: 10px; padding: 0.4rem; box-shadow: 0 12px 30px rgba(0,0,0,0.12); z-index: 200;
  }
  .nav-dropdown:last-of-type .nav-dropdown-menu { left: auto; right: 0; }
  .nav-dropdown-menu.open { display: block; }
  .nav-dropdown-menu a {
    display: block; padding: 0.6rem 0.75rem; border-radius: 6px; white-space: nowrap;
    font-size: 0.875rem; color: var(--nav-text, #111110); text-decoration: none;
  }
  .nav-dropdown-menu a:hover { background: var(--surface-alt, rgba(0,0,0,.05)); opacity: 1; }
  .nav-mobile-only { display: none; }
  .mjg-nav-cta {
    display: block; text-align: center; padding: 0.85rem 1.25rem; border-radius: 8px;
    background: var(--btn-bg, #111110); color: var(--btn-text, #fff) !important;
    font-weight: 700; font-size: 1rem; text-decoration: none;
  }
  .mjg-nav-auth-btn {
    display: block; text-align: center; padding: 0.8rem 1rem; border-radius: 8px;
    border: 1px solid var(--border, #e8e6e0); color: var(--nav-text, #111110) !important;
    font-weight: 600; font-size: 0.95rem; text-decoration: none;
  }
  @media (max-width: 768px) {
    /* Full-page mobile menu. The page's own script toggles .open; this only restyles it. */
    .nav-links.open {
      display: flex !important; position: fixed; top: 60px; left: 0; right: 0; bottom: 0;
      flex-direction: column; align-items: stretch; gap: 0.35rem;
      padding: 1.25rem 1.5rem 2.5rem; overflow-y: auto; z-index: 150;
      background: var(--nav-background, var(--nav-bg, #fff));
    }
    .nav-links.open > li { width: 100%; }
    .nav-links.open > li > a, .nav-links.open .nav-parent-link {
      display: block; width: 100%; box-sizing: border-box;
      padding: 0.85rem 0; font-size: 1.05rem; border-bottom: 1px solid var(--border, #e8e6e0);
    }
    .nav-links.open .nav-mobile-only { display: block; }
    .nav-links.open .nav-dropdown { display: block; }
    .nav-links.open .nav-caret-btn, .nav-links.open .nav-parent-btn { display: none; }
    .nav-links.open .nav-dropdown-menu { display: none !important; }
    /* Mobile order per spec: Home, About, Mission, Resources, Videos, Book Waitlist,
       Join the Journey, Contact, Sign in/Register, theme toggle. */
    .nav-links.open .nav-item-home { order: 1; }
    .nav-links.open .nav-item-about { order: 2; }
    .nav-links.open .nav-item-mission { order: 3; }
    .nav-links.open .nav-item-resources { order: 4; }
    .nav-links.open .nav-mobile-child { order: 5; }
    .nav-links.open .nav-mobile-join { order: 7; }
    .nav-links.open .nav-item-contact { order: 8; }
    .nav-links.open .nav-mobile-auth { order: 9; }
    .nav-links.open .nav-toggle-item { order: 10; }
    /* Account collapses on mobile — Sign in / Register are their own buttons below. */
    .nav-links.open .nav-item-account { display: none; }
    .nav-links.open .nav-mobile-auth {
      display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-top: 0.9rem;
    }
    .nav-links.open .mjg-nav-cta { margin-top: 1.1rem; }
    .nav-links.open .nav-toggle-item { margin-top: 0.9rem; }
    .nav-links.open .theme-toggle, .nav-links.open .nav-theme-toggle {
      width: 100%; border-radius: 8px; height: 46px;
    }
    /* Hero CTAs stack to equal width on phones instead of hugging their label. */
    .hero-ctas { flex-direction: column; align-items: stretch; }
    .hero-ctas .btn { width: 100%; min-width: 0; }
  }
  body.mjg-nav-open { overflow: hidden; }
</style>`;

/**
 * Dropdown + scroll-lock behaviour for the static pages ONLY.
 *
 * Deliberately does NOT wire the hamburger or the theme toggle: each page already has its own
 * handlers for those. A second hamburger handler would toggle .open twice per click and the
 * menu would open and immediately close — so the scroll lock watches the class instead.
 */
const STATIC_NAV_SCRIPT = `<script>(function(){
  function closeDropdowns(){
    var open=document.querySelectorAll('.nav-dropdown-menu.open');
    for(var i=0;i<open.length;i++)open[i].classList.remove('open');
    var exp=document.querySelectorAll('.nav-dropdown [aria-expanded="true"]');
    for(var j=0;j<exp.length;j++)exp[j].setAttribute('aria-expanded','false');
  }
  var triggers=document.querySelectorAll('.nav-caret-btn, .nav-parent-btn');
  for(var t=0;t<triggers.length;t++){
    triggers[t].addEventListener('click',function(e){
      e.preventDefault();e.stopPropagation();
      var parent=this.closest('.nav-dropdown');
      var menu=parent&&parent.querySelector('.nav-dropdown-menu');
      if(!menu)return;
      var isOpen=menu.classList.contains('open');
      closeDropdowns();
      if(!isOpen){menu.classList.add('open');this.setAttribute('aria-expanded','true');}
    });
  }
  document.addEventListener('click',function(e){
    if(!e.target.closest('.nav-dropdown'))closeDropdowns();
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeDropdowns();});

  // Mirror the page's own .open toggle onto <body> so the page behind can't scroll.
  var nl=document.getElementById('nav-links');
  if(nl&&window.MutationObserver){
    new MutationObserver(function(){
      document.body.classList.toggle('mjg-nav-open', nl.classList.contains('open'));
    }).observe(nl,{attributes:true,attributeFilter:['class']});
  }
})();</script>`;

function injectFrontendNav(html: string, siteUrl: string) {
  if (html.includes("mjg-frontend-nav")) return html; // already injected

  const withNav = html.replace(
    /(<ul class="nav-links" id="nav-links">)([\s\S]*?)(<\/ul>)/,
    (_match, open: string, body: string, close: string) => {
      // Keep this page's own theme-toggle button exactly as it is.
      const toggle = body.match(/<li>\s*<button id="(?:nav-)?theme-toggle"[\s\S]*?<\/li>/);
      const toggleHtml = toggle ? `<li class="nav-toggle-item">${toggle[0].replace(/^<li>/, "").replace(/<\/li>$/, "")}</li>` : undefined;
      return `${open}\n        ${renderNavListItems(siteUrl, toggleHtml)}\n      ${close}`;
    },
  );
  if (withNav === html) return html; // no nav list on this page

  // Several of the main/*.html sources are partial documents with no </head> or </body> at
  // all (about-us, resources, post), so anchored injection silently does nothing there.
  // Fall back to appending — browsers accept <style>/<script> anywhere in the document.
  const withStyles = withNav.includes("</head>")
    ? withNav.replace("</head>", `${STATIC_NAV_STYLES}\n</head>`)
    : `${STATIC_NAV_STYLES}\n${withNav}`;

  return withStyles.includes("</body>")
    ? withStyles.replace("</body>", `${STATIC_NAV_SCRIPT}\n</body>`)
    : `${withStyles}\n${STATIC_NAV_SCRIPT}`;
}

function transformStaticHtml(html: string) {
  const siteUrl = publicSiteUrl();
  const app = appUrl();
  let output = html
    // The source HTML points footer "Register" at the newsletter anchor (#join). Registration
    // is a real page now, so retarget it BEFORE the generic host rewrite below turns the URL
    // into ${siteUrl}/#join and makes it unmatchable.
    .replace(
      /<a href="https:\/\/my\.michaeljgauthier\.com\/#join">Register<\/a>/g,
      `<a href="${app}/register">Register</a>`,
    )
    .replaceAll("https://blueprint.michaeljgauthier.com", siteUrl)
    // The main/*.html sources hardcode ~72 my.michaeljgauthier.com nav/footer/CTA
    // links. Rewrite them to the configured site domain so the marketing pages
    // follow the primary-domain move (via NEXT_PUBLIC_SITE_URL) instead of leaning
    // on the my. → apex redirect. URL host only, so mailto:/@ addresses are safe.
    .replaceAll("https://my.michaeljgauthier.com", siteUrl)
    .replace(/https:\/\/michaeljgauthier\.com\/login\/?/g, `${siteUrl}/login`)
    // Was pointed at the /#join newsletter anchor back when there was no registration page.
    .replace(/https:\/\/michaeljgauthier\.com\/register\/?/g, `${app}/register`)
    .replace(
      /const FLUENT_CRM_ENDPOINT = 'https:\/\/michaeljgauthier\.com\/\?fluentcrm=1&route=contact&hash=[^']+';/g,
      "const FLUENT_CRM_ENDPOINT = '/api/public/join-journey';",
    )
    .replace(
      /var FLUENT_CRM_URL = 'https:\/\/michaeljgauthier\.com\/\?fluentcrm=1&route=contact&hash=[^']+';/g,
      "var FLUENT_CRM_URL = '/api/public/join-journey';",
    )
    .replace("const POST_PAGE = 'post.html';", "const POST_PAGE = '/post';")
    // Nav: replace the "Listen" item (an audio-modal button, or a /listen link) with a
    // "Videos" link to the challenge video library, and drop its now-dead click handler so
    // the page's inline script doesn't throw on a missing element.
    .replace(
      /<li>\s*<button id="listen-(?:btn|nav)"[^>]*>\s*Listen\s*<\/button>\s*<\/li>/gi,
      `<li><a href="${siteUrl}/6-week-challenge/videos" class="nav-link-plain">Videos</a></li>`,
    )
    .replace(
      /<li>\s*<a href="[^"]*\/listen"[^>]*>\s*Listen\s*<\/a>\s*<\/li>/gi,
      `<li><a href="${siteUrl}/6-week-challenge/videos">Videos</a></li>`,
    )
    .replace(/document\.getElementById\(['"]listen-(?:btn|nav)['"]\)\s*\.addEventListener\([^;]*\);/g, "")
    // The nav is rebuilt below (injectFrontendNav), which removes elements these pages' own
    // inline scripts still reach for — about-us.html, for one, does
    // getElementById('join-btn').addEventListener(...), and that TypeError would kill the rest
    // of its script, taking the theme toggle and hamburger with it. Make every such lookup
    // null-safe rather than trying to delete multi-line handler bodies with a regex.
    .replace(/(document\.getElementById\((['"])[^'"]+\2\))\s*\.addEventListener\(/g, "$1?.addEventListener(");

  for (const [fileName, route] of Object.entries(STATIC_ROUTES)) {
    const absolute = `${siteUrl}${route === "/" ? "/" : route}`;
    output = output
      .replace(new RegExp(`href="${escapeRegExp(fileName)}"`, "g"), `href="${absolute}"`)
      .replace(new RegExp(`href='${escapeRegExp(fileName)}'`, "g"), `href='${absolute}'`);
  }

  return injectFrontendNav(
    injectMobileNavStyle(injectViewport(injectLegalFooterColumn(injectPwa(injectFaviconLinks(output))))),
    siteUrl,
  );
}

// The exported main/*.html pages carry their own nav CSS; on phones the "Michael J. Gauthier"
// wordmark wraps to two lines and looks broken. Hide it below 768px (keep the logo mark).
function injectMobileNavStyle(html: string) {
  const style = `<style>@media (max-width:768px){.nav-logo-text{display:none !important;}}</style>\n`;
  if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, `  ${style}</head>`);
  if (/<head[^>]*>/i.test(html)) return html.replace(/(<head[^>]*>)/i, `$1\n  ${style}`);
  return `${style}${html}`;
}

// Several exported main/*.html pages (about-us, created-for-more, post, resources) are Bricks
// code-block fragments with no <head> and no viewport meta — so phones render them at desktop
// width and shrink everything. Inject the viewport meta when it's missing (browsers hoist a
// leading <meta> into <head>).
function injectViewport(html: string) {
  if (/<meta[^>]+name=["']viewport["']/i.test(html)) return html;
  const tag = `<meta name="viewport" content="width=device-width, initial-scale=1" />\n`;
  if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, `  ${tag}</head>`);
  if (/<head[^>]*>/i.test(html)) return html.replace(/(<head[^>]*>)/i, `$1\n  ${tag}`);
  return `${tag}${html}`;
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
  const tag = `${renderFaviconLinks()}\n`;
  // Prefer just before </head>; but some exported pages (e.g. about-us.html) are
  // head-less fragments with no </head> — there a plain replace would no-op and the
  // tab would fall back to the browser's default icon. Fall back to just after the
  // opening <head>, else prepend (the browser hoists leading <link> tags into <head>).
  if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, `  ${tag}</head>`);
  if (/<head[^>]*>/i.test(html)) return html.replace(/(<head[^>]*>)/i, `$1\n  ${tag}`);
  return `${tag}${html}`;
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

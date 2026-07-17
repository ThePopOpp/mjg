import { NextResponse } from "next/server";
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

// SMS / email opt-in and opt-out pages.
//
// These are the consent pages Twilio's A2P 10DLC review looks at, so the exact
// disclosure wording on the opt-in forms matters: program name, message frequency,
// "Msg & data rates may apply", STOP/HELP, and links to the Privacy Policy and
// Terms. Keep those intact if you restyle this.
//
// Rendered as HTML (not React) so they reuse the real site header/footer/theme —
// the same chrome as /mission and /resources — instead of a second copy that
// drifts. The forms are a few lines of vanilla JS posting to the same
// /api/public/* endpoints the React versions used.

type Kind = "sms" | "email";
type Mode = "opt-in" | "opt-out";

const COPY = {
  sms: {
    "opt-in": {
      title: "Subscribe to SMS Updates",
      lede: "Get occasional encouragement and stewardship reminders by text.",
      submit: "Subscribe to texts",
      successTitle: "You’re subscribed.",
      successBody: "Reply STOP at any time to unsubscribe, or HELP for help.",
    },
    "opt-out": {
      title: "Unsubscribe from SMS",
      lede: "Enter the mobile number you'd like to stop receiving texts on. You can also reply STOP to any message.",
      submit: "Unsubscribe from texts",
      successTitle: "You’ve been unsubscribed.",
      successBody: "You won’t receive any more texts. You can opt back in at any time.",
    },
  },
  email: {
    "opt-in": {
      title: "Subscribe to Email Updates",
      lede: "Get new resources, teaching and stewardship encouragement by email.",
      submit: "Subscribe to emails",
      successTitle: "You’re subscribed.",
      successBody: "You can unsubscribe at any time using the link in any email.",
    },
    "opt-out": {
      title: "Unsubscribe from Email",
      lede: "Enter the email address you'd like to stop receiving messages at.",
      submit: "Unsubscribe from emails",
      successTitle: "You’ve been unsubscribed.",
      successBody: "You won’t receive any more emails. You can opt back in at any time.",
    },
  },
} as const;

export function renderConsentPage(kind: Kind, mode: Mode) {
  const siteUrl = publicSiteUrl();
  const copy = COPY[kind][mode];
  const isOptIn = mode === "opt-in";
  const isSms = kind === "sms";
  const endpoint = `/api/public/${kind}/${mode}`;
  const otherHref = `/${kind}/${isOptIn ? "opt-out" : "opt-in"}`;
  const otherLabel = isOptIn ? `Unsubscribe from ${isSms ? "texts" : "emails"} instead` : `Subscribe to ${isSms ? "texts" : "emails"} instead`;

  const field = isSms
    ? `<label class="c-label" for="contact">Mobile number</label>
       <input class="c-input" id="contact" name="contact" type="tel" required autocomplete="tel" placeholder="+1 (555) 000-0000" />`
    : `<label class="c-label" for="contact">Email address</label>
       <input class="c-input" id="contact" name="contact" type="email" required autocomplete="email" placeholder="you@example.com" />`;

  const nameField = isOptIn
    ? `<div class="c-field">
         <label class="c-label" for="firstName">First name <span class="c-optional">(optional)</span></label>
         <input class="c-input" id="firstName" name="firstName" type="text" autocomplete="given-name" placeholder="Your first name" />
       </div>`
    : "";

  // A2P 10DLC disclosure. Wording is deliberate — see the note at the top.
  const consent = isOptIn
    ? `<label class="c-consent">
         <input type="checkbox" id="agreed" required />
         <span>
           ${
             isSms
               ? `I agree to receive text messages from <strong>Michael J. Gauthier</strong> (Created for More) at the number provided, including messages sent by an automatic telephone dialing system. Consent is not a condition of any purchase. Message frequency varies. Msg &amp; data rates may apply. Reply <strong>STOP</strong> to unsubscribe or <strong>HELP</strong> for help.`
               : `I agree to receive emails from <strong>Michael J. Gauthier</strong> (Created for More) at the address provided. Email frequency varies, and I can unsubscribe at any time using the link in any message.`
           }
           See our <a href="/privacy">Privacy Policy</a> and <a href="/terms">Terms of Service</a>.
         </span>
       </label>`
    : "";

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${copy.title} | Michael J. Gauthier</title>
  <meta name="description" content="${copy.lede}" />
  ${renderFaviconLinks()}
  ${renderPwaHeadTags()}
  ${renderThemeScript()}
  ${renderFonts()}
  <style>
    ${renderNavStyles()}

    *, *::before, *::after { box-sizing: border-box; }

    :root {
      --paper: #fbfaf7; --ink: #070807; --muted: #5f6d66;
      --line: #e4ded2; --gold: #C9A46E; --card: #ffffff;
    }
    [data-theme="dark"] {
      --paper: #10110f; --ink: #f8f6f1; --muted: #b6bcb6;
      --line: #2b2a25; --card: #1a1b18;
    }

    body { margin:0; background:var(--paper); color:var(--ink); font-family:var(--font-body); }
    main { min-height:60vh; padding:64px 20px 88px; }
    .c-wrap { max-width:560px; margin:0 auto; }

    .c-eyebrow {
      display:inline-flex; border:1px solid var(--line); border-radius:999px; padding:7px 16px;
      color:var(--gold); font-weight:700; letter-spacing:.16em; text-transform:uppercase; font-size:11px; margin-bottom:18px;
    }
    .c-wrap h1 { font-family:var(--font-display); font-size:clamp(30px,5vw,44px); line-height:1.1; margin:0 0 12px; }
    .c-lede { color:var(--muted); font-size:16px; line-height:1.7; margin:0 0 28px; }

    .c-card { border:1px solid var(--line); border-radius:14px; background:var(--card); padding:26px; }
    .c-field { margin-bottom:18px; }
    .c-label { display:block; font-size:13px; font-weight:600; margin-bottom:6px; color:var(--ink); }
    .c-optional { color:var(--muted); font-weight:400; }
    .c-input {
      width:100%; border:1px solid var(--line); border-radius:8px; background:var(--paper); color:var(--ink);
      padding:11px 13px; font-size:15px; font-family:inherit; transition:border-color .2s;
    }
    .c-input:focus { outline:none; border-color:var(--gold); box-shadow:0 0 0 3px rgba(201,164,110,.18); }

    .c-consent { display:flex; gap:10px; align-items:flex-start; margin:20px 0; font-size:13px; line-height:1.65; color:var(--muted); }
    .c-consent input { margin-top:3px; width:16px; height:16px; accent-color:var(--gold); flex-shrink:0; }
    .c-consent a { color:var(--gold); text-decoration:underline; text-underline-offset:2px; }
    .c-consent strong { color:var(--ink); }

    .c-submit {
      width:100%; border:0; border-radius:8px; background:var(--ink); color:var(--paper);
      padding:13px 20px; font-size:15px; font-weight:700; font-family:inherit; cursor:pointer; transition:opacity .2s;
    }
    .c-submit:hover { opacity:.88; }
    .c-submit:disabled { opacity:.55; cursor:not-allowed; }

    .c-error { margin:14px 0 0; color:#b3261e; font-size:14px; }
    [data-theme="dark"] .c-error { color:#f2b8b5; }

    .c-success { text-align:center; padding:12px 0; }
    .c-success-mark {
      width:46px; height:46px; margin:0 auto 14px; border-radius:999px; border:2px solid var(--gold);
      display:flex; align-items:center; justify-content:center; color:var(--gold); font-size:22px; line-height:1;
    }
    .c-success h2 { font-family:var(--font-display); font-size:24px; margin:0 0 8px; color:var(--ink); }
    .c-success p { color:var(--muted); font-size:15px; line-height:1.7; margin:0; }

    .c-foot { margin-top:22px; display:flex; flex-wrap:wrap; gap:8px 18px; justify-content:center; font-size:13px; }
    .c-foot a { color:var(--muted); text-decoration:none; }
    .c-foot a:hover { color:var(--gold); }

    @media(max-width:560px){ main{padding:40px 16px 64px;} .c-card{padding:20px;} }
  </style>
</head>
<body>
  ${renderSiteHeader(siteUrl)}

  <main>
    <div class="c-wrap">
      <div class="c-eyebrow">${isSms ? "Text messages" : "Email"}</div>
      <h1>${copy.title}</h1>
      <p class="c-lede">${copy.lede}</p>

      <div class="c-card">
        <form id="c-form" novalidate="false">
          ${nameField}
          <div class="c-field">${field}</div>
          ${consent}
          <button class="c-submit" type="submit" id="c-submit">${copy.submit}</button>
          <p class="c-error" id="c-error" hidden></p>
        </form>

        <div class="c-success" id="c-success" hidden>
          <div class="c-success-mark" aria-hidden="true">&check;</div>
          <h2>${copy.successTitle}</h2>
          <p>${copy.successBody}</p>
        </div>
      </div>

      <div class="c-foot">
        <a href="${otherHref}">${otherLabel}</a>
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
      </div>
    </div>
  </main>

  ${renderSiteFooter(siteUrl)}
  ${renderNavScript()}
  ${renderInstallScript()}

  <script>
    (function () {
      var form = document.getElementById('c-form');
      var btn = document.getElementById('c-submit');
      var err = document.getElementById('c-error');
      var ok = document.getElementById('c-success');

      function fail(msg) {
        err.textContent = msg;
        err.hidden = false;
        btn.disabled = false;
        btn.textContent = ${JSON.stringify(copy.submit)};
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        // Let the browser handle "required" and email/tel format first.
        if (!form.reportValidity()) return;

        err.hidden = true;
        btn.disabled = true;
        btn.textContent = 'Working…';

        var payload = {};
        payload[${JSON.stringify(isSms ? "phone" : "email")}] = document.getElementById('contact').value.trim();
        var name = document.getElementById('firstName');
        if (name) payload.firstName = name.value.trim();

        fetch(${JSON.stringify(endpoint)}, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
          .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
          .then(function (res) {
            if (!res.ok) return fail(res.d && res.d.error ? res.d.error : 'Something went wrong. Please try again.');
            form.hidden = true;
            ok.hidden = false;
          })
          .catch(function () { fail('Network error. Please try again.'); });
      });
    })();
  </script>
</body>
</html>`;

  return new NextResponse(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}

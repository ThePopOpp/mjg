import { NextResponse } from "next/server";
import {
  appUrl,
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
} from "@/lib/public-site/static-pages";

// "Join the Movement" — the canonical, linkable signup page.
//
// This used to serve the legacy static file main/join-the-movement.html. It's now
// rendered here, at the same URL, so existing indexing and inbound links survive.
//
// The form posts to the EXISTING /api/public/join-journey endpoint with
// form_type=join_the_journey — that's what upserts the participant, starts the
// 7-day email journey and records the submission. Don't add a second endpoint.
//
// Fields mirror the homepage #join modal (main/index.html), which is the fuller of
// the two legacy forms. church_name and questions aren't mapped onto the participant
// record, but the endpoint stores the whole raw body in form_submissions.payload, so
// they persist without any extra work.

const HEAR_ABOUT_OPTIONS = [
  "Google",
  "AI",
  "YouTube",
  "LinkedIn",
  "Facebook",
  "Church",
  "Friend",
  "Family",
  "Strategic Income Group",
  "Other",
];

const NEXT_STEPS: Array<{ step: string; title: string; body: string }> = [
  {
    step: "1",
    title: "A welcome note",
    body: "You'll get an email right away confirming you're in, with access to your account on the site.",
  },
  {
    step: "2",
    title: "Seven days of encouragement",
    body: "Over the following week, a short reflection lands in your inbox each day — one part of the Stewardship Blueprint at a time: time, talent, treasure, and purpose.",
  },
  {
    step: "3",
    title: "Early access as the book takes shape",
    body: "Chapter drafts, reflection worksheets, and invitations to live Q&A. Your input genuinely shapes what gets written.",
  },
];

export const dynamic = "force-dynamic";

export function GET() {
  const siteUrl = publicSiteUrl();
  const app = appUrl();

  const hearAboutOptions = HEAR_ABOUT_OPTIONS.map(
    (option) => `<option value="${option}">${option}</option>`,
  ).join("");

  const nextSteps = NEXT_STEPS.map(
    (item) => `
      <li class="j-step">
        <span class="j-step-num" aria-hidden="true">${item.step}</span>
        <div>
          <h3>${item.title}</h3>
          <p>${item.body}</p>
        </div>
      </li>`,
  ).join("");

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Join the Movement | Michael J. Gauthier</title>
  <meta name="description" content="Join the movement to use God-given resources for God-given purposes. Sign up for The Journey and get seven days of stewardship encouragement, early chapter drafts, and reflection worksheets." />
  <link rel="canonical" href="${siteUrl}/join-the-movement" />
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

    /* ── Hero ── */
    .j-hero { padding:78px 20px 60px; text-align:center; border-bottom:1px solid var(--line); }
    .j-hero-inner { max-width:760px; margin:0 auto; }
    .j-eyebrow {
      display:inline-flex; border:1px solid var(--line); border-radius:999px; padding:8px 18px;
      color:var(--gold); font-weight:700; letter-spacing:.16em; text-transform:uppercase;
      font-size:11px; margin-bottom:26px;
    }
    .j-hero h1 {
      font-family:var(--font-display); font-size:clamp(36px,6.4vw,64px);
      line-height:1.04; margin:0 0 20px;
    }
    .j-hero h1 em { color:var(--gold); font-style:italic; }
    .j-lede { color:var(--muted); font-size:19px; line-height:1.7; max-width:620px; margin:0 auto 30px; }
    .j-perks { display:flex; flex-wrap:wrap; justify-content:center; gap:14px 26px; margin:0; padding:0; list-style:none; }
    .j-perks li { display:inline-flex; align-items:center; gap:9px; font-size:14.5px; color:var(--ink); }
    .j-perks li::before { content:"\\2713"; color:var(--gold); font-weight:800; }

    /* ── Form ── */
    .j-form-section { padding:56px 20px 24px; }
    .j-wrap { max-width:640px; margin:0 auto; }
    .j-card { border:1px solid var(--line); border-radius:16px; background:var(--card); padding:30px; }
    .j-card-head { margin-bottom:24px; }
    .j-card-head h2 { font-family:var(--font-display); font-size:29px; line-height:1.15; margin:0 0 8px; }
    .j-card-head p { color:var(--muted); font-size:14.5px; line-height:1.65; margin:0; }

    .j-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .j-field { margin-bottom:18px; }
    .j-label { display:block; font-size:13px; font-weight:600; margin-bottom:6px; color:var(--ink); }
    .j-optional { color:var(--muted); font-weight:400; }
    .j-input, .j-select, .j-textarea {
      width:100%; border:1px solid var(--line); border-radius:8px; background:var(--paper); color:var(--ink);
      padding:12px 13px; font-size:15px; font-family:inherit; line-height:1.5;
      min-height:46px; transition:border-color .2s, box-shadow .2s;
    }
    .j-textarea { min-height:104px; resize:vertical; }
    .j-select { appearance:none; cursor:pointer; padding-right:40px;
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235f6d66' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
      background-repeat:no-repeat; background-position:right 13px center; background-size:18px; }
    [data-theme="dark"] .j-select {
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23b6bcb6' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    }
    .j-input:focus, .j-select:focus, .j-textarea:focus {
      outline:none; border-color:var(--gold); box-shadow:0 0 0 3px rgba(201,164,110,.18);
    }
    .j-help { display:block; margin-top:6px; font-size:12.5px; line-height:1.6; color:var(--muted); }
    .j-field-error { display:none; margin-top:6px; font-size:12.5px; color:#b3261e; }
    [data-theme="dark"] .j-field-error { color:#f2b8b5; }
    .j-field.has-error .j-input, .j-field.has-error .j-select, .j-field.has-error .j-textarea { border-color:#b3261e; }
    .j-field.has-error .j-field-error { display:block; }

    .j-consent { display:flex; gap:11px; align-items:flex-start; margin:22px 0 4px; font-size:13px; line-height:1.65; color:var(--muted); }
    .j-consent input { margin:2px 0 0; width:18px; height:18px; accent-color:var(--gold); flex-shrink:0; }
    .j-consent a { color:var(--gold); text-decoration:underline; text-underline-offset:2px; }
    .j-consent strong { color:var(--ink); }
    .j-consent.has-error span { color:#b3261e; }
    [data-theme="dark"] .j-consent.has-error span { color:#f2b8b5; }

    .j-submit {
      width:100%; margin-top:20px; border:0; border-radius:8px; background:var(--gold); color:#1a1206;
      padding:15px 20px; font-size:16px; font-weight:700; font-family:inherit; cursor:pointer;
      min-height:52px; transition:opacity .2s;
    }
    .j-submit:hover { opacity:.9; }
    .j-submit:disabled { opacity:.55; cursor:not-allowed; }
    .j-submit:focus-visible, .j-input:focus-visible, .j-select:focus-visible,
    .j-textarea:focus-visible, .j-consent input:focus-visible { outline:2px solid var(--gold); outline-offset:2px; }

    .j-error { margin:16px 0 0; padding:11px 13px; border-radius:8px; font-size:14px; line-height:1.6;
      color:#b3261e; background:rgba(179,38,30,.08); border:1px solid rgba(179,38,30,.28); }
    [data-theme="dark"] .j-error { color:#f2b8b5; background:rgba(242,184,181,.09); border-color:rgba(242,184,181,.3); }
    .j-fine { margin:16px 0 0; font-size:12.5px; line-height:1.65; color:var(--muted); text-align:center; }

    /* ── Success ── */
    .j-success { text-align:center; padding:14px 4px 8px; }
    .j-success-mark {
      width:56px; height:56px; margin:0 auto 18px; border-radius:999px; border:2px solid var(--gold);
      display:flex; align-items:center; justify-content:center; color:var(--gold); font-size:27px; line-height:1;
    }
    .j-success h2 { font-family:var(--font-display); font-size:29px; margin:0 0 10px; color:var(--ink); }
    .j-success p { color:var(--muted); font-size:15.5px; line-height:1.7; margin:0 auto; max-width:420px; }
    .j-success .j-success-links { margin-top:24px; display:flex; flex-wrap:wrap; gap:10px; justify-content:center; }
    .j-success-links a {
      display:inline-flex; align-items:center; min-height:44px; padding:11px 20px; border-radius:8px;
      border:1px solid var(--line); color:var(--ink); text-decoration:none; font-size:14px; font-weight:600;
      transition:border-color .2s, color .2s;
    }
    .j-success-links a:hover { border-color:var(--gold); color:var(--gold); }

    /* ── What happens next ── */
    .j-next { padding:24px 20px 88px; }
    .j-next-inner { max-width:640px; margin:0 auto; }
    .j-next h2 { font-family:var(--font-display); font-size:clamp(26px,4vw,36px); margin:0 0 8px; text-align:center; }
    .j-next-lede { color:var(--muted); font-size:15px; line-height:1.7; margin:0 0 32px; text-align:center; }
    .j-steps { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:20px; }
    .j-step { display:flex; gap:16px; align-items:flex-start; }
    .j-step-num {
      flex:0 0 34px; height:34px; border-radius:999px; background:rgba(201,164,110,.16); color:var(--gold);
      display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700;
    }
    .j-step h3 { font-family:var(--font-display); font-size:20px; margin:4px 0 6px; color:var(--ink); }
    .j-step p { color:var(--muted); font-size:14.5px; line-height:1.7; margin:0; }

    @media (max-width:600px) {
      .j-hero { padding:52px 16px 44px; }
      .j-form-section { padding:40px 16px 20px; }
      .j-next { padding:20px 16px 64px; }
      .j-card { padding:22px; }
      .j-row { grid-template-columns:1fr; gap:0; }
    }
  </style>
</head>
<body>
  ${renderSiteHeader(siteUrl)}

  <main>
    <section class="j-hero">
      <div class="j-hero-inner">
        <div class="j-eyebrow">Join the Movement</div>
        <h1>Your resources were never <em>only yours</em></h1>
        <p class="j-lede">
          Time, talent, and treasure — entrusted, not earned. This is a movement of people
          learning to steward what God has given them for the people and causes He has
          placed on their hearts. Add your name, and walk it with us.
        </p>
        <ul class="j-perks">
          <li>Early chapter drafts</li>
          <li>Reflection worksheets</li>
          <li>Live Q&amp;A invites</li>
          <li>Blueprint actions</li>
        </ul>
      </div>
    </section>

    <section class="j-form-section">
      <div class="j-wrap">
        <div class="j-card">
          <div id="j-form-body">
            <div class="j-card-head">
              <h2>Join the Journey</h2>
              <p>Tell us a little about yourself. You&rsquo;ll hear from us within a few minutes.</p>
            </div>

            <form id="j-form" novalidate>
              <div class="j-row">
                <div class="j-field" data-field>
                  <label class="j-label" for="first_name">First name</label>
                  <input class="j-input" id="first_name" name="first_name" type="text" required autocomplete="given-name" />
                  <span class="j-field-error">Please enter your first name.</span>
                </div>
                <div class="j-field" data-field>
                  <label class="j-label" for="last_name">Last name</label>
                  <input class="j-input" id="last_name" name="last_name" type="text" required autocomplete="family-name" />
                  <span class="j-field-error">Please enter your last name.</span>
                </div>
              </div>

              <div class="j-row">
                <div class="j-field" data-field>
                  <label class="j-label" for="email">Email address</label>
                  <input class="j-input" id="email" name="email" type="email" required autocomplete="email" placeholder="you@example.com" />
                  <span class="j-field-error">Please enter a valid email address.</span>
                </div>
                <div class="j-field" data-field>
                  <label class="j-label" for="phone">Phone number</label>
                  <input class="j-input" id="phone" name="phone" type="tel" required autocomplete="tel" placeholder="(555) 000-0000" />
                  <span class="j-field-error">Please enter your phone number.</span>
                </div>
              </div>

              <div class="j-field" data-field>
                <label class="j-label" for="hear_about">How did you hear about us?</label>
                <select class="j-select" id="hear_about" name="hear_about" required>
                  <option value="">Select an option&hellip;</option>
                  ${hearAboutOptions}
                </select>
                <span class="j-field-error">Please choose an option.</span>
              </div>

              <div class="j-field" id="j-church-field" data-field hidden>
                <label class="j-label" for="church_name">Church name <span class="j-optional">(optional)</span></label>
                <input class="j-input" id="church_name" name="church_name" type="text" placeholder="Where do you worship?" />
              </div>

              <div class="j-field" data-field>
                <label class="j-label" for="questions">Questions &amp; comments <span class="j-optional">(optional)</span></label>
                <textarea class="j-textarea" id="questions" name="questions" placeholder="Share any thoughts or questions&hellip;"></textarea>
              </div>

              <label class="j-consent" id="j-consent">
                <input type="checkbox" id="agree" name="agree" required />
                <span>
                  I agree to <strong>The Stewardship Blueprint</strong>&rsquo;s
                  <a href="${app}/privacy">Privacy Policy</a> and
                  <a href="${app}/terms">Terms of Service</a>. I understand I&rsquo;ll receive
                  updates and resources related to stewardship and biblical principles of
                  financial integrity, and I can unsubscribe at any time.
                </span>
              </label>

              <button class="j-submit" type="submit" id="j-submit">Join the Journey &rarr;</button>
              <p class="j-error" id="j-error" hidden></p>
              <p class="j-fine">
                Your information is only used to send you updates about The Stewardship
                Blueprint. No spam, ever. Unsubscribe at any time.
              </p>
            </form>
          </div>

          <div class="j-success" id="j-success" hidden tabindex="-1">
            <div class="j-success-mark" aria-hidden="true">&check;</div>
            <h2>Welcome to the movement.</h2>
            <p>
              You&rsquo;re on the journey. Check your inbox &mdash; a welcome note with your
              account details is on its way, and the first reflection follows shortly after.
            </p>
            <div class="j-success-links">
              <a href="${siteUrl}/mission">Read the mission</a>
              <a href="${siteUrl}/resources">Browse resources</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="j-next">
      <div class="j-next-inner">
        <h2>What happens next</h2>
        <p class="j-next-lede">No guesswork — here&rsquo;s exactly what lands in your inbox.</p>
        <ul class="j-steps">${nextSteps}</ul>
      </div>
    </section>
  </main>

  ${renderSiteFooter(siteUrl)}
  ${renderNavScript()}
  ${renderInstallScript()}

  <script>
    (function () {
      var form = document.getElementById('j-form');
      var formBody = document.getElementById('j-form-body');
      var success = document.getElementById('j-success');
      var btn = document.getElementById('j-submit');
      var err = document.getElementById('j-error');
      var hearAbout = document.getElementById('hear_about');
      var churchField = document.getElementById('j-church-field');
      var consent = document.getElementById('j-consent');
      var agree = document.getElementById('agree');
      var SUBMIT_LABEL = btn.textContent;

      // The church name field only makes sense for one answer — mirror the homepage.
      function syncChurchField() {
        churchField.hidden = hearAbout.value !== 'Church';
      }
      hearAbout.addEventListener('change', syncChurchField);
      syncChurchField();

      function fieldOf(el) { return el.closest('[data-field]'); }

      function clearError(el) {
        var f = fieldOf(el);
        if (f) f.classList.remove('has-error');
      }

      // Inline validation: mark the offending fields, focus the first one, no alert().
      function validate() {
        var invalid = [];
        var controls = form.querySelectorAll('input, select, textarea');
        for (var i = 0; i < controls.length; i++) {
          var el = controls[i];
          if (el === agree) continue;
          var f = fieldOf(el);
          if (f && f.hidden) continue;
          var ok = el.checkValidity();
          if (f) f.classList.toggle('has-error', !ok);
          if (!ok) invalid.push(el);
        }
        var agreed = agree.checked;
        consent.classList.toggle('has-error', !agreed);
        if (!agreed) invalid.push(agree);
        return invalid;
      }

      form.addEventListener('input', function (e) { clearError(e.target); });
      form.addEventListener('change', function (e) { clearError(e.target); });
      agree.addEventListener('change', function () {
        consent.classList.toggle('has-error', !agree.checked);
      });

      function fail(msg) {
        err.textContent = msg;
        err.hidden = false;
        btn.disabled = false;
        btn.textContent = SUBMIT_LABEL;
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        err.hidden = true;

        var invalid = validate();
        if (invalid.length) {
          invalid[0].focus();
          return;
        }

        btn.disabled = true;
        btn.textContent = 'Joining\\u2026';

        var payload = { form_type: 'join_the_journey', source: 'Join the Movement page' };
        new FormData(form).forEach(function (value, key) {
          payload[key] = typeof value === 'string' ? value.trim() : value;
        });
        payload.agree = agree.checked ? 'yes' : 'no';
        if (churchField.hidden) delete payload.church_name;

        fetch('/api/public/join-journey', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
          .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
          .then(function (res) {
            if (!res.ok || (res.d && res.d.ok === false)) {
              return fail((res.d && res.d.error) || 'Something went wrong. Please try again.');
            }
            formBody.hidden = true;
            success.hidden = false;
            success.focus();
          })
          .catch(function () { fail('Network error. Please check your connection and try again.'); });
      });
    })();
  </script>
</body>
</html>`;

  return new NextResponse(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}

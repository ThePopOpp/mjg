// npm run test:annual-retreat
//
// Checks from Mike's brief (docs/squeeze-page/…/Email_to_Jeremy.txt §5, §8, §9, §10)
// that can be proven without a database: every link token resolved, the right
// footer on the right email, the exact consent wording, the tracked links, and
// unsubscribe links that can't be forged.
import { test } from "node:test";
import assert from "node:assert/strict";

process.env.EMAIL_UNSUBSCRIBE_SECRET = "test-secret-for-unit-tests";

const { MARKETING_CONSENT_TEXT, FOLLOWUP_STEPS, allTrackedLinks, guideUrl, stewardUrl, trackedLink } = await import("./config.ts");
const { EMAILS, renderEmail } = await import("./emails.ts");
const { signUnsubscribe, verifyUnsubscribe, maskEmail } = await import("../email/unsubscribe-token.ts");

const base = "https://michaeljgauthier.com";
const input = (over = {}) => ({
  firstName: "Jordan",
  guideUrl: guideUrl("email", base),
  stewardUrl: stewardUrl(base),
  siteUrl: base,
  unsubscribe: { url: `${base}/email/unsubscribe?t=abc`, mailingAddress: "123 Main St, Scottsdale, AZ 85251" },
  ...over,
});
const KEYS = ["delivery", ...FOLLOWUP_STEPS.map((s) => s.key)];

test("the optional checkbox wording is Mike's, word for word", () => {
  assert.equal(
    MARKETING_CONSENT_TEXT,
    "Also send me a short series to help me use the guide and occasional Stewardship Blueprint reflections and resources. I can unsubscribe at any time.",
  );
});

test("follow-ups are timed Day 2, 5, 8 and 12 from the request", () => {
  assert.deepEqual(FOLLOWUP_STEPS.map((s) => s.day), [2, 5, 8, 12]);
  for (const s of FOLLOWUP_STEPS) assert.equal(s.offsetMs, s.day * 86_400_000);
});

test("every email resolves every link token", () => {
  for (const key of KEYS) {
    const r = renderEmail(key, input({ unsubscribe: key === "delivery" ? null : input().unsubscribe }));
    for (const body of [r.html, r.text]) {
      assert.doesNotMatch(body, /\[(GUIDE_URL|STEWARD_URL|BUTTON)[^\]]*\]|\{\{|\}\}/, `${key} has an unresolved token`);
    }
  }
  const steward = renderEmail("steward_next_step", input());
  assert.match(steward.html, /href="https:\/\/michaeljgauthier\.com\/meet-steward"/);
  assert.match(renderEmail("delivery", input({ unsubscribe: null })).html, /href="https:\/\/michaeljgauthier\.com\/annual-retreat\/guide\?via=email"/);
});

test("subjects and preheaders match the copy file", () => {
  assert.equal(EMAILS.delivery.subject, "Your free Annual Stewardship Blueprint Retreat Guide");
  assert.equal(EMAILS.delivery.preheader, "Your guide is ready. Choose a time to begin.");
  assert.equal(EMAILS.remember_release.subject, "Begin by remembering the season you have lived");
  assert.equal(EMAILS.discern_diagnose.subject, "What does this part of your life need now?");
  assert.equal(EMAILS.design_live.subject, "Give one decision a place in your week");
  assert.equal(EMAILS.steward_next_step.subject, "Continue building your personal Blueprint");
});

test("delivery has no unsubscribe or sales footer; follow-ups always carry unsubscribe and the address", () => {
  const delivery = renderEmail("delivery", input({ unsubscribe: null }));
  assert.doesNotMatch(delivery.html, /Unsubscribe/);
  assert.doesNotMatch(delivery.html, /\bSteward\b|meet-steward/);
  for (const s of FOLLOWUP_STEPS) {
    const r = renderEmail(s.key, input());
    assert.match(r.html, /Unsubscribe/);
    assert.match(r.html, /123 Main St, Scottsdale, AZ 85251/);
    assert.match(r.text, /Unsubscribe: https:\/\/michaeljgauthier\.com\/email\/unsubscribe/);
  }
});

test("the greeting appears only with a first name, and names are escaped", () => {
  assert.match(renderEmail("delivery", input({ unsubscribe: null })).html, /Hi Jordan,/);
  const none = renderEmail("delivery", input({ firstName: "", unsubscribe: null }));
  assert.doesNotMatch(none.html, /Hi /);
  assert.doesNotMatch(none.text, /^Hi /m);
  const evil = renderEmail("delivery", input({ firstName: "<script>x</script>", unsubscribe: null }));
  assert.doesNotMatch(evil.html, /<script>/);
});

test("nine tracked links: three posts × three networks, with Mike's UTM values", () => {
  const links = allTrackedLinks(base);
  assert.equal(links.length, 9);
  assert.equal(new Set(links.map((l) => l.url)).size, 9);
  const u = new URL(trackedLink("instagram", "retreat_03", "annual_retreat_2026", base));
  assert.equal(u.pathname, "/annual-retreat");
  assert.equal(u.searchParams.get("utm_source"), "instagram");
  assert.equal(u.searchParams.get("utm_medium"), "organic_social");
  assert.equal(u.searchParams.get("utm_campaign"), "annual_retreat_2026");
  assert.equal(u.searchParams.get("utm_content"), "retreat_03");
});

test("the download link never carries personal data", () => {
  assert.equal(guideUrl("email", base), `${base}/annual-retreat/guide?via=email`);
  assert.equal(guideUrl(undefined, base), `${base}/annual-retreat/guide`);
});

test("unsubscribe tokens verify, and can't be forged or retargeted", () => {
  const t = signUnsubscribe("Person@Example.com", "annual_retreat");
  assert.deepEqual(verifyUnsubscribe(t), { email: "person@example.com", scope: "annual_retreat" });
  const [payload, sig] = t.split(".");
  const other = Buffer.from(JSON.stringify({ e: "someone@else.com", s: "annual_retreat" })).toString("base64url");
  assert.equal(verifyUnsubscribe(`${other}.${sig}`), null);
  assert.equal(verifyUnsubscribe(`${payload}.${sig.slice(0, -2)}xx`), null);
  assert.equal(verifyUnsubscribe(""), null);
  assert.equal(verifyUnsubscribe("garbage"), null);
  assert.equal(maskEmail("jeremy@example.com"), "j*****@example.com");
});

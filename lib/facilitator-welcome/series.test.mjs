// npm run test:facilitator-welcome — the pure rules of the welcome series.
import { test } from "node:test";
import assert from "node:assert/strict";
import { STEPS, nextSmsWindow, readinessProblems } from "./series.ts";

// Arizona is UTC-7 all year. 11am AZ = 18:00Z, 5pm AZ = 00:00Z next day.
const at = (iso) => Date.parse(iso);

test("schedule: Email 1 and the text at signup, Email 2 at +2 days, Email 3 at +5 days", () => {
  const byKey = Object.fromEntries(STEPS.map((s) => [s.key, s]));
  assert.equal(byKey.welcome_1.offsetMs, 0);
  assert.equal(byKey.welcome_sms.offsetMs, 0);
  assert.equal(byKey.welcome_sms.channel, "sms");
  assert.equal(byKey.welcome_2.offsetMs, 2 * 86_400_000);
  assert.equal(byKey.welcome_3.offsetMs, 5 * 86_400_000);
});

test("a text inside 11am–5pm Arizona goes now", () => {
  const noonAz = at("2026-11-16T19:00:00Z");
  assert.equal(nextSmsWindow(noonAz), noonAz);
});

test("a text before 11am waits until 11am the same day", () => {
  assert.equal(nextSmsWindow(at("2026-11-16T13:30:00Z")), at("2026-11-16T18:00:00Z")); // 6:30am AZ
  assert.equal(nextSmsWindow(at("2026-11-16T17:00:00Z")), at("2026-11-16T18:00:00Z")); // 10am AZ
});

test("a text at or after 5pm waits until 11am the next day", () => {
  assert.equal(nextSmsWindow(at("2026-11-17T00:00:00Z")), at("2026-11-17T18:00:00Z")); // 5pm AZ on the 16th
  assert.equal(nextSmsWindow(at("2026-11-17T06:00:00Z")), at("2026-11-17T18:00:00Z")); // 11pm AZ
});

test("cannot be switched on without the handbook, the postal address and a social link", () => {
  const base = { enabled: false, handbook_url: null, assessment_url: "https://x", resources_url: "https://y", instagram_url: null, facebook_url: null, linkedin_url: null, mailing_address: null };
  assert.equal(readinessProblems(base).length, 3);
  assert.equal(readinessProblems({ ...base, handbook_url: "https://h" }).length, 2);
  assert.equal(readinessProblems({ ...base, handbook_url: "https://h", facebook_url: "https://f" }).length, 1);
  assert.equal(readinessProblems({ ...base, handbook_url: "https://h", facebook_url: "https://f", mailing_address: "PO Box 1, Mesa, AZ 85201" }).length, 0);
});

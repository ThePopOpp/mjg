// npm run test:facilitator-welcome — the pure rules of the welcome series.
import { test } from "node:test";
import assert from "node:assert/strict";
import { STEPS, nextSmsWindow, readinessProblems } from "./series.ts";

// Arizona is UTC-7 all year. 9am AZ = 16:00Z, 8pm AZ = 03:00Z next day.
const at = (iso) => Date.parse(iso);

test("schedule: Email 1 and the text at signup, Email 2 at +2 days, Email 3 at +5 days", () => {
  const byKey = Object.fromEntries(STEPS.map((s) => [s.key, s]));
  assert.equal(byKey.welcome_1.offsetMs, 0);
  assert.equal(byKey.welcome_sms.offsetMs, 0);
  assert.equal(byKey.welcome_sms.channel, "sms");
  assert.equal(byKey.welcome_2.offsetMs, 2 * 86_400_000);
  assert.equal(byKey.welcome_3.offsetMs, 5 * 86_400_000);
});

test("a text inside 9am–8pm Arizona goes now", () => {
  const noonAz = at("2026-11-16T19:00:00Z");
  assert.equal(nextSmsWindow(noonAz), noonAz);
});

test("a text before 9am waits until 9am the same day", () => {
  assert.equal(nextSmsWindow(at("2026-11-16T13:30:00Z")), at("2026-11-16T16:00:00Z")); // 6:30am AZ
});

test("a text at or after 8pm waits until 9am the next day", () => {
  assert.equal(nextSmsWindow(at("2026-11-17T03:00:00Z")), at("2026-11-17T16:00:00Z")); // 8pm AZ on the 16th
  assert.equal(nextSmsWindow(at("2026-11-17T06:00:00Z")), at("2026-11-17T16:00:00Z")); // 11pm AZ
});

test("cannot be switched on without the handbook and a social link", () => {
  const base = { enabled: false, handbook_url: null, assessment_url: "https://x", resources_url: "https://y", instagram_url: null, facebook_url: null, linkedin_url: null };
  assert.equal(readinessProblems(base).length, 2);
  assert.equal(readinessProblems({ ...base, handbook_url: "https://h" }).length, 1);
  assert.equal(readinessProblems({ ...base, handbook_url: "https://h", facebook_url: "https://f" }).length, 0);
});

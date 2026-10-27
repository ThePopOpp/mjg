// Unit tests for Find a Group: location privacy (fuzzing), distance, CSV parsing, schedule
// labels and the ?next= redirect guard. Run: npm run test:groups (the database flows —
// capacity races, approvals — are covered by the end-to-end harness).

import { test } from "node:test";
import assert from "node:assert/strict";
import { distanceMiles, fuzzPoint, APPROX_RADIUS_M } from "@/lib/maps/geo.ts";
import { parseCSV, csvToObjects } from "@/lib/csv.ts";
import { scheduleLabel, timeOfDay, formatMeetingTime } from "@/lib/facilitator-groups/shared.ts";
import { safeNextPath } from "@/lib/auth/safe-next.ts";

const meters = (a, b) => distanceMiles(a, b) * 1609.344;

test("fuzzed point is never the real spot, always inside the approximate circle, and stable", () => {
  const home = { lat: 33.3062, lng: -111.8413 };
  for (let i = 0; i < 500; i++) {
    const seed = `group-${i}`;
    const p = fuzzPoint(home.lat, home.lng, seed);
    const d = meters(home, p);
    assert.ok(d > 100, `too close (${d.toFixed(0)} m) for ${seed}`);
    assert.ok(d < APPROX_RADIUS_M, `outside the circle (${d.toFixed(0)} m) for ${seed}`);
    assert.deepEqual(fuzzPoint(home.lat, home.lng, seed), p, "same seed → same point");
  }
});

test("distance in miles", () => {
  const chandler = { lat: 33.3062, lng: -111.8413 };
  const phoenix = { lat: 33.4484, lng: -112.074 };
  const d = distanceMiles(chandler, phoenix);
  assert.ok(d > 15 && d < 18, `Chandler→Phoenix ≈ 16.5 mi, got ${d}`);
  assert.equal(distanceMiles(chandler, chandler), 0);
});

test("CSV: quotes, escaped quotes, newlines in quotes, CRLF, BOM, blank lines", () => {
  const text = '﻿Name,Email,Note\r\n"Smith, John",john@x.com,"He said ""hi""\nthen left"\r\n\r\nAmy,amy@x.com,\n';
  const { headers, rows } = parseCSV(text);
  assert.deepEqual(headers, ["Name", "Email", "Note"]);
  assert.equal(rows.length, 2);
  assert.deepEqual(rows[0], ["Smith, John", "john@x.com", 'He said "hi"\nthen left']);
  assert.deepEqual(rows[1], ["Amy", "amy@x.com", ""]);
});

test("CSV → objects with header aliases", () => {
  const { columns, records } = csvToObjects("First Name,E-mail Address,Church\nAl,al@x.com,Grace", {
    "first name": "firstName",
    "e mail address": "email",
    church: "churchOrg",
  });
  assert.deepEqual(columns, ["firstName", "email", "churchOrg"]);
  assert.deepEqual(records[0], { firstName: "Al", email: "al@x.com", churchOrg: "Grace" });
});

test("schedule labels", () => {
  assert.equal(formatMeetingTime("18:30"), "6:30pm");
  assert.equal(formatMeetingTime("09:00"), "9am");
  assert.equal(scheduleLabel({ meetingDay: 2, meetingTime: "18:30", timezone: "America/Phoenix", frequency: "weekly" }), "Tuesdays · 6:30pm AZ time");
  assert.equal(scheduleLabel({ meetingDay: 0, meetingTime: null, timezone: "America/Phoenix", frequency: "biweekly" }), "Every other Sunday");
  assert.equal(timeOfDay("07:00"), "morning");
  assert.equal(timeOfDay("13:00"), "afternoon");
  assert.equal(timeOfDay("19:00"), "evening");
});

test("?next= only allows same-origin paths", () => {
  assert.equal(safeNextPath("/groups/tuesday-men"), "/groups/tuesday-men");
  assert.equal(safeNextPath("//evil.com"), "/dashboard");
  assert.equal(safeNextPath("https://evil.com"), "/dashboard");
  assert.equal(safeNextPath("/\\evil.com"), "/dashboard");
  assert.equal(safeNextPath(null), "/dashboard");
  assert.equal(safeNextPath("", "/groups"), "/groups");
});

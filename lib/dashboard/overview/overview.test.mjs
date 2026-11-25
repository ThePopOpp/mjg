// npm run test:overview
//
// The customizable Overview dashboard: layouts are cleaned per role, defaults are
// right for each role, and the small maths helpers behave.
import { test } from "node:test";
import assert from "node:assert/strict";
import { WIDGETS, WIDGET_BY_ID, allowed, sourceAllowed, widgetsFor } from "./catalog.ts";
import { LAYOUT_VERSION, blankLayout, defaultLayoutFor, sanitizeLayout, standardLayout } from "./layout.ts";
import { linearForecast } from "./forecast.ts";
import { WHATS_NEW } from "./whats-new.ts";

const cardsOf = (layout) => layout.views.flatMap((v) => v.rows.flatMap((r) => r.cards.map((c) => c.widget)));

test("catalog ids are unique and every source-less card is client-only", () => {
  const ids = WIDGETS.map((w) => w.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const w of WIDGETS) {
    assert.ok(w.span >= 2 && w.span <= 12, `${w.id} span`);
    if (w.minSpan) assert.ok(w.minSpan <= w.span, `${w.id} minSpan`);
  }
});

test("Standard has Jeremy's default rows in order for a super admin", () => {
  const l = defaultLayoutFor("super_admin");
  const rows = l.views[0].rows;
  assert.equal(l.mode, "standard");
  assert.deepEqual(rows[0].cards.map((c) => c.widget), ["start.checklist"]);
  assert.deepEqual(rows[1].cards.map((c) => c.widget), ["toolbar.search", "toolbar.features", "toolbar.clock", "toolbar.weather"]);
  assert.deepEqual(rows[2].cards.map((c) => c.widget), ["alert.agent", "alert.next-todo", "alert.jobs"]);
  const stats = rows[3];
  assert.equal(stats.kind, "rail");
  assert.deepEqual(
    stats.cards.map((c) => c.widget),
    ["stat.calls", "stat.outbound", "stat.inbound", "stat.missed", "stat.sms", "stat.bookings", "stat.calendar", "stat.notifications", "stat.messages", "stat.alerts", "stat.emails", "stat.files"],
  );
  assert.equal(rows[4].cards[0].widget, "tasks.my");
  assert.equal(rows[5].cards[0].widget, "community.whats-new");
  // The original overview sections are all still there.
  for (const id of ["community.invitations", "comms.dms", "community.metrics", "community.recent-checkins", "community.waves", "community.pipeline"]) {
    assert.ok(cardsOf(l).includes(id), id);
  }
});

test("defaults never include a card the role can't use, and drop rows left empty", () => {
  for (const role of ["super_admin", "admin", "team_member", "content_reviewer", "pastor_elder_reviewer"]) {
    const l = defaultLayoutFor(role);
    for (const id of cardsOf(l)) assert.ok(allowed(role, WIDGET_BY_ID.get(id).access), `${role} got ${id}`);
    for (const r of l.views[0].rows) assert.ok(r.cards.length, `${role} has an empty row ${r.id}`);
  }
  // A team member sees calls, but not emails (admin) or invitations (admin).
  const tm = cardsOf(defaultLayoutFor("team_member"));
  assert.ok(tm.includes("stat.calls"));
  assert.ok(!tm.includes("stat.emails"));
  assert.ok(!tm.includes("community.invitations"));
});

test("sanitize drops unknown, forbidden and duplicate single cards; clamps spans", () => {
  const raw = {
    views: [
      {
        id: "main",
        name: "Mine",
        rows: [
          {
            id: "r1",
            kind: "grid",
            cards: [
              { uid: "a", widget: "tools.notepad", span: 99 },
              { uid: "b", widget: "tools.notepad", span: 4 },
              { uid: "c", widget: "not.a.card" },
              { uid: "d", widget: "fin.revenue" },
              { uid: "e", widget: "toolbar.clock", span: 1 },
            ],
          },
        ],
      },
    ],
  };
  const l = sanitizeLayout(raw, "admin");
  const cards = l.views[0].rows[0].cards;
  assert.deepEqual(cards.map((c) => c.widget), ["tools.notepad", "toolbar.clock"]);
  assert.equal(cards[0].span, 12);
  assert.equal(cards[1].span, 2);
  // The same layout keeps revenue for a super admin.
  assert.ok(cardsOf(sanitizeLayout(raw, "super_admin")).includes("fin.revenue"));
});

test("sanitize keeps settings small, rounds location and survives garbage", () => {
  const big = { notes: "x".repeat(5000) };
  const l = sanitizeLayout(
    {
      mode: "blank",
      statRange: "30d",
      location: { lat: 33.4942123, lon: -111.9260519, label: "Scottsdale" },
      views: [{ id: "v", name: "V", rows: [{ id: "r", kind: "rail", visible: 3.7, cards: [{ uid: "x", widget: "tools.world-clock", settings: big }] }] }],
    },
    "admin",
  );
  assert.equal(l.mode, "blank");
  assert.equal(l.statRange, "30d");
  assert.deepEqual(l.location, { lat: 33.49, lon: -111.93, label: "Scottsdale" });
  assert.equal(l.views[0].rows[0].visible, 3.5);
  assert.equal(l.views[0].rows[0].cards[0].settings, undefined);
  for (const junk of [null, 42, "x", [], { views: "no" }, { views: [] }]) {
    const s = sanitizeLayout(junk, "admin");
    assert.equal(s.version, LAYOUT_VERSION);
    assert.ok(s.views.length >= 1);
  }
});

test("blank starts empty with the wizard pending; standard has it done", () => {
  assert.equal(blankLayout().views[0].rows.length, 0);
  assert.equal(blankLayout().wizardDone, false);
  assert.equal(standardLayout().wizardDone, true);
});

test("data sources follow card access", () => {
  assert.equal(sourceAllowed("team_member", "revenue"), false);
  assert.equal(sourceAllowed("super_admin", "revenue"), true);
  assert.equal(sourceAllowed("participant", "community"), false);
  assert.equal(sourceAllowed("participant", "items"), true);
  assert.equal(sourceAllowed("participant", "stats"), true); // only unread counts are filled for them
  assert.equal(widgetsFor("participant").some((w) => w.id === "tools.dialpad"), false);
  assert.equal(widgetsFor("team_member").some((w) => w.id === "tools.dialpad"), true);
});

test("forecast projects a trend and never goes negative", () => {
  assert.equal(linearForecast([], 10), 0);
  assert.equal(linearForecast([5, 5, 5, 5], 10), 50);
  assert.ok(linearForecast([1, 2, 3, 4], 2) > 9);
  assert.equal(linearForecast([10, 8, 6, 4, 2, 0], 5), 0);
});

test("what's new entries are dated and unique", () => {
  assert.equal(new Set(WHATS_NEW.map((w) => w.id)).size, WHATS_NEW.length);
  for (const w of WHATS_NEW) assert.match(w.date, /^\d{4}-\d{2}-\d{2}$/);
});

// Phase 3 (dashboard areas with no tools yet): registry invariants for the new
// tool arrays, the "Readable by MCP" assessment gate, and the Steward rule that
// the connector sees usage and status, never a member's words.
// Run: node --experimental-strip-types --no-warnings --conditions=react-server --import ./scripts/test-loader.mjs --test lib/mcp/phase3.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import Ajv from "ajv";
import { TOOLS } from "@/lib/tools/index.ts";
import { ASSESSMENT_TOOLS, checkDefinition } from "@/lib/tools/assessments.ts";
import { DASHBOARD_PLUS_TOOLS } from "@/lib/tools/dashboard-plus.ts";
import { mcpResultsGate } from "@/lib/assessments/mcp-access.ts";
import { memberStatusFrom } from "@/lib/steward/admin-usage.ts";
import { AGENT_SCOPE_DOMAINS } from "@/lib/mcp/scopes.ts";

const PHASE3 = [...ASSESSMENT_TOOLS, ...DASHBOARD_PLUS_TOOLS];
const byName = (n) => PHASE3.find((t) => t.name === n);

test("phase 3 tools: well formed, unique, no collision with the registry", () => {
  const ajv = new Ajv({ strict: false });
  const domains = new Set(["core", ...AGENT_SCOPE_DOMAINS.map((d) => d.key)]);
  // Once the lead registers these arrays they appear in TOOLS; same object = not a collision.
  const existing = new Map(TOOLS.map((t) => [t.name, t]));
  const seen = new Set();
  for (const t of PHASE3) {
    assert.match(t.name, /^[a-z][a-z0-9_]{1,63}$/, `bad name ${t.name}`);
    assert.ok(!seen.has(t.name), `duplicate ${t.name}`);
    seen.add(t.name);
    const other = existing.get(t.name);
    assert.ok(!other || other === t, `${t.name} collides with an existing tool`);
    assert.ok(t.description.length > 10, `${t.name} description`);
    assert.equal(t.minRole, "super_admin");
    assert.ok(domains.has(t.domain), `${t.name} domain ${t.domain}`);
    assert.equal(typeof t.run, "function");
    assert.doesNotThrow(() => ajv.compile({ type: "object", ...t.inputSchema }), `${t.name} schema`);
  }
});

test("phase 3 tools: risk tiers", () => {
  for (const t of PHASE3) {
    if (/delete|publish|automation/.test(t.name)) assert.equal(t.risk, "high", `${t.name} must be high`);
    if (t.risk === "high") assert.equal(typeof t.summarize, "function", `${t.name} needs summarize`);
  }
  const expect = {
    assessments_list: "read", assessment_get: "read", assessment_results_list: "read", assessment_result_get: "read",
    assessment_create_draft: "write", assessment_update_draft: "write", assessment_publish: "high",
    surveys_list: "read", survey_responses_list: "read",
    steward_usage_summary: "read", steward_member_status: "read", steward_settings_get: "read", steward_settings_update: "high",
    dm_threads_list: "read", dm_thread_get: "read", dm_send: "write",
    reports_run: "read", products_list: "read", prices_list: "read",
    journey_list: "read", journey_get: "read", journey_update_step: "write",
    mjg_clients_list: "read", inner_circle_list: "read", waves_list: "read", portal_library_list: "read",
  };
  for (const [name, risk] of Object.entries(expect)) assert.equal(byName(name)?.risk, risk, name);
  assert.equal(byName("mjg_clients_list").domain, "core");
  // Stripe stays read-only here.
  for (const t of PHASE3.filter((x) => x.domain === "commerce")) assert.equal(t.risk, "read", t.name);
});

test("Readable by MCP gate: only an explicit true opens results", () => {
  assert.deepEqual(mcpResultsGate({ key: "energy-audit", title: "Energy Audit", mcpReadable: true }), { ok: true });
  for (const v of [false, null, undefined, "true", 1]) {
    const g = mcpResultsGate({ key: "energy-audit", title: "Energy Audit", mcpReadable: v });
    assert.equal(g.ok, false, `mcpReadable=${String(v)}`);
    assert.match(g.message, /Readable by MCP/);
    assert.match(g.message, /Energy Audit/);
  }
  assert.equal(mcpResultsGate(null).ok, false);
  assert.equal(mcpResultsGate(undefined).ok, false);
});

test("assessment definitions are shape-checked", () => {
  assert.equal(checkDefinition("survey", { fields: [{ name: "email", label: "Email", type: "email" }] }), null);
  assert.ok(checkDefinition("survey", { fields: [] }));
  assert.ok(checkDefinition("survey", null));
  assert.equal(checkDefinition("check_in", { sections: [{ key: "faith", title: "Faith", questions: ["I pray"] }] }), null);
  assert.ok(checkDefinition("check_in", { sections: [{ title: "No key" }] }));
});

test("Steward member status never carries conversation or Blueprint content", () => {
  const secret = "MY PRIVATE WORDS";
  const out = memberStatusFrom({
    profile: { id: "p1", first_name: "Ann", last_name: "Lee", email: "a@x.co", role: "participant", status: "active", notes: secret },
    blueprint: { edition: "full", created_at: "2026-10-01T00:00:00Z", updated_at: "2026-10-20T00:00:00Z", content: secret, sections: [{ text: secret }] },
    entitlements: [{ benefit: "premium", source: "grant", starts_at: null, ends_at: null, grant_reason: secret }],
    conversations: [{ started_at: "2026-10-02T00:00:00Z", last_active_at: "2026-10-21T00:00:00Z", title: secret, session_id: "s1", messages: [secret], transcript: secret }],
    runs: [{ status: "completed", started_at: new Date().toISOString(), error: secret }],
    orders: [{ offer_key: "full", status: "paid", amount_minor: 9900, currency: "USD", paid_at: null, created_at: null, accepted_terms: secret }],
  });
  const json = JSON.stringify(out);
  assert.ok(!json.includes(secret), "member text leaked");
  for (const key of ["title", "transcript", "messages", "content", "session_id", "sections", "fields", "wording", "body"]) {
    assert.ok(!new RegExp(`"${key}"`).test(json), `field ${key} must not appear`);
  }
  assert.equal(out.conversations.count, 1);
  assert.equal(out.blueprint.edition, "full");
  assert.equal(out.repliesLast30Days, 1);
});

test("Steward admin lib never selects content columns or content tables", () => {
  const src = readFileSync(new URL("../steward/admin-usage.ts", import.meta.url), "utf8");
  const selects = [...src.matchAll(/\.select\("([^"]*)"/g)].map((m) => m[1]).join(",");
  for (const col of ["title", "session_id", "body", "content", "transcript", "wording", "text", "*"]) {
    assert.ok(!selects.split(/\s*,\s*/).includes(col), `selects ${col}`);
  }
  assert.ok(!/steward_(fields|field_versions|sections|observations|selected_notes|write_receipts)|dm_messages/.test(src), "touches a content table");
});

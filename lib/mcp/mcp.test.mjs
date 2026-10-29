// Unit tests for the MJG MCP: the tool registry's safety invariants, scopes,
// credentials, confirmation hashing, audit redaction, validation and limits.
// Run: npm run test:mcp  (the database-backed flows are covered by the
// end-to-end checks described in the plan).

import { test } from "node:test";
import assert from "node:assert/strict";
import Ajv from "ajv";
import { TOOLS } from "@/lib/tools/index.ts";
import { scopesAllow } from "@/lib/tools/types.ts";
import { validateArgs } from "@/lib/tools/validate.ts";
import { hashSecret, safeEqual, verifyPkce, newSecret, PREFIX } from "@/lib/mcp/tokens.ts";
import { argsHash } from "@/lib/mcp/confirm.ts";
import { redactArgs } from "@/lib/mcp/audit.ts";
import { allowCall } from "@/lib/mcp/rate-limit.ts";
import { AGENT_SCOPE_DOMAINS, PEOPLE_ONLY_DOMAINS } from "@/lib/mcp/scopes.ts";

test("registry: every tool is well formed", () => {
  const names = new Set();
  const ajv = new Ajv({ strict: false });
  for (const t of TOOLS) {
    assert.match(t.name, /^[a-z][a-z0-9_]{1,63}$/, `bad name ${t.name}`);
    assert.ok(!names.has(t.name), `duplicate tool ${t.name}`);
    names.add(t.name);
    assert.ok(t.description && t.description.length > 10, `${t.name} needs a description`);
    assert.ok(["read", "write", "high"].includes(t.risk), `${t.name} risk`);
    assert.ok(["super_admin", "admin"].includes(t.minRole), `${t.name} minRole`);
    assert.equal(typeof t.run, "function", `${t.name} run`);
    assert.doesNotThrow(() => ajv.compile({ type: "object", ...t.inputSchema }), `${t.name} schema compiles`);
  }
  assert.ok(!names.has("mjg_confirm"), "mjg_confirm is reserved for the server");
});

test("registry: anything that deletes, publishes, mass-sends or automates is high risk", () => {
  const risky = /delete|publish|lifecycle|site_wide|automation|run_due|update_navigation|update_global/;
  for (const t of TOOLS) {
    if (risky.test(t.name)) assert.equal(t.risk, "high", `${t.name} must be high risk`);
  }
});

test("registry: every tool domain is grantable to agents, core, or explicitly people-only", () => {
  const grantable = new Set(AGENT_SCOPE_DOMAINS.map((d) => d.key));
  const peopleOnly = new Set(PEOPLE_ONLY_DOMAINS);
  for (const t of TOOLS) assert.ok(t.domain === "core" || grantable.has(t.domain) || peopleOnly.has(t.domain), `${t.name} has unknown domain ${t.domain}`);
  for (const d of PEOPLE_ONLY_DOMAINS) assert.ok(!grantable.has(d), `${d} must not be grantable`);
});

test("deploying is people-only and high risk", () => {
  const deploy = TOOLS.find((t) => t.name === "deploy_trigger");
  assert.equal(deploy?.risk, "high");
  assert.equal(deploy?.domain, "deploy");
  // An agent granted every area there is (read + write) still can't reach deploy tools.
  const everything = AGENT_SCOPE_DOMAINS.flatMap((d) => [`${d.key}:read`, `${d.key}:write`]);
  for (const t of TOOLS.filter((x) => x.domain === "deploy")) assert.ok(!scopesAllow(everything, t), `${t.name} must stay people-only`);
});

test("scopes", () => {
  const read = { domain: "email", risk: "read" };
  const write = { domain: "email", risk: "write" };
  const high = { domain: "email", risk: "high" };
  assert.ok(scopesAllow(["*"], high));
  assert.ok(scopesAllow(["email:*"], high));
  assert.ok(scopesAllow(["email:read"], read));
  assert.ok(!scopesAllow(["email:read"], write));
  assert.ok(scopesAllow(["email:write"], read), "write implies read");
  assert.ok(scopesAllow(["email:write"], high), "high is a write");
  assert.ok(!scopesAllow(["sms:write"], read));
  assert.ok(!scopesAllow([], read));
});

test("PKCE S256 (RFC 7636 appendix B vector)", () => {
  assert.ok(verifyPkce("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk", "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"));
  assert.ok(!verifyPkce("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXX", "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"));
  assert.ok(!verifyPkce("short", "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"), "verifier length enforced");
});

test("secrets: prefixed, random, hashed", () => {
  const a = newSecret(PREFIX.access);
  const b = newSecret(PREFIX.access);
  assert.ok(a.startsWith("mjg_at_") && a !== b && a.length > 40);
  assert.equal(hashSecret(a), hashSecret(a));
  assert.notEqual(hashSecret(a), hashSecret(b));
  assert.ok(safeEqual("abc", "abc") && !safeEqual("abc", "abd") && !safeEqual("abc", "abcd"));
});

test("confirmation args hash is order-independent and change-sensitive", () => {
  assert.equal(argsHash({ a: 1, b: { c: 2, d: [1, 2] } }), argsHash({ b: { d: [1, 2], c: 2 }, a: 1 }));
  assert.notEqual(argsHash({ a: 1 }), argsHash({ a: 2 }));
  assert.notEqual(argsHash({ list: [1, 2] }), argsHash({ list: [2, 1] }));
});

test("audit redaction", () => {
  const out = redactArgs({ email: "a@b.c", password: "x", nested: { apiKey: "k", ok: 1 }, long: "y".repeat(3000) });
  assert.equal(out.password, "[redacted]");
  assert.equal(out.nested.apiKey, "[redacted]");
  assert.equal(out.nested.ok, 1);
  assert.equal(out.email, "a@b.c");
  assert.ok(out.long.length < 2100);
});

test("argument validation", () => {
  const schema = { type: "object", properties: { id: { type: "string" }, n: { type: "integer" } }, required: ["id"] };
  assert.deepEqual(validateArgs("t1", schema, { id: "x", n: 2 }), { ok: true });
  assert.equal(validateArgs("t1", schema, { n: 2 }).ok, false);
  assert.equal(validateArgs("t1", schema, { id: 5 }).ok, false);
});

test("rate limit caps high-risk calls per minute", () => {
  const token = `test-${Math.random()}`;
  let allowed = 0;
  for (let i = 0; i < 30; i++) if (allowCall(token, "high")) allowed++;
  assert.equal(allowed, 15);
  assert.ok(allowCall(token, "read"), "reads still allowed under the overall cap");
});

// ── Phase 1 safety upgrades (docs/mcp/MJG-MCP-EXPANSION-PLAN.md §3) ──────────

test("clients: Claude and ChatGPT are labelled from their name or redirect", async () => {
  const { labelForClient } = await import("@/lib/mcp/clients.ts");
  assert.equal(labelForClient("Claude", ["https://claude.ai/api/mcp/auth_callback"]), "Claude");
  assert.equal(labelForClient("MCP client", ["https://claude.ai/api/mcp/auth_callback"]), "Claude");
  assert.equal(labelForClient("ChatGPT", ["https://chatgpt.com/connector_platform_oauth_redirect"]), "ChatGPT");
  assert.equal(labelForClient("connector", ["https://chatgpt.com/aip/g-123/oauth/callback"]), "ChatGPT");
  assert.equal(labelForClient("OpenAI", []), "ChatGPT");
  assert.equal(labelForClient("MCP Inspector", ["http://localhost:6274/oauth/callback"]), "Other");
});

test("clients: a switched-off client is refused, by name", async () => {
  const { clientGate } = await import("@/lib/mcp/clients.ts");
  assert.equal(clientGate(null), null, "agent tokens have no client");
  assert.equal(clientGate({ client_label: "Claude", disabled_at: null }), null);
  assert.match(clientGate({ client_label: "ChatGPT", disabled_at: "2026-10-29T00:00:00Z" }), /^ChatGPT is switched off/);
  assert.match(clientGate({ client_label: "Other", disabled_at: "2026-10-29T00:00:00Z" }), /^This client is switched off/);
});

test("caps: one-person sends are capped; broadcasts stay high risk instead", async () => {
  const { CAPPED_TOOLS, capGroupFor } = await import("@/lib/mcp/caps.ts");
  assert.equal(capGroupFor("sms_send"), "sms");
  assert.equal(capGroupFor("send_email"), "email");
  assert.equal(capGroupFor("send_template_email"), "email");
  assert.equal(capGroupFor("sms_broadcast"), null);
  for (const name of Object.values(CAPPED_TOOLS).flat()) {
    const tool = TOOLS.find((t) => t.name === name);
    if (tool) assert.equal(tool.risk, "write", `${name} is a one-person send`);
  }
  for (const name of ["sms_broadcast", "email_send_to_audience"]) assert.equal(TOOLS.find((t) => t.name === name)?.risk, "high", `${name} must be high`);
});

test("trash: every trashable entity has a high-risk, previewed, soft delete tool", async () => {
  const { RECORD_ENTITIES, trashableEntities } = await import("@/lib/mcp/records.ts");
  assert.ok(trashableEntities().includes("contact"));
  for (const entity of trashableEntities()) {
    const tool = TOOLS.find((t) => t.name === RECORD_ENTITIES[entity].trash.deleteTool);
    assert.ok(tool, `${entity} delete tool is registered`);
    assert.equal(tool.risk, "high");
    assert.equal(typeof tool.summarize, "function", `${tool.name} summarize`);
    assert.equal(typeof tool.preview, "function", `${tool.name} preview`);
    assert.equal(tool.record?.entity, entity, `${tool.name} snapshots its record`);
  }
  assert.equal(TOOLS.find((t) => t.name === "mjg_restore")?.risk, "write");
  assert.equal(TOOLS.find((t) => t.name === "mjg_trash_list")?.risk, "read");
});

test("trash: no tool hard-deletes or purges through the connector", () => {
  for (const t of TOOLS) assert.doesNotMatch(t.name, /purge|hard_delete|empty_trash/, `${t.name} must not exist`);
});

test("records: every audited write names a known entity", async () => {
  const { RECORD_ENTITIES } = await import("@/lib/mcp/records.ts");
  for (const t of TOOLS.filter((x) => x.record && typeof x.record.entity === "string")) {
    assert.ok(RECORD_ENTITIES[t.record.entity], `${t.name} → unknown entity ${t.record.entity}`);
  }
});

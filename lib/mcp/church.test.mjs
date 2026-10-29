// Churches, church admins and facilitator applications (plan §2.3 / Phase 4): the church-scoping
// rule, the approval-link token, the role boundary and the tool risk tiers.
// Run: node --experimental-strip-types --no-warnings --conditions=react-server --import ./scripts/test-loader.mjs --test lib/mcp/church.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  approvalTokenState,
  canDecideFacilitatorApplication,
  churchGroupProblem,
  hashApprovalToken,
  newApprovalToken,
  APPROVAL_TOKEN_TTL_HOURS,
} from "@/lib/churches/rules.ts";
import { CHURCH_TOOLS } from "@/lib/tools/churches.ts";
import { SELF_SERVE_ROLES, isSelfServeRole } from "@/lib/user-management/self-registration.ts";
import { ROLES, canAccessDashboard, canAccessPortal } from "@/lib/rbac/roles.ts";
import { can, PERMISSIONS } from "@/lib/rbac/permissions.ts";

const CHURCH = "11111111-1111-1111-1111-111111111111";
const OTHER = "22222222-2222-2222-2222-222222222222";

test("church scoping: an unapproved facilitator can't create an official church group", () => {
  assert.match(churchGroupProblem(CHURCH, []), /hasn't been approved/);
  assert.match(churchGroupProblem(CHURCH, [OTHER]), /hasn't been approved/, "approval for another church doesn't count");
  assert.equal(churchGroupProblem(CHURCH, [CHURCH]), null);
  assert.equal(churchGroupProblem(null, []), null, "a group with no church is never blocked");
  assert.equal(churchGroupProblem(undefined, []), null);
});

test("facilitator applications: only a Super Admin or that church's admin decides", () => {
  assert.ok(canDecideFacilitatorApplication({ role: "super_admin", adminChurchIds: [] }, CHURCH));
  assert.ok(canDecideFacilitatorApplication({ role: "church_admin", adminChurchIds: [CHURCH] }, CHURCH));
  assert.ok(!canDecideFacilitatorApplication({ role: "church_admin", adminChurchIds: [OTHER] }, CHURCH));
  assert.ok(!canDecideFacilitatorApplication({ role: "admin", adminChurchIds: [] }, CHURCH));
  assert.ok(!canDecideFacilitatorApplication({ role: "facilitator", adminChurchIds: [] }, CHURCH));
});

test("approval token: only the SHA-256 is stored, and it expires", () => {
  const now = new Date("2026-10-29T12:00:00Z");
  const { token, hash, expiresAt } = newApprovalToken(now);
  assert.ok(token.length >= 40, "token has enough entropy");
  assert.equal(hash, createHash("sha256").update(token).digest("hex"));
  assert.equal(hashApprovalToken(token), hash);
  assert.notEqual(hash, token);
  assert.equal(new Date(expiresAt).getTime() - now.getTime(), APPROVAL_TOKEN_TTL_HOURS * 3600_000);
  assert.notEqual(newApprovalToken(now).token, token, "tokens are random");
});

test("approval token: valid once, then used / decided / expired / missing", () => {
  const now = new Date("2026-10-29T12:00:00Z");
  const base = { status: "pending", token_hash: "h", token_expires_at: "2026-10-30T12:00:00Z", token_used_at: null };
  assert.equal(approvalTokenState(base, now), "valid");
  assert.equal(approvalTokenState({ ...base, token_used_at: "2026-10-29T13:00:00Z" }, now), "used");
  assert.equal(approvalTokenState({ ...base, status: "approved" }, now), "decided");
  assert.equal(approvalTokenState({ ...base, status: "rejected" }, now), "decided");
  assert.equal(approvalTokenState({ ...base, token_expires_at: "2026-10-29T11:59:59Z" }, now), "expired");
  assert.equal(approvalTokenState({ ...base, token_expires_at: null }, now), "expired");
  assert.equal(approvalTokenState({ ...base, token_hash: null }, now), "missing");
  assert.equal(approvalTokenState(null, now), "missing");
});

test("church_admin is a real role but never self-serve, and stays out of the staff dashboard", () => {
  assert.equal(ROLES.CHURCH_ADMIN, "church_admin");
  assert.ok(!SELF_SERVE_ROLES.includes("church_admin"));
  assert.ok(!isSelfServeRole("church_admin"));
  assert.ok(canAccessPortal("church_admin"), "church admins reach their church page");
  assert.ok(!canAccessDashboard("church_admin"), "but not pages gated on the staff dashboard");
  assert.ok(!can("church_admin", PERMISSIONS.MANAGE_CHURCHES));
  assert.ok(!can("admin", PERMISSIONS.MANAGE_CHURCHES), "managing churches is Super Admin only");
  assert.ok(can("super_admin", PERMISSIONS.MANAGE_CHURCHES));
});

test("church tools: risk tiers, Super Admin only, previews on high-risk", () => {
  const byName = Object.fromEntries(CHURCH_TOOLS.map((t) => [t.name, t]));
  const expected = {
    churches_list: "read", church_get: "read", church_create: "write", church_update: "write", church_archive: "high",
    church_admins_list: "read", church_admin_assign: "high", church_admin_remove: "high",
    facilitator_applications_list: "read", facilitator_application_get: "read", facilitator_application_decide: "high",
    group_create: "write",
  };
  assert.deepEqual(Object.keys(byName).sort(), Object.keys(expected).sort());
  for (const [name, risk] of Object.entries(expected)) {
    const t = byName[name];
    assert.equal(t.risk, risk, `${name} risk`);
    assert.equal(t.minRole, "super_admin", `${name} is Super Admin only`);
    assert.equal(t.domain, "people", `${name} domain`);
    if (risk === "high") {
      assert.equal(typeof t.summarize, "function", `${name} summarize`);
      assert.equal(typeof t.preview, "function", `${name} preview`);
    }
  }
  for (const name of ["church_create", "church_update", "church_archive"]) assert.equal(byName[name].record?.entity, "church", `${name} records the church`);
  assert.equal(byName.church_create.record.id({}, { id: "abc" }), "abc");
  assert.equal(byName.church_update.record.id({ id: "xyz" }), "xyz");
});

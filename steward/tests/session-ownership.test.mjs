// node --experimental-strip-types --test tests/session-ownership.test.mjs
//
// The ownership guard against a stand-in channel shaped like eve 0.74's: one
// create route, session-addressed routes, and an unrelated route. Auth is a
// header so two members can be played without real tokens.
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { withSessionOwnership, resetOwnershipCache } from "../agent/lib/session-ownership.ts";

const handled = [];
const route = (method, path, respond) => ({
  transport: "http",
  method,
  path,
  handler: async (_req, args) => {
    handled.push(`${method} ${path}`);
    return respond(args);
  },
});

let nextId = 1;
const channel = {
  __kind: "test",
  routes: [
    route("GET", "/eve/v1/health", () => Response.json({ ok: true })),
    route("POST", "/eve/v1/session", () => {
      const id = `wrun_test${String(nextId++).padStart(6, "0")}`;
      return Response.json({ ok: true, sessionId: id }, { status: 202, headers: { "x-eve-session-id": id } });
    }),
    route("POST", "/eve/v1/session/:sessionId", ({ params }) =>
      Response.json({ ok: true }, { status: 202, headers: { "x-eve-session-id": params.sessionId } }),
    ),
    route("GET", "/eve/v1/session/:sessionId/stream", () => new Response("{}\n")),
    route("POST", "/eve/v1/session/:sessionId/reset", () => Response.json({ ok: true })),
    route("GET", "/eve/v1/session/:parentSessionId/subagents/:callId/:childSessionId/stream", () => new Response("")),
  ],
};

const auth = async (req) => {
  const who = req.headers.get("x-test-user");
  return who ? { principalId: who, principalType: "user", subject: who, authenticator: "test", attributes: {} } : null;
};

let table;
let failClaims = false;
const store = {
  async claim(principalId, sessionId) {
    if (failClaims) throw new Error("db down");
    if (!table.has(sessionId)) table.set(sessionId, principalId);
    return table.get(sessionId) === principalId;
  },
  async owned(principalId, sessionId) {
    return table.get(sessionId) === principalId;
  },
};

const guarded = withSessionOwnership(channel, auth, store);
const find = (method, path) => guarded.routes.find((r) => r.method === method && r.path === path);
const call = (method, path, user, params = {}) =>
  find(method, path).handler(new Request("http://x" + path, { method, headers: user ? { "x-test-user": user } : {} }), { params });

beforeEach(() => {
  table = new Map();
  failClaims = false;
  handled.length = 0;
  resetOwnershipCache();
});

async function create(user) {
  const res = await call("POST", "/eve/v1/session", user);
  return { res, id: res.headers.get("x-eve-session-id") };
}

test("creating a session records the caller as owner", async () => {
  const { res, id } = await create("alice");
  assert.equal(res.status, 202);
  assert.equal(table.get(id), "alice");
});

test("the owner can stream and message their session", async () => {
  const { id } = await create("alice");
  assert.equal((await call("GET", "/eve/v1/session/:sessionId/stream", "alice", { sessionId: id })).status, 200);
  assert.equal((await call("POST", "/eve/v1/session/:sessionId", "alice", { sessionId: id })).status, 202);
});

test("another member gets 404 on every session route, and eve is never reached", async () => {
  const { id } = await create("alice");
  handled.length = 0;
  for (const [method, path] of [
    ["GET", "/eve/v1/session/:sessionId/stream"],
    ["POST", "/eve/v1/session/:sessionId"],
    ["POST", "/eve/v1/session/:sessionId/reset"],
  ]) {
    const res = await call(method, path, "mallory", { sessionId: id });
    assert.equal(res.status, 404, `${method} ${path}`);
  }
  const sub = await call("GET", "/eve/v1/session/:parentSessionId/subagents/:callId/:childSessionId/stream", "mallory", {
    parentSessionId: id, callId: "c", childSessionId: "wrun_child",
  });
  assert.equal(sub.status, 404);
  assert.deepEqual(handled, []);
});

test("a session with no recorded owner is refused, even to a signed-in member", async () => {
  const res = await call("GET", "/eve/v1/session/:sessionId/stream", "alice", { sessionId: "wrun_unclaimed01" });
  assert.equal(res.status, 404);
});

test("unauthenticated requests are refused before eve runs", async () => {
  assert.equal((await call("POST", "/eve/v1/session", null)).status, 401);
  assert.equal((await call("GET", "/eve/v1/session/:sessionId/stream", null, { sessionId: "wrun_x0000001" })).status, 401);
  assert.deepEqual(handled, []);
});

test("if the owner cannot be recorded, the session id is withheld", async () => {
  failClaims = true;
  const res = await call("POST", "/eve/v1/session", "alice");
  assert.equal(res.status, 503);
  assert.equal(res.headers.get("x-eve-session-id"), null);
});

test("routes without a session are untouched", async () => {
  assert.equal(find("GET", "/eve/v1/health").handler, channel.routes[0].handler);
});

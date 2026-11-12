// node --experimental-strip-types --test lib/steward/conversation-export.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseSessionStream, renderExport } from "./conversation-export.ts";

// Shapes follow eve 0.74's protocol/message.d.ts; one JSON event per line, with
// the blank heartbeat lines eve sends.
const line = (type, data) => JSON.stringify({ type, data });
const STREAM = [
  "",
  line("session.started", { sequence: 0 }),
  line("turn.started", { turnId: "t1", sequence: 1 }),
  line("message.received", { turnId: "t1", message: "I just finished the Created for More Check-In.", sequence: 2 }),
  line("step.started", { turnId: "t1", modelId: "gpt-6-sol", stepIndex: 0, sequence: 3 }),
  line("reasoning.completed", { turnId: "t1", reasoning: "PRIVATE REASONING", stepIndex: 0, sequence: 4 }),
  line("actions.requested", { turnId: "t1", stepIndex: 0, sequence: 5, actions: [
    { kind: "tool-call", callId: "c1", toolName: "read_assessments", input: {} },
    { kind: "tool-call", callId: "c2", toolName: "search_library", input: { query: "what Guardrails protect" } },
  ] }),
  line("action.result", { turnId: "t1", stepIndex: 0, sequence: 6, status: "completed", result: { kind: "tool-result", callId: "c1", toolName: "read_assessments", output: {} } }),
  line("action.result", { turnId: "t1", stepIndex: 0, sequence: 7, status: "completed", error: { message: "boom" }, result: { kind: "tool-result", callId: "c2", toolName: "search_library", output: null, isError: true } }),
  line("step.started", { turnId: "t1", modelId: "gpt-6-sol", stepIndex: 1, sequence: 8 }),
  line("message.completed", { turnId: "t1", message: "Your Check-In today: 93/140.", finishReason: "stop", stepIndex: 1, sequence: 9 }),
  line("turn.completed", { turnId: "t1", sequence: 10 }),
  "",
  line("message.received", { turnId: "t2", message: "Tell me more about Guardrails.", sequence: 11 }),
  line("step.failed", { turnId: "t2", code: "provider_error", message: "model unavailable", stepIndex: 0, sequence: 12 }),
  "not json",
].join("\n");

test("parses turns, tools, models and failures in order", () => {
  const turns = parseSessionStream(STREAM);
  assert.equal(turns.length, 2);
  assert.equal(turns[0].member, "I just finished the Created for More Check-In.");
  assert.equal(turns[0].steward, "Your Check-In today: 93/140.");
  assert.deepEqual(turns[0].models, ["gpt-6-sol"]);
  assert.deepEqual(turns[0].tools.map((t) => t.name), ["read_assessments", "search_library"]);
  assert.equal(turns[0].tools[1].failed, true);
  assert.equal(turns[0].tools[0].failed, undefined);
  assert.equal(turns[1].steward, "");
  assert.deepEqual(turns[1].errors, ["model unavailable"]);
});

test("never includes model reasoning", () => {
  const md = renderExport({
    exportedBy: "Test Person", exportedAt: "2026-11-12T20:00:00Z", library: "D0.7.3-R1", instructionVersion: null,
    context: "THEIR CHECK-IN RESULTS: …",
    conversations: [{ sessionId: "s1", title: "Results", startedAt: "2026-11-12T19:00:00Z", lastActiveAt: null, turns: parseSessionStream(STREAM) }],
  });
  assert.ok(!md.includes("PRIVATE REASONING"));
  assert.match(md, /## Review instructions/);
  assert.match(md, /## Conversation 1: Results/);
  assert.match(md, /model gpt-6-sol/);
  assert.match(md, /Steward used: read_assessments; search_library \(what Guardrails protect\) — FAILED/);
  assert.match(md, /Errors this turn: model unavailable/);
});

test("an unreadable conversation is listed, not dropped", () => {
  const md = renderExport({
    exportedBy: "x", exportedAt: "2026-11-12T20:00:00Z", library: "L", instructionVersion: "v2", context: "",
    conversations: [{ sessionId: "s", title: "Gone", startedAt: null, lastActiveAt: null, turns: [], unavailable: "the conversation is no longer stored" }],
  });
  assert.match(md, /Transcript unavailable: the conversation is no longer stored/);
});

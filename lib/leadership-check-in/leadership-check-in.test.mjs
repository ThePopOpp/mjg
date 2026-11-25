// npm run test:leadership
//
// Release checks from the Leadership Check-In implementation kit §09
// (docs/assessments/Leadership_Check_In_Jeremy_Implementation_Kit.docx).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ITEM_KEYS,
  LAYERS,
  MAX_SCORE,
  TOTAL_STATEMENTS,
  bandFor,
  layerStatusFor,
  parseResponses,
  scoreLeadership,
} from "./leadership-check-in.ts";

const all = (n) => Object.fromEntries(ITEM_KEYS.map((k) => [k, n]));
/** Answers whose total is exactly `total` (28–140), filled from the first statement on. */
function totalOf(total) {
  const a = all(1);
  let left = total - 28;
  for (const k of ITEM_KEYS) {
    const add = Math.min(4, left);
    a[k] += add;
    left -= add;
  }
  return a;
}

test("28 statements across seven layers of four", () => {
  assert.equal(TOTAL_STATEMENTS, 28);
  assert.equal(LAYERS.length, 7);
  for (const l of LAYERS) assert.equal(l.statements.length, 4);
  assert.equal(MAX_SCORE, 140);
});

test("all ones = 28, all threes = 84, all fives = 140; each layer 4 / 12 / 20", () => {
  for (const [n, total, layer] of [[1, 28, 4], [3, 84, 12], [5, 140, 20]]) {
    const s = scoreLeadership(all(n));
    assert.equal(s.total, total);
    for (const l of s.layers) assert.equal(l.score, layer);
  }
});

test("overall band boundaries 55/56, 83/84, 111/112", () => {
  assert.equal(scoreLeadership(totalOf(55)).band.label, "Time to Pause & Rebuild");
  assert.equal(scoreLeadership(totalOf(56)).band.label, "Drifting in Key Layers");
  assert.equal(scoreLeadership(totalOf(83)).band.label, "Drifting in Key Layers");
  assert.equal(scoreLeadership(totalOf(84)).band.label, "Aware but Stretched");
  assert.equal(scoreLeadership(totalOf(111)).band.label, "Aware but Stretched");
  assert.equal(scoreLeadership(totalOf(112)).band.label, "Aligned & Intentional");
  assert.equal(bandFor(28).key, "rebuild");
  assert.equal(bandFor(140).key, "aligned");
});

test("layer boundaries 8/9, 12/13, 16/17", () => {
  assert.equal(layerStatusFor(8).label, "Drifting");
  assert.equal(layerStatusFor(9).label, "Stretched");
  assert.equal(layerStatusFor(12).label, "Stretched");
  assert.equal(layerStatusFor(13).label, "Stable");
  assert.equal(layerStatusFor(16).label, "Stable");
  assert.equal(layerStatusFor(17).label, "Strong");
  assert.equal(layerStatusFor(4).action, "Rebuild");
  assert.equal(layerStatusFor(20).action, "Protect");
});

test("questions 9–12 give the four Pillar scores", () => {
  const a = all(3);
  a["pillars:0"] = 1;
  a["pillars:1"] = 2;
  a["pillars:2"] = 4;
  a["pillars:3"] = 5;
  assert.deepEqual(scoreLeadership(a).pillars, { Family: 1, Fitness: 2, Fun: 4, Finances: 5 });
});

test("rejects missing, fractional, out-of-range, non-numeric and duplicate items", () => {
  const missing = all(3);
  delete missing["legacy:3"];
  assert.equal(parseResponses(missing).ok, false);
  assert.equal(parseResponses({ ...all(3), "energy:0": 2.5 }).ok, false);
  assert.equal(parseResponses({ ...all(3), "energy:0": 0 }).ok, false);
  assert.equal(parseResponses({ ...all(3), "energy:0": 6 }).ok, false);
  assert.equal(parseResponses({ ...all(3), "energy:0": "3" }).ok, false);
  assert.equal(parseResponses(null).ok, false);
  const list = ITEM_KEYS.map((id) => ({ id, value: 3 }));
  assert.equal(parseResponses(list).ok, true);
  assert.equal(parseResponses([...list, { id: "bedrock:0", value: 4 }]).ok, false);
  assert.throws(() => scoreLeadership(missing));
});

test("unknown keys are ignored, never scored", () => {
  const r = parseResponses({ ...all(2), "extra:0": 5 });
  assert.equal(r.ok, true);
  assert.equal(Object.keys(r.answers).length, 28);
});

test("ties: every tied highest and lowest layer is reported", () => {
  const a = all(3);
  for (let i = 0; i < 4; i++) { a[`bedrock:${i}`] = 1; a[`energy:${i}`] = 1; a[`legacy:${i}`] = 5; a[`foundation:${i}`] = 5; }
  const s = scoreLeadership(a);
  assert.deepEqual(s.lowestKeys, ["bedrock", "energy"]);
  assert.deepEqual(s.highestKeys, ["foundation", "legacy"]);
  assert.equal(s.allTied, false);
});

test("all layers tied is flagged, not given a winner", () => {
  const s = scoreLeadership(all(4));
  assert.equal(s.allTied, true);
  assert.equal(s.lowestKeys.length, 7);
});

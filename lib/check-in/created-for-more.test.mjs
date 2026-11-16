// npm run test:check-in
//
// The release checks from the v4 handoff (docs/Updates-11-16-26,
// Created_for_More_Check-In_v4_Website_Handoff.md §5).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CHECK_IN_V3,
  CHECK_IN_VERSION,
  LAYERS,
  completeAnswers,
  layersForVersion,
  scoreCheckIn,
} from "./created-for-more.ts";

const keys = LAYERS.flatMap((l) => l.statements.map((_, i) => `${l.key}:${i}`));
const all = (n) => Object.fromEntries(keys.map((k) => [k, n]));
/** Answers whose total is exactly `total` (28–140), filled from the first statement on. */
function totalOf(total) {
  const a = all(1);
  let left = total - 28;
  for (const k of keys) {
    const add = Math.min(4, left);
    a[k] += add;
    left -= add;
  }
  return a;
}
const layerOf = (layer, sum) => {
  const a = all(3);
  const each = [1, 1, 1, 1];
  let left = sum - 4;
  for (let i = 0; i < 4; i++) { const add = Math.min(4, left); each[i] += add; left -= add; }
  each.forEach((v, i) => { a[`${layer}:${i}`] = v; });
  return a;
};

test("28 statements, seven layers of four", () => {
  assert.equal(keys.length, 28);
  assert.equal(LAYERS.length, 7);
  assert.ok(LAYERS.every((l) => l.statements.length === 4));
});

test("all 1s → 28, all 3s → 84, all 4s → 112, all 5s → 140", () => {
  assert.equal(scoreCheckIn(all(1)).total, 28);
  assert.equal(scoreCheckIn(all(3)).total, 84);
  assert.equal(scoreCheckIn(all(4)).total, 112);
  assert.equal(scoreCheckIn(all(5)).total, 140);
});

test("overall band boundaries 55/56, 83/84, 111/112", () => {
  const stage = (t) => scoreCheckIn(totalOf(t)).stage;
  assert.equal(stage(55), "Time to Pause & Rebuild");
  assert.equal(stage(56), "Drifting in Key Layers");
  assert.equal(stage(83), "Drifting in Key Layers");
  assert.equal(stage(84), "Aware but Stretched");
  assert.equal(stage(111), "Aware but Stretched");
  assert.equal(stage(112), "Aligned & Intentional");
});

test("layer boundaries 8/9, 12/13, 16/17", () => {
  const status = (sum) => scoreCheckIn(layerOf("energy", sum)).layerScores.find((l) => l.key === "energy").status;
  assert.equal(status(8), "Drifting / Rebuild");
  assert.equal(status(9), "Stretched / Focus");
  assert.equal(status(12), "Stretched / Focus");
  assert.equal(status(13), "Stable / Strengthen");
  assert.equal(status(16), "Stable / Strengthen");
  assert.equal(status(17), "Strong / Protect");
});

test("a missing answer is refused, never scored as 0 or neutral", () => {
  const a = all(4);
  delete a["legacy:3"];
  assert.equal(completeAnswers(a), null);
  assert.throws(() => scoreCheckIn(a));
});

test("out-of-range, non-integer and malformed values are refused", () => {
  for (const bad of [0, 6, 2.5, "x", null, true]) {
    assert.equal(completeAnswers({ ...all(3), "bedrock:0": bad }), null, String(bad));
  }
  assert.equal(completeAnswers(null), null);
});

test("ties are kept, not broken", () => {
  const s = scoreCheckIn(all(3));
  assert.equal(s.lowestLayers.length, 7);
  assert.equal(s.strongestLayers.length, 7);
  assert.equal(s.lowestLayerKeys.length, 7);
  // All four Pillars tie too.
  assert.deepEqual(s.lowestPillars.sort(), ["Family", "Finances", "Fitness", "Fun"]);
});

test("a high total can still hold a low layer", () => {
  const a = all(5);
  for (let i = 0; i < 4; i++) a[`guardrails:${i}`] = 1;
  const s = scoreCheckIn(a);
  assert.equal(s.total, 124);
  assert.equal(s.stage, "Aligned & Intentional");
  assert.deepEqual(s.lowestLayerKeys, ["guardrails"]);
  assert.equal(s.layerScores.find((l) => l.key === "guardrails").status, "Drifting / Rebuild");
});

test("each Pillar's response is reported even when the layer is not lowest", () => {
  const a = all(4);
  a["pillars:2"] = 2;
  a["legacy:0"] = 1; a["legacy:1"] = 1;
  const s = scoreCheckIn(a);
  assert.deepEqual(s.lowestLayerKeys, ["legacy"]);
  assert.equal(s.pillarResponses.Fun, 2);
  assert.equal(s.lowestPillar, null);
});

test("results carry the v4 version; v3 wording is kept for older results", () => {
  assert.equal(scoreCheckIn(all(3)).version, CHECK_IN_VERSION);
  const v3 = layersForVersion(CHECK_IN_V3);
  assert.match(v3.find((l) => l.key === "legacy").statements[3].text, /outlast me/);
  assert.match(LAYERS.find((l) => l.key === "legacy").statements[3].text, /pass it on/);
  assert.equal(v3.find((l) => l.key === "foundation").subtitle, "Mission, Values & Purpose");
  assert.equal(LAYERS.find((l) => l.key === "foundation").subtitle, "Mission + Values + Direction");
});

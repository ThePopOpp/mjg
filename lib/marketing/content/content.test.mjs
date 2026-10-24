// Tests for the marketing content layer — the rules that decide what visitors
// see when the database holds an override.
//
// Run: npm run test:marketing

import assert from "node:assert/strict";
import { test } from "node:test";
import { defineSection, validateFields } from "./kit.ts";
import { applyPatch, defaultsIssues, resetFields, resolveSection, withIds } from "./merge.ts";
import { SCOPES } from "./registry.ts";

// ── Every section's defaults are valid and survive validation unchanged ─────

for (const scope of Object.values(SCOPES)) {
  for (const section of Object.values(scope.sections)) {
    test(`${scope.key}/${section.key}: defaults validate cleanly and round-trip`, () => {
      assert.deepEqual(defaultsIssues(section), []);
      const { value, issues } = resolveSection(section, null);
      assert.deepEqual(issues, []);
      assert.deepEqual(value, section.defaults);
    });
  }
}

// ── Merge rules ─────────────────────────────────────────────────────────────

const sample = defineSection({
  key: "sample",
  label: "Sample",
  fields: [
    { key: "title", label: "Title", kind: "text", required: true },
    { key: "cta", label: "Button", kind: "cta" },
    {
      key: "card",
      label: "Card",
      kind: "group",
      fields: [
        { key: "heading", label: "Heading", kind: "text" },
        { key: "note", label: "Note", kind: "text" },
      ],
    },
    { key: "items", label: "Items", kind: "list", stableIds: true, fields: [{ key: "label", label: "Label", kind: "text" }] },
    { key: "image", label: "Image", kind: "media" },
  ],
  defaults: {
    title: "Default title",
    cta: { label: "Go", href: "/start" },
    card: { heading: "Card heading", note: "Card note" },
    items: [
      { id: "a", label: "First" },
      { id: "b", label: "Second" },
    ],
    image: { src: "/a.jpg", alt: "A" },
  },
});

test("no override renders the defaults", () => {
  assert.deepEqual(resolveSection(sample, undefined).value, sample.defaults);
});

test("a changed field overrides; untouched fields keep following the default", () => {
  const { value } = resolveSection(sample, { title: "New title" });
  assert.equal(value.title, "New title");
  assert.deepEqual(value.cta, sample.defaults.cta);
});

test("groups merge deeply", () => {
  const { value } = resolveSection(sample, { card: { note: "Edited note" } });
  assert.deepEqual(value.card, { heading: "Card heading", note: "Edited note" });
});

test("lists are replaced whole, not merged item by item", () => {
  const { value } = resolveSection(sample, { items: [{ id: "c", label: "Only" }] });
  assert.deepEqual(value.items, [{ id: "c", label: "Only" }]);
});

test("an invalid override falls back to that field's default and is reported", () => {
  const { value, issues } = resolveSection(sample, { title: "Fine", cta: { label: "Bad", href: "javascript:alert(1)" } });
  assert.equal(value.title, "Fine");
  assert.deepEqual(value.cta, sample.defaults.cta);
  assert.equal(issues.length, 1);
});

test("an image without alt text is rejected and falls back", () => {
  const { value, issues } = resolveSection(sample, { image: { src: "/b.jpg", alt: "" } });
  assert.deepEqual(value.image, sample.defaults.image);
  assert.ok(issues.some((i) => /alt text/.test(i.message)));
});

test("unknown keys in an override are dropped on read", () => {
  const { value } = resolveSection(sample, { title: "T", sneaky: "<script>" });
  assert.equal("sneaky" in value, false);
});

test("a garbage override (not an object) renders defaults", () => {
  assert.deepEqual(resolveSection(sample, "nonsense").value, sample.defaults);
  assert.deepEqual(resolveSection(sample, [1, 2]).value, sample.defaults);
});

// ── Saving is strict ────────────────────────────────────────────────────────

test("saving rejects unknown fields", () => {
  const { issues } = applyPatch(sample, {}, { nope: 1 });
  assert.equal(issues.length, 1);
});

test("saving rejects invalid values", () => {
  const { issues } = applyPatch(sample, {}, { title: "" });
  assert.ok(issues.some((i) => /required/.test(i.message)));
});

test("saving stores only what changed, merged over the previous override", () => {
  const { override, issues } = applyPatch(sample, { title: "One" }, { card: { note: "N" } });
  assert.deepEqual(issues, []);
  assert.deepEqual(override, { title: "One", card: { note: "N" } });
});

test("new list items get stable ids at write time; existing ids are kept", () => {
  const out = withIds(sample.fields, { items: [{ id: "keep", label: "x" }, { label: "y" }] });
  assert.equal(out.items[0].id, "keep");
  assert.match(out.items[1].id, /^[a-z0-9][a-z0-9-]+$/);
});

test("reset removes the field so it follows the default again", () => {
  assert.deepEqual(resetFields({ title: "x", cta: { label: "y", href: "/" } }, ["title"]), { cta: { label: "y", href: "/" } });
});

test("schema migration runs for overrides saved under an older version", () => {
  const v2 = { ...sample, schemaVersion: 2, migrate: (o) => ({ title: o.heading }) };
  assert.equal(resolveSection(v2, { heading: "Moved" }, 1).value.title, "Moved");
});

test("video files must be mp4/webm", () => {
  const issues = [];
  validateFields([{ key: "v", label: "Video", kind: "videoFile" }], { v: { src: "/x.gif" } }, "", issues);
  assert.equal(issues.length, 1);
});

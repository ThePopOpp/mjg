// Frontend Editor — before/after comparison (spec §18).
//
// Produces a structured change list (block added / removed / moved / edited,
// plus SEO and settings changes) and the one-sentence summary Steward quotes
// back to Mike. Client-safe so the review panel and the server both use it.

import { blockLabel, blockPreviewText } from "./registry";
import type { WebsiteBlock, WebsiteContent } from "./types";

export type DiffKind = "added" | "removed" | "moved" | "edited" | "hidden" | "shown";

export type BlockChange = {
  kind: DiffKind;
  blockId: string;
  type: string;
  label: string;
  preview: string;
  /** For "moved" */
  from?: number;
  to?: number;
  /** For "edited" — one entry per changed prop path. */
  fields?: FieldChange[];
};

export type FieldChange = { path: string; before: string; after: string };

export type MetaChange = { field: string; label: string; before: string; after: string };

export type PageDiff = {
  blocks: BlockChange[];
  meta: MetaChange[];
  summary: string;
  hasChanges: boolean;
};

function flatten(value: unknown, path = "", out: Record<string, string> = {}): Record<string, string> {
  if (value === null || value === undefined) return out;
  if (Array.isArray(value)) {
    value.forEach((v, i) => flatten(v, `${path}[${i}]`, out));
    return out;
  }
  if (typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      flatten(v, path ? `${path}.${k}` : k, out);
    }
    return out;
  }
  const s = String(value);
  if (s !== "" && s !== "false") out[path] = s;
  return out;
}

function propChanges(before: WebsiteBlock, after: WebsiteBlock): FieldChange[] {
  const a = flatten(before.props);
  const b = flatten(after.props);
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const changes: FieldChange[] = [];
  for (const key of keys) {
    const x = a[key] ?? "";
    const y = b[key] ?? "";
    if (x !== y) changes.push({ path: key, before: x, after: y });
  }
  return changes;
}

const META_LABELS: Record<string, string> = {
  title: "Page title",
  slug: "Page address",
  page_type: "Page type",
  template: "Template",
  status: "Status",
  seo_title: "SEO title",
  seo_description: "Meta description",
  seo_keywords: "Keywords",
  canonical_url: "Canonical URL",
  og_title: "Open Graph title",
  og_description: "Open Graph description",
  og_image_url: "Open Graph image",
  featured_image_url: "Featured image",
  no_index: "Search engine indexing",
  no_follow: "Link following",
  navigation_visibility: "Shown in navigation",
  navigation_label: "Navigation label",
};

export function diffMeta(
  before: Record<string, unknown> | null | undefined,
  after: Record<string, unknown> | null | undefined,
): MetaChange[] {
  const a = (before ?? {}) as Record<string, unknown>;
  const b = (after ?? {}) as Record<string, unknown>;
  const changes: MetaChange[] = [];
  for (const field of Object.keys(META_LABELS)) {
    if (!(field in a) && !(field in b)) continue;
    const x = a[field] === null || a[field] === undefined ? "" : String(a[field]);
    const y = b[field] === null || b[field] === undefined ? "" : String(b[field]);
    if (x !== y) changes.push({ field, label: META_LABELS[field], before: x, after: y });
  }
  return changes;
}

/** Compare two content documents plus optional page metadata. */
export function diffContent(
  before: WebsiteContent,
  after: WebsiteContent,
  meta: { before?: Record<string, unknown>; after?: Record<string, unknown> } = {},
): PageDiff {
  const beforeMap = new Map(before.blocks.map((b, i) => [b.id, { block: b, index: i }]));
  const afterMap = new Map(after.blocks.map((b, i) => [b.id, { block: b, index: i }]));
  const changes: BlockChange[] = [];

  for (const [id, { block, index }] of afterMap) {
    const prior = beforeMap.get(id);
    if (!prior) {
      changes.push({ kind: "added", blockId: id, type: block.type, label: blockLabel(block.type), preview: blockPreviewText(block), to: index });
      continue;
    }
    if (Boolean(prior.block.hidden) !== Boolean(block.hidden)) {
      changes.push({
        kind: block.hidden ? "hidden" : "shown",
        blockId: id, type: block.type, label: blockLabel(block.type), preview: blockPreviewText(block),
      });
    }
    const fields = propChanges(prior.block, block);
    if (fields.length) {
      changes.push({ kind: "edited", blockId: id, type: block.type, label: blockLabel(block.type), preview: blockPreviewText(block), fields });
    }
    if (prior.index !== index) {
      changes.push({ kind: "moved", blockId: id, type: block.type, label: blockLabel(block.type), preview: blockPreviewText(block), from: prior.index, to: index });
    }
  }

  for (const [id, { block, index }] of beforeMap) {
    if (afterMap.has(id)) continue;
    changes.push({ kind: "removed", blockId: id, type: block.type, label: blockLabel(block.type), preview: blockPreviewText(block), from: index });
  }

  const metaChanges = diffMeta(meta.before, meta.after);
  return {
    blocks: changes,
    meta: metaChanges,
    summary: summarize(changes, metaChanges),
    hasChanges: changes.length > 0 || metaChanges.length > 0,
  };
}

function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

/**
 * "This change updates the hero headline, adds a Stewardship Blueprint section,
 * and changes the SEO description." (spec §18)
 */
export function summarize(blocks: BlockChange[], meta: MetaChange[]): string {
  const parts: string[] = [];
  const added = blocks.filter((c) => c.kind === "added");
  const removed = blocks.filter((c) => c.kind === "removed");
  const edited = blocks.filter((c) => c.kind === "edited");
  const moved = blocks.filter((c) => c.kind === "moved");
  const hidden = blocks.filter((c) => c.kind === "hidden");
  const shown = blocks.filter((c) => c.kind === "shown");

  if (added.length) parts.push(`adds ${plural(added.length, "section")} (${added.map((c) => c.label).join(", ")})`);
  if (removed.length) parts.push(`removes ${plural(removed.length, "section")} (${removed.map((c) => c.label).join(", ")})`);
  if (edited.length) parts.push(`edits ${plural(edited.length, "section")} (${edited.map((c) => c.label).join(", ")})`);
  if (moved.length) parts.push(`reorders ${plural(moved.length, "section")}`);
  if (hidden.length) parts.push(`hides ${plural(hidden.length, "section")}`);
  if (shown.length) parts.push(`shows ${plural(shown.length, "section")}`);
  if (meta.length) parts.push(`updates ${meta.map((m) => m.label.toLowerCase()).join(", ")}`);

  if (!parts.length) return "No changes.";
  const sentence = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
  return `This change ${sentence}.`;
}

/** Word-level diff for the side-by-side text comparison in the review panel. */
export type TextSegment = { text: string; kind: "same" | "added" | "removed" };

export function diffWords(before: string, after: string): TextSegment[] {
  const a = String(before ?? "").split(/(\s+)/).filter(Boolean);
  const b = String(after ?? "").split(/(\s+)/).filter(Boolean);

  // Longest-common-subsequence table. Inputs here are short field values, so the
  // O(n*m) table is comfortably small; guard anyway.
  if (a.length * b.length > 40000) {
    return [
      { text: before, kind: "removed" },
      { text: after, kind: "added" },
    ];
  }

  const lcs: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const out: TextSegment[] = [];
  const push = (text: string, kind: TextSegment["kind"]) => {
    const last = out[out.length - 1];
    if (last && last.kind === kind) last.text += text;
    else out.push({ text, kind });
  };

  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      push(a[i], "same");
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      push(a[i], "removed");
      i++;
    } else {
      push(b[j], "added");
      j++;
    }
  }
  while (i < a.length) push(a[i++], "removed");
  while (j < b.length) push(b[j++], "added");
  return out;
}

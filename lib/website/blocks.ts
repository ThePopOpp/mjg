// Frontend Editor — pure block-tree operations (spec §12.2 website.blocks.*).
//
// The content model is a flat, ordered list (spec §9). Every helper returns a new
// content document, so the same functions back the manual editor's optimistic UI,
// the server-side API and Steward's tools — one implementation, one behaviour.

import { createBlock, getDefinition, newBlockId } from "./registry";
import { validateProps } from "./schema";
import type { WebsiteBlock, WebsiteContent } from "./types";

function withBlocks(content: WebsiteContent, blocks: WebsiteBlock[]): WebsiteContent {
  return { version: 1, blocks };
}

export function findBlock(content: WebsiteContent, blockId: string): WebsiteBlock | undefined {
  return content.blocks.find((b) => b.id === blockId);
}

export function blockIndex(content: WebsiteContent, blockId: string): number {
  return content.blocks.findIndex((b) => b.id === blockId);
}

/**
 * Insert a new block. `position` is an index; omit it to append. `afterBlockId`
 * is the friendlier form Steward uses ("put it below the hero").
 */
export function addBlock(
  content: WebsiteContent,
  input: { type: string; props?: Record<string, unknown>; position?: number; afterBlockId?: string },
): { content: WebsiteContent; block: WebsiteBlock } {
  const block = createBlock(input.type, input.props ?? {});
  const blocks = [...content.blocks];
  let at = blocks.length;
  if (input.afterBlockId) {
    const i = blocks.findIndex((b) => b.id === input.afterBlockId);
    if (i === -1) throw new Error("Could not find the section to insert after.");
    at = i + 1;
  } else if (typeof input.position === "number" && Number.isFinite(input.position)) {
    at = Math.min(blocks.length, Math.max(0, Math.floor(input.position)));
  }
  blocks.splice(at, 0, block);
  return { content: withBlocks(content, blocks), block };
}

/**
 * Merge a partial props patch into a block. Only keys the registry knows about
 * survive, and every value is re-validated, so a patch can never smuggle in an
 * unapproved field.
 */
export function updateBlock(
  content: WebsiteContent,
  blockId: string,
  patch: { props?: Record<string, unknown>; hidden?: boolean },
): WebsiteContent {
  const existing = findBlock(content, blockId);
  if (!existing) throw new Error("That section is no longer on the page.");
  const def = getDefinition(existing.type);
  if (!def) throw new Error(`"${existing.type}" is not an approved page component.`);

  const merged = { ...existing.props, ...(patch.props ?? {}) };
  const next: WebsiteBlock = { ...existing, props: validateProps(def.fields, merged) };
  if (patch.hidden === undefined) {
    if (existing.hidden) next.hidden = true;
  } else if (patch.hidden) {
    next.hidden = true;
  } else {
    delete next.hidden;
  }
  return withBlocks(content, content.blocks.map((b) => (b.id === blockId ? next : b)));
}

/** Move a block to an absolute index, or by a relative step with `direction`. */
export function moveBlock(
  content: WebsiteContent,
  blockId: string,
  target: { position?: number; direction?: "up" | "down" },
): WebsiteContent {
  const from = blockIndex(content, blockId);
  if (from === -1) throw new Error("That section is no longer on the page.");
  const blocks = [...content.blocks];
  let to = from;
  if (target.direction === "up") to = from - 1;
  else if (target.direction === "down") to = from + 1;
  else if (typeof target.position === "number") to = Math.floor(target.position);
  to = Math.min(blocks.length - 1, Math.max(0, to));
  if (to === from) return content;
  const [moved] = blocks.splice(from, 1);
  blocks.splice(to, 0, moved);
  return withBlocks(content, blocks);
}

export function duplicateBlock(
  content: WebsiteContent,
  blockId: string,
): { content: WebsiteContent; block: WebsiteBlock } {
  const i = blockIndex(content, blockId);
  if (i === -1) throw new Error("That section is no longer on the page.");
  const source = content.blocks[i];
  const copy: WebsiteBlock = {
    ...source,
    id: newBlockId(source.type),
    props: JSON.parse(JSON.stringify(source.props ?? {})),
  };
  const blocks = [...content.blocks];
  blocks.splice(i + 1, 0, copy);
  return { content: withBlocks(content, blocks), block: copy };
}

export function removeBlock(content: WebsiteContent, blockId: string): WebsiteContent {
  if (blockIndex(content, blockId) === -1) throw new Error("That section is no longer on the page.");
  return withBlocks(content, content.blocks.filter((b) => b.id !== blockId));
}

/** Reorder the whole page from a list of ids (drag and drop). */
export function reorderBlocks(content: WebsiteContent, orderedIds: string[]): WebsiteContent {
  const byId = new Map(content.blocks.map((b) => [b.id, b]));
  const ordered: WebsiteBlock[] = [];
  for (const id of orderedIds) {
    const block = byId.get(id);
    if (block) {
      ordered.push(block);
      byId.delete(id);
    }
  }
  // Anything the client did not mention keeps its place at the end.
  return withBlocks(content, [...ordered, ...byId.values()]);
}

// ── Text extraction (search, link intelligence, SEO audits, accessibility) ───

type TextHit = { blockId: string; type: string; field: string; value: string };

function walkStrings(
  value: unknown,
  path: string,
  out: (field: string, value: string) => void,
): void {
  if (typeof value === "string") {
    if (value.trim()) out(path, value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => walkStrings(v, `${path}[${i}]`, out));
    return;
  }
  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      walkStrings(v, path ? `${path}.${k}` : k, out);
    }
  }
}

/** Every authored string on the page, with the block and field it came from. */
export function extractText(content: WebsiteContent): TextHit[] {
  const hits: TextHit[] = [];
  for (const block of content.blocks) {
    walkStrings(block.props, "", (field, value) => {
      hits.push({ blockId: block.id, type: block.type, field, value });
    });
  }
  return hits;
}

/** Plain-text rendering of a page, used for full-site content search. */
export function contentToPlainText(content: WebsiteContent): string {
  return extractText(content)
    .map((h) => h.value)
    .join("\n");
}

const URL_FIELD = /(href|url|Url)$/;

/** Every link the page points at, deduplicated. */
export function extractLinks(content: WebsiteContent): { blockId: string; field: string; href: string }[] {
  const links: { blockId: string; field: string; href: string }[] = [];
  for (const block of content.blocks) {
    walkStrings(block.props, "", (field, value) => {
      const leaf = field.split(".").pop() ?? "";
      if (URL_FIELD.test(leaf) && !/imageUrl|videoUrl|ogImage/.test(leaf)) {
        links.push({ blockId: block.id, field, href: value.trim() });
      }
      // Markdown links inside rich text count too.
      for (const m of value.matchAll(/\]\((\/[^\s)]*|https?:\/\/[^\s)]+)\)/g)) {
        links.push({ blockId: block.id, field, href: m[1] });
      }
    });
  }
  return links;
}

/** Images on the page, so alt text can be audited (spec §57). */
export function extractImages(content: WebsiteContent): { blockId: string; type: string; url: string; alt: string }[] {
  const images: { blockId: string; type: string; url: string; alt: string }[] = [];
  for (const block of content.blocks) {
    const collect = (holder: Record<string, unknown>) => {
      const url = typeof holder.imageUrl === "string" ? holder.imageUrl : "";
      if (!url) return;
      images.push({
        blockId: block.id,
        type: block.type,
        url,
        alt: typeof holder.imageAlt === "string" ? holder.imageAlt : "",
      });
    };
    collect(block.props as Record<string, unknown>);
    const items = (block.props as Record<string, unknown>).items;
    if (Array.isArray(items)) items.forEach((it) => collect((it ?? {}) as Record<string, unknown>));
  }
  return images;
}

/** Replace a literal string across a page. Used by site-wide changes (spec §35). */
export function replaceTextInContent(
  content: WebsiteContent,
  find: string,
  replaceWith: string,
): { content: WebsiteContent; replacements: number } {
  if (!find) return { content, replacements: 0 };
  let replacements = 0;
  const swap = (value: unknown): unknown => {
    if (typeof value === "string") {
      if (!value.includes(find)) return value;
      replacements += value.split(find).length - 1;
      return value.split(find).join(replaceWith);
    }
    if (Array.isArray(value)) return value.map(swap);
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, swap(v)]));
    }
    return value;
  };
  const blocks = content.blocks.map((b) => ({ ...b, props: swap(b.props) as Record<string, unknown> }));
  return { content: withBlocks(content, blocks), replacements };
}

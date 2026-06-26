// Render a social block schema into the concrete post payload: body text,
// media URLs, and hashtags. The schema is the drag-and-drop builder's output.

import type { SocialBlock, SocialBuilderSchema } from "./types";

export type RenderedPost = { body_text: string; media_urls: string[]; hashtags: string[]; link_url: string | null };

export function renderSchema(schema: SocialBuilderSchema | Record<string, unknown> | null | undefined): RenderedPost {
  const blocks: SocialBlock[] = (schema && Array.isArray((schema as SocialBuilderSchema).blocks))
    ? (schema as SocialBuilderSchema).blocks
    : [];

  const lines: string[] = [];
  const media: string[] = [];
  const hashtags: string[] = [];
  let link: string | null = null;

  for (const b of blocks) {
    switch (b.type) {
      case "heading":
      case "text":
        if (b.text?.trim()) lines.push(b.text.trim());
        break;
      case "quote":
        if (b.text?.trim()) lines.push(`“${b.text.trim()}”`);
        break;
      case "image":
      case "video":
        if (b.url?.trim()) media.push(b.url.trim());
        break;
      case "link":
      case "cta":
        if (b.url?.trim()) { link = b.url.trim(); lines.push(b.label?.trim() ? `${b.label.trim()} ${b.url.trim()}` : b.url.trim()); }
        break;
      case "hashtags":
        for (const h of b.items ?? []) { const tag = normalizeHashtag(h); if (tag) hashtags.push(tag); }
        break;
      case "divider":
        lines.push("");
        break;
    }
  }

  return {
    body_text: lines.join("\n\n").replace(/\n{3,}/g, "\n\n").trim(),
    media_urls: media,
    hashtags,
    link_url: link,
  };
}

export function normalizeHashtag(raw: string): string {
  const t = String(raw || "").trim().replace(/\s+/g, "");
  if (!t) return "";
  return t.startsWith("#") ? t : `#${t}`;
}

// Compose the final text that goes out: body + hashtags appended.
export function composePostText(bodyText: string, hashtags: string[]): string {
  const tags = (hashtags ?? []).map(normalizeHashtag).filter(Boolean);
  const body = (bodyText ?? "").trim();
  return tags.length ? `${body}\n\n${tags.join(" ")}`.trim() : body;
}

// Replace {{merge_fields}} with provided values; unknown fields are left blank.
export function applyMergeFields(text: string, data: Record<string, string>): string {
  return String(text || "").replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, (_m, key) => data[key] ?? "");
}

export function extractMergeFields(text: string): string[] {
  const out = new Set<string>();
  for (const m of String(text || "").matchAll(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi)) out.add(m[1].toLowerCase());
  return Array.from(out);
}

// Marketing content — the field kit.
//
// Every section of every public page declares its editable content here: a
// typed default value plus a field list describing it. The same field list
// validates an override before it is saved, coerces whatever is read back, and
// describes the section to whoever edits it (the dashboard, Shepherd, the MCP).
//
// Leaf kinds delegate to the Frontend Editor's validator (lib/website/schema)
// so URL and text rules are identical everywhere. The kinds the marketing pages
// need on top of it — nested groups, image slots with alt text and credits,
// self-hosted video, lists whose items keep a stable id — live here, so the
// editor's shared schema stays untouched.
//
// Client-safe: no server imports.

import {
  isSafeImageUrl,
  isSafeUrl,
  validateProps,
  type FieldDef,
  type ValidationIssue,
} from "@/lib/website/schema";

export type { ValidationIssue };

type Base = { key: string; label: string; help?: string; required?: boolean };

export type ContentField =
  | (Base & { kind: "text" | "textarea"; maxLength?: number })
  | (Base & { kind: "url" })
  | (Base & { kind: "boolean" })
  | (Base & { kind: "number"; min?: number; max?: number })
  | (Base & { kind: "select"; options: { value: string; label: string }[] })
  /** { label, href } — a button or text link. */
  | (Base & { kind: "cta" })
  /** A YouTube / Vimeo link. */
  | (Base & { kind: "embed" })
  /** { src, alt, credit?, mock? } — see MediaValue. */
  | (Base & { kind: "media" })
  /** { src, mobileSrc?, poster? } — self-hosted MP4/WebM. */
  | (Base & { kind: "videoFile" })
  | (Base & { kind: "group"; fields: ContentField[] })
  | (Base & {
      kind: "list";
      fields: ContentField[];
      itemLabel?: string;
      maxItems?: number;
      /** Items carry an `id` so edits can target one item without resending the list. */
      stableIds?: boolean;
    });

export type Cta = { label: string; href: string };

/**
 * An image slot. `src` empty + `mock` set renders a designed stand-in (a book
 * cover, a study guide, a Blueprint page) until the approved artwork exists —
 * replacing it later is a content edit, not a code change.
 */
export type MediaValue = {
  src: string;
  alt: string;
  /** Photographer credit for stock images ("Photo: Jane Doe / Unsplash"). */
  credit?: string;
  /** "contain" for cut-outs with a transparent background (the book render); photos fill their frame. */
  fit?: "cover" | "contain";
  /** Which part of a cropped photo stays in view (a portrait keeps the face with "top"). */
  position?: "top" | "center" | "bottom";
  mock?: { variant: "book" | "guide" | "blueprint-page" | "panel"; title: string; subtitle?: string };
};

export type VideoFileValue = { src: string; mobileSrc?: string; poster?: string; mobilePoster?: string };

const ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,47}$/;

function leaf(def: FieldDef, raw: unknown, path: string, issues: ValidationIssue[]): unknown {
  // validateProps prefixes the key onto the path; hand it the parent path.
  const parent = path.includes(".") ? path.slice(0, path.lastIndexOf(".")) : "";
  return validateProps([def], { [def.key]: raw }, parent, issues)[def.key];
}

function text(raw: unknown, max: number): string {
  return typeof raw === "string" ? raw.replace(/\r\n/g, "\n").slice(0, max) : "";
}

const VIDEO_FILE = /\.(mp4|webm)(\?.*)?$/i;

function isSafeVideoFile(value: string): boolean {
  return !value || (isSafeImageUrl(value) && VIDEO_FILE.test(value));
}

/** Validate + coerce one field. Unknown keys are dropped; missing ones are "". */
export function validateField(field: ContentField, raw: unknown, path: string, issues: ValidationIssue[]): unknown {
  const fail = (message: string) => issues.push({ path, message });

  switch (field.kind) {
    case "text":
    case "textarea":
      return leaf(
        { key: field.key, label: field.label, kind: field.kind, required: field.required, maxLength: field.maxLength },
        raw,
        path,
        issues,
      );
    case "url":
    case "boolean":
      return leaf({ key: field.key, label: field.label, kind: field.kind, required: field.required }, raw, path, issues);
    case "number":
      return leaf(
        { key: field.key, label: field.label, kind: "number", required: field.required, min: field.min, max: field.max },
        raw,
        path,
        issues,
      );
    case "select":
      return leaf(
        { key: field.key, label: field.label, kind: "select", required: field.required, options: field.options },
        raw,
        path,
        issues,
      );
    case "embed":
      return leaf({ key: field.key, label: field.label, kind: "video", required: field.required }, raw, path, issues);
    case "cta": {
      const value = leaf({ key: field.key, label: field.label, kind: "link", required: field.required }, raw, path, issues) as {
        label: string;
        href: string;
      };
      return { label: value.label, href: value.href };
    }
    case "media": {
      const obj = (raw ?? {}) as Record<string, unknown>;
      const src = text(obj.src, 2000).trim();
      const alt = text(obj.alt, 300).trim();
      const out: MediaValue = { src: isSafeImageUrl(src) ? src : "", alt };
      if (src && !isSafeImageUrl(src)) fail(`${field.label} must be an uploaded file or an http(s) image URL.`);
      if (out.src && !alt) fail(`${field.label} needs alt text describing the image.`);
      const credit = text(obj.credit, 200).trim();
      if (credit) out.credit = credit;
      if (obj.fit === "contain" || obj.fit === "cover") out.fit = obj.fit;
      if (obj.position === "top" || obj.position === "center" || obj.position === "bottom") out.position = obj.position;
      const mock = obj.mock as Record<string, unknown> | undefined;
      if (mock && typeof mock === "object") {
        const variant = String(mock.variant);
        out.mock = {
          variant: (["book", "guide", "blueprint-page", "panel"].includes(variant) ? variant : "panel") as NonNullable<
            MediaValue["mock"]
          >["variant"],
          title: text(mock.title, 120),
          ...(mock.subtitle ? { subtitle: text(mock.subtitle, 160) } : {}),
        };
      }
      if (field.required && !out.src && !out.mock) fail(`${field.label} is required.`);
      return out;
    }
    case "videoFile": {
      const obj = (raw ?? {}) as Record<string, unknown>;
      const out: VideoFileValue = { src: "" };
      for (const key of ["src", "mobileSrc"] as const) {
        const v = text(obj[key], 2000).trim();
        if (v && !isSafeVideoFile(v)) fail(`${field.label}: ${key} must be an .mp4 or .webm file.`);
        else if (v) out[key] = v;
      }
      for (const key of ["poster", "mobilePoster"] as const) {
        const v = text(obj[key], 2000).trim();
        if (v && !isSafeImageUrl(v)) fail(`${field.label}: ${key} must be an image URL.`);
        else if (v) out[key] = v;
      }
      if (field.required && !out.src) fail(`${field.label} is required.`);
      return out;
    }
    case "group":
      return validateFields(field.fields, raw as Record<string, unknown>, path, issues);
    case "list": {
      const arr = Array.isArray(raw) ? raw : [];
      const max = field.maxItems ?? 24;
      if (arr.length > max) fail(`${field.label} can hold at most ${max} items.`);
      return arr.slice(0, max).map((item, i) => {
        const itemPath = `${path}[${i}]`;
        const value = validateFields(field.fields, item as Record<string, unknown>, itemPath, issues);
        if (field.stableIds) {
          const id = (item as Record<string, unknown> | null)?.id;
          value.id = typeof id === "string" && ID_PATTERN.test(id) ? id : "";
        }
        return value;
      });
    }
  }
}

/** Validate an object against a field list. Unknown keys are dropped. */
export function validateFields(
  fields: ContentField[],
  raw: Record<string, unknown> | null | undefined,
  path = "",
  issues: ValidationIssue[] = [],
): Record<string, unknown> {
  const input = raw && typeof raw === "object" ? raw : {};
  const out: Record<string, unknown> = {};
  for (const field of fields) {
    out[field.key] = validateField(field, input[field.key], path ? `${path}.${field.key}` : field.key, issues);
  }
  return out;
}

// ── Sections and scopes ──────────────────────────────────────────────────────

export type SectionDef<T = unknown> = {
  key: string;
  label: string;
  /** Bump when a field is renamed or reshaped, and supply `migrate`. */
  schemaVersion: number;
  fields: ContentField[];
  defaults: T;
  migrate?: (override: Record<string, unknown>, fromVersion: number) => Record<string, unknown>;
};

export function defineSection<T>(def: Omit<SectionDef<T>, "schemaVersion"> & { schemaVersion?: number }): SectionDef<T> {
  return { schemaVersion: 1, ...def };
}

export type ScopeDef<S extends Record<string, SectionDef> = Record<string, SectionDef>> = {
  /** 'page:home', 'global:nav', … */
  key: string;
  label: string;
  /** The public path this scope renders on, for revalidation and the editor. */
  path?: string;
  sections: S;
};

export function defineScope<S extends Record<string, SectionDef>>(def: ScopeDef<S>): ScopeDef<S> {
  return def;
}

/** The resolved content of a scope: one value per section, typed from its defaults. */
export type ScopeValues<D extends ScopeDef> = {
  [K in keyof D["sections"]]: D["sections"][K] extends SectionDef<infer T> ? T : never;
};

/** A compact description of a field list, for editors and the MCP. */
export function describeContentFields(fields: ContentField[], indent = ""): string {
  return fields
    .map((f) => {
      let line = `${indent}- ${f.key} (${f.kind}${f.required ? ", required" : ""}) — ${f.label}`;
      if (f.help) line += ` — ${f.help}`;
      if (f.kind === "select") line += ` — one of: ${f.options.map((o) => o.value).join(" | ")}`;
      if (f.kind === "cta") line += " — { label, href }";
      if (f.kind === "media") line += " — { src, alt, credit?, fit?: cover|contain, position?: top|center|bottom, mock?: { variant: book|guide|blueprint-page|panel, title, subtitle? } }";
      if (f.kind === "videoFile") line += " — { src, mobileSrc?, poster?, mobilePoster? }";
      if ((f.kind === "group" || f.kind === "list") && f.fields.length) {
        if (f.kind === "list") line += ` — list${f.stableIds ? " (items have id)" : ""}, max ${f.maxItems ?? 24}`;
        line += `\n${describeContentFields(f.fields, `${indent}    `)}`;
      }
      return line;
    })
    .join("\n");
}

/** True when a value is a safe link target — re-exported for components building hrefs. */
export { isSafeUrl };

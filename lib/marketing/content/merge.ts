// Marketing content — how a stored override becomes the content a page renders.
//
// Pure functions, no I/O, so the rules that decide what visitors see are tested
// directly (merge.test.mjs).
//
// The rules:
//   - Overrides are sparse: only the top-level fields someone changed.
//   - A group field merges deeply (change one line of a nested card without
//     resending the rest). Lists and media are replaced whole — merging two lists
//     item by item has no answer that is right every time.
//   - Each top-level field is validated on its own. If an override for a field is
//     invalid, THAT field falls back to its code default and the problem is
//     reported; the rest of the section still renders. A bad edit can degrade a
//     sentence, never take a page down.

import { validateField, type ContentField, type SectionDef, type ValidationIssue } from "./kit";

export type Override = Record<string, unknown>;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/** Overlay `override` onto `base` for one field list, deep for groups only. */
export function overlay(fields: ContentField[], base: Record<string, unknown>, override: Override): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base };
  for (const field of fields) {
    if (!Object.prototype.hasOwnProperty.call(override, field.key)) continue;
    const next = override[field.key];
    if (field.kind === "group" && isPlainObject(next) && isPlainObject(base[field.key])) {
      out[field.key] = overlay(field.fields, base[field.key] as Record<string, unknown>, next);
    } else {
      out[field.key] = next;
    }
  }
  return out;
}

/** Bring an override written under an older schema up to date, when the section knows how. */
function upgrade(section: SectionDef, override: Override, storedVersion: number): Override {
  if (storedVersion >= section.schemaVersion || !section.migrate) return override;
  try {
    return section.migrate(override, storedVersion);
  } catch {
    return {};
  }
}

export type Resolved<T> = { value: T; issues: ValidationIssue[] };

/**
 * defaults ⊕ override → validated content. Never throws; invalid fields fall
 * back to their defaults and are listed in `issues`.
 */
export function resolveSection<T>(
  section: SectionDef<T>,
  override: Override | null | undefined,
  storedVersion = section.schemaVersion,
): Resolved<T> {
  const defaults = section.defaults as unknown as Record<string, unknown>;
  const clean = isPlainObject(override) ? upgrade(section as SectionDef, override, storedVersion) : {};
  const merged = overlay(section.fields, defaults, clean);

  const issues: ValidationIssue[] = [];
  const value: Record<string, unknown> = {};
  for (const field of section.fields) {
    const fieldIssues: ValidationIssue[] = [];
    const candidate = validateField(field, merged[field.key], `${section.key}.${field.key}`, fieldIssues);
    if (fieldIssues.length && Object.prototype.hasOwnProperty.call(clean, field.key)) {
      issues.push(...fieldIssues);
      value[field.key] = validateField(field, defaults[field.key], field.key, []);
    } else {
      value[field.key] = candidate;
    }
  }
  return { value: value as T, issues };
}

/**
 * Applies a patch to an existing override for saving. Unlike reading, saving is
 * strict: the merged result must validate cleanly, or nothing is stored.
 */
export function applyPatch(
  section: SectionDef,
  current: Override | null | undefined,
  patch: Override,
): { override: Override; issues: ValidationIssue[] } {
  const known = new Set(section.fields.map((f) => f.key));
  const unknownKeys = Object.keys(patch).filter((k) => !known.has(k));
  if (unknownKeys.length) {
    return {
      override: current ?? {},
      issues: unknownKeys.map((k) => ({ path: `${section.key}.${k}`, message: `"${k}" is not a field of ${section.label}.` })),
    };
  }

  const base = isPlainObject(current) ? current : {};
  const next = overlay(section.fields, base, withIds(section.fields, patch));
  const issues: ValidationIssue[] = [];
  const defaults = section.defaults as unknown as Record<string, unknown>;
  const merged = overlay(section.fields, defaults, next);
  for (const field of section.fields) {
    if (!Object.prototype.hasOwnProperty.call(next, field.key)) continue;
    validateField(field, merged[field.key], `${section.key}.${field.key}`, issues);
  }
  return { override: next, issues };
}

/** Removes fields from an override, so they follow the code default again. */
export function resetFields(current: Override | null | undefined, keys: string[]): Override {
  const out: Override = { ...(isPlainObject(current) ? current : {}) };
  for (const key of keys) delete out[key];
  return out;
}

let counter = 0;
function newId(): string {
  counter = (counter + 1) % 1296;
  return `${Date.now().toString(36)}-${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** Gives every item of a stable-id list an id, recursively, at write time. */
export function withIds(fields: ContentField[], value: Override): Override {
  const out: Override = { ...value };
  for (const field of fields) {
    const v = out[field.key];
    if (field.kind === "list" && Array.isArray(v)) {
      out[field.key] = v.map((item) => {
        const obj = isPlainObject(item) ? withIds(field.fields, item) : {};
        if (field.stableIds && (typeof obj.id !== "string" || !obj.id)) obj.id = newId();
        return obj;
      });
    } else if (field.kind === "group" && isPlainObject(v)) {
      out[field.key] = withIds(field.fields, v);
    }
  }
  return out;
}

/** Every default must validate unchanged — checked by the tests for every section. */
export function defaultsIssues(section: SectionDef): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const field of section.fields) {
    validateField(field, (section.defaults as Record<string, unknown>)[field.key], `${section.key}.${field.key}`, issues);
  }
  return issues;
}

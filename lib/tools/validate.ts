import Ajv, { type ValidateFunction } from "ajv";

// Argument validation against each tool's JSON Schema. Shepherd's handlers take
// `args: any`, so this is the only thing standing between a model's arguments
// and the database — every call is checked before it runs.

const ajv = new Ajv({ allErrors: true, strict: false, coerceTypes: false, useDefaults: true });
const cache = new Map<string, ValidateFunction>();

export type ValidationResult = { ok: true } | { ok: false; errors: string[] };

export function validateArgs(toolName: string, schema: Record<string, unknown>, args: unknown): ValidationResult {
  let validate = cache.get(toolName);
  if (!validate) {
    validate = ajv.compile({ type: "object", ...schema });
    cache.set(toolName, validate);
  }
  if (validate(args ?? {})) return { ok: true };
  const errors = (validate.errors ?? []).map((e) => `${e.instancePath || "(arguments)"} ${e.message ?? "is invalid"}`.trim());
  return { ok: false, errors };
}

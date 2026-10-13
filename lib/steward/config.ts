import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Typed access to steward_config.
//
// THE POINT OF THIS MODULE IS THAT IT THROWS. The accepted docset deliberately
// leaves several values unset and the handoff notice forbids inventing them:
// usage allowances, dunning retry schedule, final invoice disposition,
// notification cadence, retention durations. A `?? 30` anywhere in the commerce
// path would turn "nobody has decided this" into a promise made to a paying
// customer, silently. So an unset required key raises StewardConfigUnset and the
// calling feature refuses to run.
//
// Reads are cached per request-ish window because this is hit on every checkout
// and entitlement check, and the values change about as often as the Terms do.

export class StewardConfigUnset extends Error {
  readonly key: string;
  constructor(key: string, label?: string) {
    super(
      `Steward config "${key}"${label ? ` (${label})` : ""} is not set. ` +
        `The accepted docset leaves this value unset on purpose — decide it in the Agent Manager rather than defaulting it.`,
    );
    this.name = "StewardConfigUnset";
    this.key = key;
  }
}

export type StewardConfigRow = {
  key: string;
  value: unknown;
  value_type: string;
  label: string;
  description: string;
  config_group: string;
  production_enabled: boolean;
};

let cache: { at: number; rows: Map<string, StewardConfigRow> } | null = null;
const CACHE_MS = 30_000;

async function loadAll(): Promise<Map<string, StewardConfigRow>> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.rows;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("steward_config")
    .select("key, value, value_type, label, description, config_group, production_enabled");
  if (error) throw error;

  const rows = new Map<string, StewardConfigRow>();
  for (const row of (data ?? []) as StewardConfigRow[]) rows.set(row.key, row);
  cache = { at: Date.now(), rows };
  return rows;
}

/** Drops the cache. Call after a config write so the next read is fresh. */
export function invalidateStewardConfigCache() {
  cache = null;
}

export async function listStewardConfig(): Promise<StewardConfigRow[]> {
  return [...(await loadAll()).values()].sort((a, b) =>
    a.config_group === b.config_group ? a.key.localeCompare(b.key) : a.config_group.localeCompare(b.config_group),
  );
}

/** Raw value, or null when unset. Use when "unset" is a legitimate answer. */
export async function getStewardConfigOrNull(key: string): Promise<unknown | null> {
  const row = (await loadAll()).get(key);
  if (!row) return null;
  return row.value ?? null;
}

/** Raw value, throwing when unset or unknown. */
export async function requireStewardConfig(key: string): Promise<unknown> {
  const row = (await loadAll()).get(key);
  if (!row) throw new StewardConfigUnset(key);
  if (row.value === null || row.value === undefined) throw new StewardConfigUnset(key, row.label);
  return row.value;
}

export async function requireNumber(key: string): Promise<number> {
  const v = await requireStewardConfig(key);
  if (typeof v !== "number" || !Number.isFinite(v)) {
    throw new Error(`Steward config "${key}" should be a number, got ${JSON.stringify(v)}.`);
  }
  return v;
}

export async function requireString(key: string): Promise<string> {
  const v = await requireStewardConfig(key);
  if (typeof v !== "string" || v.length === 0) {
    throw new Error(`Steward config "${key}" should be a non-empty string, got ${JSON.stringify(v)}.`);
  }
  return v;
}

export async function requireBoolean(key: string): Promise<boolean> {
  const v = await requireStewardConfig(key);
  if (typeof v !== "boolean") {
    throw new Error(`Steward config "${key}" should be a boolean, got ${JSON.stringify(v)}.`);
  }
  return v;
}

// == Convenience bundles =====================================================
// Grouped so a caller takes one trip and gets a coherent policy rather than
// assembling one key at a time and half-failing partway through.

export async function getActivationPolicy() {
  return {
    activationDeadlineDays: await requireNumber("lifecycle.activation_deadline_days"),
    buildDays: await requireNumber("lifecycle.build_days"),
    premiumMonths: await requireNumber("lifecycle.premium_months"),
    policyVersion: await requireString("lifecycle.policy_version"),
  };
}

export async function getRefundPolicy() {
  return {
    initialPostActivationDays: await requireNumber("refund.initial_post_activation_days"),
    annualChargeDays: await requireNumber("refund.annual_charge_days"),
    unusedUnactivatedDays: await requireNumber("refund.unused_unactivated_days"),
  };
}

export async function getRenewalPolicy() {
  return {
    graceDays: await requireNumber("renewal.grace_days"),
    annualNoticeDays: await requireNumber("notices.annual_advance_days"),
    // Both genuinely unset in the docset. Exposed as null rather than thrown so
    // a dashboard can SHOW that they are undecided; any code path that needs to
    // act on them must call requireStewardConfig and fail.
    providerRetrySchedule: await getStewardConfigOrNull("renewal.provider_retry_schedule"),
    finalInvoiceDisposition: await getStewardConfigOrNull("renewal.final_invoice_disposition"),
  };
}

export async function getTaxPolicy() {
  return {
    enabled: await requireBoolean("tax.enabled"),
    behavior: await requireString("tax.behavior"),
  };
}

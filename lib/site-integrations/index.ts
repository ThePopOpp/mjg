import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Third-party site integrations (migration 202611230148). Read by the public
// endpoint that the Metricool loader calls, written from Social Media → Settings.

export type MetricoolConfig = { enabled: boolean; hash: string | null };

export async function getMetricoolConfig(): Promise<MetricoolConfig> {
  const { data, error } = await createSupabaseAdminClient()
    .from("site_integrations")
    .select("metricool_enabled, metricool_hash")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return { enabled: Boolean(data?.metricool_enabled && data?.metricool_hash), hash: data?.metricool_hash ?? null };
}

export async function saveMetricoolConfig(input: { enabled: boolean; hash: string | null }, by: string) {
  const hash = input.hash?.trim().toLowerCase() || null;
  if (hash && !/^[a-f0-9]{16,64}$/.test(hash)) {
    throw new Error("That doesn't look like a Metricool hash (letters a–f and numbers, from the tracking code's hash:\"…\").");
  }
  if (input.enabled && !hash) throw new Error("Add the Metricool hash before switching the tracker on.");
  const { error } = await createSupabaseAdminClient()
    .from("site_integrations")
    .upsert({ id: 1, metricool_enabled: input.enabled, metricool_hash: hash, updated_by: by, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
  return getMetricoolConfig();
}

/** Pulls the hash out of a pasted Metricool snippet, or returns the input if it's already a hash. */
export function metricoolHashFrom(input: string): string | null {
  const s = input.trim();
  const m = s.match(/hash\s*:\s*["']([a-f0-9]{16,64})["']/i);
  if (m) return m[1].toLowerCase();
  return /^[a-f0-9]{16,64}$/i.test(s) ? s.toLowerCase() : null;
}

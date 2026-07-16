import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ROLES, normalizeAppRole } from "@/lib/rbac/roles";

// Feature flags — the app has no entitlement/subscription system, so this is the
// generic gate for optional capabilities. Backed by public.feature_flags
// (migration 202607160039). Deliberately no billing logic: a flag is on for a
// subject if ANY grant matches. Mirrors the SQL comment in that migration.
//
// Default is DENY: an unknown or missing flag key is off for everyone except
// super admins, so a failed lookup can never accidentally unlock a feature.

export const FLAGS = {
  PLAN_BUILDER_PREMIUM: "plan_builder.premium",
} as const;

export type FeatureFlagKey = (typeof FLAGS)[keyof typeof FLAGS];

export type FlagSubject = {
  id: string;
  role: string | null | undefined;
};

type FeatureFlagRow = {
  key: string;
  enabled: boolean;
  enabled_roles: string[] | null;
  enabled_profile_ids: string[] | null;
};

function grants(row: FeatureFlagRow | null | undefined, subject: FlagSubject) {
  if (!row) return false;
  if (row.enabled) return true;
  const role = normalizeAppRole(subject.role);
  if (role && (row.enabled_roles ?? []).includes(role)) return true;
  return (row.enabled_profile_ids ?? []).includes(subject.id);
}

export async function isFeatureEnabled(key: FeatureFlagKey, subject: FlagSubject): Promise<boolean> {
  // Matches can() in lib/rbac/permissions.ts — super admin short-circuits everything.
  if (normalizeAppRole(subject.role) === ROLES.SUPER_ADMIN) return true;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("feature_flags")
    .select("key,enabled,enabled_roles,enabled_profile_ids")
    .eq("key", key)
    .maybeSingle();

  if (error) return false;
  return grants(data as FeatureFlagRow | null, subject);
}

// One round trip when a page needs several flags (e.g. to render the create-plan modal).
export async function getEnabledFlags(
  keys: readonly FeatureFlagKey[],
  subject: FlagSubject,
): Promise<Record<string, boolean>> {
  const isSuperAdmin = normalizeAppRole(subject.role) === ROLES.SUPER_ADMIN;
  if (isSuperAdmin) return Object.fromEntries(keys.map((k) => [k, true]));

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("feature_flags")
    .select("key,enabled,enabled_roles,enabled_profile_ids")
    .in("key", keys as string[]);

  if (error) return Object.fromEntries(keys.map((k) => [k, false]));
  const rows = (data ?? []) as FeatureFlagRow[];
  return Object.fromEntries(keys.map((k) => [k, grants(rows.find((r) => r.key === k), subject)]));
}

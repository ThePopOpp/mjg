import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type ChallengeTypeOption = { id: string; name: string; slug: string };

// The challenge (experience) types Super Admins can grant to facilitators — the "Program"
// category (6-Week Challenge, Stewardship Blueprint, etc.).
export async function getChallengeTypes(): Promise<ChallengeTypeOption[]> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("experience_types")
    .select("id,name,slug,category")
    .eq("category", "Program")
    .order("name", { ascending: true });
  return (data ?? []).map((t: any) => ({ id: t.id, name: t.name, slug: t.slug }));
}

/** The experience-type ids a facilitator is allowed to start/see. */
export async function getFacilitatorAllowedTypeIds(facilitatorId: string): Promise<string[]> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("facilitator_challenge_access")
    .select("experience_type_id")
    .eq("facilitator_id", facilitatorId);
  return (data ?? []).map((r: any) => r.experience_type_id as string);
}

/** For the Super-Admin UI: all challenge types + which are granted to this facilitator. */
export async function getFacilitatorChallengeAccess(facilitatorId: string): Promise<{ types: ChallengeTypeOption[]; allowedIds: string[] }> {
  const [types, allowedIds] = await Promise.all([getChallengeTypes(), getFacilitatorAllowedTypeIds(facilitatorId)]);
  return { types, allowedIds };
}

export type VisibilityInput = { mode: "all" | "select" | "none"; facilitatorIds?: string[] };

/**
 * Grant a challenge type's visibility to facilitators (additive — does not remove existing
 * grants). "all" grants every active facilitator; "select" grants the given ids; "none" is a
 * no-op. Used by the admin Start-Challenge wizard's Visibility step. Returns how many
 * facilitators were granted access.
 */
export async function grantChallengeTypeVisibility(typeId: string, visibility: VisibilityInput, actorId?: string | null): Promise<number> {
  if (!typeId || visibility.mode === "none") return 0;
  const supabase = createSupabaseAdminClient();
  let targets: string[] = [];
  if (visibility.mode === "all") {
    const { data } = await supabase.from("profiles").select("id").eq("role", "facilitator").eq("status", "active");
    targets = (data ?? []).map((r: any) => r.id as string);
  } else {
    targets = Array.from(new Set((visibility.facilitatorIds ?? []).filter(Boolean)));
  }
  if (!targets.length) return 0;
  await supabase
    .from("facilitator_challenge_access")
    .upsert(
      targets.map((facilitator_id) => ({ facilitator_id, experience_type_id: typeId, created_by: actorId ?? null })),
      { onConflict: "facilitator_id,experience_type_id", ignoreDuplicates: true },
    );
  return targets.length;
}

/** Replace a facilitator's challenge access with `typeIds`. Super-Admin only (API-gated). */
export async function setFacilitatorChallengeAccess(facilitatorId: string, typeIds: string[], actorId?: string | null) {
  const supabase = createSupabaseAdminClient();
  const wanted = Array.from(new Set(typeIds.filter(Boolean)));
  await supabase.from("facilitator_challenge_access").delete().eq("facilitator_id", facilitatorId);
  if (wanted.length) {
    await supabase.from("facilitator_challenge_access").insert(
      wanted.map((experience_type_id) => ({ facilitator_id: facilitatorId, experience_type_id, created_by: actorId ?? null })),
    );
  }
  return { facilitatorId, count: wanted.length };
}

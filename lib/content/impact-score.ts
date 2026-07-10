import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// The Impact Score dashboard editor was removed; the public Mission page still
// reads any previously-published record for its "What Drives Us" section.
export async function getPublishedImpactScore() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("impact_scores")
    .select("*")
    .eq("published", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

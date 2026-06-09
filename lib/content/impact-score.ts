import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type ImpactCategory = {
  icon: string;
  title: string;
  description: string;
};

export type ImpactScoreInput = {
  scoreDate: string;
  totalAmount: number;
  goalLabel: string;
  headline: string;
  bodyText: string;
  notes?: string;
  published: boolean;
  categories: ImpactCategory[];
  actorUserId?: string;
};

export async function getImpactScore() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("impact_scores")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

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

export async function saveImpactScore(input: ImpactScoreInput) {
  const supabase = createSupabaseAdminClient();

  const { data: existing } = await supabase
    .from("impact_scores")
    .select("id")
    .limit(1)
    .maybeSingle();

  const payload = {
    score_date: input.scoreDate,
    total_amount: input.totalAmount,
    goal_label: input.goalLabel,
    headline: input.headline,
    body_text: input.bodyText,
    notes: input.notes ?? null,
    published: input.published,
    categories: input.categories,
    updated_by: input.actorUserId ?? null,
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    const { data, error } = await supabase
      .from("impact_scores")
      .update(payload)
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("impact_scores")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Pilot Forms data layer (service-role admin client). Resilient: if the
// pilot_forms table or a row is missing, resolvers fall back to the hardcoded
// constants so the live public forms never break.

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  type PilotForm, type PilotFormKind, type SurveyDefinition, type CheckInDefinition, type SurveyField,
  SEED_FORMS, seedDefFor, seedSurveyDef, checkInDefFromConstants,
} from "@/lib/pilot/form-types";

const COLUMNS = "id, kind, slug, title, description, status, draft_definition, published_definition, created_at, updated_at, published_at";

export async function listForms(kind?: PilotFormKind): Promise<PilotForm[]> {
  try {
    const sb = createSupabaseAdminClient();
    let q = sb.from("pilot_forms").select(COLUMNS).order("created_at", { ascending: true });
    if (kind) q = q.eq("kind", kind);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as PilotForm[];
  } catch { return []; }
}

export async function getFormBySlug(slug: string): Promise<PilotForm | null> {
  try {
    const sb = createSupabaseAdminClient();
    const { data, error } = await sb.from("pilot_forms").select(COLUMNS).eq("slug", slug).maybeSingle();
    if (error) throw error;
    return (data as PilotForm) ?? null;
  } catch { return null; }
}

// Public read: published survey fields, else the hardcoded seed for that slug.
export async function resolveSurveyFields(slug: string): Promise<SurveyField[]> {
  const form = await getFormBySlug(slug);
  const def = form?.status === "published" ? (form.published_definition as SurveyDefinition | null) : null;
  if (def && Array.isArray(def.fields) && def.fields.length) return def.fields;
  return seedSurveyDef(slug).fields;
}

// Public read: published check-in definition, else the hardcoded constants.
export async function resolveCheckInDef(): Promise<CheckInDefinition> {
  const form = await getFormBySlug("check-in");
  const def = form?.status === "published" ? (form.published_definition as CheckInDefinition | null) : null;
  if (def && Array.isArray(def.sections) && def.sections.length) return def;
  return checkInDefFromConstants();
}

// Builder: the row if it exists, else a synthetic draft pre-filled from constants.
export async function getBuilderForm(kind: PilotFormKind, slug: string): Promise<PilotForm> {
  const existing = await getFormBySlug(slug);
  if (existing) return existing;
  const seed = SEED_FORMS.find((s) => s.slug === slug);
  const now = new Date().toISOString();
  return {
    id: "", kind, slug, title: seed?.title ?? slug, description: seed?.description ?? null,
    status: "draft", draft_definition: seedDefFor(kind, slug), published_definition: null,
    created_at: now, updated_at: now, published_at: null,
  };
}

// Ensure the 3 seed forms exist as draft rows (best-effort; skips if table missing).
export async function ensureSeeds(actorUserId?: string): Promise<void> {
  try {
    const sb = createSupabaseAdminClient();
    const { data } = await sb.from("pilot_forms").select("slug");
    const have = new Set((data ?? []).map((r: { slug: string }) => r.slug));
    const missing = SEED_FORMS.filter((s) => !have.has(s.slug));
    if (!missing.length) return;
    await sb.from("pilot_forms").insert(missing.map((s) => ({
      kind: s.kind, slug: s.slug, title: s.title, description: s.description,
      status: "draft", draft_definition: seedDefFor(s.kind, s.slug), created_by: actorUserId ?? null,
    })));
  } catch { /* table not migrated yet — fall back silently */ }
}

export type SaveDraftInput = {
  id?: string; kind: PilotFormKind; slug: string; title: string; description?: string | null;
  draftDefinition: SurveyDefinition | CheckInDefinition; actorUserId?: string | null;
};
export async function saveDraft(input: SaveDraftInput): Promise<PilotForm> {
  const sb = createSupabaseAdminClient();
  const patch = { title: input.title, description: input.description ?? null, draft_definition: input.draftDefinition, updated_at: new Date().toISOString() };
  if (input.id) {
    const { data, error } = await sb.from("pilot_forms").update(patch).eq("id", input.id).select(COLUMNS).single();
    if (error) throw new Error(error.message);
    return data as PilotForm;
  }
  const { data, error } = await sb.from("pilot_forms")
    .insert({ kind: input.kind, slug: input.slug, created_by: input.actorUserId ?? null, ...patch })
    .select(COLUMNS).single();
  if (error) throw new Error(error.message);
  return data as PilotForm;
}

export async function publishForm(id: string): Promise<PilotForm> {
  const sb = createSupabaseAdminClient();
  const { data: cur, error: e1 } = await sb.from("pilot_forms").select("draft_definition").eq("id", id).single();
  if (e1) throw new Error(e1.message);
  const { data, error } = await sb.from("pilot_forms")
    .update({ published_definition: cur.draft_definition, status: "published", published_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", id).select(COLUMNS).single();
  if (error) throw new Error(error.message);
  return data as PilotForm;
}

export async function deleteForm(id: string): Promise<void> {
  const sb = createSupabaseAdminClient();
  const { error } = await sb.from("pilot_forms").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// Is a survey slug currently accepting responses? (published OR a legacy seed slug)
export async function isSubmittableSurvey(slug: string): Promise<boolean> {
  if (slug === "general" || slug === "pastor-elder" || slug === "pastor_elder") return true;
  const form = await getFormBySlug(slug);
  return form?.kind === "survey" && form.status === "published";
}

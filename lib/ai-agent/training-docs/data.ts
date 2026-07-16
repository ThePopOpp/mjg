// Agent Training Docs — data layer (agent_training_docs, migration 202607160043).
// Service-role admin client behind the Super-Admin API guard.

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type TrainingDocStatus = "ready" | "stored" | "failed" | "archived";

export type TrainingDoc = {
  id: string;
  title: string;
  summary: string | null;
  content_md: string | null;
  source_kind: string;
  file_name: string | null;
  file_url: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  status: TrainingDocStatus;
  conversion_error: string | null;
  char_count: number;
  tags: string[];
  created_by: string | null;
  created_by_email: string | null;
  created_at: string;
  updated_at: string;
};

// Body text is deliberately excluded — a list of 50 docs shouldn't ship every
// document to the browser. read_training_doc / getTrainingDoc fetch the body.
const LIST_COLUMNS =
  "id, title, summary, source_kind, file_name, file_url, mime_type, size_bytes, status, conversion_error, char_count, tags, created_by, created_by_email, created_at, updated_at";

export type TrainingDocListItem = Omit<TrainingDoc, "content_md">;

export async function listTrainingDocs(includeArchived = true): Promise<TrainingDocListItem[]> {
  const sb = createSupabaseAdminClient();
  let q = sb.from("agent_training_docs").select(LIST_COLUMNS).order("updated_at", { ascending: false }).limit(300);
  if (!includeArchived) q = q.neq("status", "archived");
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as TrainingDocListItem[];
}

export async function getTrainingDoc(id: string): Promise<TrainingDoc | null> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb.from("agent_training_docs").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as TrainingDoc) ?? null;
}

export type CreateTrainingDocInput = {
  title: string;
  summary?: string | null;
  contentMd?: string | null;
  sourceKind?: string;
  fileName?: string | null;
  fileUrl?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  status?: TrainingDocStatus;
  conversionError?: string | null;
  tags?: string[];
  actorId?: string | null;
  actorEmail?: string | null;
};

export async function createTrainingDoc(input: CreateTrainingDocInput): Promise<TrainingDoc> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb
    .from("agent_training_docs")
    .insert({
      title: input.title,
      summary: input.summary ?? null,
      content_md: input.contentMd ?? null,
      source_kind: input.sourceKind ?? "upload",
      file_name: input.fileName ?? null,
      file_url: input.fileUrl ?? null,
      mime_type: input.mimeType ?? null,
      size_bytes: input.sizeBytes ?? null,
      status: input.status ?? "ready",
      conversion_error: input.conversionError ?? null,
      char_count: (input.contentMd ?? "").length,
      tags: input.tags ?? [],
      created_by: input.actorId ?? null,
      created_by_email: input.actorEmail ?? null,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as TrainingDoc;
}

export async function updateTrainingDoc(
  id: string,
  patch: Partial<Pick<TrainingDoc, "title" | "summary" | "content_md" | "status" | "tags">>,
): Promise<TrainingDoc> {
  const sb = createSupabaseAdminClient();
  const update: Record<string, unknown> = { ...patch, updated_at: new Date().toISOString() };
  // char_count is derived — keep it honest when the body is edited by hand.
  if (typeof patch.content_md === "string") update.char_count = patch.content_md.length;
  const { data, error } = await sb.from("agent_training_docs").update(update).eq("id", id).select("*").single();
  if (error) throw new Error(error.message);
  return data as TrainingDoc;
}

export async function deleteTrainingDoc(id: string): Promise<void> {
  const sb = createSupabaseAdminClient();
  const { error } = await sb.from("agent_training_docs").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Retrieval used by the agent ──────────────────────────────────────────────

// Only 'ready' docs are visible to Steward: 'stored' has no text, 'failed' never
// converted, 'archived' was switched off on purpose.
export async function listAgentReadableDocs(): Promise<Array<{ id: string; title: string; summary: string | null; char_count: number; tags: string[] }>> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb
    .from("agent_training_docs")
    .select("id, title, summary, char_count, tags")
    .eq("status", "ready")
    .order("updated_at", { ascending: false })
    .limit(100);
  if (error) return [];
  return data ?? [];
}

export async function searchTrainingDocs(query: string, limit = 5): Promise<Array<{ id: string; title: string; summary: string | null; excerpt: string }>> {
  const sb = createSupabaseAdminClient();
  const q = query.trim();
  if (!q) return [];

  // ilike over title/summary/body: good enough at this library size, and it needs
  // no embeddings or extra infrastructure. The GIN tsvector index is in place if
  // this ever needs to become real full-text search.
  const { data, error } = await sb
    .from("agent_training_docs")
    .select("id, title, summary, content_md")
    .eq("status", "ready")
    .or(`title.ilike.%${q}%,summary.ilike.%${q}%,content_md.ilike.%${q}%`)
    .limit(limit);
  if (error) return [];

  return (data ?? []).map((d) => {
    const body = (d.content_md as string) ?? "";
    const at = body.toLowerCase().indexOf(q.toLowerCase());
    // Window the excerpt around the hit so the agent sees why it matched.
    const start = at < 0 ? 0 : Math.max(0, at - 200);
    const excerpt = body.slice(start, start + 600);
    return {
      id: d.id as string,
      title: d.title as string,
      summary: (d.summary as string) ?? null,
      excerpt: (start > 0 ? "…" : "") + excerpt + (body.length > start + 600 ? "…" : ""),
    };
  });
}

// The index injected into the system prompt: titles + summaries only, so Steward
// knows WHAT exists and can fetch the body it needs. Capped so a large library
// can't quietly inflate every request.
export async function renderTrainingDocsForPrompt(): Promise<string> {
  const docs = await listAgentReadableDocs();
  if (!docs.length) return "";
  const lines = docs
    .slice(0, 40)
    .map((d) => `- "${d.title}" (id: ${d.id})${d.summary ? ` — ${d.summary}` : ""}`)
    .join("\n");
  return `\n\nTRAINING DOCS (reference material uploaded by the team — the index only; call search_training_docs or read_training_doc to read one):\n\n${lines}`;
}

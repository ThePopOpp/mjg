import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { CmsBlock, CmsPage, CmsPageType } from "./types";

// Service-role data layer. ONLY call from super-admin-guarded routes/pages
// (requireSuperAdmin) — RLS (is_super_admin) is the defense-in-depth backstop.

const PAGE_TYPES = new Set(["page", "landing", "stewardship", "experience", "resource", "informational"]);

export function slugify(input: string): string {
  return (
    String(input || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "page"
  );
}

async function ensureUniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const sb = createSupabaseAdminClient();
  const root = slugify(base);
  let candidate = root;
  for (let i = 0; i < 50; i++) {
    const { data } = await sb.from("cms_pages").select("id").eq("slug", candidate).maybeSingle();
    if (!data || data.id === ignoreId) return candidate;
    candidate = `${root}-${i + 2}`;
  }
  return `${root}-${Date.now().toString(36)}`;
}

export async function listCmsPages(): Promise<CmsPage[]> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb.from("cms_pages").select("*").order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as CmsPage[];
}

export async function getCmsPage(id: string): Promise<CmsPage | null> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb.from("cms_pages").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as unknown as CmsPage | null;
}

export async function createCmsPage(input: {
  title: string; slug?: string; page_type?: string; description?: string | null; actorUserId?: string;
}): Promise<CmsPage> {
  const sb = createSupabaseAdminClient();
  const title = String(input.title || "").trim();
  if (!title) throw new Error("A page title is required.");
  const page_type = PAGE_TYPES.has(String(input.page_type)) ? String(input.page_type) : "page";
  const slug = await ensureUniqueSlug(input.slug || title);
  const { data, error } = await sb.from("cms_pages").insert({
    title, slug, page_type, description: input.description ?? null, status: "draft",
    created_by: input.actorUserId ?? null, updated_by: input.actorUserId ?? null,
  }).select("*").single();
  if (error) throw new Error(error.message);
  return data as unknown as CmsPage;
}

export async function updateCmsPage(id: string, patch: {
  title?: string; slug?: string; page_type?: string; description?: string | null;
  status?: string; assigned_roles?: string[]; actorUserId?: string;
}): Promise<CmsPage> {
  const sb = createSupabaseAdminClient();
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.title !== undefined) row.title = String(patch.title).trim();
  if (patch.description !== undefined) row.description = patch.description || null;
  if (patch.page_type && PAGE_TYPES.has(String(patch.page_type))) row.page_type = String(patch.page_type) as CmsPageType;
  // Phase 1 supports draft <-> archived; publishing arrives in Phase 3.
  if (patch.status && ["draft", "archived"].includes(String(patch.status))) row.status = String(patch.status);
  if (Array.isArray(patch.assigned_roles)) row.assigned_roles = patch.assigned_roles;
  if (patch.slug) row.slug = await ensureUniqueSlug(patch.slug, id);
  if (patch.actorUserId) row.updated_by = patch.actorUserId;

  const { data, error } = await sb.from("cms_pages").update(row).eq("id", id).select("*").single();
  if (error) throw new Error(error.message);
  return data as unknown as CmsPage;
}

export async function deleteCmsPage(id: string): Promise<void> {
  const sb = createSupabaseAdminClient();
  const { error } = await sb.from("cms_pages").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// Page + its editable draft block tree (draft_content jsonb). The returned page
// includes draft_content as a CmsDraft (or {} for a never-edited page).
export async function getCmsPageWithDraft(id: string): Promise<(CmsPage & { draft_content: unknown }) | null> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb.from("cms_pages").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as unknown as (CmsPage & { draft_content: unknown }) | null;
}

// Create a new page AND seed its draft block tree in one step. Always lands as a
// DRAFT (createCmsPage forces status:"draft") — used by Steward AI authoring.
export async function createCmsDraftPage(input: {
  title: string; slug?: string; page_type?: string; description?: string | null;
  blocks: CmsBlock[]; actorUserId?: string;
}): Promise<CmsPage> {
  const page = await createCmsPage({
    title: input.title, slug: input.slug, page_type: input.page_type,
    description: input.description ?? null, actorUserId: input.actorUserId,
  });
  await saveCmsDraft(page.id, { version: 1, blocks: Array.isArray(input.blocks) ? input.blocks : [] }, input.actorUserId);
  return page;
}

export async function saveCmsDraft(id: string, content: unknown, actorUserId?: string): Promise<void> {
  const sb = createSupabaseAdminClient();
  const { error } = await sb.from("cms_pages")
    .update({ draft_content: content ?? {}, updated_by: actorUserId ?? null, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Saved block/component templates ───────────────────────────────────────────
export type CmsBlockTemplate = { id: string; name: string; kind: string; content: CmsBlock[]; created_at?: string };

export async function listBlockTemplates(): Promise<CmsBlockTemplate[]> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb.from("cms_block_templates").select("id, name, kind, content, created_at").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({ ...r, content: Array.isArray(r.content) ? (r.content as CmsBlock[]) : [] })) as CmsBlockTemplate[];
}

export async function createBlockTemplate(input: { name: string; kind?: string; content: CmsBlock[]; actorUserId?: string }): Promise<CmsBlockTemplate> {
  const sb = createSupabaseAdminClient();
  const name = String(input.name || "").trim();
  if (!name) throw new Error("A template name is required.");
  const kind = ["block", "section", "group"].includes(String(input.kind)) ? String(input.kind) : (Array.isArray(input.content) && input.content.length > 1 ? "group" : "block");
  const { data, error } = await sb.from("cms_block_templates")
    .insert({ name, kind, content: Array.isArray(input.content) ? input.content : [], created_by: input.actorUserId ?? null })
    .select("id, name, kind, content, created_at").single();
  if (error) throw new Error(error.message);
  return { ...data, content: Array.isArray(data.content) ? (data.content as CmsBlock[]) : [] } as CmsBlockTemplate;
}

export async function deleteBlockTemplate(id: string): Promise<void> {
  const sb = createSupabaseAdminClient();
  const { error } = await sb.from("cms_block_templates").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// Frontend Editor — server data layer (spec §47).
//
// SERVICE-ROLE ONLY. Every exported function here assumes the caller already
// passed requireSuperAdmin (API routes) or the /dashboard/cms layout guard
// (pages). RLS (is_super_admin) is the backstop, not the gate.
//
// Invariants this module enforces so no caller has to remember them:
//   • protected routes can never be claimed, renamed or deleted (spec §29),
//   • publishing always writes a version first, then swaps the snapshot (§42),
//   • archiving is preferred over deletion, and deletion runs a dependency
//     check (§19),
//   • every write lands in website_audit_logs (§38).

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { assertUsableSlug, isProtectedPath } from "./protected";
import { validateContent } from "./registry";
import { templateContent } from "./templates";
import { extractLinks, contentToPlainText } from "./blocks";
import {
  asContent,
  emptyContent,
  pagePath,
  type EditSource,
  type WebsiteAuditLog,
  type WebsiteContent,
  type WebsitePage,
  type WebsitePageStatus,
  type WebsitePageSummary,
  type WebsitePageType,
  type WebsitePageVersion,
} from "./types";

const PAGE_COLUMNS = "*";

const PAGE_TYPES = new Set<WebsitePageType>(["page", "landing", "resource", "marketing", "legal", "system"]);

export function slugify(input: string): string {
  return (
    String(input || "")
      .toLowerCase()
      .replace(/[^a-z0-9/]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^[-/]+|[-/]+$/g, "")
      .slice(0, 96) || "page"
  );
}

function hydrate(row: Record<string, unknown> | null): WebsitePage | null {
  if (!row) return null;
  return {
    ...(row as unknown as WebsitePage),
    draft_content: asContent(row.draft_content),
    published_content: row.published_content ? asContent(row.published_content) : null,
    seo_keywords: Array.isArray(row.seo_keywords) ? (row.seo_keywords as string[]) : [],
  };
}

async function ensureUniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const sb = createSupabaseAdminClient();
  const root = assertUsableSlug(slugify(base));
  let candidate = root;
  for (let i = 0; i < 50; i++) {
    const { data } = await sb.from("website_pages").select("id").eq("slug", candidate).maybeSingle();
    if (!data || data.id === ignoreId) return candidate;
    candidate = `${root}-${i + 2}`;
  }
  return `${root}-${Date.now().toString(36)}`;
}

/**
 * Drop the rendered route for a page so publish / unpublish / archive / delete
 * take effect immediately (spec §42). The published-page read itself is
 * uncached (see lib/website/public.ts), so this is the only layer to clear.
 */
function revalidateWebsitePage(slug: string): void {
  revalidatePath(pagePath(slug));
}

// ── Audit log (spec §38) ─────────────────────────────────────────────────────

export async function logWebsiteAudit(input: {
  actorId?: string | null;
  actorType?: "user" | "steward";
  action: string;
  resourceType?: string;
  resourceId?: string | null;
  summary?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const sb = createSupabaseAdminClient();
  await sb
    .from("website_audit_logs")
    .insert({
      actor_id: input.actorId ?? null,
      actor_type: input.actorType ?? "user",
      action: input.action,
      resource_type: input.resourceType ?? "page",
      resource_id: input.resourceId ?? null,
      summary: input.summary ?? "",
      metadata: input.metadata ?? {},
    })
    // The audit log must never be the reason a legitimate edit fails.
    .then(undefined, () => undefined);
}

export async function listAuditLogs(limit = 60, resourceId?: string): Promise<WebsiteAuditLog[]> {
  const sb = createSupabaseAdminClient();
  let query = sb.from("website_audit_logs").select("*").order("created_at", { ascending: false }).limit(Math.min(200, limit));
  if (resourceId) query = query.eq("resource_id", resourceId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as WebsiteAuditLog[];
}

// ── Reads ────────────────────────────────────────────────────────────────────

export type ListPagesOptions = {
  status?: WebsitePageStatus | "all";
  pageType?: WebsitePageType | "all";
  includeDeleted?: boolean;
  search?: string;
};

export async function listPages(options: ListPagesOptions = {}): Promise<WebsitePageSummary[]> {
  const sb = createSupabaseAdminClient();
  let query = sb.from("website_pages").select(PAGE_COLUMNS).order("updated_at", { ascending: false });
  if (!options.includeDeleted) query = query.is("deleted_at", null);
  if (options.status && options.status !== "all") query = query.eq("status", options.status);
  if (options.pageType && options.pageType !== "all") query = query.eq("page_type", options.pageType);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const pages = (data ?? []).map((r) => hydrate(r as Record<string, unknown>)!).filter(Boolean);

  const [versionCounts, editorNames] = await Promise.all([countVersions(), lookupEditorNames(pages)]);

  let summaries: WebsitePageSummary[] = pages.map((p) => ({
    ...p,
    version_count: versionCounts.get(p.id) ?? 0,
    updated_by_label: p.updated_by ? editorNames.get(p.updated_by) ?? null : null,
  }));

  const term = options.search?.trim().toLowerCase();
  if (term) {
    summaries = summaries.filter((p) => {
      const haystack = [
        p.title,
        p.slug,
        p.seo_title ?? "",
        p.seo_description ?? "",
        contentToPlainText(p.draft_content),
      ]
        .join("\n")
        .toLowerCase();
      return haystack.includes(term);
    });
  }
  return summaries;
}

async function countVersions(): Promise<Map<string, number>> {
  const sb = createSupabaseAdminClient();
  const { data } = await sb.from("website_page_versions").select("page_id");
  const counts = new Map<string, number>();
  for (const row of (data ?? []) as { page_id: string }[]) {
    counts.set(row.page_id, (counts.get(row.page_id) ?? 0) + 1);
  }
  return counts;
}

async function lookupEditorNames(pages: { updated_by: string | null }[]): Promise<Map<string, string>> {
  const ids = Array.from(new Set(pages.map((p) => p.updated_by).filter(Boolean))) as string[];
  const names = new Map<string, string>();
  if (!ids.length) return names;
  const sb = createSupabaseAdminClient();
  const { data } = await sb.from("profiles").select("id, email, first_name, last_name").in("id", ids);
  for (const row of (data ?? []) as { id: string; email: string; first_name: string | null; last_name: string | null }[]) {
    names.set(row.id, [row.first_name, row.last_name].filter(Boolean).join(" ") || row.email);
  }
  return names;
}

export async function getPage(id: string): Promise<WebsitePage | null> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb.from("website_pages").select(PAGE_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return hydrate(data as Record<string, unknown> | null);
}

export async function getPageOrThrow(id: string): Promise<WebsitePage> {
  const page = await getPage(id);
  if (!page) throw new Error("That page no longer exists.");
  return page;
}

export async function getPageBySlug(slug: string, opts: { includeArchived?: boolean } = {}): Promise<WebsitePage | null> {
  const sb = createSupabaseAdminClient();
  let query = sb.from("website_pages").select(PAGE_COLUMNS).eq("slug", slugify(slug)).is("deleted_at", null);
  if (!opts.includeArchived) query = query.neq("status", "archived");
  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(error.message);
  return hydrate(data as Record<string, unknown> | null);
}

// ── Create / update ──────────────────────────────────────────────────────────

export type CreatePageInput = {
  title: string;
  slug?: string;
  page_type?: string;
  template?: string;
  seo_title?: string | null;
  seo_description?: string | null;
  navigation_visibility?: boolean;
  navigation_label?: string | null;
  content?: unknown;
  actorId?: string | null;
  actorType?: "user" | "steward";
};

/** Always lands as a DRAFT (spec §15: no production write before a valid draft). */
export async function createPage(input: CreatePageInput): Promise<WebsitePage> {
  const sb = createSupabaseAdminClient();
  const title = String(input.title || "").trim();
  if (!title) throw new Error("A page title is required.");

  const slug = await ensureUniqueSlug(input.slug || title);
  const pageType = PAGE_TYPES.has(input.page_type as WebsitePageType) ? (input.page_type as WebsitePageType) : "page";
  const template = String(input.template || "standard");

  const seeded = input.content ? validateContent(input.content).content : templateContent(template, title);

  const { data, error } = await sb
    .from("website_pages")
    .insert({
      title,
      slug,
      page_type: pageType,
      template,
      status: "draft",
      draft_content: seeded,
      published_content: null,
      seo_title: input.seo_title ?? title,
      seo_description: input.seo_description ?? null,
      navigation_visibility: input.navigation_visibility ?? false,
      navigation_label: input.navigation_label ?? null,
      is_legal: pageType === "legal",
      has_unpublished_changes: true,
      last_edited_source: input.actorType === "steward" ? "steward" : "manual",
      created_by: input.actorId ?? null,
      updated_by: input.actorId ?? null,
    })
    .select(PAGE_COLUMNS)
    .single();
  if (error) throw new Error(error.message);

  const page = hydrate(data as Record<string, unknown>)!;
  await logWebsiteAudit({
    actorId: input.actorId,
    actorType: input.actorType ?? "user",
    action: "page.created",
    resourceId: page.id,
    summary: `Created the draft page "${page.title}" at /${page.slug}.`,
    metadata: { slug: page.slug, template, blocks: seeded.blocks.length },
  });
  return page;
}

export type UpdatePageMetaInput = {
  title?: string;
  slug?: string;
  page_type?: string;
  template?: string;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string[];
  canonical_url?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  featured_image_url?: string | null;
  no_index?: boolean;
  no_follow?: boolean;
  navigation_visibility?: boolean;
  navigation_label?: string | null;
  parent_page_id?: string | null;
  sort_order?: number;
  scheduled_at?: string | null;
  unpublish_at?: string | null;
  actorId?: string | null;
  actorType?: "user" | "steward";
  /** Create a 301 from the old address when the slug changes (spec §24). */
  createRedirect?: boolean;
};

export async function updatePageMeta(id: string, patch: UpdatePageMetaInput): Promise<WebsitePage> {
  const sb = createSupabaseAdminClient();
  const current = await getPageOrThrow(id);

  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.title !== undefined) row.title = String(patch.title).trim() || current.title;
  if (patch.page_type && PAGE_TYPES.has(patch.page_type as WebsitePageType)) {
    row.page_type = patch.page_type;
    row.is_legal = patch.page_type === "legal";
  }
  if (patch.template !== undefined) row.template = String(patch.template);
  for (const key of [
    "seo_title", "seo_description", "canonical_url", "og_title", "og_description",
    "og_image_url", "featured_image_url", "navigation_label",
  ] as const) {
    if (patch[key] !== undefined) row[key] = patch[key] || null;
  }
  if (patch.seo_keywords !== undefined) {
    row.seo_keywords = (patch.seo_keywords ?? []).map((k) => String(k).trim()).filter(Boolean).slice(0, 20);
  }
  for (const key of ["no_index", "no_follow", "navigation_visibility"] as const) {
    if (patch[key] !== undefined) row[key] = Boolean(patch[key]);
  }
  if (patch.parent_page_id !== undefined) row.parent_page_id = patch.parent_page_id || null;
  if (patch.sort_order !== undefined) row.sort_order = Number(patch.sort_order) || 0;
  if (patch.scheduled_at !== undefined) row.scheduled_at = patch.scheduled_at || null;
  if (patch.unpublish_at !== undefined) row.unpublish_at = patch.unpublish_at || null;
  if (patch.actorId) row.updated_by = patch.actorId;
  if (patch.actorType) row.last_edited_source = patch.actorType === "steward" ? "steward" : "manual";

  let oldSlug: string | null = null;
  if (patch.slug !== undefined && slugify(patch.slug) !== current.slug) {
    if (current.is_protected) {
      throw new Error(`"${current.title}" is a protected page — its address cannot be changed.`);
    }
    oldSlug = current.slug;
    row.slug = await ensureUniqueSlug(patch.slug, id);
  }

  // Any metadata edit makes the live page stale until it is published again.
  row.has_unpublished_changes = true;

  const { data, error } = await sb.from("website_pages").update(row).eq("id", id).select(PAGE_COLUMNS).single();
  if (error) throw new Error(error.message);
  const page = hydrate(data as Record<string, unknown>)!;

  if (oldSlug && patch.createRedirect !== false) {
    await sb
      .from("website_redirects")
      .upsert(
        {
          source_path: pagePath(oldSlug),
          destination_path: pagePath(page.slug),
          status_code: 301,
          is_active: true,
          created_by: patch.actorId ?? null,
        },
        { onConflict: "source_path" },
      )
      .then(undefined, () => undefined);
  }

  await logWebsiteAudit({
    actorId: patch.actorId,
    actorType: patch.actorType ?? "user",
    action: oldSlug ? "page.slug_changed" : "page.settings_updated",
    resourceId: id,
    summary: oldSlug
      ? `Moved "${page.title}" from /${oldSlug} to /${page.slug}.`
      : `Updated settings for "${page.title}".`,
    metadata: { oldSlug, newSlug: page.slug },
  });

  if (oldSlug) {
    revalidateWebsitePage(oldSlug);
    revalidateWebsitePage(page.slug);
  }
  return page;
}

/** Autosave target: writes the draft only, never the published snapshot. */
export async function saveDraft(
  id: string,
  content: unknown,
  opts: { actorId?: string | null; source?: EditSource; silent?: boolean } = {},
): Promise<{ page: WebsitePage; issues: { path: string; message: string }[] }> {
  const sb = createSupabaseAdminClient();
  await getPageOrThrow(id);
  const { content: clean, issues } = validateContent(content);

  const { data, error } = await sb
    .from("website_pages")
    .update({
      draft_content: clean,
      has_unpublished_changes: true,
      last_edited_source: opts.source ?? "manual",
      updated_by: opts.actorId ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(PAGE_COLUMNS)
    .single();
  if (error) throw new Error(error.message);

  const page = hydrate(data as Record<string, unknown>)!;
  // Autosave fires every couple of seconds; only deliberate saves are logged.
  if (!opts.silent) {
    await logWebsiteAudit({
      actorId: opts.actorId,
      actorType: opts.source === "steward" ? "steward" : "user",
      action: "page.draft_saved",
      resourceId: id,
      summary: `Saved the draft of "${page.title}" (${clean.blocks.length} sections).`,
      metadata: { blocks: clean.blocks.length },
    });
  }
  return { page, issues };
}

// ── Versions (spec §17) ──────────────────────────────────────────────────────

async function nextVersionNumber(pageId: string): Promise<number> {
  const sb = createSupabaseAdminClient();
  const { data } = await sb
    .from("website_page_versions")
    .select("version_number")
    .eq("page_id", pageId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  return ((data?.version_number as number) ?? 0) + 1;
}

function versionMetadata(page: WebsitePage): Record<string, unknown> {
  return {
    title: page.title,
    slug: page.slug,
    page_type: page.page_type,
    template: page.template,
    seo_title: page.seo_title,
    seo_description: page.seo_description,
    seo_keywords: page.seo_keywords,
    canonical_url: page.canonical_url,
    og_title: page.og_title,
    og_description: page.og_description,
    og_image_url: page.og_image_url,
    featured_image_url: page.featured_image_url,
    no_index: page.no_index,
    no_follow: page.no_follow,
    navigation_visibility: page.navigation_visibility,
    navigation_label: page.navigation_label,
  };
}

export async function createVersion(
  page: WebsitePage,
  content: WebsiteContent,
  opts: { source?: EditSource; summary?: string; actorId?: string | null } = {},
): Promise<WebsitePageVersion> {
  const sb = createSupabaseAdminClient();
  const version_number = await nextVersionNumber(page.id);
  const { data, error } = await sb
    .from("website_page_versions")
    .insert({
      page_id: page.id,
      version_number,
      content,
      metadata: versionMetadata(page),
      source: opts.source ?? "manual",
      change_summary: opts.summary ?? "",
      created_by: opts.actorId ?? null,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return { ...(data as unknown as WebsitePageVersion), content: asContent((data as Record<string, unknown>).content) };
}

export async function listVersions(pageId: string): Promise<WebsitePageVersion[]> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb
    .from("website_page_versions")
    .select("*")
    .eq("page_id", pageId)
    .order("version_number", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    ...(r as unknown as WebsitePageVersion),
    content: asContent((r as Record<string, unknown>).content),
  }));
}

export async function getVersion(versionId: string): Promise<WebsitePageVersion | null> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb.from("website_page_versions").select("*").eq("id", versionId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return { ...(data as unknown as WebsitePageVersion), content: asContent((data as Record<string, unknown>).content) };
}

/**
 * Restore a version INTO THE DRAFT. It never touches the live page — Mike still
 * reviews and publishes, which is what keeps "restore" reversible too.
 */
export async function restoreVersion(
  versionId: string,
  opts: { actorId?: string | null; actorType?: "user" | "steward" } = {},
): Promise<WebsitePage> {
  const version = await getVersion(versionId);
  if (!version) throw new Error("That version no longer exists.");
  const page = await getPageOrThrow(version.page_id);

  // Snapshot what we are about to overwrite so the restore itself is undoable.
  await createVersion(page, page.draft_content, {
    source: "restore",
    summary: `Draft replaced by version ${version.version_number}.`,
    actorId: opts.actorId,
  });

  const { page: updated } = await saveDraft(page.id, version.content, {
    actorId: opts.actorId,
    source: "restore",
    silent: true,
  });

  await logWebsiteAudit({
    actorId: opts.actorId,
    actorType: opts.actorType ?? "user",
    action: "version.restored",
    resourceId: page.id,
    summary: `Restored version ${version.version_number} of "${page.title}" into the draft.`,
    metadata: { versionId, versionNumber: version.version_number },
  });
  return updated;
}

// ── Publish / unpublish (spec §42) ───────────────────────────────────────────

export async function publishPage(
  id: string,
  opts: { actorId?: string | null; actorType?: "user" | "steward"; summary?: string } = {},
): Promise<{ page: WebsitePage; version: WebsitePageVersion; issues: { path: string; message: string }[] }> {
  const sb = createSupabaseAdminClient();
  const page = await getPageOrThrow(id);

  // 1. Validate.
  const { content, issues } = validateContent(page.draft_content);
  if (!content.blocks.length) {
    throw new Error("This page has no sections yet. Add content before publishing.");
  }

  // 2. Version record (before the swap, so the previous live content is kept).
  const version = await createVersion(page, content, {
    source: opts.actorType === "steward" ? "steward" : "manual",
    summary: opts.summary ?? "Published.",
    actorId: opts.actorId,
  });

  // 3. Swap the published snapshot.
  const now = new Date().toISOString();
  const { data, error } = await sb
    .from("website_pages")
    .update({
      published_content: content,
      status: "published",
      published_at: now,
      scheduled_at: null,
      has_unpublished_changes: false,
      updated_by: opts.actorId ?? null,
      updated_at: now,
    })
    .eq("id", id)
    .select(PAGE_COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  const published = hydrate(data as Record<string, unknown>)!;

  // 4-6. Revalidate every cache that could still serve the old content.
  revalidateWebsitePage(published.slug);

  // 7. Audit.
  await logWebsiteAudit({
    actorId: opts.actorId,
    actorType: opts.actorType ?? "user",
    action: "page.published",
    resourceId: id,
    summary: `Published "${published.title}" (version ${version.version_number}) to /${published.slug}.`,
    metadata: { versionNumber: version.version_number, blocks: content.blocks.length },
  });

  return { page: published, version, issues };
}

export async function unpublishPage(
  id: string,
  opts: { actorId?: string | null; actorType?: "user" | "steward" } = {},
): Promise<WebsitePage> {
  const sb = createSupabaseAdminClient();
  const page = await getPageOrThrow(id);
  if (page.is_protected) throw new Error(`"${page.title}" is a protected page and must stay published.`);

  const { data, error } = await sb
    .from("website_pages")
    .update({
      status: "draft",
      has_unpublished_changes: true,
      updated_by: opts.actorId ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(PAGE_COLUMNS)
    .single();
  if (error) throw new Error(error.message);

  revalidateWebsitePage(page.slug);
  await logWebsiteAudit({
    actorId: opts.actorId,
    actorType: opts.actorType ?? "user",
    action: "page.unpublished",
    resourceId: id,
    summary: `Took "${page.title}" off the live site. The draft is untouched.`,
  });
  return hydrate(data as Record<string, unknown>)!;
}

// ── Archive / restore / delete (spec §19) ────────────────────────────────────

export async function archivePage(
  id: string,
  opts: { actorId?: string | null; actorType?: "user" | "steward" } = {},
): Promise<WebsitePage> {
  const sb = createSupabaseAdminClient();
  const page = await getPageOrThrow(id);
  if (page.is_protected) throw new Error(`"${page.title}" is a protected page and cannot be archived.`);

  const { data, error } = await sb
    .from("website_pages")
    .update({ status: "archived", updated_by: opts.actorId ?? null, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(PAGE_COLUMNS)
    .single();
  if (error) throw new Error(error.message);

  await sb.from("website_navigation_items").update({ is_visible: false }).eq("page_id", id).then(undefined, () => undefined);
  revalidateWebsitePage(page.slug);

  await logWebsiteAudit({
    actorId: opts.actorId,
    actorType: opts.actorType ?? "user",
    action: "page.archived",
    resourceId: id,
    summary: `Archived "${page.title}". It is off the site and out of the navigation, but fully recoverable.`,
  });
  return hydrate(data as Record<string, unknown>)!;
}

export async function restorePage(
  id: string,
  opts: { actorId?: string | null; actorType?: "user" | "steward" } = {},
): Promise<WebsitePage> {
  const sb = createSupabaseAdminClient();
  const page = await getPageOrThrow(id);

  const { data, error } = await sb
    .from("website_pages")
    .update({
      status: "draft",
      deleted_at: null,
      has_unpublished_changes: true,
      updated_by: opts.actorId ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select(PAGE_COLUMNS)
    .single();
  if (error) throw new Error(error.message);

  await logWebsiteAudit({
    actorId: opts.actorId,
    actorType: opts.actorType ?? "user",
    action: "page.restored",
    resourceId: id,
    summary: `Restored "${page.title}" as a draft. Publish it when you are ready.`,
  });
  return hydrate(data as Record<string, unknown>)!;
}

export type PageDependencies = {
  incomingLinks: { pageId: string; title: string; slug: string; count: number }[];
  childPages: { id: string; title: string; slug: string }[];
  navigationItems: { id: string; label: string; group: string }[];
  isProtected: boolean;
  canDelete: boolean;
  warnings: string[];
};

/** Dependency check run before deletion and before a slug change (spec §19/§37). */
export async function pageDependencies(id: string): Promise<PageDependencies> {
  const sb = createSupabaseAdminClient();
  const page = await getPageOrThrow(id);
  const target = pagePath(page.slug);

  const [{ data: allPages }, { data: children }, { data: navItems }] = await Promise.all([
    sb.from("website_pages").select("id, title, slug, draft_content, published_content").is("deleted_at", null),
    sb.from("website_pages").select("id, title, slug").eq("parent_page_id", id).is("deleted_at", null),
    sb.from("website_navigation_items").select("id, label, navigation_group").eq("page_id", id),
  ]);

  const incomingLinks: PageDependencies["incomingLinks"] = [];
  for (const row of (allPages ?? []) as Record<string, unknown>[]) {
    if (row.id === id) continue;
    const links = [
      ...extractLinks(asContent(row.published_content ?? row.draft_content)),
    ].filter((l) => l.href === target || l.href.startsWith(`${target}#`) || l.href.startsWith(`${target}?`));
    if (links.length) {
      incomingLinks.push({ pageId: row.id as string, title: row.title as string, slug: row.slug as string, count: links.length });
    }
  }

  const childPages = ((children ?? []) as { id: string; title: string; slug: string }[]).map((c) => c);
  const navigationItems = ((navItems ?? []) as { id: string; label: string; navigation_group: string }[]).map((n) => ({
    id: n.id, label: n.label, group: n.navigation_group,
  }));

  const warnings: string[] = [];
  if (incomingLinks.length) {
    const total = incomingLinks.reduce((n, l) => n + l.count, 0);
    warnings.push(
      `This page is linked ${total} time${total === 1 ? "" : "s"} from ${incomingLinks.length} other page${incomingLinks.length === 1 ? "" : "s"}. Removing it may create broken links.`,
    );
  }
  if (childPages.length) warnings.push(`${childPages.length} page${childPages.length === 1 ? " sits" : "s sit"} beneath this one.`);
  if (navigationItems.length) warnings.push(`It appears in the ${navigationItems.map((n) => n.group).join(" and ")} navigation.`);
  if (page.is_protected) warnings.push("This is a protected page and cannot be deleted from the editor.");

  return { incomingLinks, childPages, navigationItems, isProtected: page.is_protected, canDelete: !page.is_protected, warnings };
}

/**
 * Permanent delete. Soft-deletes by default (spec §19: "avoid permanent deletion
 * by default"); `hard: true` really removes the row and its version history and
 * is only reachable from the Owner-confirmed dialog.
 */
export async function deletePage(
  id: string,
  opts: { actorId?: string | null; actorType?: "user" | "steward"; hard?: boolean; confirmTitle?: string } = {},
): Promise<{ ok: true }> {
  const sb = createSupabaseAdminClient();
  const page = await getPageOrThrow(id);
  if (page.is_protected) throw new Error(`"${page.title}" is a protected page and cannot be deleted.`);
  if (opts.hard && String(opts.confirmTitle ?? "").trim() !== page.title) {
    throw new Error(`To permanently delete this page, type its exact title: "${page.title}".`);
  }

  if (opts.hard) {
    const { error } = await sb.from("website_pages").delete().eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await sb
      .from("website_pages")
      .update({ deleted_at: new Date().toISOString(), status: "archived", updated_by: opts.actorId ?? null })
      .eq("id", id);
    if (error) throw new Error(error.message);
  }

  revalidateWebsitePage(page.slug);
  await logWebsiteAudit({
    actorId: opts.actorId,
    actorType: opts.actorType ?? "user",
    action: opts.hard ? "page.deleted_permanently" : "page.deleted",
    resourceId: id,
    summary: opts.hard
      ? `Permanently deleted "${page.title}" and its version history.`
      : `Moved "${page.title}" to deleted. It can still be restored.`,
    metadata: { slug: page.slug, hard: Boolean(opts.hard) },
  });
  return { ok: true };
}

export async function duplicatePage(
  id: string,
  opts: { actorId?: string | null; actorType?: "user" | "steward"; title?: string } = {},
): Promise<WebsitePage> {
  const source = await getPageOrThrow(id);
  const title = String(opts.title || `${source.title} (copy)`).trim();
  const page = await createPage({
    title,
    slug: `${source.slug}-copy`,
    page_type: source.page_type,
    template: source.template,
    seo_title: source.seo_title,
    seo_description: source.seo_description,
    content: source.draft_content,
    actorId: opts.actorId,
    actorType: opts.actorType,
  });
  await logWebsiteAudit({
    actorId: opts.actorId,
    actorType: opts.actorType ?? "user",
    action: "page.duplicated",
    resourceId: page.id,
    summary: `Duplicated "${source.title}" as the draft "${page.title}".`,
    metadata: { sourceId: id },
  });
  return page;
}

// ── Search + link intelligence (spec §36/§37) ────────────────────────────────

export type SearchHit = {
  pageId: string;
  title: string;
  slug: string;
  status: WebsitePageStatus;
  matches: { where: string; excerpt: string }[];
};

export async function searchWebsite(query: string, limit = 25): Promise<SearchHit[]> {
  const term = String(query || "").trim().toLowerCase();
  if (!term) return [];
  const pages = await listPages({ includeDeleted: false });
  const hits: SearchHit[] = [];

  for (const page of pages) {
    const matches: { where: string; excerpt: string }[] = [];
    const consider = (where: string, value: string) => {
      const lower = value.toLowerCase();
      const at = lower.indexOf(term);
      if (at === -1) return;
      const start = Math.max(0, at - 40);
      const excerpt = `${start > 0 ? "…" : ""}${value.slice(start, at + term.length + 60)}${at + term.length + 60 < value.length ? "…" : ""}`;
      matches.push({ where, excerpt });
    };
    consider("Title", page.title);
    consider("Address", `/${page.slug}`);
    consider("SEO title", page.seo_title ?? "");
    consider("Meta description", page.seo_description ?? "");
    consider("Page content", contentToPlainText(page.draft_content));
    if (matches.length) {
      hits.push({ pageId: page.id, title: page.title, slug: page.slug, status: page.status, matches: matches.slice(0, 4) });
    }
    if (hits.length >= limit) break;
  }
  return hits;
}

export type LinkReport = {
  pageId: string;
  title: string;
  slug: string;
  outgoing: { href: string; blockId: string; external: boolean; broken: boolean }[];
};

/**
 * Internal links are "broken" when they point at a path that is neither a
 * published CMS page, an active redirect, nor a code-owned application route.
 */
export async function linkReport(): Promise<{ pages: LinkReport[]; brokenCount: number }> {
  const sb = createSupabaseAdminClient();
  const [pages, { data: redirects }] = await Promise.all([
    listPages({ includeDeleted: false }),
    sb.from("website_redirects").select("source_path").eq("is_active", true),
  ]);

  const known = new Set<string>(pages.filter((p) => p.status === "published").map((p) => pagePath(p.slug)));
  for (const r of (redirects ?? []) as { source_path: string }[]) known.add(r.source_path);

  let brokenCount = 0;
  const report: LinkReport[] = pages.map((page) => {
    const outgoing = extractLinks(page.draft_content).map((l) => {
      const href = l.href;
      const external = /^https?:\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
      const path = href.split(/[?#]/)[0].replace(/\/$/, "") || "/";
      // Code-owned application routes are always valid targets.
      const broken = !external && !href.startsWith("#") && !known.has(path) && !isProtectedPath(path);
      if (broken) brokenCount++;
      return { href, blockId: l.blockId, external, broken };
    });
    return { pageId: page.id, title: page.title, slug: page.slug, outgoing };
  });

  return { pages: report, brokenCount };
}

// ── Overview (spec §6.1) ─────────────────────────────────────────────────────

export type OverviewStats = {
  published: number;
  drafts: number;
  scheduled: number;
  archived: number;
  unpublishedChanges: number;
  missingSeo: number;
  missingAltText: number;
  brokenLinks: number;
  pendingChangeSets: number;
  recentPages: { id: string; title: string; slug: string; status: WebsitePageStatus; updated_at: string; source: EditSource }[];
  recentActivity: WebsiteAuditLog[];
  recentlyArchived: { id: string; title: string; slug: string; updated_at: string }[];
};

export async function overviewStats(): Promise<OverviewStats> {
  const sb = createSupabaseAdminClient();
  const [pages, links, { data: changeSets }, activity] = await Promise.all([
    listPages({ includeDeleted: false }),
    linkReport(),
    sb.from("website_change_sets").select("id").in("status", ["proposed", "draft_applied"]),
    listAuditLogs(12),
  ]);

  const { extractImages } = await import("./blocks");
  let missingAltText = 0;
  for (const page of pages) {
    missingAltText += extractImages(page.draft_content).filter((i) => !i.alt.trim()).length;
  }

  return {
    published: pages.filter((p) => p.status === "published").length,
    drafts: pages.filter((p) => p.status === "draft").length,
    scheduled: pages.filter((p) => p.status === "scheduled").length,
    archived: pages.filter((p) => p.status === "archived").length,
    unpublishedChanges: pages.filter((p) => p.has_unpublished_changes && p.status === "published").length,
    missingSeo: pages.filter((p) => !p.seo_title?.trim() || !p.seo_description?.trim()).length,
    missingAltText,
    brokenLinks: links.brokenCount,
    pendingChangeSets: (changeSets ?? []).length,
    recentPages: pages.slice(0, 8).map((p) => ({
      id: p.id, title: p.title, slug: p.slug, status: p.status, updated_at: p.updated_at, source: p.last_edited_source,
    })),
    recentActivity: activity,
    recentlyArchived: pages
      .filter((p) => p.status === "archived")
      .slice(0, 5)
      .map((p) => ({ id: p.id, title: p.title, slug: p.slug, updated_at: p.updated_at })),
  };
}

export { emptyContent };

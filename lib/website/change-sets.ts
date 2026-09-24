// Frontend Editor — change sets (spec §14) and the Steward apply pipeline.
//
// A change set is the unit of review. Steward never writes a page directly: it
// proposes a change set (before/after snapshot + summary + risk), the change set
// is applied to the DRAFT, Mike previews it, and only then is it published.
// That is what makes every AI edit explainable and reversible.
//
// SERVICE-ROLE ONLY — same guard contract as lib/website/data.ts.

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { diffContent } from "./diff";
import { validateContent } from "./registry";
import { getPageOrThrow, logWebsiteAudit, publishPage, saveDraft } from "./data";
import { getEditorSettings } from "./site";
import { riskForPage, type WebsiteAction } from "./protected";
import { asContent, type ChangeRisk, type WebsiteChangeSet, type WebsiteContent, type WebsitePage } from "./types";

export type ProposeInput = {
  pageId: string;
  /** The full proposed draft content. Validated before anything is stored. */
  content: unknown;
  /** Metadata the change also touches (SEO, title, navigation label…). */
  meta?: Record<string, unknown>;
  prompt?: string | null;
  action?: WebsiteAction;
  source?: "steward" | "manual";
  actorId?: string | null;
};

export type ProposeResult = {
  changeSet: WebsiteChangeSet;
  summary: string;
  risk: ChangeRisk;
  issues: { path: string; message: string }[];
  diff: ReturnType<typeof diffContent>;
};

/**
 * Record a proposal. Nothing on the page moves yet — this is the "here is what I
 * would do" step Steward shows before touching the draft.
 */
export async function proposeChangeSet(input: ProposeInput): Promise<ProposeResult> {
  const sb = createSupabaseAdminClient();
  const page = await getPageOrThrow(input.pageId);
  const { content, issues } = validateContent(input.content);

  const before = page.draft_content;
  const meta = input.meta ?? {};
  const diff = diffContent(before, content, { before: page as unknown as Record<string, unknown>, after: { ...(page as unknown as Record<string, unknown>), ...meta } });
  const risk = riskForPage(input.action ?? "page.updateContent", page);

  const { data, error } = await sb
    .from("website_change_sets")
    .insert({
      page_id: page.id,
      requested_by: input.actorId ?? null,
      source: input.source ?? "steward",
      risk,
      prompt: input.prompt ?? null,
      summary: diff.summary,
      before_state: { content: before, meta: snapshotMeta(page) },
      after_state: { content, meta: { ...snapshotMeta(page), ...meta } },
      status: "proposed",
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  await logWebsiteAudit({
    actorId: input.actorId,
    actorType: input.source === "manual" ? "user" : "steward",
    action: "changeset.proposed",
    resourceType: "change_set",
    resourceId: (data as { id: string }).id,
    summary: `Proposed a change to "${page.title}": ${diff.summary}`,
    metadata: { pageId: page.id, risk, prompt: input.prompt ?? null },
  });

  return { changeSet: hydrate(data as Record<string, unknown>), summary: diff.summary, risk, issues, diff };
}

function snapshotMeta(page: WebsitePage): Record<string, unknown> {
  return {
    title: page.title,
    slug: page.slug,
    seo_title: page.seo_title,
    seo_description: page.seo_description,
    og_title: page.og_title,
    og_description: page.og_description,
    og_image_url: page.og_image_url,
    no_index: page.no_index,
    navigation_visibility: page.navigation_visibility,
    navigation_label: page.navigation_label,
  };
}

function hydrate(row: Record<string, unknown>): WebsiteChangeSet {
  return row as unknown as WebsiteChangeSet;
}

export async function listChangeSets(opts: { pageId?: string; status?: string; limit?: number } = {}): Promise<WebsiteChangeSet[]> {
  const sb = createSupabaseAdminClient();
  let query = sb.from("website_change_sets").select("*").order("created_at", { ascending: false }).limit(opts.limit ?? 50);
  if (opts.pageId) query = query.eq("page_id", opts.pageId);
  if (opts.status) query = query.eq("status", opts.status);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => hydrate(r as Record<string, unknown>));
}

export async function getChangeSet(id: string): Promise<WebsiteChangeSet | null> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb.from("website_change_sets").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? hydrate(data as Record<string, unknown>) : null;
}

/**
 * Apply a proposed change set to the DRAFT. This is the default landing point
 * for every Steward edit — the live page is untouched until someone publishes.
 */
export async function applyChangeSetToDraft(
  id: string,
  opts: { actorId?: string | null; actorType?: "user" | "steward" } = {},
): Promise<{ changeSet: WebsiteChangeSet; page: WebsitePage }> {
  const sb = createSupabaseAdminClient();
  const changeSet = await getChangeSet(id);
  if (!changeSet) throw new Error("That change set no longer exists.");
  if (changeSet.status === "rejected") throw new Error("That change was rejected and cannot be applied.");
  if (!changeSet.page_id) throw new Error("That change set is not attached to a page.");

  const after = changeSet.after_state as { content?: unknown; meta?: Record<string, unknown> };
  const { page } = await saveDraft(changeSet.page_id, asContent(after.content), {
    actorId: opts.actorId,
    source: changeSet.source === "steward" ? "steward" : "manual",
    silent: true,
  });

  // Metadata the change set also carries (SEO, navigation label, title).
  const meta = after.meta ?? {};
  const metaPatch: Record<string, unknown> = {};
  for (const key of ["title", "seo_title", "seo_description", "og_title", "og_description", "og_image_url", "navigation_label"]) {
    if (meta[key] !== undefined && meta[key] !== (page as unknown as Record<string, unknown>)[key]) metaPatch[key] = meta[key];
  }
  if (Object.keys(metaPatch).length) {
    await sb.from("website_pages").update({ ...metaPatch, updated_at: new Date().toISOString() }).eq("id", page.id);
  }

  const { data, error } = await sb
    .from("website_change_sets")
    .update({ status: "draft_applied" })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  await logWebsiteAudit({
    actorId: opts.actorId,
    actorType: opts.actorType ?? "user",
    action: "changeset.applied",
    resourceType: "change_set",
    resourceId: id,
    summary: `Applied a change to the draft of "${page.title}": ${changeSet.summary}`,
    metadata: { pageId: page.id },
  });

  return { changeSet: hydrate(data as Record<string, unknown>), page: await getPageOrThrow(page.id) };
}

export async function rejectChangeSet(
  id: string,
  opts: { actorId?: string | null; reason?: string } = {},
): Promise<WebsiteChangeSet> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb
    .from("website_change_sets")
    .update({ status: "rejected", approved_by: opts.actorId ?? null, approved_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  await logWebsiteAudit({
    actorId: opts.actorId,
    action: "changeset.rejected",
    resourceType: "change_set",
    resourceId: id,
    summary: opts.reason ? `Rejected a proposed change: ${opts.reason}` : "Rejected a proposed change.",
  });
  return hydrate(data as Record<string, unknown>);
}

/**
 * Approve AND publish. Reached only from an explicit owner action, or from
 * Steward when direct publish is switched on and the page is neither protected
 * nor legal (spec §16).
 */
export async function approveAndPublishChangeSet(
  id: string,
  opts: { actorId?: string | null; actorType?: "user" | "steward" } = {},
): Promise<{ changeSet: WebsiteChangeSet; page: WebsitePage }> {
  const sb = createSupabaseAdminClient();
  const changeSet = await getChangeSet(id);
  if (!changeSet) throw new Error("That change set no longer exists.");
  if (!changeSet.page_id) throw new Error("That change set is not attached to a page.");

  if (changeSet.status !== "draft_applied") {
    await applyChangeSetToDraft(id, opts);
  }
  const { page } = await publishPage(changeSet.page_id, {
    actorId: opts.actorId,
    actorType: opts.actorType ?? "user",
    summary: changeSet.summary,
  });

  const now = new Date().toISOString();
  const { data, error } = await sb
    .from("website_change_sets")
    .update({ status: "published", approved_by: opts.actorId ?? null, approved_at: now, published_at: now })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  return { changeSet: hydrate(data as Record<string, unknown>), page };
}

/**
 * Whether Steward may publish this page on its own right now. Direct publish is
 * OFF by default and NEVER applies to protected or legal pages, nor to a
 * high-risk change — those always come back to Mike (spec §16).
 */
export async function stewardMayPublish(page: WebsitePage, risk: ChangeRisk): Promise<{ allowed: boolean; reason: string }> {
  const settings = await getEditorSettings();
  if (!settings.allowStewardDirectPublish) {
    return { allowed: false, reason: "Direct publishing is off, so this is waiting in the draft for you to review and publish." };
  }
  if (page.is_protected) {
    return { allowed: false, reason: `"${page.title}" is a protected page, so it always needs your approval before going live.` };
  }
  if (page.is_legal) {
    return { allowed: false, reason: `"${page.title}" is a legal page, so it always needs your approval before going live.` };
  }
  if (risk === "high") {
    return { allowed: false, reason: "This is a high-risk change, so it needs your explicit confirmation before going live." };
  }
  return { allowed: true, reason: "Direct publishing is on and this change is low risk." };
}

/** Change sets awaiting a decision, for the dashboard's pending-approvals list. */
export async function pendingChangeSets(limit = 20): Promise<(WebsiteChangeSet & { page_title: string | null })[]> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb
    .from("website_change_sets")
    .select("*")
    .in("status", ["proposed", "draft_applied"])
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);

  const rows = (data ?? []).map((r) => hydrate(r as Record<string, unknown>));
  const pageIds = Array.from(new Set(rows.map((r) => r.page_id).filter(Boolean))) as string[];
  const titles = new Map<string, string>();
  if (pageIds.length) {
    const { data: pages } = await sb.from("website_pages").select("id, title").in("id", pageIds);
    for (const p of (pages ?? []) as { id: string; title: string }[]) titles.set(p.id, p.title);
  }
  return rows.map((r) => ({ ...r, page_title: r.page_id ? titles.get(r.page_id) ?? null : null }));
}

/** Rebuild the diff view for a stored change set. */
export function changeSetDiff(changeSet: WebsiteChangeSet) {
  const before = changeSet.before_state as { content?: unknown; meta?: Record<string, unknown> };
  const after = changeSet.after_state as { content?: unknown; meta?: Record<string, unknown> };
  return diffContent(asContent(before.content), asContent(after.content), { before: before.meta, after: after.meta });
}

export type { WebsiteContent };

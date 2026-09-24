// Frontend Editor — site-level content: navigation, global content, redirects
// and editor settings (spec §21, §22, §24, §16).
//
// SERVICE-ROLE ONLY — same guard contract as lib/website/data.ts.

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSafeUrl } from "./schema";
import { isProtectedPath } from "./protected";
import { logWebsiteAudit } from "./data";
import {
  DEFAULT_EDITOR_SETTINGS,
  type EditorSettings,
  type NavigationGroup,
  type WebsiteGlobal,
  type WebsiteNavItem,
  type WebsiteRedirect,
} from "./types";

const NAV_GROUPS = new Set<NavigationGroup>(["main", "footer", "utility"]);

// ── Navigation ───────────────────────────────────────────────────────────────

export async function listNavigation(group?: NavigationGroup): Promise<WebsiteNavItem[]> {
  const sb = createSupabaseAdminClient();
  let query = sb.from("website_navigation_items").select("*").order("sort_order", { ascending: true });
  if (group) query = query.eq("navigation_group", group);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as WebsiteNavItem[];
}

/** Navigation as a two-level tree, the shape both the manager and the site use. */
export async function navigationTree(group: NavigationGroup): Promise<(WebsiteNavItem & { children: WebsiteNavItem[] })[]> {
  const items = await listNavigation(group);
  const roots = items.filter((i) => !i.parent_id);
  return roots.map((r) => ({ ...r, children: items.filter((i) => i.parent_id === r.id) }));
}

export type NavInput = {
  navigation_group?: string;
  label?: string;
  url?: string;
  page_id?: string | null;
  parent_id?: string | null;
  sort_order?: number;
  is_visible?: boolean;
  open_in_new_tab?: boolean;
  actorId?: string | null;
  actorType?: "user" | "steward";
};

function validateNavUrl(url: string): string {
  const clean = String(url ?? "").trim();
  if (clean && !isSafeUrl(clean)) {
    throw new Error("A navigation link must be a page address (/example) or an http(s), mailto or tel link.");
  }
  return clean;
}

export async function createNavItem(input: NavInput): Promise<WebsiteNavItem> {
  const sb = createSupabaseAdminClient();
  const label = String(input.label ?? "").trim();
  if (!label) throw new Error("A navigation item needs a label.");
  const group = NAV_GROUPS.has(input.navigation_group as NavigationGroup) ? input.navigation_group : "main";

  const { data, error } = await sb
    .from("website_navigation_items")
    .insert({
      navigation_group: group,
      label,
      url: validateNavUrl(input.url ?? ""),
      page_id: input.page_id || null,
      parent_id: input.parent_id || null,
      sort_order: Number(input.sort_order) || 0,
      is_visible: input.is_visible ?? true,
      open_in_new_tab: Boolean(input.open_in_new_tab),
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  await logWebsiteAudit({
    actorId: input.actorId,
    actorType: input.actorType ?? "user",
    action: "navigation.item_added",
    resourceType: "navigation",
    resourceId: (data as { id: string }).id,
    summary: `Added "${label}" to the ${group} navigation.`,
  });
  revalidatePath("/", "layout");
  return data as unknown as WebsiteNavItem;
}

export async function updateNavItem(id: string, input: NavInput): Promise<WebsiteNavItem> {
  const sb = createSupabaseAdminClient();
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.label !== undefined) row.label = String(input.label).trim();
  if (input.url !== undefined) row.url = validateNavUrl(input.url);
  if (input.page_id !== undefined) row.page_id = input.page_id || null;
  if (input.parent_id !== undefined) row.parent_id = input.parent_id || null;
  if (input.sort_order !== undefined) row.sort_order = Number(input.sort_order) || 0;
  if (input.is_visible !== undefined) row.is_visible = Boolean(input.is_visible);
  if (input.open_in_new_tab !== undefined) row.open_in_new_tab = Boolean(input.open_in_new_tab);
  if (input.navigation_group && NAV_GROUPS.has(input.navigation_group as NavigationGroup)) {
    row.navigation_group = input.navigation_group;
  }
  if (id === row.parent_id) throw new Error("A navigation item cannot sit beneath itself.");

  const { data, error } = await sb.from("website_navigation_items").update(row).eq("id", id).select("*").single();
  if (error) throw new Error(error.message);

  await logWebsiteAudit({
    actorId: input.actorId,
    actorType: input.actorType ?? "user",
    action: "navigation.item_updated",
    resourceType: "navigation",
    resourceId: id,
    summary: `Updated the navigation item "${(data as { label: string }).label}".`,
  });
  revalidatePath("/", "layout");
  return data as unknown as WebsiteNavItem;
}

export async function deleteNavItem(id: string, opts: { actorId?: string | null; actorType?: "user" | "steward" } = {}): Promise<void> {
  const sb = createSupabaseAdminClient();
  const { data: existing } = await sb.from("website_navigation_items").select("label, navigation_group").eq("id", id).maybeSingle();
  const { error } = await sb.from("website_navigation_items").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await logWebsiteAudit({
    actorId: opts.actorId,
    actorType: opts.actorType ?? "user",
    action: "navigation.item_removed",
    resourceType: "navigation",
    resourceId: id,
    summary: `Removed "${(existing as { label?: string } | null)?.label ?? "an item"}" from the ${(existing as { navigation_group?: string } | null)?.navigation_group ?? "site"} navigation.`,
  });
  revalidatePath("/", "layout");
}

/** Persist a whole group's order after a drag-and-drop reorder. */
export async function reorderNavigation(
  group: NavigationGroup,
  ordered: { id: string; parent_id: string | null; sort_order: number }[],
  opts: { actorId?: string | null } = {},
): Promise<void> {
  const sb = createSupabaseAdminClient();
  for (const item of ordered) {
    await sb
      .from("website_navigation_items")
      .update({ parent_id: item.parent_id || null, sort_order: item.sort_order, updated_at: new Date().toISOString() })
      .eq("id", item.id)
      .eq("navigation_group", group);
  }
  await logWebsiteAudit({
    actorId: opts.actorId,
    action: "navigation.reordered",
    resourceType: "navigation",
    summary: `Reordered the ${group} navigation.`,
  });
  revalidatePath("/", "layout");
}

// ── Global content ───────────────────────────────────────────────────────────

export async function listGlobals(): Promise<WebsiteGlobal[]> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb.from("website_globals").select("*").order("key", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as WebsiteGlobal[];
}

export async function getGlobal(key: string): Promise<WebsiteGlobal | null> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb.from("website_globals").select("*").eq("key", key).maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as unknown as WebsiteGlobal | null;
}

/**
 * Global content is a high-risk surface (spec §32) — it shows on every page —
 * so values are validated the same way block props are: strings only, links
 * checked, unknown keys dropped against the existing shape.
 */
export async function updateGlobal(
  key: string,
  value: Record<string, unknown>,
  opts: { actorId?: string | null; actorType?: "user" | "steward" } = {},
): Promise<WebsiteGlobal> {
  const sb = createSupabaseAdminClient();
  const existing = await getGlobal(key);
  if (!existing) throw new Error(`"${key}" is not a known global content item.`);

  const clean: Record<string, unknown> = {};
  for (const [k, current] of Object.entries(existing.value ?? {})) {
    const incoming = value[k];
    if (incoming === undefined) {
      clean[k] = current;
      continue;
    }
    if (typeof current === "boolean") {
      clean[k] = incoming === true || incoming === "true";
      continue;
    }
    const text = String(incoming ?? "").slice(0, 2000);
    if (/href|url|link/i.test(k) && text && !isSafeUrl(text)) {
      throw new Error(`"${k}" must be a page address (/example) or an http(s), mailto or tel link.`);
    }
    clean[k] = text;
  }

  const { data, error } = await sb
    .from("website_globals")
    .update({ value: clean, updated_by: opts.actorId ?? null, updated_at: new Date().toISOString() })
    .eq("key", key)
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  await logWebsiteAudit({
    actorId: opts.actorId,
    actorType: opts.actorType ?? "user",
    action: "global.updated",
    resourceType: "global",
    resourceId: (data as { id: string }).id,
    summary: `Updated the global content item "${existing.label}".`,
    metadata: { key },
  });
  revalidatePath("/", "layout");
  return data as unknown as WebsiteGlobal;
}

// ── Editor settings (spec §16) ───────────────────────────────────────────────

export async function getEditorSettings(): Promise<EditorSettings> {
  const row = await getGlobal("editor.settings");
  return { ...DEFAULT_EDITOR_SETTINGS, ...((row?.value ?? {}) as Partial<EditorSettings>) };
}

export async function setEditorSettings(
  patch: Partial<EditorSettings>,
  opts: { actorId?: string | null } = {},
): Promise<EditorSettings> {
  const current = await getEditorSettings();
  const next: EditorSettings = { ...current, ...patch };
  await updateGlobal("editor.settings", next as unknown as Record<string, unknown>, opts);
  await logWebsiteAudit({
    actorId: opts.actorId,
    action: "settings.updated",
    resourceType: "settings",
    summary: next.allowStewardDirectPublish
      ? "Turned ON direct publishing for Steward. Protected and legal pages still require your approval."
      : "Turned OFF direct publishing for Steward. Every change now waits for your approval.",
  });
  return next;
}

// ── Redirects (spec §24) ─────────────────────────────────────────────────────

export async function listRedirects(): Promise<WebsiteRedirect[]> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb.from("website_redirects").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as WebsiteRedirect[];
}

export async function createRedirect(input: {
  source_path: string;
  destination_path: string;
  status_code?: number;
  actorId?: string | null;
  actorType?: "user" | "steward";
}): Promise<WebsiteRedirect> {
  const sb = createSupabaseAdminClient();
  const source = normalizeRedirectPath(input.source_path);
  const destination = String(input.destination_path ?? "").trim();
  if (!source.startsWith("/")) throw new Error("The old address must start with /.");
  if (isProtectedPath(source)) throw new Error(`${source} is a protected application route and cannot be redirected.`);
  if (!isSafeUrl(destination)) throw new Error("The new address must be a page address (/example) or an http(s) link.");
  if (source === destination) throw new Error("A redirect cannot point at itself.");

  const { data, error } = await sb
    .from("website_redirects")
    .upsert(
      {
        source_path: source,
        destination_path: destination,
        status_code: input.status_code === 302 ? 302 : 301,
        is_active: true,
        created_by: input.actorId ?? null,
      },
      { onConflict: "source_path" },
    )
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  await logWebsiteAudit({
    actorId: input.actorId,
    actorType: input.actorType ?? "user",
    action: "redirect.created",
    resourceType: "redirect",
    resourceId: (data as { id: string }).id,
    summary: `Redirected ${source} to ${destination}.`,
  });
  revalidatePath(source);
  return data as unknown as WebsiteRedirect;
}

export async function setRedirectActive(id: string, isActive: boolean, opts: { actorId?: string | null } = {}): Promise<void> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb.from("website_redirects").update({ is_active: isActive }).eq("id", id).select("source_path").single();
  if (error) throw new Error(error.message);
  await logWebsiteAudit({
    actorId: opts.actorId,
    action: isActive ? "redirect.enabled" : "redirect.disabled",
    resourceType: "redirect",
    resourceId: id,
    summary: `${isActive ? "Enabled" : "Disabled"} the redirect from ${(data as { source_path: string }).source_path}.`,
  });
  revalidatePath((data as { source_path: string }).source_path);
}

export async function deleteRedirect(id: string, opts: { actorId?: string | null } = {}): Promise<void> {
  const sb = createSupabaseAdminClient();
  const { data } = await sb.from("website_redirects").select("source_path").eq("id", id).maybeSingle();
  const { error } = await sb.from("website_redirects").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await logWebsiteAudit({
    actorId: opts.actorId,
    action: "redirect.deleted",
    resourceType: "redirect",
    resourceId: id,
    summary: `Removed the redirect from ${(data as { source_path?: string } | null)?.source_path ?? "a page"}.`,
  });
}

function normalizeRedirectPath(path: string): string {
  const clean = String(path ?? "").trim();
  const withSlash = clean.startsWith("/") ? clean : `/${clean}`;
  return withSlash.replace(/\/+$/, "") || "/";
}

/** Public lookup used by the catch-all route before it 404s. */
export async function findRedirect(path: string): Promise<WebsiteRedirect | null> {
  const sb = createSupabaseAdminClient();
  const { data } = await sb
    .from("website_redirects")
    .select("*")
    .eq("source_path", normalizeRedirectPath(path))
    .eq("is_active", true)
    .maybeSingle();
  return (data ?? null) as unknown as WebsiteRedirect | null;
}

"use client";

// Frontend Editor — one typed client for /api/admin/website.
//
// Every dashboard component talks through this so the action token, the error
// shape and the JSON contract live in a single place.

import type {
  EditorSettings, WebsiteAuditLog, WebsiteChangeSet, WebsiteContent, WebsiteGlobal, WebsiteNavItem,
  WebsitePage, WebsitePageSummary, WebsitePageVersion, WebsiteRedirect,
} from "@/lib/website/types";
import type { PageDependencies, OverviewStats, SearchHit } from "@/lib/website/data";
import type { MediaItem, MediaUsage } from "@/lib/website/media";
import type { PageDiff } from "@/lib/website/diff";

const BASE = "/api/admin/website";

type CallInit = Omit<RequestInit, "body"> & { token: string; body?: unknown };

async function call<T>(path: string, init: CallInit): Promise<T> {
  const { token, body, ...rest } = init;
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: { "Content-Type": "application/json", "x-mjg-action-token": token, ...(rest.headers ?? {}) },
    body: body === undefined ? undefined : JSON.stringify({ ...(body as object), actionToken: token }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { error?: string }).error || "Something went wrong. Please try again.");
  return json as T;
}

const get = <T,>(path: string, token: string) => call<T>(path, { token, method: "GET" });
const post = <T,>(path: string, token: string, body: unknown) => call<T>(path, { token, method: "POST", body });
const patch = <T,>(path: string, token: string, body: unknown) => call<T>(path, { token, method: "PATCH", body });
const put = <T,>(path: string, token: string, body: unknown) => call<T>(path, { token, method: "PUT", body });
const del = <T,>(path: string, token: string, body: unknown) => call<T>(path, { token, method: "DELETE", body });

export type PageContext = {
  page: WebsitePage;
  versions: WebsitePageVersion[];
  dependencies: PageDependencies;
  changeSets: WebsiteChangeSet[];
};

export const websiteApi = {
  // Pages
  listPages: (token: string, params: Record<string, string> = {}) =>
    get<{ pages: WebsitePageSummary[] }>(`/pages?${new URLSearchParams(params)}`, token),
  createPage: (token: string, body: Record<string, unknown>) => post<{ page: WebsitePage }>("/pages", token, body),
  getPage: (token: string, id: string) => get<PageContext>(`/pages/${id}`, token),
  updatePage: (token: string, id: string, body: Record<string, unknown>) =>
    patch<{ page: WebsitePage }>(`/pages/${id}`, token, body),
  deletePage: (token: string, id: string, body: { hard?: boolean; confirmTitle?: string } = {}) =>
    del<{ ok: true }>(`/pages/${id}`, token, body),

  // Draft + blocks
  saveDraft: (token: string, id: string, content: WebsiteContent, silent = true) =>
    put<{ page: WebsitePage; issues: { path: string; message: string }[] }>(`/pages/${id}/draft`, token, { content, silent }),
  blockOp: (token: string, id: string, body: Record<string, unknown>) =>
    post<{ page: WebsitePage; issues: { path: string; message: string }[]; blockId?: string }>(`/pages/${id}/draft`, token, body),

  // Lifecycle
  pageAction: <T = Record<string, unknown>,>(token: string, id: string, body: Record<string, unknown>) =>
    post<T>(`/pages/${id}/actions`, token, body),

  // Navigation
  navigation: (token: string, group?: string) =>
    get<{ items: WebsiteNavItem[]; pages: { id: string; title: string; slug: string; status: string }[] }>(
      `/navigation${group ? `?group=${group}` : ""}`, token),
  createNavItem: (token: string, body: Record<string, unknown>) => post<{ item: WebsiteNavItem }>("/navigation", token, body),
  updateNavItem: (token: string, body: Record<string, unknown>) => patch<{ item: WebsiteNavItem }>("/navigation", token, body),
  deleteNavItem: (token: string, id: string) => del<{ ok: true }>("/navigation", token, { id }),
  reorderNavigation: (token: string, group: string, items: { id: string; parent_id: string | null; sort_order: number }[]) =>
    post<{ items: WebsiteNavItem[] }>("/navigation", token, { op: "reorder", group, items }),

  // Globals + settings
  globals: (token: string) => get<{ globals: WebsiteGlobal[] }>("/globals", token),
  updateGlobal: (token: string, key: string, value: Record<string, unknown>) =>
    patch<{ global: WebsiteGlobal }>("/globals", token, { key, value }),
  settings: (token: string) => get<{ settings: EditorSettings }>("/settings", token),
  updateSettings: (token: string, body: Partial<EditorSettings>) => patch<{ settings: EditorSettings }>("/settings", token, body),

  // Redirects
  redirects: (token: string) => get<{ redirects: WebsiteRedirect[] }>("/redirects", token),
  createRedirect: (token: string, body: Record<string, unknown>) => post<{ redirect: WebsiteRedirect }>("/redirects", token, body),
  setRedirectActive: (token: string, id: string, isActive: boolean) =>
    patch<{ redirects: WebsiteRedirect[] }>("/redirects", token, { id, is_active: isActive }),
  deleteRedirect: (token: string, id: string) => del<{ ok: true }>("/redirects", token, { id }),

  // Media
  media: (token: string, params: Record<string, string> = {}) =>
    get<{ media: MediaItem[] }>(`/media?${new URLSearchParams(params)}`, token),
  mediaUsage: (token: string, url: string) => get<{ usage: MediaUsage[] }>(`/media?usageFor=${encodeURIComponent(url)}`, token),
  updateMediaAlt: (token: string, id: string, altText: string) => patch<{ item: MediaItem }>("/media", token, { id, altText }),

  // Change sets
  changeSets: (token: string, params: Record<string, string> = {}) =>
    get<{ changeSets: (WebsiteChangeSet & { page_title?: string | null })[] }>(`/change-sets?${new URLSearchParams(params)}`, token),
  changeSet: (token: string, id: string) => get<{ changeSet: WebsiteChangeSet; diff: PageDiff }>(`/change-sets?id=${id}`, token),
  changeSetAction: (token: string, id: string, action: string, reason?: string) =>
    post<{ changeSet: WebsiteChangeSet; page?: WebsitePage }>("/change-sets", token, { id, action, reason }),

  // Overview / search / links / audit
  overview: (token: string) =>
    get<{ stats: OverviewStats; pending: (WebsiteChangeSet & { page_title: string | null })[] }>("/overview", token),
  search: (token: string, q: string) => get<{ hits: SearchHit[] }>(`/overview?view=search&q=${encodeURIComponent(q)}`, token),
  links: (token: string) =>
    get<{ links: { pages: { pageId: string; title: string; slug: string; outgoing: { href: string; blockId: string; external: boolean; broken: boolean }[] }[]; brokenCount: number } }>(
      "/overview?view=links", token),
  audit: (token: string, resourceId?: string) =>
    get<{ logs: WebsiteAuditLog[] }>(`/overview?view=audit${resourceId ? `&resourceId=${resourceId}` : ""}`, token),
};

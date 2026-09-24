// Frontend Editor — the public read path (spec §27, §44, §59).
//
// The only module the public site imports. It reads PUBLISHED snapshots through
// the service-role client (RLS is super-admin-only, and drafts are never
// selected here).
//
// CACHING: the read itself is deliberately NOT wrapped in unstable_cache. A
// cached published page has to be dropped the instant it is unpublished,
// archived or deleted, and a data-cache entry that outlives that invalidation
// leaves withdrawn content on the live site — the one failure mode this module
// must not have. Caching lives at the route level instead, where publishPage()'s
// revalidatePath() reliably clears it; the read is a single indexed lookup.

import type { Metadata } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { publicSiteUrl } from "@/lib/public-site/static-pages";
import { isProtectedPath } from "./protected";
import { asContent, pagePath, type WebsiteContent, type NavigationGroup } from "./types";

export type PublishedPage = {
  id: string;
  title: string;
  slug: string;
  content: WebsiteContent;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[];
  canonical_url: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  no_index: boolean;
  no_follow: boolean;
  published_at: string | null;
};

const PUBLIC_COLUMNS =
  "id, title, slug, published_content, seo_title, seo_description, seo_keywords, canonical_url, og_title, og_description, og_image_url, no_index, no_follow, published_at";

async function readPublishedPage(slug: string): Promise<PublishedPage | null> {
  const sb = createSupabaseAdminClient();
  const { data } = await sb
    .from("website_pages")
    .select(PUBLIC_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .is("deleted_at", null)
    .maybeSingle();
  if (!data) return null;
  const row = data as Record<string, unknown>;
  if (!row.published_content) return null;
  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    content: asContent(row.published_content),
    seo_title: (row.seo_title as string) ?? null,
    seo_description: (row.seo_description as string) ?? null,
    seo_keywords: Array.isArray(row.seo_keywords) ? (row.seo_keywords as string[]) : [],
    canonical_url: (row.canonical_url as string) ?? null,
    og_title: (row.og_title as string) ?? null,
    og_description: (row.og_description as string) ?? null,
    og_image_url: (row.og_image_url as string) ?? null,
    no_index: Boolean(row.no_index),
    no_follow: Boolean(row.no_follow),
    published_at: (row.published_at as string) ?? null,
  };
}

/**
 * Published page by slug. Protected paths short-circuit, so the CMS can never
 * shadow an application route even if a row somehow existed.
 */
export async function getPublishedPageBySlug(slug: string): Promise<PublishedPage | null> {
  const clean = String(slug ?? "").replace(/^\/+|\/+$/g, "").toLowerCase();
  if (!clean || isProtectedPath(clean)) return null;
  return readPublishedPage(clean);
}

/** Global content for the renderer, as a flat key → value map. */
export async function getPublicGlobals(): Promise<Record<string, Record<string, unknown>>> {
  const sb = createSupabaseAdminClient();
  const { data } = await sb.from("website_globals").select("key, value");
  const out: Record<string, Record<string, unknown>> = {};
  for (const row of (data ?? []) as { key: string; value: Record<string, unknown> }[]) {
    out[row.key] = row.value ?? {};
  }
  return out;
}

export async function getPublicNavigation(group: NavigationGroup) {
  const sb = createSupabaseAdminClient();
  const { data } = await sb
    .from("website_navigation_items")
    .select("id, label, url, parent_id, sort_order, open_in_new_tab, page_id")
    .eq("navigation_group", group)
    .eq("is_visible", true)
    .order("sort_order", { ascending: true });
  return (data ?? []) as { id: string; label: string; url: string; parent_id: string | null; sort_order: number; open_in_new_tab: boolean; page_id: string | null }[];
}

/** Next.js metadata for a published page, falling back to the site defaults. */
export function buildPageMetadata(page: PublishedPage, defaults: Record<string, unknown> = {}): Metadata {
  const suffix = String(defaults.titleSuffix ?? "");
  const title = page.seo_title?.trim() || `${page.title}${suffix}`;
  const description = page.seo_description?.trim() || String(defaults.description ?? "") || undefined;
  const ogImage = page.og_image_url?.trim() || String(defaults.ogImage ?? "") || undefined;
  const url = `${publicSiteUrl()}${pagePath(page.slug)}`;

  return {
    title,
    description,
    keywords: page.seo_keywords.length ? page.seo_keywords : undefined,
    alternates: { canonical: page.canonical_url?.trim() || url },
    robots: {
      index: !page.no_index,
      follow: !page.no_follow,
      googleBot: { index: !page.no_index, follow: !page.no_follow },
    },
    openGraph: {
      type: "article",
      url,
      title: page.og_title?.trim() || title,
      description: page.og_description?.trim() || description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: page.og_title?.trim() || title,
      description: page.og_description?.trim() || description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

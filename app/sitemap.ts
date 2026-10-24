import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/content/blog";
import { liveMarketingRoutes } from "@/lib/marketing/routes";
import { publicSiteUrl } from "@/lib/public-site/static-pages";

// Live marketing pages (lib/marketing/routes.ts) plus published articles.
// Preview pages are left out until they are marked live.

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = publicSiteUrl();
  const pages: MetadataRoute.Sitemap = liveMarketingRoutes().map((route) => ({
    url: `${site}${route.path === "/" ? "" : route.path}`,
    changeFrequency: "weekly",
    priority: route.priority,
  }));

  const posts = await getPublishedPosts().catch(() => []);
  const articles: MetadataRoute.Sitemap = posts
    .filter((post: { slug?: string | null }) => post.slug)
    .map((post: { slug?: string | null; updated_at?: string | null; published_at?: string | null }) => ({
      url: `${site}/resources/${post.slug}`,
      lastModified: post.updated_at || post.published_at || undefined,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  return [...pages, ...articles];
}

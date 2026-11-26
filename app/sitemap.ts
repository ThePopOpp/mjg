import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/content/blog";
import { liveMarketingRoutes } from "@/lib/marketing/routes";
import { publicSiteUrl } from "@/lib/public-site/static-pages";
import { leadershipFlagOn } from "@/lib/leadership-check-in/switches";
import { FLAGS } from "@/lib/flags";
import { retreatIsPublic } from "@/lib/annual-retreat/server";

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

  // Released by its switch, not the route list (migration 202611250149).
  if (await leadershipFlagOn(FLAGS.LEADERSHIP_PUBLIC).catch(() => false)) {
    pages.push({ url: `${site}/leadership-check-in`, changeFrequency: "weekly", priority: 0.8 });
  }
  // The Annual Retreat landing page, once released (migration 202611260152). Never the thank-you page.
  if (await retreatIsPublic().catch(() => false)) {
    pages.push({ url: `${site}/annual-retreat`, changeFrequency: "monthly", priority: 0.7 });
  }

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

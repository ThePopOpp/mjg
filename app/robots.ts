import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { publicSiteUrl } from "@/lib/public-site/static-pages";

// Host-aware: the Steward app host is never indexed; the main site hides the
// dashboard, the API, preview copies and the Steward chat app.

const STEWARD_HOST = process.env.STEWARD_HOST?.trim() || "steward.michaeljgauthier.com";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = ((await headers()).get("host") || "").split(":")[0].toLowerCase();
  if (host === STEWARD_HOST.toLowerCase()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  const site = publicSiteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/api",
          "/site-preview",
          "/steward-preview",
          "/steward-homepage-autoplay",
          "/steward-homepage-scroll",
          "/website-preview",
          // Not "/steward": robots rules are prefixes and that would also hide /stewardship-blueprint.
          "/steward$",
          "/steward/",
        ],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
  };
}

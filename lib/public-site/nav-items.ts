// The public site navigation for the renderers that predate the marketing
// rebuild: renderSiteHeader() in static-pages.ts (the server-rendered HTML pages
// — /post, /listen, /resources/<slug>, legal and consent pages) and <SiteNav />
// in components/public-site/site-nav.tsx.
//
// It is DERIVED from the marketing navigation (lib/marketing/content/scopes/
// global.ts → global:nav), so every page shows the same menu. Those renderers
// support one level of dropdown, so each "Discover" column becomes its own
// dropdown. They read the code defaults (they render synchronously); edits made
// through the content layer reach the React pages immediately and these on the
// next deploy.

import { globalNav } from "@/lib/marketing/content/scopes/global";

export type NavChild = { label: string; href: string };
export type NavItem = { label: string; href?: string; children?: NavChild[] };

/** Login and registration live on the app origin; everything else on the site. */
function absolute(href: string, siteUrl: string, appUrl: string) {
  if (!href.startsWith("/")) return href;
  return /^\/(login|register)(\/|$|\?)/.test(href) ? `${appUrl}${href}` : `${siteUrl}${href}`;
}

/**
 * @param siteUrl the marketing site origin (NEXT_PUBLIC_SITE_URL)
 * @param appUrl  this app's origin — login and register live here. Pass "" from
 *                inside the app so those become relative paths.
 */
export function publicNavItems(siteUrl: string, appUrl: string): NavItem[] {
  const nav = globalNav.sections.nav.defaults;
  const link = (l: { label: string; href: string }) => ({ label: l.label, href: absolute(l.href, siteUrl, appUrl) });
  return [
    ...nav.columns.map((c) => ({ ...link(c), children: c.links.map(link) })),
    ...nav.links.map(link),
    { label: nav.accountLabel, children: nav.accountLinks.map(link) },
  ];
}

/** "Join the Journey" — mobile menu only. */
export function joinJourneyHref(siteUrl: string) {
  return `${siteUrl}/join`;
}

export const ACCOUNT_LABEL = globalNav.sections.nav.defaults.accountLabel;

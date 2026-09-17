// Single source of truth for the public site navigation.
//
// Two renderers consume this: renderSiteHeader() in static-pages.ts (for the server-rendered
// HTML pages and the main/*.html marketing pages) and <SiteNav /> in
// components/public-site/site-nav.tsx (for the React app pages such as /book-waitlist).
// Change the nav here and both follow.

export type NavChild = { label: string; href: string };
export type NavItem = { label: string; href?: string; children?: NavChild[] };

/**
 * @param siteUrl the marketing site origin (NEXT_PUBLIC_SITE_URL)
 * @param appUrl  this app's origin — login, register and the book waitlist live here.
 *                Pass "" from inside the app so those become relative paths ("/login") and
 *                Next can soft-navigate to them.
 */
export function publicNavItems(siteUrl: string, appUrl: string): NavItem[] {
  return [
    { label: "Home", href: `${siteUrl}/` },
    { label: "About", href: `${siteUrl}/about` },
    { label: "Mission", href: `${siteUrl}/mission` },
    {
      // Resources stays a real link to its own page AND carries a dropdown.
      label: "Resources",
      href: `${siteUrl}/resources`,
      children: [
        { label: "Videos", href: `${siteUrl}/6-week-challenge/videos` },
        { label: "Book Waitlist", href: `${appUrl}/book-waitlist` },
      ],
    },
    { label: "Contact", href: `${siteUrl}/contact` },
    {
      label: "Account",
      children: [
        { label: "Sign in", href: `${appUrl}/login` },
        { label: "Register", href: `${appUrl}/register` },
      ],
    },
  ];
}

/** The "Join the Journey" CTA — mobile menu only; it was removed from the desktop bar. */
export function joinJourneyHref(siteUrl: string) {
  return `${siteUrl}/#join`;
}

export const ACCOUNT_LABEL = "Account";
export const RESOURCES_LABEL = "Resources";

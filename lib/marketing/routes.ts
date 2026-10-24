// The marketing site's pages: where each one lives and whether it is public yet.
//
// One list feeds the sitemap and the preview index, so a page appears in search
// results only once it is marked live here. A 'preview' page is built and
// reviewable at /site-preview/<slug> but still served by its old version (or not
// at all) at its real address.

export type MarketingRoute = {
  path: string;
  title: string;
  /** Content scope that holds the page's copy. */
  scope: string;
  status: "live" | "preview";
  priority: number;
};

export const MARKETING_ROUTES: MarketingRoute[] = [
  { path: "/", title: "Home", scope: "page:home", status: "live", priority: 1 },
  { path: "/the-life-youre-building", title: "The Life You’re Building", scope: "page:the-life-youre-building", status: "live", priority: 0.8 },
  { path: "/stewardship-blueprint", title: "The Stewardship Blueprint", scope: "page:stewardship-blueprint", status: "live", priority: 0.9 },
  { path: "/personal-blueprint", title: "Your Personal Blueprint", scope: "page:personal-blueprint", status: "live", priority: 0.8 },
  { path: "/assessments", title: "Assessments & Check-Ins", scope: "page:assessments", status: "live", priority: 0.8 },
  { path: "/created-for-more-check-in", title: "Created for More Check-In", scope: "page:created-for-more-check-in", status: "live", priority: 0.9 },
  { path: "/start", title: "Start Here", scope: "page:start", status: "live", priority: 0.8 },
  { path: "/learn-and-grow", title: "Learn & Grow", scope: "page:learn-and-grow", status: "live", priority: 0.7 },
  { path: "/studies", title: "Studies & Experiences", scope: "page:studies", status: "live", priority: 0.7 },
  { path: "/join", title: "Join the Journey", scope: "page:join", status: "live", priority: 0.8 },
  { path: "/churches", title: "For Churches", scope: "page:churches", status: "live", priority: 0.7 },
  { path: "/lead-a-group", title: "Lead a Group", scope: "page:lead-a-group", status: "live", priority: 0.7 },
  { path: "/meet-steward", title: "Meet Steward", scope: "page:meet-steward", status: "live", priority: 0.8 },
  { path: "/about", title: "About Michael", scope: "page:about", status: "live", priority: 0.7 },
  { path: "/mission", title: "Mission & Vision", scope: "page:mission", status: "live", priority: 0.6 },
  { path: "/contact", title: "Contact", scope: "page:contact", status: "live", priority: 0.6 },
  { path: "/resources", title: "Insights & Resources", scope: "page:resources", status: "live", priority: 0.7 },
];

export const PREVIEW_PREFIX = "/site-preview";

export function liveMarketingRoutes(): MarketingRoute[] {
  return MARKETING_ROUTES.filter((r) => r.status === "live");
}

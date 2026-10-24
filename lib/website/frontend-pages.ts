// Frontend Editor — the catalogue of public pages Mike can point at.
//
// The website has two kinds of page and the difference decides what can happen
// when he describes an edit:
//
//   "managed"    — a website_pages row. Shepherd reads it, proposes a change set,
//                  the change lands in a draft, he previews it and publishes.
//
//   "code"       — a page built in the repository (a static file under main/, or
//                  a React route). It has no block model, so no amount of
//                  prompting can rewrite it from the dashboard. A description of
//                  the change goes to the developer queue instead.
//
// Keeping the code-owned list here rather than inferring it means the picker
// shows Mike the whole site, not just the part the editor happens to own.

export type FrontendPageKind = "managed" | "code";

export type CodeOwnedPage = {
  slug: string;
  label: string;
  path: string;
  /** Where the page actually lives, shown to Mike and sent to the developer. */
  source: string;
  group: string;
};

/**
 * Public, code-owned pages worth listing. Application routes (login, dashboard,
 * checkout and the rest) are deliberately absent — they are not content.
 */
export const CODE_OWNED_PAGES: CodeOwnedPage[] = [
  { slug: "home", label: "Home", path: "/", source: "components/marketing/pages/home.tsx", group: "Marketing site" },
  { slug: "about", label: "About", path: "/about", source: "components/marketing/pages/about.tsx", group: "Marketing site" },
  { slug: "mission", label: "Mission", path: "/mission", source: "components/marketing/pages/mission.tsx", group: "Marketing site" },
  { slug: "resources", label: "Resources", path: "/resources", source: "components/marketing/pages/resources.tsx", group: "Marketing site" },
  { slug: "contact", label: "Contact", path: "/contact", source: "components/marketing/pages/contact.tsx", group: "Marketing site" },
  { slug: "events", label: "Events", path: "/events", source: "app/events", group: "Marketing site" },
  { slug: "book", label: "Booking", path: "/book", source: "app/book", group: "Marketing site" },
  { slug: "created-for-more", label: "Created for More", path: "/created-for-more", source: "main/created-for-more.html", group: "Marketing site" },

  { slug: "book-waitlist", label: "Book Waitlist", path: "/book-waitlist", source: "app/book-waitlist/page.tsx", group: "App pages" },
  { slug: "created-for-more-check-in", label: "Created for More Check-In", path: "/created-for-more-check-in", source: "components/marketing/pages/check-in.tsx", group: "App pages" },
  { slug: "energy-audit", label: "Energy Audit", path: "/stewardship-blueprint/energy-audit", source: "app/stewardship-blueprint/energy-audit/page.tsx", group: "App pages" },
  { slug: "six-week-challenge", label: "6-Week Challenge", path: "/6-week-challenge", source: "app/6-week-challenge/page.tsx", group: "App pages" },
  {
    slug: "the-life-youre-building",
    label: "The Life You're Building (book)",
    path: "/the-life-youre-building",
    source: "components/marketing/pages/book.tsx",
    group: "Marketing site",
  },
  { slug: "stewardship-blueprint", label: "The Stewardship Blueprint", path: "/stewardship-blueprint", source: "components/marketing/pages/stewardship-blueprint.tsx", group: "Marketing site" },
  { slug: "personal-blueprint", label: "Your Personal Blueprint", path: "/personal-blueprint", source: "components/marketing/pages/personal-blueprint.tsx", group: "Marketing site" },
  { slug: "assessments", label: "Assessments & Check-Ins", path: "/assessments", source: "components/marketing/pages/assessments.tsx", group: "Marketing site" },
  { slug: "start", label: "Start Here", path: "/start", source: "components/marketing/pages/start.tsx", group: "Marketing site" },
  { slug: "learn-and-grow", label: "Learn & Grow", path: "/learn-and-grow", source: "components/marketing/pages/learn-and-grow.tsx", group: "Marketing site" },
  { slug: "studies", label: "Studies & Experiences", path: "/studies", source: "components/marketing/pages/studies.tsx", group: "Marketing site" },
  { slug: "join", label: "Join the Journey", path: "/join", source: "components/marketing/pages/join.tsx", group: "Marketing site" },
  { slug: "churches", label: "For Churches", path: "/churches", source: "components/marketing/pages/churches.tsx", group: "Marketing site" },
  { slug: "lead-a-group", label: "Lead a Group", path: "/lead-a-group", source: "components/marketing/pages/lead-a-group.tsx", group: "Marketing site" },
  { slug: "meet-steward", label: "Meet Steward", path: "/meet-steward", source: "components/marketing/pages/meet-steward.tsx", group: "Marketing site" },
  { slug: "six-week-challenge-videos", label: "6-Week Challenge — Videos", path: "/6-week-challenge/videos", source: "app/6-week-challenge/videos/page.tsx", group: "App pages" },

  { slug: "privacy", label: "Privacy Policy", path: "/privacy", source: "CMS → Legal (components/marketing/pages/legal.tsx)", group: "Legal" },
  { slug: "terms", label: "Terms", path: "/terms", source: "CMS → Legal (components/marketing/pages/legal.tsx)", group: "Legal" },
];

/** One row in the page picker, whichever kind of page it describes. */
export type PickablePage = {
  /** website_pages id for managed pages; `code:<slug>` for code-owned ones. */
  id: string;
  kind: FrontendPageKind;
  label: string;
  path: string;
  group: string;
  status?: string;
  /** Code-owned only — where a developer would go to change it. */
  source?: string;
};

export function codeOwnedToPickable(page: CodeOwnedPage): PickablePage {
  return {
    id: `code:${page.slug}`,
    kind: "code",
    label: page.label,
    path: page.path,
    group: page.group,
    source: page.source,
  };
}

export function findCodeOwnedPage(id: string): CodeOwnedPage | undefined {
  if (!id.startsWith("code:")) return undefined;
  const slug = id.slice("code:".length);
  return CODE_OWNED_PAGES.find((p) => p.slug === slug);
}

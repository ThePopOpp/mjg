import type { Access } from "./catalog";

// "What's New" cards on the Overview. Newest first; add an entry when something
// ships that people should know about. `access` limits who sees it.

export type WhatsNew = { id: string; date: string; title: string; body: string; href?: string; tag: string; access: Access };

export const WHATS_NEW: WhatsNew[] = [
  {
    id: "2026-11-26-overview",
    date: "2026-11-26",
    tag: "Dashboard",
    title: "Make this dashboard yours",
    body: "Drag cards into place, hide what you don't need, and add tools like a dialpad, recorder, notepad and calendar from Add Card.",
    access: "any",
  },
  {
    id: "2026-11-25-leadership",
    date: "2026-11-25",
    tag: "Assessments",
    title: "Leadership Check-In (preview)",
    body: "A new 28-statement assessment for business and ministry leaders. Super admins can preview it while it waits for Mike's sign-off.",
    href: "/leadership-check-in",
    access: "super",
  },
  {
    id: "2026-11-23-speaking",
    date: "2026-11-23",
    tag: "Website",
    title: "Speaking & Podcasts page",
    body: "Hosts can watch Mike's reel, read his bio and send a speaking inquiry straight to the team.",
    href: "/speaking",
    access: "staff",
  },
  {
    id: "2026-11-22-analytics",
    date: "2026-11-22",
    tag: "Reporting",
    title: "Website analytics",
    body: "Visitors, channels, AI referrals and sign-up attribution, all first-party and cookieless.",
    href: "/dashboard/analytics",
    access: { permission: "view_reports" },
  },
  {
    id: "2026-11-23-leads",
    date: "2026-11-23",
    tag: "Pipeline",
    title: "Leads pipeline",
    body: "Track churches and partners from new to converted, with agent-assisted prospecting and approvals.",
    href: "/dashboard/contacts/leads",
    access: "manager",
  },
  {
    id: "2026-11-12-steward",
    date: "2026-11-12",
    tag: "Steward",
    title: "Steward V2",
    body: "Fuller answers grounded in the Stewardship Blueprint library, with editable suggestions.",
    access: "staff",
  },
];

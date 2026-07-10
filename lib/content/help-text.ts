import type { HelpSection } from "@/components/dashboard/page-help";

// Onboarding copy for the "i" info modals — written for Super Admins and team
// members so they can learn the new options at a glance.

export const MEDIA_STUDIO_HELP_TITLE = "How Media Studio & Resources work";
export const MEDIA_STUDIO_HELP_INTRO =
  "Media Studio manages Audio, Video, Photos, and Resources. Each type has a Studio sub-tab (to create) and a Files sub-tab (your library).";

export const MEDIA_STUDIO_HELP: HelpSection[] = [
  {
    heading: "Resources — what it's for",
    body: "The Resources tab is where the team uploads reference material for the site: feature requests, documents, designs, and assets.",
    bullets: [
      "Upload a PDF, JPEG, PNG, Word doc, text file, or other document type — or paste a File URL instead of uploading.",
      "Add a Title, a Resource type (Feature request, Reference/documentation, Design/asset, or Other), and Description / notes.",
      "For feature requests, put as much detail as you like in the notes — it's read alongside the file.",
      "Set Status (draft/published) and Visibility (private/public/assigned).",
    ],
  },
  {
    heading: "Share & notify Super Admins (Super Admin only)",
    body: "Below the sharing options, Super Admins can pick specific Super Admins to share a resource with.",
    bullets: [
      "Newly-added Super Admins get a dashboard notification when you save — editing later won't re-notify people already on it.",
      "The \"Share on\" toggles choose where a published resource can appear (Resources page, Frontend home, dashboard, etc.).",
    ],
  },
  {
    heading: "Send to Claude (Super Admin only)",
    body: "On each resource card in the Files tab, \"Send to Claude\" adds the resource to the Dev Request Queue — the list of items flagged for the dev agent (Claude) to build.",
    bullets: [
      "It captures the title, notes, file, and resource type so the request is self-contained.",
      "It's idempotent — re-sending the same resource updates its queue entry instead of duplicating. The button then shows \"Queued for Claude\".",
    ],
  },
  {
    heading: "Ask Steward",
    body: "\"Ask Steward\" opens the in-app AI assistant already loaded with that resource's details.",
    bullets: [
      "Ask it to summarize a feature request, outline how it would be implemented, or add it to the dev queue and mark it in progress.",
    ],
  },
];

export const CMS_HELP_TITLE = "How the CMS, editors & requests work";
export const CMS_HELP_INTRO =
  "The CMS is where you review pages, collect change requests from the site and dashboard, triage them, and hand them off to be built.";

export const CMS_HELP: HelpSection[] = [
  {
    heading: "Overview",
    body: "The landing tab: quick-launch tiles plus at-a-glance stats — Pages, Open requests, Dev Queue (items flagged for Claude), In progress, Completed, and recent activity.",
  },
  {
    heading: "Frontend Editor",
    body: "Open a public page and leave requests directly on it.",
    bullets: [
      "Click any element (heading, card, section…) to attach an edit or add request, with a type and priority.",
      "Requests re-attach to the same element, so reviewers see exactly what you meant.",
    ],
  },
  {
    heading: "Dashboard Editor (Review button)",
    body: "The floating Review button captures and annotates a dashboard screen, then files a request.",
    bullets: [
      "Dashboard requests include a screenshot, can be shared with specific recipients, and support a reply thread.",
    ],
  },
  {
    heading: "Edit Requests — triage",
    body: "The Edit Requests tab lists everything from both sources, split into Frontend Edits and Dashboard Edits, viewable as Cards, List, or Table.",
    bullets: [
      "Open any request to reassign the requester, change status (Open → In progress → Done), Archive, or Delete.",
    ],
  },
  {
    heading: "Send to Claude & Ask Steward (on each request)",
    body: "Inside a request, two actions connect it to the dev workflow:",
    bullets: [
      "\"Send to Claude\" adds the request to the Dev Request Queue to be implemented.",
      "\"Ask Steward\" opens the AI assistant seeded with the request to summarize it, outline the change, or queue it.",
    ],
  },
  {
    heading: "Dev Queue tile",
    body: "The Dev Queue stat on the Overview counts active items flagged for Claude (queued + in progress). Click it to open Steward and triage the queue.",
  },
  {
    heading: "Pages & Block Builder + Steward AI",
    body: "Create and edit CMS pages block-by-block, or have Steward AI draft whole pages and changes for you.",
  },
];

// Frontend Editor — approved page templates (spec §25).
//
// A template is just a starting block list plus sensible page defaults. Steward
// picks the closest one when creating a page; Mike picks from the New Page
// dialog. Every block a template emits goes through createBlock(), so templates
// can never seed a page with unregistered components.

import { createBlock } from "./registry";
import type { WebsiteBlock, WebsiteContent, WebsitePageType } from "./types";

export type PageTemplate = {
  key: string;
  label: string;
  description: string;
  pageType: WebsitePageType;
  /** Steward should reach for this when the request matches these words. */
  hints: string[];
  build: (title: string) => WebsiteBlock[];
};

const TEMPLATES: PageTemplate[] = [
  {
    key: "standard",
    label: "Standard content page",
    description: "A hero and a body of copy. The safe default for most pages.",
    pageType: "page",
    hints: ["page", "content", "information", "explainer"],
    build: (title) => [
      createBlock("hero", { title, description: "", layout: "centered" }),
      createBlock("richText", { content: "Write the opening of this page here." }),
    ],
  },
  {
    key: "landing",
    label: "Landing page",
    description: "Hero, feature grid, proof and a closing call to action.",
    pageType: "landing",
    hints: ["landing", "campaign", "launch", "offer", "signup"],
    build: (title) => [
      createBlock("hero", { title, description: "", layout: "centered", primaryCta: { label: "Get started", href: "" } }),
      createBlock("featureGrid", {
        title: "What you get",
        items: [
          { title: "First benefit", description: "" },
          { title: "Second benefit", description: "" },
          { title: "Third benefit", description: "" },
        ],
      }),
      createBlock("testimonial", { items: [{ quote: "", name: "", role: "" }] }),
      createBlock("cta", { title: "Ready to begin?", primaryCta: { label: "Get started", href: "" }, background: "gold" }),
    ],
  },
  {
    key: "resource",
    label: "Resource page",
    description: "An intro plus a list of downloadable resources.",
    pageType: "resource",
    hints: ["resource", "download", "library", "guide", "worksheet"],
    build: (title) => [
      createBlock("hero", { title, description: "", layout: "centered" }),
      createBlock("resourceCard", {
        title: "Downloads",
        items: [{ title: "Resource name", description: "", href: "", fileType: "PDF", linkLabel: "Download" }],
      }),
    ],
  },
  {
    key: "blueprint",
    label: "Stewardship Blueprint page",
    description: "The Blueprint explainer with its framework points and a CTA.",
    pageType: "marketing",
    hints: ["blueprint", "stewardship", "framework", "kingdom stewardship"],
    build: (title) => [
      createBlock("hero", { eyebrow: "The Stewardship Blueprint", title, layout: "centered" }),
      createBlock("blueprintSection", {
        title: "A whole-life framework",
        description: "",
        items: [
          { title: "Faith", description: "" },
          { title: "Relationships", description: "" },
          { title: "Resources", description: "" },
        ],
        cta: { label: "Explore the Blueprint", href: "" },
      }),
      createBlock("cta", { title: "Start where you are", primaryCta: { label: "Take the first step", href: "" }, background: "gold" }),
    ],
  },
  {
    key: "service",
    label: "Service / offering page",
    description: "What the offering is, who it is for, and how to begin.",
    pageType: "marketing",
    hints: ["service", "offering", "coaching", "speaking", "consulting"],
    build: (title) => [
      createBlock("hero", { title, description: "", layout: "split" }),
      createBlock("imageContent", { title: "What this is", content: "", imagePosition: "right" }),
      createBlock("featureGrid", { title: "Who this is for", items: [{ title: "", description: "" }] }),
      createBlock("faq", { title: "Common questions", items: [{ question: "", answer: "" }] }),
      createBlock("bookingCta", { title: "Let's talk", cta: { label: "Book a conversation", href: "/book" } }),
    ],
  },
  {
    key: "article",
    label: "Article / insight page",
    description: "A long-form piece: hero, body copy and a pull quote.",
    pageType: "page",
    hints: ["article", "insight", "essay", "teaching", "story"],
    build: (title) => [
      createBlock("hero", { title, layout: "centered", width: "narrow" }),
      createBlock("richText", { content: "", width: "narrow" }),
      createBlock("quote", { quote: "", attribution: "" }),
      createBlock("richText", { content: "", width: "narrow" }),
    ],
  },
  {
    key: "event",
    label: "Event page",
    description: "Event details with the upcoming-events feed and a signup CTA.",
    pageType: "marketing",
    hints: ["event", "gathering", "conference", "workshop", "retreat"],
    build: (title) => [
      createBlock("hero", { title, description: "", layout: "centered" }),
      createBlock("richText", { content: "" }),
      createBlock("eventFeed", { title: "Upcoming", limit: 3 }),
      createBlock("cta", { title: "Save your place", primaryCta: { label: "Register", href: "" } }),
    ],
  },
  {
    key: "membership",
    label: "Product / membership page",
    description: "Pricing tiers with benefits and a subscription CTA.",
    pageType: "marketing",
    hints: ["membership", "pricing", "product", "subscription", "plan"],
    build: (title) => [
      createBlock("hero", { title, description: "", layout: "centered" }),
      createBlock("pricing", { title: "Choose your path", items: [{ name: "", price: "", features: "" }] }),
      createBlock("faq", { title: "Questions", items: [{ question: "", answer: "" }] }),
      createBlock("subscriptionCta", { title: "Join us", cta: { label: "Become a member", href: "" }, background: "gold" }),
    ],
  },
  {
    key: "contact",
    label: "Contact page",
    description: "An invitation plus the contact form.",
    pageType: "page",
    hints: ["contact", "get in touch", "reach out", "message"],
    build: (title) => [
      createBlock("hero", { title, description: "", layout: "centered" }),
      createBlock("contactForm", { title: "Send a message" }),
    ],
  },
  {
    key: "booking",
    label: "Booking page",
    description: "A booking invitation pointing at the application booking flow.",
    pageType: "marketing",
    hints: ["booking", "book", "schedule", "speaking request"],
    build: (title) => [
      createBlock("hero", { title, description: "", layout: "centered" }),
      createBlock("richText", { content: "" }),
      createBlock("bookingCta", { title: "Check availability", cta: { label: "Book now", href: "/book" }, background: "gold" }),
    ],
  },
  {
    key: "legal",
    label: "Legal page",
    description: "A single body of legal copy. Edits are always draft-first.",
    pageType: "legal",
    hints: ["legal", "privacy", "terms", "policy", "disclosure"],
    build: (title) => [
      createBlock("hero", { title, layout: "centered", width: "narrow", spacing: "sm" }),
      createBlock("richText", { content: "", width: "narrow" }),
    ],
  },
  {
    key: "blank",
    label: "Blank page",
    description: "No starting sections — build from scratch.",
    pageType: "page",
    hints: ["blank", "empty", "scratch"],
    build: () => [],
  },
];

export const PAGE_TEMPLATES = TEMPLATES;

export function getTemplate(key: string): PageTemplate | undefined {
  return TEMPLATES.find((t) => t.key === key);
}

export function templateContent(key: string, title: string): WebsiteContent {
  const template = getTemplate(key) ?? getTemplate("standard")!;
  return { version: 1, blocks: template.build(title) };
}

/** Steward's template menu, rendered into its tool description. */
export function templateSummary(): { key: string; label: string; description: string; bestFor: string }[] {
  return TEMPLATES.map((t) => ({
    key: t.key,
    label: t.label,
    description: t.description,
    bestFor: t.hints.join(", "),
  }));
}

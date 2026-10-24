// /resources — Insights & Resources (resources.dc.html). The articles are the
// published blog posts; this scope holds the page's own words and the eight
// Blueprint areas used to browse them.

import { defineScope, defineSection, type Cta, type MediaValue } from "../kit";
import { f, photo, seoSection } from "./shared";

type Hero = { eyebrow: string; title: string; body: string; primaryCta: Cta };

const hero = defineSection<Hero>({
  key: "hero",
  label: "Hero",
  fields: [f.eyebrow(), f.title(), f.body(), f.cta("primaryCta", "Button")],
  defaults: {
    eyebrow: "Insights & Resources",
    title: "Insights for the Life You’re Building.",
    body: "Sometimes one honest question can change the way you see an entire season. Explore reflections, teaching, and practical tools for a life rooted in faith, built on purpose, and lived with generosity.\n\nThese resources are meant to be used—not just collected. Each one offers a question or next step you can apply in real life.",
    primaryCta: { label: "Take the Free Check-In", href: "/created-for-more-check-in" },
  },
});

type Featured = {
  eyebrow: string;
  slug: string;
  topic: string;
  kind: string;
  summary: string;
  readMore: string;
  fallbackImage: MediaValue;
};

const featured = defineSection<Featured>({
  key: "featured",
  label: "Featured Insight",
  fields: [
    f.eyebrow(),
    { key: "slug", label: "Featured article (slug)", kind: "text", maxLength: 160, help: "Empty = the newest published article." },
    f.text("topic", "Topic label", 40),
    f.text("kind", "Kind label", 40),
    { key: "summary", label: "Summary (replaces the excerpt)", kind: "textarea", maxLength: 1200 },
    f.text("readMore", "Link text", 40),
    f.media("fallbackImage", "Image if the article has none"),
  ],
  defaults: {
    eyebrow: "Featured Insight",
    slug: "the-watch-and-the-wrong-scoreboard",
    topic: "Awaken & Purpose",
    kind: "Personal reflection",
    summary:
      "Why did an expensive watch and a professional title seem like arrival—and what happened when the achievement failed to deliver the meaning I expected?\n\nThis personal reflection explores ambition, identity, priorities, and the danger of becoming excellent at building the wrong life.",
    readMore: "Read the Article →",
    fallbackImage: photo("/marketing/brand/watch-wrong-scoreboard.webp", "The Watch and the Wrong Scoreboard"),
  },
});

export type ResourceTopic = { id: string; title: string; body: string; match: string };
type Browse = { eyebrow: string; title: string; topics: ResourceTopic[]; emptyLabel: string };

const browse = defineSection<Browse>({
  key: "browse",
  label: "Explore by Blueprint Area",
  fields: [
    f.eyebrow(),
    f.title(),
    f.list(
      "topics",
      "Areas",
      [
        { key: "title", label: "Title", kind: "text", required: true, maxLength: 40 },
        f.text("body", "Description", 200),
        { key: "match", label: "Matches categories / tags (comma-separated slugs)", kind: "text", maxLength: 200 },
      ],
      12,
      "Area",
    ),
    f.text("emptyLabel", "Label when an area has no articles yet", 40),
  ],
  defaults: {
    eyebrow: "Browse",
    title: "Explore by Blueprint Area.",
    topics: [
      { id: "awaken-purpose", title: "Awaken & Purpose", body: "The wrong scoreboard, drifting without noticing, and what your life is really building.", match: "created-for-more, stewardship-blueprint, purpose" },
      { id: "faith-identity", title: "Faith & Identity", body: "Life beyond roles and performance; faith at the center of decisions.", match: "faith, faith-and-work" },
      { id: "family", title: "Family", body: "Presence, relationships, mentorship, and investing in others.", match: "family" },
      { id: "fitness-energy", title: "Fitness & Energy", body: "Health, recovery, attention, and fully engaged living.", match: "fitness, energy, health" },
      { id: "fun-joy", title: "Fun & Joy", body: "Purposeful experiences, Sabbath, adventure, and celebration.", match: "fun, joy, sabbath" },
      { id: "finances", title: "Finances", body: "Money as tool, margin, generosity, freedom, and stewardship.", match: "finance, finances, stewardship" },
      { id: "guardrails-habits", title: "Guardrails & Habits", body: "Pre-decided boundaries and rhythms that protect what matters.", match: "guardrails, habits" },
      { id: "legacy-generosity", title: "Legacy & Generosity", body: "Modeling and equipping others to practice and pass on generosity while living.", match: "legacy, generosity" },
    ],
    emptyLabel: "Articles coming soon",
  },
});

type Articles = { eyebrow: string; title: string; filteredTitle: string; showAll: string; readLabel: string; empty: string };

const articles = defineSection<Articles>({
  key: "articles",
  label: "Articles",
  fields: [
    f.eyebrow(),
    f.title(),
    { key: "filteredTitle", label: "Heading when an area is chosen", kind: "text", maxLength: 80, help: "{area} is replaced with the area's name." },
    f.text("showAll", "Show-all link", 40),
    f.text("readLabel", "Card link text", 40),
    f.text("empty", "Message when nothing matches", 200),
  ],
  defaults: {
    eyebrow: "Foundation Articles",
    title: "Start Here.",
    filteredTitle: "{area}",
    showAll: "Show all articles",
    readLabel: "Read →",
    empty: "Nothing here yet — new articles are added regularly. In the meantime, the free Check-In is a good place to begin.",
  },
});

export const pageResources = defineScope({
  key: "page:resources",
  label: "Insights & Resources",
  path: "/resources",
  sections: {
    _seo: seoSection({
      title: "Insights & Resources",
      description:
        "Reflections, teaching, and practical tools for a life rooted in faith, built on purpose, and lived with generosity — each with a question or next step to apply.",
    }),
    hero,
    featured,
    browse,
    articles,
  },
});

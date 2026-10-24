// /learn-and-grow — Learn & Grow (learn-and-grow.dc.html): book, studies, insights.

import { defineScope, defineSection, type ContentField, type Cta, type MediaValue } from "../kit";
import { f, photo, seoSection } from "./shared";

type Hero = { eyebrow: string; title: string; body: string; primaryCta: Cta; secondaryCta: Cta };

const hero = defineSection<Hero>({
  key: "hero",
  label: "Hero",
  fields: [f.eyebrow(), f.title(), f.body(), f.cta("primaryCta", "Primary button", true), f.cta("secondaryCta", "Secondary button")],
  defaults: {
    eyebrow: "Learn & Grow",
    title: "Learning That Leads to Living.",
    body: "Information alone rarely changes a life. What matters is what you notice, discuss, decide, and put into practice.\n\nExplore books, small-group studies, videos, and practical insights that help you understand and live the Stewardship Blueprint.",
    primaryCta: { label: "Explore Studies", href: "/studies" },
    secondaryCta: { label: "Read Insights & Resources", href: "/resources" },
  },
});

type FeatureCard = { id: string; label: string; title: string; body: string; href: string; cta: string; image: MediaValue };
type Featured = { eyebrow: string; title: string; cards: FeatureCard[] };

const cardFields: ContentField[] = [
  f.text("label", "Label", 40),
  { key: "title", label: "Title", kind: "text", required: true, maxLength: 80 },
  f.textarea("body", "Description", 300),
  { key: "href", label: "Link", kind: "url" },
  f.text("cta", "Link text", 40),
  f.media("image", "Image"),
];

const featured = defineSection<Featured>({
  key: "featured",
  label: "Featured Learning",
  fields: [f.eyebrow(), f.title(), f.list("cards", "Cards", cardFields, 6, "Card")],
  defaults: {
    eyebrow: "Featured Learning",
    title: "Choose How You Like to Learn.",
    cards: [
      {
        id: "book",
        label: "The Book",
        title: "The Life You’re Building",
        body: "A story-driven invitation to move from drift to design.",
        href: "/the-life-youre-building",
        cta: "Explore the Book →",
        image: { ...photo("/marketing/brand/the-life-youre-building-book.webp", "The Life You’re Building, by Michael J. Gauthier"), fit: "contain" },
      },
      {
        id: "together",
        label: "Together",
        title: "Studies & Group Experiences",
        body: "Guided conversation, Scripture, reflection, and practical follow-through.",
        href: "/studies",
        cta: "Find a Study →",
        image: photo("/marketing/stock/small-group.jpg", "A small group Bible study around a wooden table", "Photo: Nicolas Lobos / Unsplash"),
      },
      {
        id: "insights",
        label: "Articles & Tools",
        title: "Insights & Resources",
        body: "Brief and in-depth reflections, videos, worksheets, and tools organized around the layers of the Blueprint.",
        href: "/resources",
        cta: "Explore Insights →",
        image: photo("/marketing/brand/watch-wrong-scoreboard.webp", "The Watch, the Title and the Wrong Scoreboard — featured article image"),
      },
    ],
  },
});

type NextStep = { eyebrow: string; title: string; body: string; primaryCta: Cta };

const nextStep = defineSection<NextStep>({
  key: "nextStep",
  label: "Featured Next Step",
  fields: [f.eyebrow(), f.title(), f.body(), f.cta("primaryCta", "Button")],
  defaults: {
    eyebrow: "Featured Next Step",
    title: "From Learning to Action.",
    body: "Whatever you choose to read or watch, end with one question: *What changes because of what I have learned?*\n\nStart the free Check-In if you have not yet examined the life you are currently building.",
    primaryCta: { label: "Take the Free Check-In", href: "/created-for-more-check-in" },
  },
});

export const pageLearn = defineScope({
  key: "page:learn-and-grow",
  label: "Learn & Grow",
  path: "/learn-and-grow",
  sections: {
    _seo: seoSection({
      title: "Learn & Grow",
      description:
        "Books, small-group studies, videos, and practical insights that help you understand and live the Stewardship Blueprint.",
    }),
    hero,
    featured,
    nextStep,
  },
});

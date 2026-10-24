// /start — Start Your Journey (start.dc.html): five paths, one next step.

import { defineScope, defineSection, type Cta } from "../kit";
import { f, linkCardFields, seoSection, type LinkCard } from "./shared";

type Hero = { eyebrow: string; title: string; body: string; primaryCta: Cta };

const hero = defineSection<Hero>({
  key: "hero",
  label: "Hero",
  fields: [f.eyebrow(), f.title(), f.body(), f.cta("primaryCta", "Button", true)],
  defaults: {
    eyebrow: "Start Your Journey",
    title: "Start Where You Actually Are.",
    body: "You do not need to know exactly what is wrong—or have a detailed life plan—to take a meaningful first step.\n\nSome people begin because they sense drift. Others are changing seasons, joining a group, reading a book, or ready to build a personal plan. Wherever you’re starting, choose the next step that fits.",
    primaryCta: { label: "Take the Free Check-In", href: "/created-for-more-check-in" },
  },
});

type Paths = { eyebrow: string; title: string; cards: LinkCard[] };

const paths = defineSection<Paths>({
  key: "paths",
  label: "Choose a Path",
  fields: [f.eyebrow(), f.title(), f.list("cards", "Paths", linkCardFields, 8, "Path")],
  defaults: {
    eyebrow: "Choose a Path",
    title: "Find the Next Step That Fits.",
    cards: [
      {
        id: "where",
        label: "01",
        title: "I want to see where I am",
        body: "Take the Created for More Check-In and identify an area deserving attention.",
        href: "/created-for-more-check-in",
        cta: "Check-In",
      },
      {
        id: "framework",
        label: "02",
        title: "I want to understand the framework",
        body: "Explore how faith, purpose, the four pillars, habits, energy, and living legacy fit together.",
        href: "/stewardship-blueprint",
        cta: "The Framework",
      },
      {
        id: "learn",
        label: "03",
        title: "I want to learn on my own",
        body: "Explore reflections, the upcoming book, and practical resources.",
        href: "/learn-and-grow",
        cta: "Learn & Grow",
      },
      {
        id: "together",
        label: "04",
        title: "I want to grow with others",
        body: "Find a six-week study or church/group experience.",
        href: "/studies",
        cta: "Studies",
      },
      {
        id: "plan",
        label: "05",
        title: "I am ready to build a personal plan",
        body: "See what goes into a Personal Blueprint and how Steward can guide the process.",
        href: "/personal-blueprint",
        cta: "Personal Blueprint",
      },
    ],
  },
});

type Reassurance = { eyebrow: string; title: string; body: string; primaryCta: Cta };

const reassurance = defineSection<Reassurance>({
  key: "reassurance",
  label: "Reassurance",
  fields: [f.eyebrow(), f.title(), f.body(), f.cta("primaryCta", "Button")],
  defaults: {
    eyebrow: "Reassurance",
    title: "You Only Need One Faithful Next Step.",
    body: "The goal is not to fix everything today. Begin with what is true, choose what matters most, and take a step you can actually live.",
    primaryCta: { label: "Begin the Check-In", href: "/created-for-more-check-in" },
  },
});

export const pageStart = defineScope({
  key: "page:start",
  label: "Start Your Journey",
  path: "/start",
  sections: {
    _seo: seoSection({
      title: "Start Your Journey",
      description:
        "You do not need a detailed life plan to take a meaningful first step. Choose the path that fits — the free Check-In, the framework, learning, a group, or a personal Blueprint.",
    }),
    hero,
    paths,
    reassurance,
  },
});

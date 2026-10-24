// /about (about.dc.html) and /mission (mission.dc.html) live in their own files;
// this one is About Michael.

import { defineScope, defineSection, type Cta, type MediaValue } from "../kit";
import { f, photo, seoSection } from "./shared";

type Hero = { eyebrow: string; title: string; body: string; primaryCta: Cta; photo: MediaValue };

const hero = defineSection<Hero>({
  key: "hero",
  label: "Hero",
  fields: [f.eyebrow(), f.title(), f.body(), f.cta("primaryCta", "Button"), f.media("photo", "Portrait")],
  defaults: {
    eyebrow: "About Michael",
    title: "I’m Still Building, Too.",
    body: "I’m Michael J. Gauthier. I’m a husband, father, follower of Jesus, financial planner, business leader, and someone who is still learning to live what matters most.\n\nThe Stewardship Blueprint is not a theory I developed from a distance. It grew out of my own questions, successes, misplaced scoreboards, relationships, faith journey, and ongoing desire to steward the life God has entrusted to me.",
    primaryCta: { label: "Explore the Framework", href: "/stewardship-blueprint" },
    photo: photo("/marketing/brand/michael-gauthier.webp", "Michael J. Gauthier"),
  },
});

type Question = { eyebrow: string; title: string; body: string; image: MediaValue };

const question = defineSection<Question>({
  key: "question",
  label: "The Question",
  fields: [f.eyebrow(), f.title(), f.body(), f.media("image", "Family photo")],
  defaults: {
    eyebrow: "The Question",
    title: "If Everything I’m Chasing Works, Will It Actually Matter?",
    body: "Early in my career, I was ambitious. I worked hard and measured success through production, growth, titles, and recognition. None of those pursuits were inherently wrong. But they were incomplete.\n\nWhen Kristi and I welcomed our first child, Colton, I started thinking about a different kind of success. He would not just need provision. He would watch what I valued, how I treated his mother, where I spent my time, and what I celebrated.\n\nLater, trusted friends invited our family into a small-group Bible study. My faith began to move from a compartment of life toward the foundation of how I understood marriage, work, finances, service, and purpose.",
    image: photo("/marketing/brand/gauthier-family.webp", "The Gauthier family"),
  },
});

type Milestone = { id: string; label: string; text: string };
type Journey = { eyebrow: string; title: string; body: string; link: Cta; milestones: Milestone[] };

const journey = defineSection<Journey>({
  key: "journey",
  label: "The Journey",
  fields: [
    f.eyebrow(),
    f.title(),
    f.body(),
    f.cta("link", "Link"),
    f.list("milestones", "Timeline", [f.text("label", "Label", 20), { key: "text", label: "Text", kind: "text", required: true, maxLength: 160 }], 6, "Milestone"),
  ],
  defaults: {
    eyebrow: "The Journey",
    title: "From Planning Money to Examining the Whole Life.",
    body: "I founded Strategic Income Group in 2013 after leaving a large Wall Street firm. Financial planning taught me important lessons about discipline, responsibility, and wise use of resources.\n\nIt also revealed a deeper question: *What is the money for?* Many people have detailed financial plans without a clear picture of the life those resources are meant to serve.\n\nThat observation, together with my personal faith and family journey, helped shape the Stewardship Blueprint. It is an invitation to look beyond one scoreboard and steward the whole life.",
    link: { label: "Read My Mission →", href: "/mission" },
    milestones: [
      { id: "2013", label: "2013", text: "Left a large Wall Street firm; founded Strategic Income Group." },
      { id: "then", label: "Then", text: "Financial planning raised the deeper question: what is the money for?" },
      { id: "now", label: "Now", text: "The Stewardship Blueprint — an invitation to steward the whole life." },
    ],
  },
});

type Invitation = { eyebrow: string; title: string; body: string; primaryCta: Cta; secondaryCta: Cta };

const invitation = defineSection<Invitation>({
  key: "invitation",
  label: "Invitation",
  fields: [f.eyebrow(), f.title(), f.body(), f.cta("primaryCta", "Primary button"), f.cta("secondaryCta", "Secondary button")],
  defaults: {
    eyebrow: "Invitation",
    title: "Come Build With Me.",
    body: "I do not believe you need a perfect life to begin living on purpose. You only need the courage to stop, look honestly at what is true, and choose your next faithful step.\n\nMy hope is that the Stewardship Blueprint becomes useful to people of many ages and seasons—and that they will eventually help others begin as well.",
    primaryCta: { label: "Take the Free Check-In", href: "/created-for-more-check-in" },
    secondaryCta: { label: "Join the Journey", href: "/join" },
  },
});

export const pageAbout = defineScope({
  key: "page:about",
  label: "About Michael",
  path: "/about",
  sections: {
    _seo: seoSection({
      title: "About Michael J. Gauthier",
      description:
        "Husband, father, follower of Jesus, financial planner and business leader — and still learning to live what matters most. The story behind the Stewardship Blueprint.",
    }),
    hero,
    question,
    journey,
    invitation,
  },
});

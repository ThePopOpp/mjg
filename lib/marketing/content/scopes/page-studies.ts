// /studies — Studies & Experiences (studies.dc.html). The week tiles read the
// six-week challenge's own data (lib/six-week-challenge), not this content.

import { defineScope, defineSection, type ContentField, type Cta, type MediaValue } from "../kit";
import { f, photo, seoSection } from "./shared";

type Hero = { eyebrow: string; title: string; body: string; primaryCta: Cta };

const hero = defineSection<Hero>({
  key: "hero",
  label: "Hero",
  fields: [f.eyebrow(), f.title(), f.body(), f.cta("primaryCta", "Button", true)],
  defaults: {
    eyebrow: "Studies & Experiences",
    title: "Grow Through Conversation and Action.",
    body: "You can learn a great deal on your own. But trusted community creates space to ask better questions, tell the truth, and follow through.\n\nOur studies and experiences combine biblical teaching, guided reflection, practical commitments, and encouragement. Some are designed for specific audiences; others are for anyone ready to examine the life they are building.",
    primaryCta: { label: "Explore the Six-Week Challenge", href: "/6-week-challenge" },
  },
});

type Current = {
  eyebrow: string;
  status: string;
  title: string;
  body: string;
  primaryCta: Cta;
  secondaryCta: Cta;
  video: MediaValue;
  videoHref: string;
  videoLabel: string;
  photo: MediaValue;
  secondPhoto: MediaValue;
};

const current = defineSection<Current>({
  key: "current",
  label: "Current Experience",
  fields: [
    f.eyebrow(),
    f.text("status", "Status label", 40),
    f.title(),
    f.body(),
    f.cta("primaryCta", "Primary button"),
    f.cta("secondaryCta", "Secondary button"),
    f.media("video", "Invitation video poster"),
    { key: "videoHref", label: "Invitation video link", kind: "url" },
    f.text("videoLabel", "Video link label (screen readers)", 120),
    f.media("photo", "Photo"),
    f.media("secondPhoto", "Second photo"),
  ],
  defaults: {
    eyebrow: "Current Experience",
    status: "Live · Men’s Edition",
    title: "The Life You’re Building — Six-Week Men’s Challenge",
    body: "Six sessions to wake up to drift, see the framework, evaluate the four pillars, install guardrails, strengthen daily rhythms, and assemble a Personal Blueprint.\n\nThis edition is built for men participating with a leader or small group. It includes participant materials, short teaching videos, personal reflection, and group conversation.",
    primaryCta: { label: "Open the Challenge", href: "/6-week-challenge" },
    secondaryCta: { label: "▶ Watch the Video Library", href: "/6-week-challenge/videos" },
    video: photo("/6-week-challenge/mike-intro.png", "Michael J. Gauthier introducing the Six-Week Challenge"),
    videoHref: "/6-week-challenge/videos/invitation",
    videoLabel: "Watch the invitation to the Six-Week Challenge",
    photo: photo("/marketing/stock/group-gathering.jpg", "A small group in conversation around a table", "Photo: Small Group Network / Unsplash"),
    secondPhoto: photo("/marketing/stock/bible-reading-friends.jpg", "Two friends reading the Bible together outdoors", "Photo: Meredith Spencer / Unsplash"),
  },
});

type Experience = { id: string; status: string; statusTone: string; title: string; body: string; image: MediaValue };
type More = { eyebrow: string; title: string; experiences: Experience[]; cta: Cta };

const experienceFields: ContentField[] = [
  f.text("status", "Status label", 30),
  {
    key: "statusTone",
    label: "Status colour",
    kind: "select",
    options: [
      { value: "live", label: "Live (green)" },
      { value: "soon", label: "Upcoming (gold)" },
      { value: "future", label: "Future (grey)" },
    ],
  },
  { key: "title", label: "Title", kind: "text", required: true, maxLength: 80 },
  f.textarea("body", "Description", 400),
  f.media("image", "Image (optional)"),
];

const more = defineSection<More>({
  key: "more",
  label: "Additional Experiences",
  fields: [f.eyebrow(), f.title(), f.list("experiences", "Experiences", experienceFields, 6, "Experience"), f.cta("cta", "Button")],
  defaults: {
    eyebrow: "Additional Experiences",
    title: "More Ways to Grow.",
    experiences: [
      {
        id: "fully-engaged",
        status: "Upcoming",
        statusTone: "soon",
        title: "Fully Engaged",
        body: "A focused exploration of physical, emotional, mental, and spiritual energy stewardship.",
        image: photo("/marketing/stock/sunrise-path.jpg", "A path through a green field toward the rising sun", "Photo: Shai Pal / Unsplash"),
      },
      {
        id: "editions",
        status: "In Development",
        statusTone: "soon",
        title: "Group Editions for Different Audiences",
        body: "As they are developed, studies can be adapted for general groups, women, couples, families, young adults, and leadership settings.",
        image: { src: "", alt: "" },
      },
      {
        id: "future",
        status: "Future",
        statusTone: "future",
        title: "Guardrails, Habits, Finances & Legacy",
        body: "Future deeper resources can grow from the same master framework without changing the structure of the website.",
        image: { src: "", alt: "" },
      },
    ],
    cta: { label: "Join for New Study Updates", href: "/join" },
  },
});

type Lead = { eyebrow: string; title: string; body: string; primaryCta: Cta; secondaryCta: Cta };

const lead = defineSection<Lead>({
  key: "lead",
  label: "Invite a Group",
  fields: [f.eyebrow(), f.title(), f.body(), f.cta("primaryCta", "Primary button"), f.cta("secondaryCta", "Secondary button")],
  defaults: {
    eyebrow: "Invite a Group",
    title: "Want to Lead One?",
    body: "You do not need to be a professional teacher to host a meaningful conversation. Good facilitators create safety, ask thoughtful questions, and help participants leave with a practical next step.\n\nWe provide structured materials and guidance to help leaders prepare.",
    primaryCta: { label: "Explore Leading a Group", href: "/lead-a-group" },
    secondaryCta: { label: "For Churches", href: "/churches" },
  },
});

export const pageStudies = defineScope({
  key: "page:studies",
  label: "Studies & Experiences",
  path: "/studies",
  sections: {
    _seo: seoSection({
      title: "Studies & Experiences",
      description:
        "Six-week studies and group experiences that combine biblical teaching, guided reflection, practical commitments, and encouragement — starting with The Life You’re Building Six-Week Men’s Challenge.",
    }),
    hero,
    current,
    more,
    lead,
  },
});

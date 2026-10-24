// /lead-a-group — the facilitator entry point (lead-a-group.dc.html).

import { defineScope, defineSection, type Cta, type MediaValue } from "../kit";
import { f, mock, photo, seoSection } from "./shared";

type Hero = { eyebrow: string; title: string; body: string; primaryCta: Cta; secondaryCta: Cta; guide: MediaValue; image: MediaValue };

const hero = defineSection<Hero>({
  key: "hero",
  label: "Hero",
  fields: [f.eyebrow(), f.title(), f.body(), f.cta("primaryCta", "Primary button", true), f.cta("secondaryCta", "Register button"), f.media("guide", "Leader guide cover"), f.media("image", "Image")],
  defaults: {
    eyebrow: "Lead a Group",
    title: "You Don’t Have to Be the Expert in the Room.",
    body: "Great group conversations often begin with one person willing to create space for honesty, Scripture, reflection, and practical action.\n\nLeading a Stewardship Blueprint study is not about giving six polished speeches. It is about serving people well and helping them move from insight to one meaningful next step.",
    primaryCta: { label: "Explore the Current Challenge", href: "/6-week-challenge" },
    secondaryCta: { label: "Register as Facilitator", href: "/register" },
    guide: mock("guide", "Leader Guide", "The Life You’re Building"),
    image: photo("/marketing/stock/small-group.jpg", "A small group Bible study around a wooden table", "Photo: Nicolas Lobos / Unsplash"),
  },
});

type Role = { id: string; title: string; body: string };
type LeadersDo = { eyebrow: string; title: string; body: string; link: Cta; roles: Role[] };

const leadersDo = defineSection<LeadersDo>({
  key: "leadersDo",
  label: "What Leaders Do",
  fields: [
    f.eyebrow(),
    f.title(),
    f.body(),
    f.cta("link", "Link"),
    f.list(
      "roles",
      "Cards",
      [
        { key: "title", label: "Title", kind: "text", required: true, maxLength: 40 },
        f.text("body", "Line", 120),
      ],
      4,
      "Card",
    ),
  ],
  defaults: {
    eyebrow: "What Leaders Do",
    title: "Create Space. Ask Good Questions. Encourage Action.",
    body: "Prepare with the participant materials, welcome the group, maintain confidentiality, guide discussion rather than dominate it, and invite each person to choose a manageable commitment.\n\nGood leaders listen carefully, respect the right to pass, avoid acting as another person’s therapist or professional advisor, and know when to involve appropriate church or professional support.",
    link: { label: "View Facilitator FAQ →", href: "#faq" },
    roles: [
      { id: "space", title: "Create space", body: "Welcome, confidentiality, safety." },
      { id: "ask", title: "Ask well", body: "Guide, don’t dominate. Listen." },
      { id: "action", title: "Encourage action", body: "One manageable commitment each." },
    ],
  },
});

type Path = { eyebrow: string; title: string; steps: { id: string; text: string }[]; primaryCta: Cta; secondaryCta: Cta };

const path = defineSection<Path>({
  key: "path",
  label: "Simple Path",
  fields: [
    f.eyebrow(),
    f.title(),
    f.list("steps", "Steps", [{ key: "text", label: "Step", kind: "textarea", required: true, maxLength: 300 }], 10, "Step"),
    f.cta("primaryCta", "Primary button"),
    f.cta("secondaryCta", "Secondary button"),
  ],
  defaults: {
    eyebrow: "Simple Path",
    title: "How to Start a Group.",
    steps: [
      { id: "s1", text: "Choose the study and audience. The current men’s challenge has established materials." },
      { id: "s2", text: "Select the group schedule and location." },
      { id: "s3", text: "Register or sign in using the appropriate facilitator access." },
      { id: "s4", text: "Invite participants and distribute available materials." },
      { id: "s5", text: "Confirm all video links and session dates, then lead with humility and clarity." },
      { id: "s6", text: "Encourage each participant to name a practical next step and revisit it." },
    ],
    primaryCta: { label: "Create an Account", href: "/register" },
    secondaryCta: { label: "Open the Video Library", href: "/6-week-challenge/videos" },
  },
});

export type FaqItem = { id: string; question: string; answer: string };
type Faq = { eyebrow: string; title: string; cta: Cta; items: FaqItem[] };

const faq = defineSection<Faq>({
  key: "faq",
  label: "Facilitator FAQ",
  fields: [
    f.eyebrow(),
    f.title(),
    f.cta("cta", "Button"),
    f.list(
      "items",
      "Questions",
      [
        { key: "question", label: "Question", kind: "text", required: true, maxLength: 160 },
        { key: "answer", label: "Answer", kind: "textarea", required: true, maxLength: 800 },
      ],
      16,
      "Question",
    ),
  ],
  defaults: {
    eyebrow: "Frequent Questions",
    title: "Questions New Facilitators Ask.",
    cta: { label: "Contact Us About Leading", href: "/contact?topic=facilitator" },
    items: [
      { id: "trained", question: "Do I need to be a trained teacher?", answer: "No. Read the guide, prepare faithfully, and focus on helpful facilitation rather than performance." },
      {
        id: "length",
        question: "How long is the study?",
        answer: "The current Life You’re Building men’s experience uses six sessions. Confirm the actual session schedule with your group.",
      },
      { id: "share", question: "What if someone does not want to share?", answer: "Respect their choice. The right to pass is part of healthy group culture." },
      {
        id: "off-topic",
        question: "What if a conversation goes off topic?",
        answer: "Follow the person and the purpose; bring the conversation gently back to the question or next step when needed.",
      },
      {
        id: "customize",
        question: "Can a church customize the experience?",
        answer: "Ask about currently supported options before assuming custom content or white-label functionality.",
      },
      {
        id: "care",
        question: "What if someone needs deeper care?",
        answer: "Follow your church safeguarding policies and connect them to appropriate pastoral or professional support.",
      },
    ],
  },
});

export const pageLeadAGroup = defineScope({
  key: "page:lead-a-group",
  label: "Lead a Group",
  path: "/lead-a-group",
  sections: {
    _seo: seoSection({
      title: "Lead a Group",
      description:
        "You don’t have to be the expert in the room. How to start and lead a Stewardship Blueprint group — what leaders do, the simple path, and answers to the questions new facilitators ask.",
    }),
    hero,
    leadersDo,
    path,
    faq,
  },
});

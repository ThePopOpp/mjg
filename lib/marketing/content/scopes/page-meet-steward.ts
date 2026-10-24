// /meet-steward — the Steward marketing page (steward.dc.html). /steward is the
// member app itself; this page explains it. Prices are never written here: the
// paid card reads the live catalogue.

import { defineScope, defineSection, type ContentField, type Cta, type VideoFileValue } from "../kit";
import { chatFields, type ChatMessage, type ChatProposal } from "./page-home";
import { f, seoSection } from "./shared";

type Hero = {
  eyebrow: string;
  title: string;
  lead: string;
  body: string;
  primaryCta: Cta;
  secondaryCta: Cta;
  chatHeading: string;
  messages: ChatMessage[];
  proposal: ChatProposal;
};

const hero = defineSection<Hero>({
  key: "hero",
  label: "Hero",
  fields: [
    f.eyebrow(),
    f.title(),
    f.lead(),
    f.body(),
    f.cta("primaryCta", "Primary button", true),
    f.cta("secondaryCta", "Secondary button"),
    f.text("chatHeading", "Conversation heading", 80),
    ...chatFields,
  ],
  defaults: {
    eyebrow: "Steward · Personal Stewardship Guide",
    title: "Meet Steward, Your Personal Stewardship Guide.",
    lead: "Your life is too important to navigate only when something goes wrong.",
    body: "Steward is a personal guide built around the Stewardship Blueprint. It helps you make space to think, clarify priorities, develop your personal plan, and return to the decisions that matter when life gets busy.\n\nYour thoughts, convictions, and choices lead. Steward helps organize them into a clearer path forward.",
    primaryCta: { label: "See How Steward Works", href: "#demo" },
    secondaryCta: { label: "Explore Your Personal Blueprint", href: "/personal-blueprint" },
    chatHeading: "Steward · Guide conversation",
    messages: [
      { id: "m1", from: "member", text: "I keep saying family comes first, but my calendar doesn’t show it." },
      { id: "m2", from: "steward", text: "What would “first” look like on a normal Tuesday? Let’s name one concrete rhythm you could protect." },
      { id: "m3", from: "member", text: "Dinner together without my phone." },
    ],
    proposal: {
      label: "Draft keystone habit",
      text: "“Weeknight dinner at the table, phones in the drawer.”",
      approve: "Approve",
      edit: "Edit",
      dismiss: "Not now",
    },
  },
});

type Help = { id: string; title: string; body: string };
type Helps = { eyebrow: string; title: string; items: Help[]; cta: Cta };

const helpFields: ContentField[] = [
  { key: "title", label: "Title", kind: "text", required: true, maxLength: 40 },
  f.textarea("body", "Description", 300),
];

const helps = defineSection<Helps>({
  key: "helps",
  label: "What It Helps With",
  fields: [f.eyebrow(), f.title(), f.list("items", "Cards", helpFields, 8, "Card"), f.cta("cta", "Button")],
  defaults: {
    eyebrow: "What It Helps With",
    title: "Clarity You Can Return To.",
    items: [
      { id: "reflect", title: "Reflect", body: "Think through the real questions behind your current season." },
      { id: "build", title: "Build", body: "Work through your Personal Stewardship Blueprint one meaningful section at a time." },
      { id: "decide", title: "Decide", body: "Examine choices against your mission, values, commitments, and guardrails." },
      { id: "revisit", title: "Revisit", body: "Return to your Blueprint when you need renewed clarity or a change in direction." },
      // Worded conditionally on purpose: reminders and check-ins depend on the
      // member's plan and what is deployed, so nothing here promises them.
      { id: "follow", title: "Follow Through", body: "Use reminders, check-ins, and reviews where enabled by your current account and permissions." },
    ],
    cta: { label: "Start with the Free Check-In", href: "/created-for-more-check-in" },
  },
});

type Demo = { eyebrow: string; title: string; body: string; link: Cta; video: VideoFileValue; videoLabel: string };

const demo = defineSection<Demo>({
  key: "demo",
  label: "Demo",
  fields: [
    f.eyebrow(),
    f.title(),
    f.body(),
    f.cta("link", "Link"),
    { key: "video", label: "Demo video", kind: "videoFile", help: "Silent loop. Desktop 16:9 in src, phone 9:16 in mobileSrc." },
    f.text("videoLabel", "Video description (screen readers)", 200),
  ],
  defaults: {
    eyebrow: "Demo",
    title: "See a Realistic Conversation.",
    body: "Imagine saying: *“My work calendar keeps crowding out family. Help me think through what needs to change.”*\n\nSteward helps clarify the real tension, reconnect it to the person’s stated priorities, and propose a short action or draft statement for their approval.\n\nThe participant reviews the suggestion, chooses what to use, and decides whether to add it to the Personal Blueprint.",
    link: { label: "Explore the Personal Blueprint →", href: "/personal-blueprint" },
    video: {
      src: "/marketing/video/steward-agent.mp4",
      mobileSrc: "/marketing/video/steward-agent-mobile.mp4",
      poster: "/marketing/video/steward-agent-poster.jpg",
      mobilePoster: "/marketing/video/steward-agent-mobile-poster.jpg",
    },
    videoLabel:
      "A short silent demo of Steward: a member talks through a family situation, and Steward proposes a guardrail they approve into their Blueprint.",
  },
});

type Control = { eyebrow: string; title: string; body: string; link: Cta; disclosureLabel: string; disclosureTitle: string; disclosureBody: string };

const control = defineSection<Control>({
  key: "control",
  label: "Your Control",
  fields: [
    f.eyebrow(),
    f.title(),
    f.body(),
    f.cta("link", "Link"),
    f.text("disclosureLabel", "Disclosure label", 40),
    f.text("disclosureTitle", "Disclosure headline", 160),
    f.textarea("disclosureBody", "Disclosure text", 800),
  ],
  defaults: {
    eyebrow: "Your Control",
    title: "Your Life. Your Decisions. Your Blueprint.",
    body: "Steward offers structured reflection and suggestions. It does not replace trusted relationships, spiritual guidance, or qualified professional advice. You remain responsible for your decisions and approve changes saved to your personal plan.",
    link: { label: "Read Privacy & Trust Details →", href: "/legal" },
    disclosureLabel: "Plain disclosure",
    disclosureTitle: "Steward is an interactive digital guide powered by AI.",
    disclosureBody:
      "This technology supports the experience; it is not the purpose of the experience. The Stewardship Blueprint remains the foundation.\n\nSteward proposes the words. You approve them. Only then is anything saved.",
  },
});

type Plan = { label: string; title: string; body: string; cta: Cta };
type Access = { eyebrow: string; title: string; body: string; free: Plan; paid: Plan };

const planFields: ContentField[] = [f.text("label", "Label", 60), f.text("title", "Title", 80), f.textarea("body", "Description", 400), f.cta("cta", "Button")];

const access = defineSection<Access>({
  key: "access",
  label: "Access",
  fields: [
    f.eyebrow(),
    f.title(),
    f.body(),
    { key: "free", label: "Free card", kind: "group", fields: planFields },
    { key: "paid", label: "Paid card", kind: "group", fields: planFields, help: "The starting price is read from the live catalogue, never typed here." },
  ],
  defaults: {
    eyebrow: "Access",
    title: "Begin at the Level That Fits.",
    body: "The free Check-In is a meaningful way to start. Options for a deeper Personal Blueprint and Steward access may be available according to the current offering.\n\nReview exactly what is included and the current price before you begin. Your ability to reflect, learn, and join a group should not depend on purchasing premium access.",
    free: {
      label: "Free",
      title: "Created for More Check-In",
      body: "28 questions across seven layers. Your results and one faithful next step.",
      cta: { label: "Take the Free Check-In", href: "/created-for-more-check-in" },
    },
    paid: {
      label: "Personal Blueprint + Steward",
      title: "Full Build & Ongoing Guidance",
      body: "The complete thirteen-page Personal Blueprint built with Steward, revisited as your season changes. See what is included and the current price at checkout.",
      cta: { label: "View Current Access Options", href: "/steward/pricing" },
    },
  },
});

export const pageMeetSteward = defineScope({
  key: "page:meet-steward",
  label: "Meet Steward",
  path: "/meet-steward",
  sections: {
    _seo: seoSection({
      title: "Meet Steward, Your Personal Stewardship Guide",
      description:
        "Steward is a personal guide built around the Stewardship Blueprint: reflect, build your Personal Blueprint, decide with clarity, and return to it as life changes. You approve everything that is saved.",
    }),
    hero,
    helps,
    demo,
    control,
    access,
  },
});

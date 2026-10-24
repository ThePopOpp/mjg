// /mission (mission.dc.html). Reach goals are written as hope, not as outcomes.

import { defineScope, defineSection, type ContentField, type Cta } from "../kit";
import { f, seoSection } from "./shared";

type Hero = { eyebrow: string; title: string; lead: string; body: string; primaryCta: Cta };

const hero = defineSection<Hero>({
  key: "hero",
  label: "Hero",
  fields: [f.eyebrow(), f.title(), f.lead(), f.body(), f.cta("primaryCta", "Button")],
  defaults: {
    eyebrow: "Mission & Vision",
    title: "Using God-Given Resources for God-Given Purposes.",
    lead: "My mission is to encourage and inspire people to use their God-given resources for God-given purposes.",
    body: "Those resources include far more than money. They include time, relationships, health, talents, attention, opportunity, energy, influence, and everything else we have been entrusted to steward.",
    primaryCta: { label: "Explore the Stewardship Blueprint", href: "/stewardship-blueprint" },
  },
});

type Compare = { title: string; text: string };
type Why = { eyebrow: string; title: string; body: string; scoreboard: Compare; purpose: Compare };

const compareFields: ContentField[] = [f.text("title", "Title", 60), f.text("text", "Text", 200)];

const why = defineSection<Why>({
  key: "why",
  label: "Why It Exists",
  fields: [
    f.eyebrow(),
    f.title(),
    f.body(),
    { key: "scoreboard", label: "Left card (the visible scoreboard)", kind: "group", fields: compareFields },
    { key: "purpose", label: "Right card (what a life is for)", kind: "group", fields: compareFields },
  ],
  defaults: {
    eyebrow: "Why It Exists",
    title: "A Better Way to Measure a Meaningful Life.",
    body: "Our culture offers visible scoreboards: income, career growth, possessions, recognition, influence, and busyness. Some of those things may be good, but none is big enough to tell us what our lives are for.\n\nThe Stewardship Blueprint exists to help people move from drift toward faithful living by connecting belief to daily choices and long-term direction.",
    scoreboard: { title: "The visible scoreboard", text: "Income · Career growth · Possessions · Recognition · Influence · Busyness" },
    purpose: { title: "What a life is for", text: "Belief connected to daily choices and long-term direction." },
  },
});

type Conviction = { id: string; title: string; body: string };
type Convictions = { eyebrow: string; title: string; items: Conviction[]; cta: Cta };

const convictions = defineSection<Convictions>({
  key: "convictions",
  label: "Our Convictions",
  fields: [
    f.eyebrow(),
    f.title(),
    f.list("items", "Convictions", [{ key: "title", label: "Title", kind: "text", required: true, maxLength: 60 }, f.text("body", "Line", 240)], 9, "Conviction"),
    f.cta("cta", "Button"),
  ],
  defaults: {
    eyebrow: "Our Convictions",
    title: "What Guides This Work.",
    items: [
      { id: "faith", title: "Faith Is the Bedrock", body: "Identity is received from God, not earned through performance." },
      { id: "purpose", title: "Purpose Gives Direction", body: "Mission and values help the important govern the urgent." },
      { id: "whole-life", title: "Whole-Life Stewardship Matters", body: "Relationships, health, joy, money, and energy influence one another." },
      { id: "action", title: "Practical Action Matters", body: "Insight should result in habits, guardrails, decisions, and honest conversations." },
      { id: "community", title: "Community Strengthens Faithfulness", body: "We grow through relationships, accountability, and service." },
      { id: "legacy", title: "Legacy Begins While We Live", body: "Impact multiplies as we teach, encourage, equip, and help others live generously and pass it on." },
    ],
    cta: { label: "Start Your Journey", href: "/start" },
  },
});

type Vision = { eyebrow: string; title: string; body: string; primaryCta: Cta; secondaryCta: Cta; reach: string };

const vision = defineSection<Vision>({
  key: "vision",
  label: "Our Vision",
  fields: [
    f.eyebrow(),
    f.title(),
    f.body("Body", "State reach goals as hope, never as outcomes already achieved."),
    f.cta("primaryCta", "Primary button"),
    f.cta("secondaryCta", "Secondary button"),
    { key: "reach", label: "Where impact grows (one per line)", kind: "textarea", maxLength: 300 },
  ],
  defaults: {
    eyebrow: "Our Vision",
    title: "Impact Worth Multiplying.",
    body: "I hope the Stewardship Blueprint encourages tens of thousands of people to live more intentionally and multiply generosity and faithful influence through their families, churches, communities, workplaces, and relationships.\n\nThe goal is not to measure a person’s worth by a score, gift amount, follower count, or platform adoption. It is to encourage faithful action and let impact grow through people.",
    primaryCta: { label: "Learn With Others", href: "/studies" },
    secondaryCta: { label: "Join the Journey", href: "/join" },
    reach: "Families\nChurches\nCommunities\nWorkplaces\nRelationships",
  },
});

type Welcome = { eyebrow: string; title: string; body: string; closing: string };

const welcome = defineSection<Welcome>({
  key: "welcome",
  label: "Welcome",
  fields: [f.eyebrow(), f.title(), f.body(), f.text("closing", "Closing line", 160)],
  defaults: {
    eyebrow: "Welcome",
    title: "Faith-Rooted, People-Welcoming.",
    body: "This work is explicitly shaped by Christian faith, and we will not hide that foundation. At the same time, honest reflection and thoughtful next steps are available to people at different points in their spiritual journey.",
    closing: "No one has to pretend to have all the answers to begin.",
  },
});

export const pageMission = defineScope({
  key: "page:mission",
  label: "Mission & Vision",
  path: "/mission",
  sections: {
    _seo: seoSection({
      title: "Mission & Vision",
      description:
        "Encouraging and inspiring people to use their God-given resources — time, relationships, health, talents, money and influence — for God-given purposes.",
    }),
    hero,
    why,
    convictions,
    vision,
    welcome,
  },
});

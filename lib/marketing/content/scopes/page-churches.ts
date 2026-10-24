// /churches — For Churches & Groups (churches.dc.html). Nothing here may present
// an unbuilt track (women's, couples) or a full church-wide campaign as available.

import { defineScope, defineSection, type Cta, type MediaValue } from "../kit";
import { f, photo, seoSection } from "./shared";

type Hero = { eyebrow: string; title: string; body: string; primaryCta: Cta; secondaryCta: Cta; image: MediaValue };

const hero = defineSection<Hero>({
  key: "hero",
  label: "Hero",
  fields: [f.eyebrow(), f.title(), f.body(), f.cta("primaryCta", "Primary button", true), f.cta("secondaryCta", "Secondary button"), f.media("image", "Image")],
  defaults: {
    eyebrow: "For Churches & Groups",
    title: "Help People Build Lives of Faithful Stewardship.",
    body: "Churches help people form the faith, relationships, practices, and character that shape daily life. The Stewardship Blueprint offers a practical framework for connecting that formation to the realities people face all week long.\n\nOur studies and resources help participants examine their lives, identify drift, build wise boundaries, renew rhythms, and take meaningful next steps in community.",
    primaryCta: { label: "Explore Current Studies", href: "/studies" },
    secondaryCta: { label: "Ask About a Church Experience", href: "/contact?topic=church" },
    image: photo("/marketing/stock/group-gathering.jpg", "A small group in conversation around a table", "Photo: Small Group Network / Unsplash"),
  },
});

type Explore = { eyebrow: string; title: string; body: string; link: Cta; themes: { id: string; label: string }[] };

const explore = defineSection<Explore>({
  key: "explore",
  label: "What Groups Explore",
  fields: [
    f.eyebrow(),
    f.title(),
    f.body(),
    f.cta("link", "Link"),
    f.list("themes", "Themes", [{ key: "label", label: "Theme", kind: "text", required: true, maxLength: 60 }], 12, "Theme"),
  ],
  defaults: {
    eyebrow: "What Groups Explore",
    title: "Whole-Life Stewardship, Not Simply a Money Study.",
    body: "Faith and identity; mission and values; relationships; health and joy; finances as one entrusted tool; boundaries and habits; energy; and the legacy being multiplied through people now.\n\nParticipants are invited to move from hearing information to reflecting honestly, talking with trusted people, and practicing what they learn.",
    link: { label: "Explore the Framework →", href: "/stewardship-blueprint" },
    themes: [
      { id: "faith", label: "Faith & identity" },
      { id: "mission", label: "Mission & values" },
      { id: "relationships", label: "Relationships" },
      { id: "health", label: "Health & joy" },
      { id: "finances", label: "Finances as one entrusted tool" },
      { id: "boundaries", label: "Boundaries & habits" },
      { id: "energy", label: "Energy" },
      { id: "legacy", label: "Legacy multiplied through people now" },
    ],
  },
});

type Option = { id: string; title: string; body: string; status: string; statusTone: string };
type Options = { eyebrow: string; title: string; options: Option[]; primaryCta: Cta; secondaryCta: Cta };

const options = defineSection<Options>({
  key: "options",
  label: "Experience Options",
  fields: [
    f.eyebrow(),
    f.title(),
    f.list(
      "options",
      "Options",
      [
        { key: "title", label: "Title", kind: "text", required: true, maxLength: 80 },
        f.textarea("body", "Description", 300),
        f.text("status", "Status label", 30),
        {
          key: "statusTone",
          label: "Status colour",
          kind: "select",
          options: [
            { value: "live", label: "Live (green)" },
            { value: "soon", label: "Upcoming / plan with us (gold)" },
            { value: "future", label: "Neutral (grey)" },
          ],
        },
      ],
      8,
      "Option",
    ),
    f.cta("primaryCta", "Primary button"),
    f.cta("secondaryCta", "Secondary button"),
  ],
  defaults: {
    eyebrow: "Experience Options",
    title: "Choose a Setting That Fits Your Community.",
    options: [
      { id: "small-group", title: "Small Group Studies", body: "Guided discussion and weekly action supported by Participant and Leader Guides.", status: "Available", statusTone: "live" },
      { id: "mens", title: "Men’s Ministry Experience", body: "The existing six-week men’s challenge, with videos and practical group materials.", status: "Live", statusTone: "live" },
      {
        id: "church-wide",
        title: "Leadership or Church-Wide Pathways",
        body: "Potential expansions to plan with ministry leaders based on availability and readiness.",
        status: "Plan with us",
        statusTone: "soon",
      },
      {
        id: "personal",
        title: "Personal Reflection",
        body: "The free Check-In can support an individual starting point before or alongside a group.",
        status: "Free",
        statusTone: "future",
      },
    ],
    primaryCta: { label: "Lead a Group", href: "/lead-a-group" },
    secondaryCta: { label: "Explore the Six-Week Challenge", href: "/6-week-challenge" },
  },
});

type Receive = { eyebrow: string; title: string; body: string; primaryCta: Cta; secondaryCta: Cta; items: { id: string; label: string }[] };

const receive = defineSection<Receive>({
  key: "receive",
  label: "What Leaders Receive",
  fields: [
    f.eyebrow(),
    f.title(),
    f.body(),
    f.cta("primaryCta", "Primary button"),
    f.cta("secondaryCta", "Secondary button"),
    f.list("items", "Checklist", [{ key: "label", label: "Item", kind: "text", required: true, maxLength: 80 }], 10, "Item"),
  ],
  defaults: {
    eyebrow: "What Leaders Receive",
    title: "Support That Simplifies Facilitation.",
    body: "Where available, leaders can access session outlines, participant materials, short teaching videos, discussion questions, and group setup guidance.\n\nThe leader’s role is to foster honest conversation and help people choose real next steps—not to have all the answers.",
    primaryCta: { label: "Explore Leader Resources", href: "/lead-a-group" },
    secondaryCta: { label: "Contact Our Team", href: "/contact?topic=church" },
    items: [
      { id: "outlines", label: "Session outlines" },
      { id: "materials", label: "Participant materials" },
      { id: "videos", label: "Short teaching videos" },
      { id: "questions", label: "Discussion questions" },
      { id: "setup", label: "Group setup guidance" },
    ],
  },
});

type NextStep = { eyebrow: string; title: string; body: string; primaryCta: Cta };

const nextStep = defineSection<NextStep>({
  key: "nextStep",
  label: "Next Step",
  fields: [f.eyebrow(), f.title(), f.body(), f.cta("primaryCta", "Button", true)],
  defaults: {
    eyebrow: "Next Step",
    title: "Let’s Talk About Your Community.",
    body: "Tell us a little about your church or group, the audience you hope to serve, and the timing you are considering. We can discuss which current resources fit and which ideas belong to a future season.",
    primaryCta: { label: "Church / Group Inquiry →", href: "/contact?topic=church" },
  },
});

export const pageChurches = defineScope({
  key: "page:churches",
  label: "For Churches & Groups",
  path: "/churches",
  sections: {
    _seo: seoSection({
      title: "For Churches & Groups",
      description:
        "Whole-life stewardship studies for churches and small groups: faith, relationships, health, finances, boundaries, habits, energy, and legacy — with leader support that simplifies facilitation.",
    }),
    hero,
    explore,
    options,
    receive,
    nextStep,
  },
});

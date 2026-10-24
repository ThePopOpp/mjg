// /assessments (assessments.dc.html) and the redesigned /created-for-more-check-in
// (created-for-more-check-in.dc.html — the scoring tool itself is unchanged).

import { defineScope, defineSection, type ContentField, type Cta, type MediaValue } from "../kit";
import { f, photo, seoSection } from "./shared";

// ══ /assessments ═════════════════════════════════════════════════════════════

type Hero = { eyebrow: string; title: string; body: string; primaryCta: Cta };

const hero = defineSection<Hero>({
  key: "hero",
  label: "Hero",
  fields: [f.eyebrow(), f.title(), f.body(), f.cta("primaryCta", "Button", true)],
  defaults: {
    eyebrow: "Assessments & Check-Ins",
    title: "Clarity Begins with Honest Reflection.",
    body: "You cannot steward what you refuse to examine. Our assessments help you pause, notice what is working, and see what may need greater attention.\n\nEach tool focuses on a different part of the Stewardship Blueprint. Begin with the broad view, then explore a specific area when it is useful.",
    primaryCta: { label: "Begin Created for More", href: "/created-for-more-check-in" },
  },
});

type Assessment = { label: string; status: string; statusTone: string; title: string; body: string; facts: string; cta: Cta; image: MediaValue };

const assessmentFields: ContentField[] = [
  f.text("label", "Label", 40),
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
  f.textarea("body", "Description", 800),
  { key: "facts", label: "Facts (one per line)", kind: "textarea", maxLength: 200 },
  f.cta("cta", "Button"),
  f.media("image", "Image"),
];

const checkIn = defineSection<Assessment>({
  key: "checkIn",
  label: "Assessment 1 · Created for More",
  fields: assessmentFields,
  defaults: {
    label: "Assessment 1",
    status: "Live · Free",
    statusTone: "live",
    title: "Created for More Check-In",
    body: "A free, approximately fifteen-minute, 28-question reflection across seven Blueprint layers. It helps you see current alignment and drift and choose a next step.",
    facts: "~15 min\n28 questions\n7 layers",
    cta: { label: "Take the Check-In", href: "/created-for-more-check-in" },
    // The card shows the live animated Check-In rather than an image.
    image: { src: "", alt: "" },
  },
});

const energy = defineSection<Assessment>({
  key: "energy",
  label: "Assessment 2 · Energy Audit",
  fields: assessmentFields,
  defaults: {
    label: "Assessment 2",
    status: "Free",
    statusTone: "live",
    title: "The Energy Audit",
    body: "Energy fuels the life you are building. The Energy Audit examines your physical, emotional, mental, and spiritual capacity, helping you identify a drain to reduce and a rhythm of renewal to protect.\n\nUse this as a deeper follow-up when energy, pace, recovery, or presence becomes your focus.",
    facts: "4 energies\n20 statements",
    cta: { label: "Explore Energy Audit", href: "/stewardship-blueprint/energy-audit" },
    image: photo("/marketing/stock/sunrise-path.jpg", "A path through a green field toward the rising sun", "Photo: Shai Pal / Unsplash"),
  },
});

const values = defineSection<Assessment>({
  key: "values",
  label: "Assessment 3 · Values",
  fields: assessmentFields,
  defaults: {
    label: "Assessment 3",
    status: "Upcoming",
    statusTone: "soon",
    title: "Values Assessment",
    body: "Values guide the decisions that ultimately shape a life. This upcoming experience will help you identify what you want to stand for and where daily choices may be disconnected from those convictions.",
    facts: "",
    cta: { label: "Notify Me When Available", href: "/join" },
    image: { src: "", alt: "" },
  },
});

type Next = { eyebrow: string; title: string; body: string; steps: { id: string; text: string }[] };

const next = defineSection<Next>({
  key: "next",
  label: "What Happens Next",
  fields: [f.eyebrow(), f.title(), f.body(), f.list("steps", "Steps", [{ key: "text", label: "Text", kind: "text", required: true, maxLength: 80 }], 4, "Step")],
  defaults: {
    eyebrow: "What Happens Next",
    title: "From a Score to an Action.",
    body: "Your score is a reflection tool, not a measure of your worth or spiritual maturity. After each assessment, pause over what surprised you, choose an area to explore, and take one small action.\n\nWhen you use Steward or participate in a study, your approved reflections should be reusable with your permission where the system supports it—so you do not have to keep starting over.",
    steps: [
      { id: "pause", text: "Pause over what surprised you" },
      { id: "choose", text: "Choose an area to explore" },
      { id: "act", text: "Take one small action" },
    ],
  },
});

export const pageAssessments = defineScope({
  key: "page:assessments",
  label: "Assessments & Check-Ins",
  path: "/assessments",
  sections: {
    _seo: seoSection({
      title: "Assessments & Check-Ins",
      description:
        "Free reflection tools built on the Stewardship Blueprint: the Created for More Check-In and the Energy Audit. See what is working, notice drift, and choose one next step.",
    }),
    hero,
    checkIn,
    energy,
    values,
    next,
  },
});

// ══ /created-for-more-check-in ═══════════════════════════════════════════════

type CiHero = {
  eyebrow: string;
  title: string;
  subtitle: string;
  learnMoreLabel: string;
  body: string;
  guideLabel: string;
  guideTitle: string;
  guideBody: string;
};

const ciHero = defineSection<CiHero>({
  key: "hero",
  label: "Hero",
  fields: [
    f.eyebrow(),
    f.title(),
    { key: "subtitle", label: "Subtitle", kind: "text", maxLength: 160 },
    f.text("learnMoreLabel", "Learn more button", 30),
    f.body(
      "Learn more (dialog text)",
      "Shown in the dialog, not on the page. Blank line = new paragraph; **bold**, *italic*, and a paragraph starting with > is a pull-quote.",
    ),
    f.text("guideLabel", "Guide button", 30),
    f.text("guideTitle", "Guide dialog title", 80),
    { key: "guideBody", label: "Guide dialog text", kind: "textarea", maxLength: 1500, help: "The 1–5 rating scale is shown below it automatically." },
  ],
  defaults: {
    eyebrow: "Free · About 15 Minutes",
    title: "Created for More Check-In",
    subtitle: "What kind of life are you actually building?",
    learnMoreLabel: "Learn more",
    guideLabel: "Check-In Form 101",
    guideTitle: "How to use this Check-In",
    guideBody:
      "Set aside about 15 quiet minutes. For each statement, rate yourself from 1 to 5 based on what is actually true, not what you wish were true. A lower score is not a reason for shame — it is an invitation to notice what needs attention next.\n\nThe Check-In moves through seven steps, one layer of the Blueprint at a time. When you finish a layer you move on to the next automatically, and you can go back to change an answer at any point.",
    body: "You were created for more than simply getting through the week, meeting expectations, and checking off the next task. But even when we know what matters most, it is remarkably easy for life to drift.\n\nThe Created for More Check-In is a 28-question whole-life reflection tool designed to help you slow down long enough to see where your life is aligned with what matters most, where you may be drifting, and what deserves your attention next.\n\nIt is built around **The Stewardship Blueprint** — a framework for intentionally building a life around what God has entrusted to you and what He has called you toward.\n\nAnd when we talk about stewardship, we mean much more than money.\n\nWe are called to steward our faith, our relationships, our bodies, our time, our abilities, our resources, our energy, our influence, and ultimately the legacy our lives are creating.\n\n> The goal isn’t a perfect score. It’s greater awareness.\n\nThis isn’t a pass/fail test, and it isn’t about comparing your life to someone else’s. Think of it as a mirror and a map. A mirror helps you honestly see where you are today. A map helps you determine where you want to go next.\n\nYour answers will help you look across seven interconnected areas of your life — from your faith and identity at the bedrock to the legacy your life is ultimately producing.",
  },
});

type After = { eyebrow: string; title: string; body: string; primaryCta: Cta; secondaryCta: Cta; tertiaryCta: Cta; layersLabel: string; layersNote: string };

const after = defineSection<After>({
  key: "after",
  label: "After Results",
  fields: [
    f.eyebrow(),
    f.title(),
    f.body(),
    f.cta("primaryCta", "Primary button"),
    f.cta("secondaryCta", "Second button"),
    f.cta("tertiaryCta", "Third button"),
    f.text("layersLabel", "Layers card heading", 80),
    f.textarea("layersNote", "Layers card note", 300),
  ],
  defaults: {
    eyebrow: "After Results",
    title: "Your Score Is a Starting Point.",
    body: "Look at the area that needs your attention, but do not ignore the areas worth protecting.\n\nWhat surprised you? What matters most in this season? What small and realistic step could you take this week?\n\nYou can explore the related Blueprint layer, continue with a study, or begin creating a more personal plan.",
    primaryCta: { label: "Explore the Framework", href: "/stewardship-blueprint" },
    secondaryCta: { label: "Build a Personal Blueprint", href: "/personal-blueprint" },
    tertiaryCta: { label: "Explore Related Resources", href: "/resources" },
    layersLabel: "What your results cover",
    layersNote: "Your results show a score for each layer, the area that deserves attention, and the area worth protecting.",
  },
});

type Privacy = { eyebrow: string; title: string; body: string; link: Cta };

const privacy = defineSection<Privacy>({
  key: "privacy",
  label: "Privacy",
  fields: [f.eyebrow(), f.title(), f.body(), f.cta("link", "Link")],
  defaults: {
    eyebrow: "Privacy & Position",
    title: "Your Reflection Belongs to You.",
    body: "The Check-In is intended to support personal reflection and planning. We tell you plainly what is saved, what is optional, who can access it, and how to review or delete your information.",
    link: { label: "Privacy Policy →", href: "/privacy" },
  },
});

export const pageCheckIn = defineScope({
  key: "page:created-for-more-check-in",
  label: "Created for More Check-In",
  path: "/created-for-more-check-in",
  sections: {
    _seo: seoSection({
      title: "Created for More Check-In",
      description:
        "A free, fifteen-minute reflection across seven layers of the Stewardship Blueprint. See where your life is aligned, where drift may be emerging, and what deserves attention next.",
    }),
    hero: ciHero,
    after,
    privacy,
  },
});

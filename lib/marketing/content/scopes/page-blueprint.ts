// The Blueprint pages: /stewardship-blueprint (stewardship-blueprint.dc.html)
// and /personal-blueprint (personal-blueprint.dc.html).

import { defineScope, defineSection, type ContentField, type Cta, type MediaValue } from "../kit";
import { f, photo, seoSection } from "./shared";

const stepFields: ContentField[] = [
  f.text("label", "Label", 40),
  { key: "text", label: "Text", kind: "text", required: true, maxLength: 120 },
  { key: "highlight", label: "Highlight this step", kind: "boolean" },
];

// ══ /stewardship-blueprint ═══════════════════════════════════════════════════

type FrameworkHero = { eyebrow: string; title: string; body: string; primaryCta: Cta };

const frameworkHero = defineSection<FrameworkHero>({
  key: "hero",
  label: "Hero",
  fields: [f.eyebrow(), f.title(), f.body(), f.cta("primaryCta", "Button", true)],
  defaults: {
    eyebrow: "The Framework",
    title: "One Framework. Your Whole Life.",
    body: "You are building a life, whether you have designed it or not. The Stewardship Blueprint helps you see the entire structure and bring your daily choices into alignment with what matters most.\n\nIt begins with an important belief: our lives are not merely ours to use. They are entrusted to us to steward faithfully.",
    primaryCta: { label: "Take the Free Check-In", href: "/created-for-more-check-in" },
  },
});

type Building = { eyebrow: string; title: string; body: string; primaryCta: Cta; secondaryCta: Cta };

const building = defineSection<Building>({
  key: "building",
  label: "The Building (layer cards)",
  fields: [
    f.eyebrow(),
    f.title(),
    f.body("Intro (optional)", "The seven layer cards come from the shared Framework content."),
    f.cta("primaryCta", "Primary button"),
    f.cta("secondaryCta", "Secondary button"),
  ],
  defaults: {
    eyebrow: "The Building",
    title: "See How the Layers Work Together.",
    body: "",
    primaryCta: { label: "See the Assessments", href: "/assessments" },
    secondaryCta: { label: "Explore Studies", href: "/studies" },
  },
});

type Step = { id: string; label: string; text: string; highlight: boolean };
type HowToUse = { eyebrow: string; title: string; body: string; primaryCta: Cta; secondaryCta: Cta; steps: Step[] };

const howToUse = defineSection<HowToUse>({
  key: "howToUse",
  label: "How to Use It",
  fields: [f.eyebrow(), f.title(), f.body(), f.cta("primaryCta", "Primary button"), f.cta("secondaryCta", "Secondary button"), f.list("steps", "Steps", stepFields, 5, "Step")],
  defaults: {
    eyebrow: "How to Use It",
    title: "Your Blueprint Changes With Your Season.",
    body: "The Stewardship Blueprint is not a demand for perfect balance. Some seasons require more attention to family, others to health, resources, service, or rest. The point is to notice what is truly entrusted to you and avoid leaving important areas unattended indefinitely.\n\nBegin by examining what is true now. Then choose one important next step. As your season changes, return to the framework and refine the decisions you are making.",
    primaryCta: { label: "Start Your Journey", href: "/start" },
    secondaryCta: { label: "Build Your Personal Blueprint", href: "/personal-blueprint" },
    steps: [
      { id: "now", label: "Now", text: "Examine what is true", highlight: false },
      { id: "next", label: "Next", text: "Choose one important step", highlight: true },
      { id: "season", label: "New season", text: "Return and refine", highlight: false },
    ],
  },
});

type Faith = { eyebrow: string; title: string; body: string; link: Cta };

const faith = defineSection<Faith>({
  key: "faith",
  label: "Faith & Welcome",
  fields: [f.eyebrow(), f.title(), f.body(), f.cta("link", "Link")],
  defaults: {
    eyebrow: "Faith & Welcome",
    title: "Rooted in Faith. Open to Honest Questions.",
    body: "The framework reflects a Christian understanding of life as a gift entrusted by God. You do not need to have everything figured out—or every belief settled—to begin reflecting on the kind of life you are building.\n\nWe will be clear about the convictions that shape this work and respectful of where each visitor is beginning.",
    link: { label: "About the Mission →", href: "/mission" },
  },
});

export const pageStewardshipBlueprint = defineScope({
  key: "page:stewardship-blueprint",
  label: "The Stewardship Blueprint",
  path: "/stewardship-blueprint",
  sections: {
    _seo: seoSection({
      title: "The Stewardship Blueprint",
      description:
        "One framework for your whole life: faith and identity, mission and values, family, fitness, fun and finances, guardrails, keystone habits, energy, and legacy — seven layers that work together.",
    }),
    hero: frameworkHero,
    building,
    howToUse,
    faith,
  },
});

// ══ /personal-blueprint ══════════════════════════════════════════════════════

type PbHero = { eyebrow: string; title: string; body: string; primaryCta: Cta; secondaryCta: Cta; image: MediaValue; secondImage: MediaValue };

const pbHero = defineSection<PbHero>({
  key: "hero",
  label: "Hero",
  fields: [
    f.eyebrow(),
    f.title(),
    f.body(),
    f.cta("primaryCta", "Primary button", true),
    f.cta("secondaryCta", "Secondary button"),
    f.media("image", "Large image"),
    f.media("secondImage", "Small image"),
  ],
  defaults: {
    eyebrow: "Your Personal Stewardship Blueprint",
    title: "Make the Life You’re Building Visible.",
    body: "You may have financial plans, calendars, work goals, and lists of things to accomplish. But do they point toward one clear picture of the life you want to build?\n\nA Personal Stewardship Blueprint captures the commitments, priorities, relationships, and rhythms that matter in this season so you can use them to guide real decisions.",
    primaryCta: { label: "See a Sample Blueprint", href: "#sample" },
    secondaryCta: { label: "Explore How to Begin", href: "/start" },
    image: photo("/marketing/stock/blueprint-journal.jpg", "Someone writing in a journal beside a cup of coffee", "Photo: Cathryn Lavery / Unsplash"),
    secondImage: photo("/marketing/stock/family-walk.jpg", "A family walking hand in hand down a sunlit path", "Photo: Seljan Salim / Unsplash"),
  },
});

type Includes = { eyebrow: string; title: string; body: string; link: Cta; pagesLabel: string; galleryLabel: string };

const includes = defineSection<Includes>({
  key: "includes",
  label: "What It Includes",
  fields: [
    f.eyebrow(),
    f.title(),
    f.body(),
    f.cta("link", "Link"),
    f.text("pagesLabel", "Page list heading", 60),
    f.text("galleryLabel", "Sample pages heading", 60),
  ],
  defaults: {
    eyebrow: "What It Includes",
    title: "A Living Guide, Not Just Another Document.",
    body: "Your Blueprint can bring together your faith and identity; your mission, values, and purpose; the person you are becoming; Family, Fitness, Fun, and Finances; financial direction; guardrails; drift signals; accountability; keystone habits; energy; and the legacy your life is multiplying through others.\n\nThe standard Personal Blueprint structure includes a cover and twelve supporting pages. Each section helps answer a practical question: *What should I remember, protect, decide, practice, or revisit?*\n\nIt should be personal enough to recognize yourself and usable enough to open on a difficult Tuesday.",
    link: { label: "Explore the Framework →", href: "/stewardship-blueprint" },
    pagesLabel: "The thirteen pages",
    galleryLabel: "A look inside",
  },
});

type ProcessStep = { id: string; title: string; body: string };
type Process = { eyebrow: string; title: string; steps: ProcessStep[]; primaryCta: Cta; secondaryCta: Cta };

const process = defineSection<Process>({
  key: "process",
  label: "Building Process",
  fields: [
    f.eyebrow(),
    f.title(),
    f.list(
      "steps",
      "Steps",
      [
        { key: "title", label: "Title", kind: "text", required: true, maxLength: 60 },
        f.textarea("body", "Description", 300),
      ],
      6,
      "Step",
    ),
    f.cta("primaryCta", "Primary button"),
    f.cta("secondaryCta", "Secondary button"),
  ],
  defaults: {
    eyebrow: "Building Process",
    title: "Notice. Clarify. Build. Live. Revisit.",
    steps: [
      { id: "notice", title: "Start with Awareness", body: "Take the Created for More Check-In or reflect on a current area of drift." },
      { id: "clarify", title: "Clarify What Matters", body: "Identify the convictions, people, responsibilities, and priorities that need to guide this season." },
      { id: "build", title: "Build the Plan", body: "Capture meaningful statements, boundaries, habits, and next steps rather than generic aspirations." },
      { id: "live", title: "Put It Into Life", body: "Let your calendar, conversations, and decisions reflect what you have written." },
      { id: "revisit", title: "Revisit & Refine", body: "Your identity and enduring mission may remain steady while your calling, roles, and commitments change." },
    ],
    primaryCta: { label: "Begin with the Free Check-In", href: "/created-for-more-check-in" },
    secondaryCta: { label: "Meet Steward", href: "/meet-steward" },
  },
});

type PathOption = { title: string; body: string; pill: string };
type Path = { eyebrow: string; title: string; body: string; primaryCta: Cta; secondaryCta: Cta; free: PathOption; paid: PathOption };

const optionFields: ContentField[] = [f.text("title", "Title", 80), f.text("body", "Description", 200), f.text("pill", "Status label", 30)];

const path = defineSection<Path>({
  key: "path",
  label: "Choosing a Path",
  fields: [
    f.eyebrow(),
    f.title(),
    f.body(),
    f.cta("primaryCta", "Primary button"),
    f.cta("secondaryCta", "Secondary button"),
    { key: "free", label: "Free option", kind: "group", fields: optionFields },
    { key: "paid", label: "Paid option", kind: "group", fields: optionFields, help: "The starting price is read from the live catalogue, never typed here." },
  ],
  defaults: {
    eyebrow: "Choosing a Path",
    title: "Start Simply. Go Deeper When You’re Ready.",
    body: "You do not need to purchase a complete program to begin examining your life. The free Check-In creates a practical starting point.\n\nDeeper Blueprint-building options and ongoing Steward guidance may be available based on the current offering.",
    primaryCta: { label: "View Current Blueprint Options", href: "/steward/pricing" },
    secondaryCta: { label: "Start Here", href: "/start" },
    free: { title: "Free Check-In", body: "28 questions · seven layers · a practical starting point.", pill: "Live · Free" },
    paid: { title: "Personal Blueprint + Steward", body: "Full Blueprint build with ongoing guidance. See what is included and the current price at checkout.", pill: "Paid" },
  },
});

export const pagePersonalBlueprint = defineScope({
  key: "page:personal-blueprint",
  label: "Your Personal Blueprint",
  path: "/personal-blueprint",
  sections: {
    _seo: seoSection({
      title: "Your Personal Stewardship Blueprint",
      description:
        "A living guide that captures the commitments, priorities, relationships, and rhythms that matter in this season — so you can use them to guide real decisions.",
    }),
    hero: pbHero,
    includes,
    process,
    path,
  },
});

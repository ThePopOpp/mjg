// /the-life-youre-building — the book's landing page (the-life-youre-building.dc.html).

import { defineScope, defineSection, type Cta, type MediaValue } from "../kit";
import { f, photo, seoSection } from "./shared";

const BOOK_IMAGE: MediaValue = {
  ...photo("/marketing/brand/the-life-youre-building-book.webp", "The Life You’re Building, by Michael J. Gauthier"),
  fit: "contain",
};

// ── Hero ─────────────────────────────────────────────────────────────────────

type Hero = {
  eyebrow: string;
  title: string;
  subtitle: string;
  body: string;
  primaryCta: Cta;
  byline: string;
  cover: MediaValue;
  model: string;
};

const hero = defineSection<Hero>({
  key: "hero",
  label: "Hero",
  fields: [
    f.eyebrow(),
    f.title(),
    { key: "subtitle", label: "Subtitle", kind: "text", maxLength: 160 },
    f.body(),
    f.cta("primaryCta", "Waitlist button", true),
    f.text("byline", "Byline", 80),
    f.media("cover", "Book image", "Shown while the 3D book loads, and instead of it where 3D is unavailable."),
    { key: "model", label: "3D book (.glb)", kind: "url", help: "A .glb file; leave empty to show only the image." },
  ],
  defaults: {
    eyebrow: "The Book · Coming Soon",
    title: "The Life You’re Building",
    subtitle: "How to Stop Drifting and Design a Life That Matters",
    body: "What if you are working hard, achieving meaningful goals, and doing what responsible people do—but you have not stopped to ask whether you are building the right life?\n\nThis book invites you to look more closely at the life taking shape and discover what faithful, intentional stewardship can look like across every area of life.",
    primaryCta: { label: "Join the Book Waitlist", href: "/book-waitlist" },
    byline: "By Michael J. Gauthier",
    cover: BOOK_IMAGE,
    model: "/marketing/3d/the-life-youre-building.glb",
  },
});

// ── Inside the Book ──────────────────────────────────────────────────────────

type Part = { id: string; number: string; title: string; body: string };
type Inside = { eyebrow: string; title: string; body: string; link: Cta; partsLabel: string; parts: Part[] };

const inside = defineSection<Inside>({
  key: "inside",
  label: "Inside the Book",
  fields: [
    f.eyebrow(),
    f.title(),
    f.body(),
    f.cta("link", "Link"),
    f.text("partsLabel", "Parts list heading", 60),
    f.list(
      "parts",
      "Parts",
      [
        f.text("number", "Number", 6),
        { key: "title", label: "Title", kind: "text", required: true, maxLength: 80 },
        f.text("body", "One-line description", 200),
      ],
      10,
      "Part",
    ),
  ],
  defaults: {
    eyebrow: "Inside the Book",
    title: "A Journey from Drift to Design.",
    body: "The Life You’re Building begins with a wake-up call, introduces the Stewardship Blueprint, and helps readers evaluate relationships, health, joy, and finances; establish guardrails and habits; renew energy; rethink financial resources; and consider what their lives are multiplying through other people.\n\nEach chapter combines story, Christian faith, questions, and practical next steps. The book is written for ordinary people with full calendars—not only financial professionals or seasoned church leaders.",
    link: { label: "Explore the Framework →", href: "/stewardship-blueprint" },
    partsLabel: "The journey, in six parts",
    parts: [
      { id: "i", number: "I", title: "The Wake-Up Call", body: "Drift, the wrong scoreboard, and the life taking shape." },
      { id: "ii", number: "II", title: "The Stewardship Blueprint", body: "Bedrock, Foundation, and a whole-life structure." },
      { id: "iii", number: "III", title: "The Four Pillars", body: "Relationships, health, joy, and finances — connected." },
      { id: "iv", number: "IV", title: "Guardrails & Habits", body: "Pre-decided boundaries and rhythms that strengthen." },
      { id: "v", number: "V", title: "Energy & Resources", body: "Renewing capacity and rethinking what money is for." },
      { id: "vi", number: "VI", title: "Living Legacy", body: "What your life multiplies through other people now." },
    ],
  },
});

// ── Author note ──────────────────────────────────────────────────────────────

type Author = { eyebrow: string; title: string; body: string; photo: MediaValue; link: Cta };

const author = defineSection<Author>({
  key: "author",
  label: "Author note",
  fields: [f.eyebrow(), f.title(), f.body(), f.media("photo", "Portrait"), f.cta("link", "Link")],
  defaults: {
    eyebrow: "Author Note",
    title: "Why I Wrote It.",
    body: "For a long time I measured progress through achievement and ambition. The birth of my first child prompted a different question: *If everything I am chasing works, will it actually matter?*\n\nThe answer did not arrive in a day. It became a long journey of learning to see faith, relationships, purpose, money, time, and influence as connected responsibilities.\n\nI wrote this book to share the framework that continues to shape the life I am building.",
    photo: photo("/marketing/brand/michael-gauthier.webp", "Michael J. Gauthier"),
    link: { label: "Read My Story →", href: "/about" },
  },
});

// ── Go Deeper ────────────────────────────────────────────────────────────────

type Step = { id: string; title: string; body: string; href: string; image: MediaValue };
type Deeper = { eyebrow: string; title: string; body: string; steps: Step[]; primaryCta: Cta; secondaryCta: Cta; waitlistCta: Cta };

const deeper = defineSection<Deeper>({
  key: "deeper",
  label: "Go Deeper",
  fields: [
    f.eyebrow(),
    f.title(),
    f.body(),
    f.list(
      "steps",
      "Steps",
      [
        { key: "title", label: "Title", kind: "text", required: true, maxLength: 60 },
        f.text("body", "Line", 120),
        { key: "href", label: "Link", kind: "url" },
        f.media("image", "Image"),
      ],
      6,
      "Step",
    ),
    f.cta("primaryCta", "Primary button"),
    f.cta("secondaryCta", "Secondary button"),
    f.cta("waitlistCta", "Waitlist button"),
  ],
  defaults: {
    eyebrow: "Go Deeper",
    title: "Keep Building Beyond the Last Page.",
    body: "The book introduces the framework. The assessments help you see your current reality. Group experiences bring the conversation to life. Your Personal Blueprint and Steward help you make the work personal and ongoing.\n\nEach element is useful in its own right. Choose the next step that fits your season.",
    steps: [
      { id: "book", title: "Book", body: "Introduces the framework", href: "#inside", image: BOOK_IMAGE },
      {
        id: "assessments",
        title: "Assessments",
        body: "See your current reality",
        href: "/assessments",
        image: photo("/marketing/stock/reflection-journal.jpg", "Someone writing in a journal beside a coffee", "Photo: Prophsee Journals / Unsplash"),
      },
      {
        id: "groups",
        title: "Groups",
        body: "Bring the conversation to life",
        href: "/studies",
        image: photo("/marketing/stock/small-group.jpg", "A small group Bible study around a wooden table", "Photo: Nicolas Lobos / Unsplash"),
      },
      {
        id: "blueprint",
        title: "Blueprint + Steward",
        body: "Make it personal and ongoing",
        href: "/personal-blueprint",
        image: photo("/marketing/stock/writing-notebook.jpg", "A man writing his plans in a notebook", "Photo: Terrillo Walls / Unsplash"),
      },
    ],
    primaryCta: { label: "Explore Studies", href: "/studies" },
    secondaryCta: { label: "Build My Blueprint", href: "/personal-blueprint" },
    waitlistCta: { label: "Join the Waitlist", href: "/book-waitlist" },
  },
});

export const pageBook = defineScope({
  key: "page:the-life-youre-building",
  label: "The Life You’re Building (book)",
  path: "/the-life-youre-building",
  sections: {
    _seo: seoSection({
      title: "The Life You’re Building",
      description:
        "A forthcoming book by Michael J. Gauthier on how to stop drifting and design a life that matters — faith, relationships, health, money, and legacy as one stewardship. Join the waitlist.",
      ogImage: { src: "/marketing/brand/the-life-youre-building-book.webp", alt: "The Life You’re Building, by Michael J. Gauthier" },
    }),
    hero,
    inside,
    author,
    deeper,
  },
});

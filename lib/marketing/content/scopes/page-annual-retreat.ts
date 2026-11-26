// /annual-retreat and /annual-retreat/thank-you: the free Annual Stewardship
// Blueprint Retreat Guide (docs/squeeze-page/MJG_Annual_Retreat_Jeremy_Handoff/
// Email_to_Jeremy.txt §4 and §6). Copy defaults are Mike's, word for word, and
// editable here. The form wording that is recorded as consent lives in
// lib/annual-retreat/config.ts, so an edit here can never change what a person
// agreed to.

import { defineScope, defineSection, type MediaValue } from "../kit";
import { f, photo, seoSection } from "./shared";

type Hero = { eyebrow: string; title: string; body: string; button: string; image: MediaValue };

const hero = defineSection<Hero>({
  key: "hero",
  label: "Hero",
  fields: [f.eyebrow(), f.title(), f.body("Intro"), f.text("button", "Button", 40), f.media("image", "Photo")],
  defaults: {
    eyebrow: "Free Annual Stewardship Blueprint Retreat Guide",
    title: "Make space to reflect on the life you’re building.",
    body:
      "Set aside time with God to remember the season you have lived, examine where you are today, and consider what faithful stewardship looks like next.\n\nThis free, printable guide walks you through reflection, honest assessment, practical decisions, and a rhythm of review.",
    button: "Send Me the Free Guide",
    image: photo("/marketing/annual-retreat/grace-mug-fireplace-900.webp", "A black mug marked GRACE on a wooden table in front of a fireplace."),
  },
});

type Movements = { eyebrow: string; title: string; items: { id: string; title: string; body: string }[] };

const movements = defineSection<Movements>({
  key: "movements",
  label: "The four movements",
  fields: [
    f.eyebrow(),
    f.title(),
    f.list("items", "Movements", [f.text("title", "Name", 60), f.textarea("body", "Description", 300)], 4, "Movement"),
  ],
  defaults: {
    eyebrow: "How the Guide Works",
    title: "The four movements",
    items: [
      { id: "remember", title: "Remember & Release", body: "Reflect with gratitude, acknowledge what has been difficult, and consider what you are ready to release." },
      { id: "discern", title: "Discern & Diagnose", body: "Look honestly at your life and identify what needs restoration, strengthening, protection, or multiplication." },
      { id: "design", title: "Design & Decide", body: "Choose what matters in this season and turn that clarity into practical decisions." },
      { id: "live", title: "Live & Review", body: "Establish rhythms, protect your priorities, and create a regular opportunity to review and adjust." },
    ],
  },
});

type Inside = { eyebrow: string; title: string; items: string; pageCaption: string };

const inside = defineSection<Inside>({
  key: "inside",
  label: "What is inside",
  fields: [
    f.eyebrow(),
    f.title(),
    { key: "items", label: "What is inside (one per line)", kind: "textarea", maxLength: 1200 },
    f.text("pageCaption", "Caption under the guide pages", 160),
  ],
  defaults: {
    eyebrow: "The Guide",
    title: "What is inside",
    items:
      "Guided reflection and prayer prompts.\nQuestions to examine your current season through the Stewardship Blueprint.\nRestore, Build, Protect, and Multiply as possible responses in different areas of life.\nWorksheets for meaningful outcomes, supporting rhythms, and guardrails.\nA one-page Blueprint summary.\nPrompts to plan an ongoing review rhythm.",
    pageCaption: "Pages from the free guide.",
  },
});

type Faq = { eyebrow: string; title: string; items: { id: string; q: string; a: string }[] };

const faq = defineSection<Faq>({
  key: "faq",
  label: "FAQ",
  fields: [f.eyebrow(), f.title(), f.list("items", "Questions", [f.text("q", "Question", 160), f.textarea("a", "Answer", 600)], 10, "Question")],
  defaults: {
    eyebrow: "Questions",
    title: "Frequently asked questions",
    items: [
      { id: "free", q: "Is the guide free?", a: "Yes. The guide is free. A paid plan or Steward account is not required." },
      {
        id: "time",
        q: "How much time should I set aside?",
        a: "A single day can be meaningful. Multiple days allow more room for prayer, rest, reflection, and discernment. Work through the guide at a pace appropriate to your season.",
      },
      {
        id: "season",
        q: "Is this only for the end of the year?",
        a: "No. Use it for an annual retreat, a birthday, a transition, an important decision, or another time when you want to reflect.",
      },
      {
        id: "workbook",
        q: "Is this the exact personal workbook in Mike’s photos?",
        a: "The public guide follows the same retreat framework. Mike’s personal workbook includes information specific to his life and is separate from this download.",
      },
      { id: "emails", q: "Will I receive other emails?", a: "We will email the guide you request. Additional reflections and resources are optional and can be stopped at any time." },
    ],
  },
});

type Form = { emailLabel: string; nameLabel: string; note: string; sending: string };

const form = defineSection<Form>({
  key: "form",
  label: "Request form",
  fields: [f.text("emailLabel", "Email label", 60), f.text("nameLabel", "First name label", 60), f.textarea("note", "Line under the form", 300), f.text("sending", "Button while sending", 40)],
  defaults: {
    emailLabel: "Email address",
    nameLabel: "First name (optional)",
    note: "We’ll email you the guide. Additional emails are optional. See our Privacy Policy.",
    sending: "Sending…",
  },
});

type ThankYou = { title: string; body: string; button: string; emailSent: string; emailFailed: string };

const thankYou = defineSection<ThankYou>({
  key: "thankYou",
  label: "Thank-you page",
  fields: [f.title(), f.body(), f.text("button", "Button", 40), f.textarea("emailSent", "Email sent note", 300), f.textarea("emailFailed", "Email failed note", 400)],
  defaults: {
    title: "Your retreat guide is ready.",
    body:
      "Download your guide below. We’ll also email you a copy of the link so you can return to it later.\n\nBegin by choosing a time to reflect. Bring your Bible, a notebook, and a willingness to look honestly at the season you are in.",
    button: "Download My Free Guide",
    emailSent: "We’ve sent the link to your inbox as well. If it isn’t there in a few minutes, check your spam or promotions folder.",
    emailFailed: "We weren’t able to deliver the email just now, but your guide is ready to download here. You can bookmark this page or download the guide now.",
  },
});

export const pageAnnualRetreat = defineScope({
  key: "page:annual-retreat",
  label: "Annual Retreat Guide",
  path: "/annual-retreat",
  sections: {
    _seo: seoSection({
      title: "Free Annual Life Retreat Guide | Michael J. Gauthier",
      description:
        "Get a free Christian retreat guide to reflect with gratitude, understand your current season, make practical decisions, and establish a rhythm of review.",
      ogImage: photo("/marketing/annual-retreat/grace-mug-fireplace-900.webp", "A black mug marked GRACE on a wooden table in front of a fireplace."),
    }),
    hero,
    movements,
    inside,
    faq,
    form,
    thankYou,
  },
});

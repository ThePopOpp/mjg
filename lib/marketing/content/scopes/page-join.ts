// /join — Join the Journey (join.dc.html). The form itself (fields, consent,
// interests, thank-you) is the shared global:join-form content.

import { defineScope, defineSection } from "../kit";
import { f, seoSection } from "./shared";

type Intro = { eyebrow: string; title: string; body: string };

const intro = defineSection<Intro>({
  key: "intro",
  label: "Introduction",
  fields: [f.eyebrow(), f.title(), f.body()],
  defaults: {
    eyebrow: "Join the Journey",
    title: "Keep Building a Life That Matters.",
    body: "You do not need another crowded inbox. You need useful reminders to slow down, reflect, and act on what matters.\n\nJoin the Stewardship Blueprint journey for occasional insights, practical tools, book news, and study opportunities.",
  },
});

type Receive = { eyebrow: string; title: string; items: { id: string; text: string }[] };

const receive = defineSection<Receive>({
  key: "receive",
  label: "What You'll Receive",
  fields: [
    f.eyebrow(),
    f.title(),
    f.list("items", "Items", [{ key: "text", label: "Text", kind: "textarea", required: true, maxLength: 300 }], 6, "Item"),
  ],
  defaults: {
    eyebrow: "What You’ll Receive",
    title: "Thoughtful Resources, Not Constant Noise.",
    items: [
      { id: "reflections", text: "Reflections on faith, identity, family, health, joy, finances, habits, energy, and legacy." },
      { id: "tools", text: "Useful assessments, guides, and practical next steps." },
      { id: "updates", text: "Book updates and opportunities to participate in current or future studies and group experiences." },
    ],
  },
});

type FormCard = { eyebrow: string; title: string };

const formCard = defineSection<FormCard>({
  key: "formCard",
  label: "Form card",
  fields: [f.eyebrow(), f.title()],
  defaults: { eyebrow: "Signup", title: "Stay Connected." },
});

export const pageJoin = defineScope({
  key: "page:join",
  label: "Join the Journey",
  path: "/join",
  sections: {
    _seo: seoSection({
      title: "Join the Journey",
      description:
        "Occasional reflections, practical tools, book news, and study opportunities from the Stewardship Blueprint. No spam, ever.",
    }),
    intro,
    receive,
    formCard,
  },
});

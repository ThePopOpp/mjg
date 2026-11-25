// /leadership-check-in — The Leadership Check-In (kit §02, docs/assessments/
// Leadership_Check_In_Jeremy_Implementation_Kit.docx). The page copy is editable
// here; the 28 statements, scoring and results guidance are code
// (lib/leadership-check-in) so a copy edit can never change a score.
//
// Guardrails from the kit: no mention or promotion of Steward on the page, results or
// emails until Mike approves Phase 2 (the hand-off appears only when the
// leadership_check_in.steward switch is on); invite to the leadership study only once
// registration is available.

import { defineScope, defineSection, type Cta } from "../kit";
import { f, seoSection } from "./shared";

type Hero = { eyebrow: string; title: string; subtitle: string; body: string; facts: string; primaryCta: Cta; secondaryCta: Cta };

const hero = defineSection<Hero>({
  key: "hero",
  label: "Hero",
  fields: [
    f.eyebrow(),
    f.title(),
    f.text("subtitle", "Question under the title", 160),
    f.body(),
    { key: "facts", label: "Facts (one per line)", kind: "textarea", maxLength: 200 },
    f.cta("primaryCta", "Primary button", true),
    f.cta("secondaryCta", "Secondary button"),
  ],
  defaults: {
    eyebrow: "A Stewardship Blueprint Assessment",
    title: "The Leadership Check-In",
    subtitle: "Are you becoming the leader God is calling you to be?",
    body:
      "Business success can be measured in revenue, profitability, growth and enterprise value. But those numbers tell only part of the story. God has entrusted you with more than a business or leadership position. He has entrusted you with people, influence, opportunities, resources, relationships and responsibility.\n\nThe Leadership Check-In helps you reflect on how your faith, values and leadership decisions align with the life and organization you are building. Explore seven interconnected areas, recognize where professional success may be concealing drift, and discover Guardrails and Keystone Rhythms that can strengthen your leadership. Consider how you can multiply faith, wisdom and generosity through others.",
    facts: "28 statements\nApproximately 5–8 minutes\nComplimentary",
    primaryCta: { label: "Take the Leadership Check-In", href: "#check-in" },
    secondaryCta: { label: "Explore Stewardship Blueprint", href: "/stewardship-blueprint" },
  },
});

type Audience = { eyebrow: string; title: string; body: string; closing: string };

const audience = defineSection<Audience>({
  key: "audience",
  label: "Who it's for",
  fields: [f.eyebrow(), f.title(), f.body(), f.text("closing", "Closing line", 240)],
  defaults: {
    eyebrow: "Who It’s For",
    title: "For Anyone Entrusted with Influence.",
    body:
      "For business owners, entrepreneurs, executives, managers, ministry leaders and anyone entrusted with influence.\n\nThis is not a test of business success, leadership ability or spiritual maturity. It is an invitation to reflect honestly and identify your next faithful step.",
    closing: "Don’t simply build a successful organization. Become a faithful steward of what God has entrusted to you.",
  },
});

export const pageLeadershipCheckIn = defineScope({
  key: "page:leadership-check-in",
  label: "Leadership Check-In",
  path: "/leadership-check-in",
  sections: {
    _seo: seoSection({
      title: "The Leadership Check-In | Stewardship Blueprint",
      description:
        "Discover how your faith, values and leadership decisions align with the life and business you’re building. Take the complimentary Leadership Check-In.",
    }),
    hero,
    audience,
  },
});

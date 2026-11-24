// /speaking — Speaking & Podcasts (Mike's brief, docs/Podcasts/
// MJG_Speaking_and_Podcasts_Page_Brief_for_Jeremy.docx, 2026-11-23).
//
// A bookings page for podcast hosts, pastors and event organisers: hero, the
// Compass Christian Church interview, a short bio, topics, formats and the
// invitation form. Inquiries post to /api/public/speaking-inquiry and land in
// Dashboard → Emails → Form Submissions (form_type "speaking_inquiry").
//
// Editorial guardrails from the brief: never call The Life You're Building
// published or bestselling until it is; no invented testimonials, stages,
// audience numbers or fees; "Keystone Rhythms" (not Habits); Legacy is what a
// life multiplies through people now — estate plans support it, they don't
// define it.

import { defineScope, defineSection, type Cta, type MediaValue } from "../kit";
import { f, photo, seoSection } from "./shared";

type Hero = { eyebrow: string; title: string; body: string; primaryCta: Cta; secondaryCta: Cta };

const hero = defineSection<Hero>({
  key: "hero",
  label: "Hero",
  fields: [f.eyebrow(), f.title(), f.body(), f.cta("primaryCta", "Primary button"), f.cta("secondaryCta", "Secondary button")],
  defaults: {
    eyebrow: "Speaking & Podcasts",
    title: "Helping People Stop Drifting and Build a Life That Matters.",
    body: "I speak about the intersection of faith, purpose, leadership, family, money, generosity, and the everyday choices shaping the life we are building. Whether it is a podcast conversation, church gathering, or leadership event, my hope is to help people ask better questions, see what matters most, and take one faithful next step.",
    primaryCta: { label: "Invite Michael to Speak", href: "#invite" },
    secondaryCta: { label: "Watch the Conversation", href: "#watch" },
  },
});

type Video = { eyebrow: string; title: string; body: string; embed: string; poster: MediaValue; caption: string };

const video = defineSection<Video>({
  key: "video",
  label: "Featured video",
  fields: [
    f.eyebrow(),
    f.title(),
    f.body(),
    { key: "embed", label: "Video (Vimeo / YouTube link)", kind: "embed", help: "Plays only when clicked; never autoplays with sound." },
    f.media("poster", "Poster image", "Shown until the visitor presses play. 16:9."),
    f.text("caption", "Caption under the video", 160),
  ],
  defaults: {
    eyebrow: "Featured Conversation",
    title: "A Conversation About Faith, Business, and What Matters Most",
    body: "In this conversation with Compass Christian Church, I share how my faith began reshaping the way I approached business, generosity, and the decisions in front of me. It is a glimpse into the stories and practical convictions I bring to speaking and podcast conversations.",
    embed: "https://vimeo.com/1249504456",
    poster: photo("/marketing/speaking/compass-interview-poster.jpg", "Michael J. Gauthier speaking in an interview with Compass Christian Church"),
    caption: "With Compass Christian Church · 3:37",
  },
});

type Bio = { eyebrow: string; title: string; body: string; photo: MediaValue; shortBioLabel: string; shortBio: string };

const bio = defineSection<Bio>({
  key: "bio",
  label: "About Michael",
  fields: [
    f.eyebrow(),
    f.title(),
    f.body(),
    f.media("photo", "Photo"),
    f.text("shortBioLabel", "Short bio heading", 60),
    f.textarea("shortBio", "Short bio (for podcast hosts)", 800),
  ],
  defaults: {
    eyebrow: "About Michael",
    title: "A Practical Voice at the Intersection of Faith, Life, and Leadership.",
    body: "Michael J. Gauthier, CFP®, is the founder of Strategic Income Group and creator of the Stewardship Blueprint, a faith-rooted, whole-life framework for building a life that matters. Drawing on more than two decades in financial planning, business leadership, family life, and Christian stewardship, Michael challenges people to look beyond traditional measures of success and consider how they are using what has been entrusted to them.\n\nHe is the author of *Truth in Financial Planning* and is writing *The Life You’re Building: How to Stop Drifting and Design a Life That Matters*. His approach is personal, practical, and grounded in the belief that faith should shape the life we actually live—not remain one compartment of it.",
    photo: photo("/marketing/brand/michael-gauthier.webp", "Michael J. Gauthier"),
    shortBioLabel: "Short Bio for Hosts",
    shortBio:
      "Michael J. Gauthier, CFP®, founded Strategic Income Group and created the Stewardship Blueprint to help people move from drift to intentional stewardship. He speaks about faith, purpose, leadership, money, family, guardrails, energy, generosity, and living legacy. He is the author of Truth in Financial Planning and is writing The Life You’re Building.",
  },
});

export type SpeakingTopic = { id: string; number: string; title: string; body: string };
type Topics = { eyebrow: string; title: string; body: string; featured: SpeakingTopic[]; moreLabel: string; more: SpeakingTopic[] };

const topicFields = [
  f.text("number", "Number", 4),
  { key: "title", label: "Title", kind: "text" as const, required: true, maxLength: 80 },
  f.textarea("body", "Description", 400),
];

const topic = (id: string, number: string, title: string, body: string): SpeakingTopic => ({ id, number, title, body });

const topics = defineSection<Topics>({
  key: "topics",
  label: "Topics",
  fields: [
    f.eyebrow(),
    f.title(),
    f.body(),
    f.list("featured", "Featured topics", topicFields, 6, "Topic"),
    f.text("moreLabel", "Additional topics heading", 60),
    f.list("more", "Additional topics", topicFields, 4, "Topic"),
  ],
  defaults: {
    eyebrow: "Topics",
    title: "Conversations I Enjoy Having.",
    body: "Every audience is different. These are some of the conversations I enjoy having, and I am happy to shape the message around your group’s questions, challenges, and season.",
    featured: [
      topic("drift-to-design", "01", "The Life You’re Building: From Drift to Design", "What kind of life are you actually building? Explore why responsible, successful people still drift—and how purpose, faith, relationships, health, joy, and resources can form one intentional life."),
      topic("wrong-scoreboard", "02", "When Success Becomes the Wrong Scoreboard", "Achievement is useful, but it cannot tell us what our lives are for. A personal conversation about ambition, identity, work, status, and the things success should never cost us."),
      topic("faith-beyond-sunday", "03", "Faith Beyond Sunday: What Changes on Monday?", "What does it look like when faith shapes everyday decisions at work, at home, and with money? Lessons from building a business through a Christian lens and learning to align belief with practice."),
      topic("money-is-a-tool", "04", "Money Is a Tool, Not the Finish Line", "Move beyond accumulation as the definition of success. Discuss enough, financial freedom, generosity, and how resources can serve purpose rather than become our identity."),
      topic("guardrails", "05", "Guardrails Protect. Keystone Rhythms Strengthen.", "Good intentions are not enough when pressure arrives. Explore practical boundaries, life-giving rhythms, honest accountability, and the role of depending on God in faithful stewardship."),
      topic("fully-engaged", "06", "Fully Engaged: Steward the Energy Behind Your Calling", "You can have time and resources yet be too depleted to use them well. Explore physical, emotional, mental, and spiritual energy, along with the renewal required for lasting presence and service."),
    ],
    moreLabel: "Additional Conversation Ideas",
    more: [
      topic("raise-stewards", "07", "Raise Stewards, Not Consumers", "How are our children, mentees, and communities learning from what we model? Practical conversations about work, wealth, character, generosity, and forming people who can steward their own lives."),
      topic("legacy-begins-now", "08", "Legacy Begins Now: Multiply Through People", "Legacy is what your life multiplies in and through others while you are living. Discuss how to model, teach, and equip others to practice generosity and pass it on; estate plans support continuity, but do not define Legacy Giving."),
    ],
  },
});

type Formats = { eyebrow: string; title: string; body: string; formats: { id: string; label: string }[] };

const formats = defineSection<Formats>({
  key: "formats",
  label: "Formats & fit",
  fields: [
    f.eyebrow(),
    f.title(),
    f.body(),
    f.list("formats", "Formats", [{ key: "label", label: "Format", kind: "text", required: true, maxLength: 60 }], 8, "Format"),
  ],
  defaults: {
    eyebrow: "Formats",
    title: "Conversations That Meet People Where They Are.",
    body: "I welcome opportunities to join podcast hosts, pastors, ministry leaders, business and nonprofit teams, and community gatherings in conversations about building a faithful, purposeful life. Topics can be tailored for an interview, a short talk, a facilitated discussion, a workshop, or a retreat setting.",
    formats: [
      { id: "podcasts", label: "Podcast Interviews" },
      { id: "churches", label: "Churches & Men’s Ministries" },
      { id: "conferences", label: "Conferences & Retreats" },
      { id: "leadership", label: "Leadership & Community Events" },
    ],
  },
});

export type SpeakingInquiryContent = {
  eyebrow: string;
  title: string;
  body: string;
  invitationTypes: { id: string; label: string }[];
  consent: string;
  marketingOptIn: string;
  submitLabel: string;
  successTitle: string;
  successBody: string;
  footerLink: Cta;
  footerText: string;
};

const inquiry = defineSection<SpeakingInquiryContent>({
  key: "inquiry",
  label: "Invitation form",
  fields: [
    f.eyebrow(),
    f.title(),
    f.body(),
    f.list("invitationTypes", "Invitation types", [{ key: "label", label: "Type", kind: "text", required: true, maxLength: 60 }], 8, "Type"),
    { key: "consent", label: "Required consent checkbox", kind: "textarea", required: true, maxLength: 300 },
    f.text("marketingOptIn", "Optional updates checkbox", 200),
    f.text("submitLabel", "Button", 40),
    f.text("successTitle", "Thank-you title", 80),
    f.textarea("successBody", "Thank-you message", 300),
    f.text("footerText", "Closing line", 200),
    f.cta("footerLink", "Closing link"),
  ],
  defaults: {
    eyebrow: "Invite Michael",
    title: "Have a Conversation in Mind? Let’s Connect.",
    body: "If you are planning a podcast episode, church event, leadership gathering, retreat, or workshop, I would be glad to hear what you have in mind. Share a few details below so we can explore whether the topic and timing are a good fit.",
    invitationTypes: [
      { id: "podcast", label: "Podcast Interview" },
      { id: "church", label: "Church or Ministry Speaking" },
      { id: "event", label: "Conference or Event" },
      { id: "workshop", label: "Workshop or Retreat" },
      { id: "other", label: "Other" },
    ],
    consent: "I agree that my information may be used to respond to this inquiry.",
    marketingOptIn: "I would also like to receive MJG / Stewardship Blueprint news and resources.",
    submitLabel: "Send Speaking Inquiry",
    successTitle: "Thank you for the invitation.",
    successBody: "Your message has been received, and we will follow up using the email address you provided.",
    footerText: "Want to learn more about the framework behind these conversations?",
    footerLink: { label: "Explore the Stewardship Blueprint →", href: "/stewardship-blueprint" },
  },
});

export const pageSpeaking = defineScope({
  key: "page:speaking",
  label: "Speaking & Podcasts",
  path: "/speaking",
  sections: {
    _seo: seoSection({
      title: "Speaking & Podcast Guest",
      description:
        "Invite Michael J. Gauthier for podcasts, church gatherings and leadership events on faith, purpose, money, generosity and building a life that matters.",
      ogImage: photo("/marketing/speaking/compass-interview-poster.jpg", "Michael J. Gauthier in conversation"),
    }),
    hero,
    video,
    bio,
    topics,
    formats,
    inquiry,
  },
});

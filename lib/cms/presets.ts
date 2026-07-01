// Palette categories + pre-made block/section presets for the CMS editor.
// Presets are id-less block arrays; the editor assigns ids on insert.

import type { CmsBlock, CmsBlockType } from "./types";

export type CmsPreset = Omit<CmsBlock, "id">;

export const BLOCK_CATEGORIES: { label: string; types: CmsBlockType[] }[] = [
  { label: "Text", types: ["heading", "subheading", "paragraph", "richtext", "list", "quote", "scripture"] },
  { label: "Media", types: ["image", "video", "audio", "gallery", "embed"] },
  { label: "Layout", types: ["hero", "cta", "cardgrid", "statgrid", "divider", "spacer"] },
  { label: "Interactive", types: ["accordion", "form", "alert", "resource", "button"] },
  { label: "Advanced", types: ["html"] },
];

// Pre-made component/section presets (ready-to-use starting points).
export const BLOCK_PRESETS: { name: string; description: string; blocks: CmsPreset[] }[] = [
  {
    name: "Hero + CTA",
    description: "Full-bleed hero with headline and two buttons.",
    blocks: [
      { type: "hero", align: "center", eyebrow: "Stewardship Blueprint", text: "Lead your life and legacy with intention", subtext: "A guided path to steward your time, talent, and treasure well.", label: "Get started", url: "#", label2: "Learn more", url2: "#", minHeight: 460, overlay: "#0b1f14", overlayOpacity: 55, bgColor: "#315f43", padTop: 80, padBottom: 80 },
    ],
  },
  {
    name: "Feature cards (3)",
    description: "Three-column feature/card grid.",
    blocks: [
      { type: "subheading", align: "center", text: "How it works", padTop: 48, padBottom: 8 },
      { type: "cardgrid", columns: 3, padTop: 8, padBottom: 48, items: [
        { title: "Assess", body: "Start with a clear picture of where you are today." },
        { title: "Plan", body: "Build a simple, faithful plan you can actually follow." },
        { title: "Steward", body: "Take next steps with guidance and accountability." },
      ] },
    ],
  },
  {
    name: "CTA band",
    description: "Tinted call-to-action strip.",
    blocks: [
      { type: "cta", align: "center", bgColor: "#f1ede3", eyebrow: "Ready?", text: "Take the next step today", subtext: "It only takes a few minutes to begin.", label: "Begin now", url: "#", padTop: 56, padBottom: 56 },
    ],
  },
  {
    name: "Stats row",
    description: "Three headline numbers.",
    blocks: [
      { type: "statgrid", columns: 3, padTop: 40, padBottom: 40, items: [
        { title: "500+", body: "Families served" }, { title: "12", body: "Guided steps" }, { title: "98%", body: "Would recommend" },
      ] },
    ],
  },
  {
    name: "FAQ",
    description: "Accordion of common questions.",
    blocks: [
      { type: "subheading", align: "center", text: "Frequently asked questions", padTop: 48, padBottom: 8 },
      { type: "accordion", maxWidth: 820, padTop: 8, padBottom: 48, items: [
        { q: "Who is this for?", a: "Anyone who wants to steward their life and resources with intention." },
        { q: "How long does it take?", a: "Most people move through the core steps in a few weeks." },
      ] },
    ],
  },
  {
    name: "Contact form",
    description: "Name / email / message form.",
    blocks: [
      { type: "form", text: "Get in touch", eyebrow: "We'd love to hear from you.", label: "Send message", maxWidth: 560, padTop: 48, padBottom: 48, items: [
        { title: "Name", fieldType: "text", placeholder: "Your name", required: true },
        { title: "Email", fieldType: "email", placeholder: "you@example.com", required: true },
        { title: "Message", fieldType: "textarea", placeholder: "How can we help?" },
      ] },
    ],
  },
  {
    name: "Testimonial",
    description: "Centered pull-quote with attribution.",
    blocks: [
      { type: "quote", align: "center", text: "This changed how our whole family thinks about generosity.", author: "A grateful participant", role: "Phoenix, AZ", bgColor: "#f1ede3", padTop: 56, padBottom: 56 },
    ],
  },
  {
    name: "Scripture",
    description: "Reference, verse, and reflection.",
    blocks: [
      { type: "scripture", author: "2 Corinthians 9:7", role: "ESV", text: "Each one must give as he has decided in his heart, not reluctantly or under compulsion, for God loves a cheerful giver.", subtext: "Reflect on what it means to give freely this week.", padTop: 40, padBottom: 40 },
    ],
  },
  {
    name: "Resource download",
    description: "Downloadable file callout.",
    blocks: [
      { type: "resource", role: "PDF · 2.4 MB", text: "Stewardship starter guide", subtext: "A printable worksheet to begin your plan.", label: "Download", url: "#", padTop: 32, padBottom: 32 },
    ],
  },
  {
    name: "Audio episode",
    description: "Podcast-style audio player with title and byline.",
    blocks: [
      { type: "audio", align: "center", text: "The Stewardship Blueprint", author: "Michael J. Gauthier", role: "Life Design · Stewardship · Faith", accent: "#c9a46e", barColor: "#1b1a17", textColor: "#6a7a6f", url: "", padTop: 48, padBottom: 48 },
    ],
  },
  {
    name: "Icon badge",
    description: "Accent icon in a circle with a label.",
    blocks: [
      { type: "icon", align: "center", icon: "shield-check", variant: "line", iconShape: "circle", iconBg: "#f1ede3", iconOutline: "", accent: "#315f43", iconSize: 30, text: "Trusted guidance", subtext: "A short supporting line.", padTop: 32, padBottom: 32 },
    ],
  },
];

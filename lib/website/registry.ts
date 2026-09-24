// Frontend Editor — the approved component registry (spec §10).
//
// This file is the allow-list. Mike and Steward can only place block types that
// appear here, and only set props that appear in a block's field list; anything
// else is dropped by validateProps() before it ever reaches storage or the
// renderer. Adding a new approved component later means adding one entry here
// plus one React component in components/website/blocks — no editor redesign
// (spec: "additional approved frontend components can be registered later").
//
// Client-safe: definitions only, no React and no server imports.

import { defaultsFor, describeFields, validateProps, type FieldDef, type ValidationIssue } from "./schema";
import type { WebsiteBlock, WebsiteContent } from "./types";

export type BlockCategory = "Layout" | "Content" | "Media" | "Conversion" | "Proof" | "Data";

export type ComponentDefinition = {
  type: string;
  label: string;
  description: string;
  category: BlockCategory;
  /** Field list — validation, Steward's schema, and the property panel. */
  fields: FieldDef[];
  /** Steward may create/modify this block type. */
  stewardEditable: boolean;
  /** The owner-facing editor exposes this block type. */
  ownerEditable: boolean;
  /** Block pulls live site data (blog posts, events) rather than authored props. */
  dynamic?: boolean;
};

// ── Shared field builders ────────────────────────────────────────────────────

/**
 * Design-system-approved section settings shared by every block. These are
 * presets, never free-form class names (spec §26).
 */
function sectionFields(): FieldDef[] {
  return [
    {
      key: "background",
      label: "Background",
      kind: "select",
      group: "design",
      default: "default",
      options: [
        { value: "default", label: "Page background" },
        { value: "muted", label: "Soft neutral" },
        { value: "gold", label: "Gold wash" },
        { value: "ink", label: "Deep ink (light text)" },
      ],
    },
    {
      key: "spacing",
      label: "Vertical spacing",
      kind: "select",
      group: "layout",
      default: "md",
      options: [
        { value: "none", label: "None" },
        { value: "sm", label: "Compact" },
        { value: "md", label: "Standard" },
        { value: "lg", label: "Generous" },
      ],
    },
    {
      key: "width",
      label: "Content width",
      kind: "select",
      group: "layout",
      default: "standard",
      options: [
        { value: "narrow", label: "Narrow (reading width)" },
        { value: "standard", label: "Standard" },
        { value: "wide", label: "Wide" },
      ],
    },
    {
      key: "align",
      label: "Alignment",
      kind: "select",
      group: "layout",
      default: "left",
      options: [
        { value: "left", label: "Left" },
        { value: "center", label: "Centre" },
      ],
    },
    {
      key: "hideOnMobile",
      label: "Hide on phones",
      kind: "boolean",
      group: "layout",
      help: "Use sparingly — content hidden on mobile is invisible to most visitors.",
    },
  ];
}

const link = (key: string, label: string, required = false): FieldDef => ({
  key,
  label,
  kind: "link",
  required,
  group: "content",
  fields: [
    { key: "label", label: "Button label", kind: "text", maxLength: 80 },
    { key: "href", label: "Links to", kind: "url" },
    { key: "newTab", label: "Open in a new tab", kind: "boolean" },
  ],
});

const eyebrow: FieldDef = { key: "eyebrow", label: "Eyebrow", kind: "text", maxLength: 80, group: "content", help: "Small label above the heading." };
const heading = (required = true): FieldDef => ({ key: "title", label: "Heading", kind: "text", required, maxLength: 200, group: "content" });
const body = (label = "Body copy"): FieldDef => ({ key: "description", label, kind: "textarea", maxLength: 2000, group: "content" });
const image = (key = "imageUrl", label = "Image"): FieldDef => ({ key, label, kind: "image", group: "media" });
const imageAlt = (key = "imageAlt"): FieldDef => ({ key, label: "Image description (alt text)", kind: "text", maxLength: 200, group: "media", help: "Describe the image for screen readers and search engines." });

// ── The registry ─────────────────────────────────────────────────────────────

const DEFINITIONS: ComponentDefinition[] = [
  {
    type: "hero",
    label: "Hero",
    description: "Full-width opening section: eyebrow, headline, supporting copy and up to two buttons.",
    category: "Layout",
    stewardEditable: true,
    ownerEditable: true,
    fields: [
      eyebrow,
      heading(),
      body("Supporting copy"),
      link("primaryCta", "Primary button"),
      link("secondaryCta", "Secondary button"),
      image("imageUrl", "Side image"),
      imageAlt(),
      {
        key: "layout", label: "Layout", kind: "select", group: "layout", default: "centered",
        options: [
          { value: "centered", label: "Centred" },
          { value: "split", label: "Copy left, image right" },
          { value: "splitReverse", label: "Image left, copy right" },
        ],
      },
      ...sectionFields(),
    ],
  },
  {
    type: "richText",
    label: "Rich text",
    description: "A block of formatted copy. Supports **bold**, *italic*, [links](/page) and - bullet lists.",
    category: "Content",
    stewardEditable: true,
    ownerEditable: true,
    fields: [
      { key: "title", label: "Heading (optional)", kind: "text", maxLength: 200, group: "content" },
      { key: "content", label: "Content", kind: "richtext", required: true, maxLength: 12000, group: "content" },
      ...sectionFields(),
    ],
  },
  {
    type: "twoColumn",
    label: "Two column content",
    description: "Two side-by-side columns of copy, each with its own optional heading.",
    category: "Content",
    stewardEditable: true,
    ownerEditable: true,
    fields: [
      { key: "title", label: "Section heading", kind: "text", maxLength: 200, group: "content" },
      { key: "leftTitle", label: "Left heading", kind: "text", maxLength: 160, group: "content" },
      { key: "leftContent", label: "Left content", kind: "richtext", maxLength: 6000, group: "content" },
      { key: "rightTitle", label: "Right heading", kind: "text", maxLength: 160, group: "content" },
      { key: "rightContent", label: "Right content", kind: "richtext", maxLength: 6000, group: "content" },
      ...sectionFields(),
    ],
  },
  {
    type: "imageContent",
    label: "Image + content",
    description: "An image beside a block of copy with an optional button.",
    category: "Content",
    stewardEditable: true,
    ownerEditable: true,
    fields: [
      eyebrow,
      heading(false),
      { key: "content", label: "Content", kind: "richtext", maxLength: 6000, group: "content" },
      link("cta", "Button"),
      image(),
      imageAlt(),
      {
        key: "imagePosition", label: "Image position", kind: "select", group: "layout", default: "right",
        options: [{ value: "left", label: "Left" }, { value: "right", label: "Right" }],
      },
      ...sectionFields(),
    ],
  },
  {
    type: "video",
    label: "Video",
    description: "An embedded YouTube or Vimeo video with an optional caption.",
    category: "Media",
    stewardEditable: true,
    ownerEditable: true,
    fields: [
      heading(false),
      { key: "videoUrl", label: "Video link", kind: "video", required: true, group: "media", help: "A YouTube or Vimeo link." },
      { key: "caption", label: "Caption", kind: "text", maxLength: 240, group: "content" },
      {
        key: "aspect", label: "Aspect ratio", kind: "select", group: "layout", default: "16/9",
        options: [{ value: "16/9", label: "Widescreen 16:9" }, { value: "4/3", label: "Classic 4:3" }, { value: "1/1", label: "Square" }],
      },
      ...sectionFields(),
    ],
  },
  {
    type: "featureGrid",
    label: "Feature grid",
    description: "A grid of short feature points, each with a heading and a line of copy.",
    category: "Content",
    stewardEditable: true,
    ownerEditable: true,
    fields: [
      eyebrow,
      heading(false),
      body("Intro copy"),
      {
        key: "items", label: "Features", kind: "list", group: "content", itemLabel: "Feature", maxItems: 12,
        fields: [
          { key: "title", label: "Feature heading", kind: "text", required: true, maxLength: 160 },
          { key: "description", label: "Feature copy", kind: "textarea", maxLength: 600 },
        ],
      },
      {
        key: "columns", label: "Columns", kind: "select", group: "layout", default: "3",
        options: [{ value: "2", label: "Two" }, { value: "3", label: "Three" }, { value: "4", label: "Four" }],
      },
      ...sectionFields(),
    ],
  },
  {
    type: "cardGrid",
    label: "Card grid",
    description: "A grid of linked cards, each with an optional image.",
    category: "Content",
    stewardEditable: true,
    ownerEditable: true,
    fields: [
      heading(false),
      body("Intro copy"),
      {
        key: "items", label: "Cards", kind: "list", group: "content", itemLabel: "Card", maxItems: 12,
        fields: [
          { key: "title", label: "Card heading", kind: "text", required: true, maxLength: 160 },
          { key: "description", label: "Card copy", kind: "textarea", maxLength: 600 },
          { key: "imageUrl", label: "Card image", kind: "image" },
          { key: "imageAlt", label: "Image description", kind: "text", maxLength: 200 },
          { key: "href", label: "Card links to", kind: "url" },
          { key: "linkLabel", label: "Link label", kind: "text", maxLength: 80 },
        ],
      },
      {
        key: "columns", label: "Columns", kind: "select", group: "layout", default: "3",
        options: [{ value: "2", label: "Two" }, { value: "3", label: "Three" }, { value: "4", label: "Four" }],
      },
      ...sectionFields(),
    ],
  },
  {
    type: "cta",
    label: "Call to action",
    description: "A standout band with a headline, short copy and up to two buttons.",
    category: "Conversion",
    stewardEditable: true,
    ownerEditable: true,
    fields: [
      eyebrow,
      heading(),
      body("Supporting copy"),
      link("primaryCta", "Primary button", true),
      link("secondaryCta", "Secondary button"),
      ...sectionFields(),
    ],
  },
  {
    type: "buttonGroup",
    label: "Button group",
    description: "A row of buttons on their own.",
    category: "Conversion",
    stewardEditable: true,
    ownerEditable: true,
    fields: [
      {
        key: "items", label: "Buttons", kind: "list", group: "content", itemLabel: "Button", maxItems: 6,
        fields: [
          { key: "label", label: "Button label", kind: "text", required: true, maxLength: 80 },
          { key: "href", label: "Links to", kind: "url" },
          { key: "newTab", label: "Open in a new tab", kind: "boolean" },
          {
            key: "style", label: "Style", kind: "select", default: "primary",
            options: [{ value: "primary", label: "Solid" }, { value: "outline", label: "Outline" }, { value: "quiet", label: "Text only" }],
          },
        ],
      },
      ...sectionFields(),
    ],
  },
  {
    type: "testimonial",
    label: "Testimonial",
    description: "One or more quotes with an attributed name and role.",
    category: "Proof",
    stewardEditable: true,
    ownerEditable: true,
    fields: [
      heading(false),
      {
        key: "items", label: "Testimonials", kind: "list", group: "content", itemLabel: "Testimonial", maxItems: 9,
        fields: [
          { key: "quote", label: "Quote", kind: "textarea", required: true, maxLength: 1200 },
          { key: "name", label: "Name", kind: "text", maxLength: 120 },
          { key: "role", label: "Role / context", kind: "text", maxLength: 160 },
          { key: "imageUrl", label: "Photo", kind: "image" },
        ],
      },
      ...sectionFields(),
    ],
  },
  {
    type: "quote",
    label: "Pull quote",
    description: "A single large quote used to break up a page.",
    category: "Proof",
    stewardEditable: true,
    ownerEditable: true,
    fields: [
      { key: "quote", label: "Quote", kind: "textarea", required: true, maxLength: 800, group: "content" },
      { key: "attribution", label: "Attribution", kind: "text", maxLength: 160, group: "content" },
      ...sectionFields(),
    ],
  },
  {
    type: "faq",
    label: "FAQ / Accordion",
    description: "Expandable question-and-answer rows.",
    category: "Content",
    stewardEditable: true,
    ownerEditable: true,
    fields: [
      heading(false),
      body("Intro copy"),
      {
        key: "items", label: "Questions", kind: "list", group: "content", itemLabel: "Question", maxItems: 24,
        fields: [
          { key: "question", label: "Question", kind: "text", required: true, maxLength: 300 },
          { key: "answer", label: "Answer", kind: "richtext", required: true, maxLength: 4000 },
        ],
      },
      ...sectionFields(),
    ],
  },
  {
    type: "tabs",
    label: "Tabs",
    description: "Tabbed panels of copy.",
    category: "Content",
    stewardEditable: true,
    ownerEditable: true,
    fields: [
      heading(false),
      {
        key: "items", label: "Tabs", kind: "list", group: "content", itemLabel: "Tab", maxItems: 8,
        fields: [
          { key: "label", label: "Tab label", kind: "text", required: true, maxLength: 80 },
          { key: "content", label: "Tab content", kind: "richtext", maxLength: 6000 },
        ],
      },
      ...sectionFields(),
    ],
  },
  {
    type: "stats",
    label: "Stats",
    description: "A row of headline numbers with labels.",
    category: "Proof",
    stewardEditable: true,
    ownerEditable: true,
    fields: [
      heading(false),
      {
        key: "items", label: "Stats", kind: "list", group: "content", itemLabel: "Stat", maxItems: 8,
        fields: [
          { key: "value", label: "Number", kind: "text", required: true, maxLength: 40 },
          { key: "label", label: "Label", kind: "text", maxLength: 160 },
        ],
      },
      ...sectionFields(),
    ],
  },
  {
    type: "timeline",
    label: "Timeline",
    description: "An ordered sequence of steps or milestones.",
    category: "Content",
    stewardEditable: true,
    ownerEditable: true,
    fields: [
      heading(false),
      body("Intro copy"),
      {
        key: "items", label: "Steps", kind: "list", group: "content", itemLabel: "Step", maxItems: 16,
        fields: [
          { key: "marker", label: "Step label", kind: "text", maxLength: 40, help: "For example: 01, Week 1, 2019." },
          { key: "title", label: "Step heading", kind: "text", required: true, maxLength: 200 },
          { key: "description", label: "Step copy", kind: "textarea", maxLength: 1000 },
        ],
      },
      ...sectionFields(),
    ],
  },
  {
    type: "teamMember",
    label: "Team members",
    description: "Profile cards with a photo, name, role and short bio.",
    category: "Proof",
    stewardEditable: true,
    ownerEditable: true,
    fields: [
      heading(false),
      {
        key: "items", label: "People", kind: "list", group: "content", itemLabel: "Person", maxItems: 12,
        fields: [
          { key: "name", label: "Name", kind: "text", required: true, maxLength: 120 },
          { key: "role", label: "Role", kind: "text", maxLength: 160 },
          { key: "bio", label: "Short bio", kind: "textarea", maxLength: 800 },
          { key: "imageUrl", label: "Photo", kind: "image" },
          { key: "href", label: "Profile link", kind: "url" },
        ],
      },
      ...sectionFields(),
    ],
  },
  {
    type: "resourceCard",
    label: "Resource / download",
    description: "Downloadable resources with a title, description and file link.",
    category: "Content",
    stewardEditable: true,
    ownerEditable: true,
    fields: [
      heading(false),
      {
        key: "items", label: "Resources", kind: "list", group: "content", itemLabel: "Resource", maxItems: 12,
        fields: [
          { key: "title", label: "Resource title", kind: "text", required: true, maxLength: 200 },
          { key: "description", label: "Description", kind: "textarea", maxLength: 600 },
          { key: "href", label: "File or page link", kind: "url", required: true },
          { key: "fileType", label: "Format", kind: "text", maxLength: 40, help: "For example: PDF, Audio, Worksheet." },
          { key: "linkLabel", label: "Button label", kind: "text", maxLength: 80 },
        ],
      },
      ...sectionFields(),
    ],
  },
  {
    type: "blueprintSection",
    label: "Stewardship Blueprint section",
    description: "The branded Stewardship Blueprint explainer with its own call to action.",
    category: "Conversion",
    stewardEditable: true,
    ownerEditable: true,
    fields: [
      { key: "eyebrow", label: "Eyebrow", kind: "text", maxLength: 80, group: "content", default: "The Stewardship Blueprint" },
      heading(),
      body("Supporting copy"),
      {
        key: "items", label: "Points", kind: "list", group: "content", itemLabel: "Point", maxItems: 9,
        fields: [
          { key: "title", label: "Point heading", kind: "text", required: true, maxLength: 160 },
          { key: "description", label: "Point copy", kind: "textarea", maxLength: 600 },
        ],
      },
      link("cta", "Button"),
      ...sectionFields(),
    ],
  },
  {
    type: "pricing",
    label: "Pricing",
    description: "Pricing or membership tiers with features and a button each.",
    category: "Conversion",
    stewardEditable: true,
    ownerEditable: true,
    fields: [
      heading(false),
      body("Intro copy"),
      {
        key: "items", label: "Tiers", kind: "list", group: "content", itemLabel: "Tier", maxItems: 4,
        fields: [
          { key: "name", label: "Tier name", kind: "text", required: true, maxLength: 120 },
          { key: "price", label: "Price", kind: "text", maxLength: 60 },
          { key: "cadence", label: "Billing note", kind: "text", maxLength: 80, help: "For example: per month." },
          { key: "description", label: "Short description", kind: "textarea", maxLength: 400 },
          { key: "features", label: "Included (one per line)", kind: "textarea", maxLength: 1200 },
          { key: "ctaLabel", label: "Button label", kind: "text", maxLength: 80 },
          { key: "ctaHref", label: "Button links to", kind: "url" },
          { key: "featured", label: "Highlight this tier", kind: "boolean" },
        ],
      },
      ...sectionFields(),
    ],
  },
  {
    type: "subscriptionCta",
    label: "Subscription CTA",
    description: "A membership or subscription invitation band.",
    category: "Conversion",
    stewardEditable: true,
    ownerEditable: true,
    fields: [
      eyebrow,
      heading(),
      body("Supporting copy"),
      {
        key: "items", label: "Benefits", kind: "list", group: "content", itemLabel: "Benefit", maxItems: 8,
        fields: [{ key: "title", label: "Benefit", kind: "text", required: true, maxLength: 200 }],
      },
      link("cta", "Button", true),
      ...sectionFields(),
    ],
  },
  {
    type: "contactForm",
    label: "Contact form",
    description: "The site contact form. Fields and destination are fixed by the application.",
    category: "Conversion",
    stewardEditable: true,
    ownerEditable: true,
    fields: [
      heading(false),
      body("Intro copy"),
      { key: "submitLabel", label: "Submit button label", kind: "text", maxLength: 80, group: "content", default: "Send message" },
      { key: "successMessage", label: "Thank-you message", kind: "textarea", maxLength: 600, group: "content", default: "Thank you — your message is on its way." },
      ...sectionFields(),
    ],
  },
  {
    type: "bookingCta",
    label: "Booking CTA",
    description: "An invitation to book, pointing at the application booking flow.",
    category: "Conversion",
    stewardEditable: true,
    ownerEditable: true,
    fields: [
      eyebrow,
      heading(),
      body("Supporting copy"),
      link("cta", "Booking button"),
      ...sectionFields(),
    ],
  },
  {
    type: "newsletter",
    label: "Newsletter signup",
    description: "Email capture that posts to the application's signup endpoint.",
    category: "Conversion",
    stewardEditable: true,
    ownerEditable: true,
    fields: [
      heading(false),
      body("Supporting copy"),
      { key: "submitLabel", label: "Button label", kind: "text", maxLength: 80, group: "content", default: "Keep me posted" },
      { key: "consentNote", label: "Consent note", kind: "text", maxLength: 300, group: "content" },
      ...sectionFields(),
    ],
  },
  {
    type: "gallery",
    label: "Image gallery",
    description: "A grid of images with alt text and optional captions.",
    category: "Media",
    stewardEditable: true,
    ownerEditable: true,
    fields: [
      heading(false),
      {
        key: "items", label: "Images", kind: "list", group: "media", itemLabel: "Image", maxItems: 24,
        fields: [
          { key: "imageUrl", label: "Image", kind: "image", required: true },
          { key: "imageAlt", label: "Image description", kind: "text", maxLength: 200 },
          { key: "caption", label: "Caption", kind: "text", maxLength: 200 },
        ],
      },
      {
        key: "columns", label: "Columns", kind: "select", group: "layout", default: "3",
        options: [{ value: "2", label: "Two" }, { value: "3", label: "Three" }, { value: "4", label: "Four" }],
      },
      ...sectionFields(),
    ],
  },
  {
    type: "logoGrid",
    label: "Logo grid",
    description: "A row of partner or publication logos.",
    category: "Proof",
    stewardEditable: true,
    ownerEditable: true,
    fields: [
      heading(false),
      {
        key: "items", label: "Logos", kind: "list", group: "media", itemLabel: "Logo", maxItems: 18,
        fields: [
          { key: "imageUrl", label: "Logo image", kind: "image", required: true },
          { key: "imageAlt", label: "Organisation name", kind: "text", required: true, maxLength: 160 },
          { key: "href", label: "Links to", kind: "url" },
        ],
      },
      ...sectionFields(),
    ],
  },
  {
    type: "blogFeed",
    label: "Blog feed",
    description: "The most recent published blog posts. Content comes from Blog Posts, not from this block.",
    category: "Data",
    stewardEditable: true,
    ownerEditable: true,
    dynamic: true,
    fields: [
      heading(false),
      body("Intro copy"),
      { key: "limit", label: "How many posts", kind: "number", min: 1, max: 12, default: 3, group: "content" },
      ...sectionFields(),
    ],
  },
  {
    type: "eventFeed",
    label: "Event feed",
    description: "Upcoming public events. Content comes from Bookings & Events, not from this block.",
    category: "Data",
    stewardEditable: true,
    ownerEditable: true,
    dynamic: true,
    fields: [
      heading(false),
      body("Intro copy"),
      { key: "limit", label: "How many events", kind: "number", min: 1, max: 12, default: 3, group: "content" },
      ...sectionFields(),
    ],
  },
  {
    type: "divider",
    label: "Divider",
    description: "A horizontal rule between sections.",
    category: "Layout",
    stewardEditable: true,
    ownerEditable: true,
    fields: [
      {
        key: "style", label: "Style", kind: "select", group: "design", default: "line",
        options: [{ value: "line", label: "Line" }, { value: "dots", label: "Dots" }, { value: "gold", label: "Gold rule" }],
      },
      ...sectionFields(),
    ],
  },
  {
    type: "spacer",
    label: "Spacer",
    description: "Empty vertical space.",
    category: "Layout",
    stewardEditable: true,
    ownerEditable: true,
    fields: [
      {
        key: "size", label: "Height", kind: "select", group: "layout", default: "md",
        options: [{ value: "sm", label: "Small" }, { value: "md", label: "Medium" }, { value: "lg", label: "Large" }],
      },
    ],
  },
];

export const COMPONENT_REGISTRY: Record<string, ComponentDefinition> = Object.fromEntries(
  DEFINITIONS.map((d) => [d.type, d]),
);

export const COMPONENT_LIST = DEFINITIONS;

export const BLOCK_CATEGORIES: BlockCategory[] = ["Layout", "Content", "Media", "Conversion", "Proof", "Data"];

export function getDefinition(type: string): ComponentDefinition | undefined {
  return COMPONENT_REGISTRY[String(type)];
}

export function isRegisteredBlock(type: string): boolean {
  return Boolean(COMPONENT_REGISTRY[String(type)]);
}

export function blockLabel(type: string): string {
  return COMPONENT_REGISTRY[String(type)]?.label ?? type;
}

/** A short, human-readable line for a block in the structure tree / diffs. */
export function blockPreviewText(block: WebsiteBlock): string {
  const p = block.props ?? {};
  const first = [p.title, p.quote, p.eyebrow, p.content, p.description, p.videoUrl]
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .find(Boolean);
  if (first) return first.length > 70 ? `${first.slice(0, 70)}…` : first;
  const items = Array.isArray(p.items) ? p.items.length : 0;
  return items ? `${items} item${items === 1 ? "" : "s"}` : blockLabel(block.type);
}

// ── Block-level validation ───────────────────────────────────────────────────

let blockSeq = 0;

/** Collision-resistant, readable block id. */
export function newBlockId(type = "b"): string {
  blockSeq = (blockSeq + 1) % 100000;
  return `${type}_${Date.now().toString(36)}${blockSeq.toString(36)}`;
}

export function createBlock(type: string, props: Record<string, unknown> = {}): WebsiteBlock {
  const def = getDefinition(type);
  if (!def) throw new Error(`"${type}" is not an approved page component.`);
  return {
    id: newBlockId(type),
    type: def.type,
    props: { ...defaultsFor(def.fields), ...validateProps(def.fields, props) },
  };
}

export type BlockValidation = { block: WebsiteBlock | null; issues: ValidationIssue[] };

/**
 * Validate one block. Unregistered types are rejected outright; registered ones
 * come back with props coerced to the schema and unknown keys stripped.
 */
export function validateBlock(raw: unknown, index = 0): BlockValidation {
  const issues: ValidationIssue[] = [];
  const input = (raw ?? {}) as Partial<WebsiteBlock>;
  const type = String(input.type ?? "");
  const def = getDefinition(type);
  if (!def) {
    issues.push({
      path: `blocks[${index}]`,
      message: `"${type || "(missing)"}" is not an approved page component. Ask a developer to build and register it first.`,
    });
    return { block: null, issues };
  }
  const props = validateProps(def.fields, (input.props ?? {}) as Record<string, unknown>, `blocks[${index}].props`, issues);
  const id = typeof input.id === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(input.id) ? input.id : newBlockId(def.type);
  const block: WebsiteBlock = { id, type: def.type, props };
  if (input.hidden === true) block.hidden = true;
  return { block, issues };
}

export type ContentValidation = { content: WebsiteContent; issues: ValidationIssue[] };

/**
 * Validate a whole content document. Invalid blocks are dropped (with an issue
 * recorded) rather than failing the entire save, so one bad block from Steward
 * can never wipe a page. Duplicate ids are re-issued.
 */
export function validateContent(raw: unknown): ContentValidation {
  const blocks = Array.isArray((raw as WebsiteContent | null)?.blocks) ? (raw as WebsiteContent).blocks : [];
  const issues: ValidationIssue[] = [];
  const seen = new Set<string>();
  const out: WebsiteBlock[] = [];
  blocks.slice(0, 120).forEach((b, i) => {
    const { block, issues: blockIssues } = validateBlock(b, i);
    issues.push(...blockIssues);
    if (!block) return;
    if (seen.has(block.id)) block.id = newBlockId(block.type);
    seen.add(block.id);
    out.push(block);
  });
  return { content: { version: 1, blocks: out }, issues };
}

/**
 * The registry rendered for Steward's system context (spec §30) — every block
 * type it may use, with the exact prop names and shapes.
 */
export function renderRegistryForPrompt(): string {
  const lines = DEFINITIONS.filter((d) => d.stewardEditable).map((d) => {
    const contentFields = d.fields.filter((f) => (f.group ?? "content") === "content" || f.group === "media");
    return `### ${d.type} — ${d.label}\n${d.description}\nProps:\n${describeFields(contentFields, "  ")}`;
  });
  return [
    "APPROVED PAGE COMPONENTS (you may only use these `type` values; unknown props are discarded):",
    ...lines,
    "Every block also accepts the shared section settings: background (default|muted|gold|ink), spacing (none|sm|md|lg), width (narrow|standard|wide), align (left|center), hideOnMobile (boolean).",
  ].join("\n\n");
}

/** Compact list for tool descriptions and the Add-block picker. */
export function registrySummary(): { type: string; label: string; category: string; description: string }[] {
  return DEFINITIONS.map((d) => ({ type: d.type, label: d.label, category: d.category, description: d.description }));
}

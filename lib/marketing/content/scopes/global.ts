// Content shared by every marketing page: navigation, footer, the Stewardship
// Blueprint framework layers, and the Join the Journey form.

import { defineScope, defineSection, type ContentField, type Cta } from "../kit";

// ── Navigation ───────────────────────────────────────────────────────────────

export type NavLink = { id: string; label: string; href: string };
export type NavColumn = { id: string; label: string; href: string; links: NavLink[] };
export type NavContent = {
  discoverLabel: string;
  columns: NavColumn[];
  links: NavLink[];
  accountLabel: string;
  accountLinks: NavLink[];
  secondaryCta: Cta;
  primaryCta: Cta;
};

const linkFields: ContentField[] = [
  { key: "label", label: "Label", kind: "text", required: true, maxLength: 60 },
  { key: "href", label: "Link", kind: "url", required: true },
];

const link = (id: string, label: string, href: string): NavLink => ({ id, label, href });

const nav = defineSection<NavContent>({
  key: "nav",
  label: "Main navigation",
  fields: [
    { key: "discoverLabel", label: "Menu label", kind: "text", required: true, maxLength: 30 },
    {
      key: "columns",
      label: "Menu columns",
      kind: "list",
      stableIds: true,
      maxItems: 5,
      itemLabel: "Column",
      fields: [
        ...linkFields,
        { key: "links", label: "Links", kind: "list", stableIds: true, maxItems: 8, itemLabel: "Link", fields: linkFields },
      ],
    },
    { key: "links", label: "Top-level links", kind: "list", stableIds: true, maxItems: 4, itemLabel: "Link", fields: linkFields },
    { key: "accountLabel", label: "Account menu label", kind: "text", required: true, maxLength: 30 },
    { key: "accountLinks", label: "Account links", kind: "list", stableIds: true, maxItems: 4, itemLabel: "Link", fields: linkFields },
    { key: "secondaryCta", label: "Secondary button", kind: "cta", required: true },
    { key: "primaryCta", label: "Primary button", kind: "cta", required: true },
  ],
  defaults: {
    discoverLabel: "Discover",
    columns: [
      {
        id: "blueprint",
        label: "The Blueprint",
        href: "/stewardship-blueprint",
        links: [
          link("framework", "The Stewardship Blueprint", "/stewardship-blueprint"),
          link("personal", "Your Personal Blueprint", "/personal-blueprint"),
          link("assessments", "Assessments & Check-Ins", "/assessments"),
          link("check-in", "Created for More Check-In", "/created-for-more-check-in"),
        ],
      },
      {
        id: "learn",
        label: "Learn & Grow",
        href: "/learn-and-grow",
        links: [
          link("book", "The Life You’re Building", "/the-life-youre-building"),
          link("studies", "Studies & Experiences", "/studies"),
          link("resources", "Insights & Resources", "/resources"),
          link("start", "Start Your Journey", "/start"),
        ],
      },
      {
        id: "churches",
        label: "For Churches",
        href: "/churches",
        links: [
          link("churches", "For Churches & Groups", "/churches"),
          link("lead", "Lead a Group", "/lead-a-group"),
          link("challenge", "Six-Week Challenge", "/6-week-challenge"),
        ],
      },
      {
        id: "about",
        label: "About",
        href: "/about",
        links: [
          link("about", "About Michael", "/about"),
          link("mission", "Mission & Vision", "/mission"),
          link("join", "Join the Journey", "/join"),
          link("pricing", "Prices & Plans", "/steward/pricing"),
        ],
      },
    ],
    links: [link("steward", "Steward", "/meet-steward"), link("contact", "Contact", "/contact")],
    accountLabel: "My Account",
    accountLinks: [link("login", "Login", "/login"), link("register", "Register", "/register")],
    secondaryCta: { label: "Get Started", href: "/start" },
    primaryCta: { label: "Take the Free Check-In", href: "/created-for-more-check-in" },
  },
});

export const globalNav = defineScope({ key: "global:nav", label: "Navigation", sections: { nav } });

// ── Footer ───────────────────────────────────────────────────────────────────

export type FooterContent = {
  tagline: string;
  columns: { id: string; label: string; links: NavLink[] }[];
  copyright: string;
  legalLinks: NavLink[];
};

const footer = defineSection<FooterContent>({
  key: "footer",
  label: "Footer",
  fields: [
    { key: "tagline", label: "Tagline", kind: "textarea", maxLength: 240 },
    {
      key: "columns",
      label: "Link columns",
      kind: "list",
      stableIds: true,
      maxItems: 4,
      itemLabel: "Column",
      fields: [
        { key: "label", label: "Heading", kind: "text", required: true, maxLength: 40 },
        { key: "links", label: "Links", kind: "list", stableIds: true, maxItems: 8, itemLabel: "Link", fields: linkFields },
      ],
    },
    { key: "copyright", label: "Copyright line", kind: "text", maxLength: 120, help: "{year} is replaced with the current year." },
    { key: "legalLinks", label: "Legal links", kind: "list", stableIds: true, maxItems: 6, itemLabel: "Link", fields: linkFields },
  ],
  defaults: {
    tagline: "The Stewardship Blueprint — a whole-life framework for stewarding what God has entrusted to you.",
    columns: [
      {
        id: "blueprint",
        label: "The Blueprint",
        links: [
          link("framework", "The Framework", "/stewardship-blueprint"),
          link("personal", "Personal Blueprint", "/personal-blueprint"),
          link("assessments", "Assessments", "/assessments"),
          link("check-in", "Created for More Check-In", "/created-for-more-check-in"),
          link("steward", "Steward", "/meet-steward"),
        ],
      },
      {
        id: "learn",
        label: "Learn & Grow",
        links: [
          link("book", "The Life You’re Building", "/the-life-youre-building"),
          link("studies", "Studies & Experiences", "/studies"),
          link("resources", "Insights & Resources", "/resources"),
          link("churches", "For Churches & Groups", "/churches"),
          link("lead", "Lead a Group", "/lead-a-group"),
        ],
      },
      {
        id: "connect",
        label: "Connect",
        links: [
          link("about", "About Michael", "/about"),
          link("mission", "Mission & Vision", "/mission"),
          link("contact", "Contact", "/contact"),
          link("join", "Join the Journey", "/join"),
          link("pricing", "Prices & Plans", "/steward/pricing"),
        ],
      },
    ],
    copyright: "© {year} Stewardship Blueprint LLC · Michael J. Gauthier",
    legalLinks: [
      link("privacy", "Privacy", "/privacy"),
      link("terms", "Terms", "/terms"),
      link("sms", "SMS Preferences", "/sms/opt-in"),
      link("email", "Email Preferences", "/email/opt-in"),
      link("legal", "Legal & Trust", "/legal"),
    ],
  },
});

export const globalFooter = defineScope({ key: "global:footer", label: "Footer", sections: { footer } });

// ── The framework (home tabs, the temple, /stewardship-blueprint) ────────────

export const LAYER_KEYS = ["bedrock", "foundation", "pillars", "rail", "habits", "energy", "legacy"] as const;
export type LayerKey = (typeof LAYER_KEYS)[number];

export type Layer = {
  number: string;
  name: string;
  /** The part of the temple that represents it. */
  part: string;
  eyebrow: string;
  title: string;
  body: string;
  /** Short line written on the temple itself. */
  caption: string;
};

export type FrameworkContent = {
  layers: Record<LayerKey, Layer>;
  pillarNames: { family: string; fitness: string; fun: string; finances: string };
  bedrockNote: string;
  hint: string;
};

const layerFields: ContentField[] = [
  { key: "number", label: "Number", kind: "text", maxLength: 4 },
  { key: "name", label: "Name", kind: "text", required: true, maxLength: 40 },
  { key: "part", label: "Temple part", kind: "text", maxLength: 40 },
  { key: "eyebrow", label: "Eyebrow", kind: "text", maxLength: 60 },
  { key: "title", label: "Title", kind: "text", required: true, maxLength: 120 },
  { key: "body", label: "Description", kind: "textarea", required: true, maxLength: 600 },
  { key: "caption", label: "Caption on the temple", kind: "text", maxLength: 80 },
];

const LAYER_LABELS: Record<LayerKey, string> = {
  bedrock: "Bedrock",
  foundation: "Foundation",
  pillars: "Four Pillars",
  rail: "Guardrails",
  habits: "Keystone Habits",
  energy: "Energy",
  legacy: "Legacy",
};

const framework = defineSection<FrameworkContent>({
  key: "framework",
  label: "Framework layers",
  fields: [
    {
      key: "layers",
      label: "Layers",
      kind: "group",
      // A fixed set: the temple has exactly one part per layer, so layers can be
      // reworded but not added or removed.
      fields: LAYER_KEYS.map((key) => ({ key, label: LAYER_LABELS[key], kind: "group" as const, fields: layerFields })),
    },
    {
      key: "pillarNames",
      label: "Pillar names",
      kind: "group",
      fields: (["family", "fitness", "fun", "finances"] as const).map((key) => ({
        key,
        label: key[0].toUpperCase() + key.slice(1),
        kind: "text" as const,
        maxLength: 20,
      })),
    },
    { key: "bedrockNote", label: "Note beside Bedrock", kind: "text", maxLength: 120 },
    { key: "hint", label: "Hint under the temple", kind: "text", maxLength: 160 },
  ],
  defaults: {
    layers: {
      bedrock: {
        number: "01",
        name: "Bedrock",
        part: "Crepidoma",
        eyebrow: "Layer 01",
        title: "Bedrock — Faith & Identity",
        body: "Your identity is deeper than what you accomplish, own, or produce. Faith is not just one room in the house; it shapes the entire structure.",
        caption: "Faith & Identity",
      },
      foundation: {
        number: "02",
        name: "Foundation",
        part: "Stylobate",
        eyebrow: "Layer 02",
        title: "Foundation — Mission, Values, Calling & Purpose",
        body: "What matters most to you? What does faithful living look like in this season? Foundation translates conviction into direction.",
        caption: "Mission · Values · Calling · Purpose",
      },
      pillars: {
        number: "03",
        name: "Four Pillars",
        part: "Columns",
        eyebrow: "Layer 03",
        title: "Four Pillars — Family, Fitness, Fun & Finances",
        body: "Relationships, health, joy, and financial resources are connected. Strengthening one while neglecting the others eventually affects the whole life.",
        caption: "Family · Fitness · Fun · Finances",
      },
      rail: {
        number: "04",
        name: "Guardrails",
        part: "Balustrades",
        eyebrow: "Layer 04 · Both sides",
        title: "Guardrails — Boundaries That Protect",
        body: "Pre-decided limits protect your priorities, integrity, relationships, and freedom before pressure creates regret.",
        caption: "Boundaries that protect",
      },
      habits: {
        number: "05",
        name: "Keystone Habits",
        part: "Architrave",
        eyebrow: "Layer 05",
        title: "Keystone Habits — Rhythms That Strengthen",
        body: "Small, repeatable actions shape the life you live more than occasional bursts of motivation.",
        caption: "Rhythms that strengthen",
      },
      energy: {
        number: "06",
        name: "Energy",
        part: "Frieze",
        eyebrow: "Layer 06",
        title: "Energy — Capacity to Live It",
        body: "Physical, emotional, mental, and spiritual energy must be received, invested, renewed, and protected.",
        caption: "Capacity to live it",
      },
      legacy: {
        number: "07",
        name: "Legacy",
        part: "Pediment",
        eyebrow: "Layer 07 · Roof",
        title: "Legacy — What You Multiply While Living",
        body: "Your legacy takes shape in the people you influence, equip, serve, and encourage now. Generosity grows when others learn to practice and pass it on. Estate arrangements may support continuity but do not define Legacy Giving.",
        caption: "What your life multiplies through others now",
      },
    },
    pillarNames: { family: "Family", fitness: "Fitness", fun: "Fun", finances: "Finances" },
    bedrockNote: "Not one room in the house — it shapes the entire structure.",
    hint: "Hover a part of the building to explore · click to pin · plays on its own while in view",
  },
});

export const globalFramework = defineScope({ key: "global:framework", label: "Framework", sections: { framework } });

// ── Join the Journey form ────────────────────────────────────────────────────

export type JoinFormContent = {
  submitLabel: string;
  emailConsent: string;
  feedbackConsent: string;
  followUpConsent: string;
  interestsLabel: string;
  interests: { id: string; label: string }[];
  finePrint: string;
  successTitle: string;
  successBody: string;
  successCta: Cta;
};

const joinForm = defineSection<JoinFormContent>({
  key: "joinForm",
  label: "Join the Journey form",
  fields: [
    { key: "submitLabel", label: "Button label", kind: "text", required: true, maxLength: 40 },
    {
      key: "emailConsent",
      label: "Email consent wording",
      kind: "textarea",
      required: true,
      maxLength: 400,
      help: "The SMS consent wording is fixed to the approved A2P disclosure and is not editable here.",
    },
    {
      key: "feedbackConsent",
      label: "Anonymous feedback permission (optional box)",
      kind: "textarea",
      required: true,
      maxLength: 300,
      help: "Starts unticked; only the visitor can grant it.",
    },
    {
      key: "followUpConsent",
      label: "Follow-up permission (optional box)",
      kind: "textarea",
      required: true,
      maxLength: 300,
      help: "Starts unticked; only the visitor can grant it.",
    },
    { key: "interestsLabel", label: "Interests label", kind: "text", maxLength: 80 },
    {
      key: "interests",
      label: "Interest options",
      kind: "list",
      stableIds: true,
      maxItems: 8,
      itemLabel: "Interest",
      fields: [{ key: "label", label: "Label", kind: "text", required: true, maxLength: 40 }],
    },
    { key: "finePrint", label: "Fine print", kind: "textarea", maxLength: 300 },
    { key: "successTitle", label: "Thank-you title", kind: "text", maxLength: 80 },
    { key: "successBody", label: "Thank-you message", kind: "textarea", maxLength: 400 },
    { key: "successCta", label: "Thank-you button", kind: "cta" },
  ],
  defaults: {
    submitLabel: "Join the Journey →",
    emailConsent:
      "I agree to receive Stewardship Blueprint email updates and understand I can unsubscribe at any time.",
    feedbackConsent: "Optional: Michael may use my anonymous feedback to improve the book and future resources.",
    followUpConsent: "Optional: Michael or the team may follow up with me personally about my journey.",
    interestsLabel: "I’m especially interested in (optional)",
    interests: [
      { id: "assessments", label: "Assessments" },
      { id: "books", label: "Books / resources" },
      { id: "groups", label: "Groups / churches" },
      { id: "steward", label: "Steward" },
    ],
    finePrint:
      "Your information will only be used to send you updates about The Stewardship Blueprint. No spam, ever. Unsubscribe at any time.",
    successTitle: "Welcome to the journey.",
    successBody:
      "Check your email — we’ve sent your welcome note and your account details. As you get started, consider taking the free Created for More Check-In.",
    successCta: { label: "Take the Free Check-In", href: "/created-for-more-check-in" },
  },
});

export const globalJoinForm = defineScope({ key: "global:join-form", label: "Join form", sections: { joinForm } });

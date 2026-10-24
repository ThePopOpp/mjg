// Field building blocks reused across page scopes, so the same kind of thing
// (a section heading, a pair of buttons, a card) is edited the same way on
// every page.

import { defineSection, type ContentField, type Cta, type MediaValue } from "../kit";

export const f = {
  eyebrow: (label = "Eyebrow"): ContentField => ({ key: "eyebrow", label, kind: "text", maxLength: 80 }),
  title: (label = "Heading"): ContentField => ({ key: "title", label, kind: "text", required: true, maxLength: 160 }),
  lead: (label = "Lead sentence"): ContentField => ({ key: "lead", label, kind: "textarea", maxLength: 400 }),
  body: (label = "Body", help = "Separate paragraphs with a blank line. Wrap words in *asterisks* for italics."): ContentField => ({
    key: "body",
    label,
    kind: "textarea",
    maxLength: 3000,
    help,
  }),
  cta: (key: string, label: string, required = false): ContentField => ({ key, label, kind: "cta", required }),
  media: (key: string, label: string, help?: string): ContentField => ({ key, label, kind: "media", help }),
  text: (key: string, label: string, maxLength = 200): ContentField => ({ key, label, kind: "text", maxLength }),
  textarea: (key: string, label: string, maxLength = 1200): ContentField => ({ key, label, kind: "textarea", maxLength }),
  list: (key: string, label: string, fields: ContentField[], maxItems = 12, itemLabel = "Item"): ContentField => ({
    key,
    label,
    kind: "list",
    stableIds: true,
    maxItems,
    itemLabel,
    fields,
  }),
};

export type SeoContent = { title: string; description: string; ogImage: MediaValue; noIndex: boolean };

/** Every page scope has an editable `_seo` section. */
export function seoSection(defaults: Omit<SeoContent, "ogImage" | "noIndex"> & Partial<Pick<SeoContent, "ogImage" | "noIndex">>) {
  return defineSection<SeoContent>({
    key: "_seo",
    label: "Search & sharing",
    fields: [
      { key: "title", label: "Page title", kind: "text", required: true, maxLength: 70 },
      { key: "description", label: "Description", kind: "textarea", maxLength: 300 },
      { key: "ogImage", label: "Sharing image", kind: "media" },
      { key: "noIndex", label: "Hide from search engines", kind: "boolean" },
    ],
    defaults: { ogImage: { src: "", alt: "" }, noIndex: false, ...defaults },
  });
}

export type LinkCard = { id: string; label: string; title: string; body: string; href: string; cta: string };

export const linkCardFields: ContentField[] = [
  { key: "label", label: "Label", kind: "text", maxLength: 60 },
  { key: "title", label: "Title", kind: "text", required: true, maxLength: 120 },
  { key: "body", label: "Description", kind: "textarea", maxLength: 500 },
  { key: "href", label: "Link", kind: "url" },
  { key: "cta", label: "Link text", kind: "text", maxLength: 60 },
];

export type { Cta, MediaValue };

/** A designed stand-in shown until the approved artwork exists. */
export const mock = (variant: NonNullable<MediaValue["mock"]>["variant"], title: string, subtitle?: string): MediaValue => ({
  src: "",
  alt: "",
  mock: { variant, title, ...(subtitle ? { subtitle } : {}) },
});

export const photo = (src: string, alt: string, credit?: string): MediaValue => ({ src, alt, ...(credit ? { credit } : {}) });

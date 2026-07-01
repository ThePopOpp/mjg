// CMS — shared types. Phase 1 covers page metadata; blocks/versions are stored
// (tables exist) but the block editor + renderer arrive in later phases.

export type CmsPageStatus = "draft" | "published" | "archived";
export type CmsPageType = "page" | "landing" | "stewardship" | "experience" | "resource" | "informational";

export type CmsPage = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  page_type: CmsPageType;
  status: CmsPageStatus;
  assigned_roles: string[];
  published_version_id: string | null;
  created_by: string | null;
  updated_by: string | null;
  published_at: string | null;
  created_at?: string;
  updated_at?: string;
};

// ── Blocks (flat, ordered list; nested layout containers come later) ──
export type CmsBlockType =
  | "heading" | "subheading" | "paragraph" | "richtext" | "image" | "button" | "divider" | "spacer"
  | "cta" | "quote" | "cardgrid" | "accordion" | "video" | "html"
  | "hero" | "alert" | "list" | "statgrid" | "gallery" | "embed" | "scripture" | "resource" | "form";

export type CmsBlockItem = {
  title?: string; body?: string; imageUrl?: string; url?: string; q?: string; a?: string;
  // form fields / stats / gallery extras
  fieldType?: string;   // form field: text|email|phone|textarea|number|date|select|checkbox
  placeholder?: string; // form field placeholder
  options?: string;     // select/radio options (comma-separated)
  required?: boolean;   // form field required
  icon?: string;        // optional icon/emoji for list/stat items
};

export type CmsBlock = {
  id: string;
  type: CmsBlockType;
  text?: string;        // heading/subheading/paragraph/richtext/quote/cta-heading/alert-title
  url?: string;         // image src / button href / video url / resource file
  alt?: string;         // image alt
  label?: string;       // button label / cta primary label / form submit / resource button
  // structured content
  eyebrow?: string;     // cta/hero small label
  subtext?: string;     // cta/hero subheading / alert message / scripture reflection / form success
  label2?: string; url2?: string; // cta/hero secondary button
  author?: string; role?: string; // quote author + role / scripture ref + version / resource filetype
  items?: CmsBlockItem[]; // cardgrid / accordion / list / statgrid / gallery / form fields
  columns?: number;     // grid columns (2-4)
  gap?: number;         // grid gap (px)
  html?: string;        // html / embed code
  aspect?: string;      // video aspect ("16/9" | "4/3" | "1/1")
  variant?: string;     // alert kind (info|success|warning|error) / button style / list style
  bgImage?: string;     // hero/section background image url
  overlay?: string;     // hero overlay color
  overlayOpacity?: number; // 0-100
  minHeight?: number;   // hero/section min height (px)
  newTab?: boolean;     // links open in new tab
  // typography
  fontFamily?: string;  // Google font name (see lib/cms/fonts)
  fontWeight?: number;  // 100-900
  fontStyle?: "normal" | "italic";
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  letterSpacing?: number; // px (can be negative)
  lineHeight?: number;    // unitless multiplier
  textShadow?: string;    // css text-shadow value
  // design
  align?: "left" | "center" | "right";
  textColor?: string;   // "" = inherit
  bgColor?: string;     // "" = none (transparent band)
  buttonColor?: string; // button background
  fontSize?: number;    // px override for text/button
  marginTop?: number;   // space above the section (px)
  marginBottom?: number;// space below the section (px)
  padTop?: number;      // section padding top (px)
  padBottom?: number;   // section padding bottom (px)
  padX?: number;        // section horizontal padding (px)
  maxWidth?: number;    // content max width (px); 0 = container default
  height?: number;      // spacer height / image max-height (px)
  radius?: number;      // corner radius (px)
  // border + effects
  borderWidth?: number; // px
  borderColor?: string;
  borderStyle?: "solid" | "dashed" | "dotted";
  boxShadow?: string;   // css box-shadow value
  hidden?: boolean;
  padY?: number;        // legacy — used as padTop/padBottom fallback
};

// Resolve padding/margin with legacy padY fallback (shared by both renderers).
export function blockPad(b: CmsBlock, side: "top" | "bottom"): number {
  const specific = side === "top" ? b.padTop : b.padBottom;
  return specific ?? b.padY ?? 24;
}

export type CmsDraft = { version: 1; blocks: CmsBlock[] };

export function emptyDraft(): CmsDraft { return { version: 1, blocks: [] }; }
export function draftBlocks(draft: unknown): CmsBlock[] {
  const blocks = (draft as CmsDraft | null)?.blocks;
  return Array.isArray(blocks) ? blocks : [];
}

export const CMS_BLOCK_LABELS: Record<CmsBlockType, string> = {
  heading: "Heading", subheading: "Subheading", paragraph: "Paragraph", richtext: "Rich text",
  image: "Image", button: "Button", divider: "Divider", spacer: "Spacer",
  cta: "CTA section", quote: "Quote", cardgrid: "Card grid", accordion: "Accordion / FAQ",
  video: "Video", html: "HTML",
  hero: "Hero", alert: "Alert / Notice", list: "List / Checklist", statgrid: "Stats",
  gallery: "Gallery", embed: "Embed", scripture: "Scripture", resource: "Resource / Download", form: "Form",
};

export const CMS_PAGE_TYPES: { value: CmsPageType; label: string }[] = [
  { value: "page", label: "Page" },
  { value: "landing", label: "Landing page" },
  { value: "stewardship", label: "Stewardship" },
  { value: "experience", label: "Experience" },
  { value: "resource", label: "Resource" },
  { value: "informational", label: "Informational" },
];

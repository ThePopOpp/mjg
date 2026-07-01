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
  | "cta" | "quote" | "cardgrid" | "accordion" | "video" | "html";

export type CmsBlockItem = { title?: string; body?: string; imageUrl?: string; url?: string; q?: string; a?: string };

export type CmsBlock = {
  id: string;
  type: CmsBlockType;
  text?: string;        // heading/subheading/paragraph/richtext/quote/cta-heading
  url?: string;         // image src / button href / video url
  alt?: string;         // image alt
  label?: string;       // button label / cta primary label
  // structured content (new blocks)
  eyebrow?: string;     // cta small label
  subtext?: string;     // cta subheading
  label2?: string; url2?: string; // cta secondary button
  author?: string; role?: string; // quote author + role
  items?: CmsBlockItem[]; // cardgrid / accordion
  columns?: number;     // cardgrid columns (2-4)
  html?: string;        // html block
  aspect?: string;      // video aspect ("16/9" | "4/3" | "1/1")
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
  radius?: number;      // image/button corner radius (px)
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
};

export const CMS_PAGE_TYPES: { value: CmsPageType; label: string }[] = [
  { value: "page", label: "Page" },
  { value: "landing", label: "Landing page" },
  { value: "stewardship", label: "Stewardship" },
  { value: "experience", label: "Experience" },
  { value: "resource", label: "Resource" },
  { value: "informational", label: "Informational" },
];
